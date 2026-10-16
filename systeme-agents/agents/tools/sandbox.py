"""Exécution de code dans un conteneur Docker isolé (sans réseau, mémoire/CPU/temps limités)."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path

from agents.config import Settings


@dataclass
class RunResult:
    exit_code: int
    output: str
    timed_out: bool = False

    @property
    def ok(self) -> bool:
        return self.exit_code == 0 and not self.timed_out


class SandboxError(RuntimeError):
    pass


class Sandbox:
    """`mode="docker"` : isolation réelle. `mode="local"` : sous-processus SANS isolation,
    réservé aux tests du système lui-même."""

    def __init__(self, settings: Settings):
        self.s = settings
        self.mode = settings.sandbox_mode

    # -------------------------------------------------------------- vérifications

    def check(self) -> str:
        if self.mode == "local":
            return "mode local (AUCUNE isolation : à réserver aux tests)"
        if not shutil.which("docker"):
            raise SandboxError("Docker introuvable dans le PATH")
        res = subprocess.run(
            ["docker", "image", "inspect", self.s.sandbox_image], capture_output=True, text=True, timeout=30
        )
        if res.returncode != 0:
            raise SandboxError(
                f"Image {self.s.sandbox_image} absente : docker build -t {self.s.sandbox_image} sandbox/"
            )
        return f"docker, image {self.s.sandbox_image}"

    # -------------------------------------------------------------- exécution

    def _docker_cmd(self, workspace: Path, command: list[str], network: bool, name: str, timeout: int) -> list[str]:
        cmd = [
            "docker", "run", "--rm", "--name", name,
            "--network", "bridge" if network else "none",
            "--memory", self.s.sandbox_memory,
            "--cpus", self.s.sandbox_cpus,
            "--pids-limit", "256",
            "--security-opt", "no-new-privileges",
            "-e", "PYTHONPATH=/work/.deps:/work",
            "-e", "PYTHONDONTWRITEBYTECODE=1",
            "-v", f"{workspace.resolve()}:/work",
            "-w", "/work",
        ]
        if hasattr(os, "getuid"):  # Linux/macOS : fichiers créés avec l'utilisateur courant
            cmd += ["--user", f"{os.getuid()}:{os.getgid()}", "-e", "HOME=/tmp"]
        # `timeout` dans le conteneur : le processus est tué même si le client docker est coupé.
        return cmd + [self.s.sandbox_image, "timeout", "-s", "KILL", str(timeout), *command]

    def _run(self, workspace: Path, command: list[str], timeout: int, network: bool) -> RunResult:
        name = f"agents-sandbox-{uuid.uuid4().hex[:12]}"
        if self.mode == "docker":
            argv = self._docker_cmd(workspace, command, network, name, timeout)
            env = None
        else:
            argv = [sys.executable if command[0] == "python" else command[0], *command[1:]]
            env = {**os.environ, "PYTHONPATH": f"{workspace / '.deps'}{os.pathsep}{workspace}", "PYTHONDONTWRITEBYTECODE": "1"}
        try:
            res = subprocess.run(
                argv,
                cwd=workspace if self.mode == "local" else None,
                capture_output=True,
                text=True,
                timeout=timeout + 15,  # marge pour le démarrage du conteneur
                env=env,
            )
        except subprocess.TimeoutExpired as exc:
            if self.mode == "docker":
                subprocess.run(["docker", "kill", name], capture_output=True, timeout=30)
            out = "".join(
                s.decode(errors="replace") if isinstance(s, bytes) else s for s in (exc.stdout, exc.stderr) if s
            )[-8000:]
            return RunResult(exit_code=-1, output=f"{out}\nTEMPS DÉPASSÉ ({timeout} s)", timed_out=True)
        except FileNotFoundError as exc:
            raise SandboxError(f"Commande introuvable : {exc}") from exc
        timed_out = self.mode == "docker" and res.returncode == 137
        output = (res.stdout + res.stderr)[-12000:]
        if timed_out:
            output += f"\nTEMPS DÉPASSÉ ({timeout} s) ou mémoire dépassée ({self.s.sandbox_memory})"
        return RunResult(exit_code=res.returncode, output=output, timed_out=timed_out)

    def run_tests(self, workspace: Path) -> RunResult:
        """Lance toute la suite pytest (non-régression comprise)."""
        return self._run(
            workspace,
            ["python", "-m", "pytest", "-q", "--maxfail=5", "--tb=short", "-p", "no:cacheprovider", "tests"],
            timeout=self.s.sandbox_timeout_s,
            network=False,
        )

    def install_requirements(self, workspace: Path) -> RunResult:
        """Installe requirements.txt dans <workspace>/.deps. Nécessite le réseau : appelé
        uniquement après validation humaine."""
        return self._run(
            workspace,
            ["python", "-m", "pip", "install", "--no-cache-dir", "--disable-pip-version-check",
             "--target", "/work/.deps" if self.mode == "docker" else str(workspace / ".deps"),
             "-r", "requirements.txt"],
            timeout=self.s.sandbox_install_timeout_s,
            network=True,
        )
