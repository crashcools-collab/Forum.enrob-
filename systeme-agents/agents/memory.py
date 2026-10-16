"""Mémoire long terme : un module, pas un agent LLM.

Avant une tâche : on récupère les leçons les plus proches (recherche vectorielle).
Après une tâche : on enregistre ce qui s'est passé (tentatives, erreurs, issue).
"""

from __future__ import annotations

import time
import uuid

from langgraph.store.base import BaseStore

from agents.logs import log_event

NAMESPACE = ("memoire", "lecons")


class Memory:
    def __init__(self, store: BaseStore | None):
        self.store = store

    def recall(self, query: str, limit: int = 3) -> list[str]:
        if self.store is None:
            return []
        try:
            items = self.store.search(NAMESPACE, query=query, limit=limit)
        except Exception as exc:  # mémoire indisponible : on continue sans elle
            log_event("warning", message=f"Mémoire indisponible en lecture : {exc}")
            return []
        return [item.value["text"] for item in items if "text" in item.value]

    def remember(self, text: str, **meta) -> None:
        if self.store is None:
            return
        try:
            self.store.put(NAMESPACE, uuid.uuid4().hex, {"text": text, "ts": time.time(), **meta})
        except Exception as exc:
            log_event("warning", message=f"Mémoire indisponible en écriture : {exc}")


def format_recall(lessons: list[str]) -> str:
    if not lessons:
        return "(aucun souvenir pertinent)"
    return "\n".join(f"- {lesson}" for lesson in lessons)
