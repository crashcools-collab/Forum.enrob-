"""Journal structuré (JSON Lines) + affichage console lisible."""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

_log_file: Path | None = None
_console = True

# Événements affichés en console ; les autres ne vont que dans le fichier.
_CONSOLE_EVENTS = {
    "run_start",
    "plan",
    "llm_call",
    "manager_decision",
    "research_done",
    "developer_done",
    "test_result",
    "replan",
    "dependencies",
    "run_end",
    "warning",
}


def configure(log_file: Path | None, console: bool = True) -> None:
    global _log_file, _console
    _log_file = log_file
    _console = console
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)


def log_event(event: str, **fields) -> None:
    record = {"ts": round(time.time(), 3), "event": event, **fields}
    if _log_file:
        with _log_file.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")
    if _console and event in _CONSOLE_EVENTS:
        summary = fields.get("message") or ", ".join(
            f"{k}={v}" for k, v in fields.items() if not isinstance(v, (list, dict)) and len(str(v)) < 120
        )
        print(f"[{time.strftime('%H:%M:%S')}] {event}: {summary}", file=sys.stderr, flush=True)
