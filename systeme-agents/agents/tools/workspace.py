"""Accès fichiers confiné au workspace d'une exécution."""

from __future__ import annotations

import re
from pathlib import Path

from agents.llm.client import estimate_tokens

IGNORED_DIRS = {".deps", "__pycache__", ".pytest_cache", ".git", ".venv"}
TEXT_SUFFIXES = {".py", ".txt", ".md", ".toml", ".cfg", ".ini", ".json", ".yaml", ".yml", ".csv", ".html", ".js", ".css"}

# Blocs de fichiers produits par les agents. Format demandé :
#   ### FICHIER: chemin/relatif.py
#   ```python
#   ...
#   ```
# Un modèle quantifié s'en écarte souvent ; on accepte aussi, pour chaque bloc de code :
# un chemin dans l'en-tête du bloc (```python:fib.py), une ligne juste avant qui ne contient
# que le chemin (**fib.py**, `fib.py` :, Fichier : fib.py), ou un commentaire en première
# ligne (# fib.py). Une phrase qui mentionne un fichier ne suffit pas : un exemple
# d'utilisation écraserait le vrai fichier.
_SUFFIXES = "|".join(sorted(s[1:] for s in TEXT_SUFFIXES))
_PATH = rf"(?:[\w.-]+/)*[\w-][\w.-]*\.(?:{_SUFFIXES})"
_PATH_IN_TEXT_RE = re.compile(rf"(?<![\w/.-])({_PATH})(?![\w/-])")
_FENCE_RE = re.compile(r"^[ \t]*(`{3,}|~{3,})([^\n]*)\n(.*?)\n[ \t]*\1[ \t]*$", re.MULTILINE | re.DOTALL)
_HEADER_RE = re.compile(rf"(?:(?:fichier|file)\s*:?\s*)?`?({_PATH})`?\s*:?", re.IGNORECASE)
_FIRST_LINE_RE = re.compile(rf"\s*(?:#|//)\s*(?:(?:fichier|file)\s*:\s*)?`?({_PATH})`?\s*", re.IGNORECASE)


class WorkspaceError(ValueError):
    pass


class Workspace:
    def __init__(self, root: Path):
        self.root = root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def _resolve(self, rel: str) -> Path:
        rel = rel.strip().lstrip("/").replace("\\", "/")
        if not rel or rel.startswith("~"):
            raise WorkspaceError(f"Chemin invalide : {rel!r}")
        path = (self.root / rel).resolve()
        if path != self.root and self.root not in path.parents:
            raise WorkspaceError(f"Chemin hors du workspace refusé : {rel!r}")
        if any(part in IGNORED_DIRS for part in path.relative_to(self.root).parts):
            raise WorkspaceError(f"Dossier réservé : {rel!r}")
        return path

    def read_file(self, rel: str) -> str:
        return self._resolve(rel).read_text(encoding="utf-8")

    def write_file(self, rel: str, content: str) -> str:
        path = self._resolve(rel)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content.rstrip("\n") + "\n", encoding="utf-8")
        return path.relative_to(self.root).as_posix()

    def exists(self, rel: str) -> bool:
        try:
            return self._resolve(rel).exists()
        except WorkspaceError:
            return False

    def list_files(self) -> list[str]:
        files = []
        for p in sorted(self.root.rglob("*")):
            rel = p.relative_to(self.root)
            if p.is_file() and not any(part in IGNORED_DIRS for part in rel.parts):
                files.append(rel.as_posix())
        return files

    def snapshot(self, token_budget: int, priority: list[str] | None = None, exclude_prefix: str | None = None) -> str:
        """Contenu des fichiers texte dans la limite d'un budget de tokens.

        Les fichiers prioritaires passent d'abord ; les autres sont listés sans contenu
        quand le budget est épuisé.
        """
        files = [f for f in self.list_files() if Path(f).suffix in TEXT_SUFFIXES and f != "REPORT.md"]
        if exclude_prefix:
            files = [f for f in files if not f.startswith(exclude_prefix)]
        priority = [f for f in (priority or []) if f in files]
        ordered = priority + [f for f in files if f not in priority]
        parts: list[str] = []
        skipped: list[str] = []
        used = 0
        for rel in ordered:
            content = self.read_file(rel)
            block = f"### FICHIER: {rel}\n```\n{content.rstrip()}\n```"
            cost = estimate_tokens(block)
            if used + cost > token_budget:
                skipped.append(rel)
                continue
            parts.append(block)
            used += cost
        if skipped:
            parts.append("Fichiers existants non affichés (budget) : " + ", ".join(skipped))
        return "\n\n".join(parts) if parts else "(workspace vide)"


def _path_from_header_line(text_before: str) -> str | None:
    lines = [l for l in text_before.splitlines() if l.strip()]
    if not lines:
        return None
    line = lines[-1].strip().replace("\\", "/")
    line = re.sub(r"^\d+[.)]\s+", "", line)
    line = line.lstrip("#>-* \t").strip().strip("*_").strip()
    m = _HEADER_RE.fullmatch(line)
    return m.group(1) if m else None


def parse_file_blocks(text: str) -> list[tuple[str, str]]:
    """Extrait les paires (chemin, contenu) d'une réponse d'agent."""
    blocks: list[tuple[str, str]] = []
    previous_end = 0
    for m in _FENCE_RE.finditer(text):
        info, content = m.group(2), m.group(3)
        path = None
        found = _PATH_IN_TEXT_RE.search(info.replace("\\", "/"))
        if found:
            path = found.group(1)
        if path is None:
            path = _path_from_header_line(text[previous_end : m.start()])
        if path is None:
            first = _FIRST_LINE_RE.fullmatch(content.split("\n", 1)[0].replace("\\", "/"))
            path = first.group(1) if first else None
        previous_end = m.end()
        if path:
            blocks.append((path, content))
    return blocks


def unnamed_code_blocks(text: str) -> list[str]:
    """Contenu de tous les blocs de code, avec ou sans chemin."""
    return [m.group(3) for m in _FENCE_RE.finditer(text)]
