"""Projets du cockpit : plusieurs demandes successives sur le même code.

L'historique vit dans <workspace>/.agents/ (dossier invisible et inaccessible aux agents).
"""

from __future__ import annotations

import json
import re
import time
from pathlib import Path

from agents.tools.workspace import SYSTEM_DIR, Workspace

_NAME_RE = re.compile(r"[^\w-]+")


def clean_name(name: str) -> str:
    """Nom de projet utilisable comme dossier (lettres, chiffres, - et _)."""
    return _NAME_RE.sub("-", name.strip()).strip("-")[:60] or "principal"


def _dir(ws: Workspace) -> Path:
    path = ws.root / SYSTEM_DIR
    path.mkdir(parents=True, exist_ok=True)
    return path


def append_history(ws: Workspace, record: dict) -> None:
    with (_dir(ws) / "historique.jsonl").open("a", encoding="utf-8") as fh:
        fh.write(json.dumps({"date": time.strftime("%Y-%m-%d %H:%M"), **record}, ensure_ascii=False) + "\n")


def read_history(ws: Workspace, limit: int = 10) -> list[dict]:
    path = ws.root / SYSTEM_DIR / "historique.jsonl"
    if not path.exists():
        return []
    lines = path.read_text(encoding="utf-8").splitlines()[-limit:]
    return [json.loads(line) for line in lines if line.strip()]


def set_last_thread(ws: Workspace, thread_id: str) -> None:
    (_dir(ws) / "derniere_execution.txt").write_text(thread_id, encoding="utf-8")


def last_thread(ws: Workspace) -> str | None:
    path = ws.root / SYSTEM_DIR / "derniere_execution.txt"
    return path.read_text(encoding="utf-8").strip() or None if path.exists() else None


def list_projects(workspaces_dir: Path) -> list[str]:
    if not workspaces_dir.exists():
        return []
    return sorted(p.name for p in workspaces_dir.iterdir() if (p / SYSTEM_DIR).is_dir())
