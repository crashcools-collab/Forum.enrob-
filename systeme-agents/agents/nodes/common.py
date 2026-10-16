"""Aides partagées par les nœuds."""

from __future__ import annotations

from pathlib import Path

from agents.state import AgentState, Deps, Task
from agents.tools.workspace import Workspace


def workspace_for(deps: Deps, state: AgentState) -> Workspace:
    # Un projet regroupe plusieurs exécutions sur le même code (cockpit) ; à défaut, une par exécution.
    return Workspace(Path(deps.settings.workspaces_dir) / (state.get("project") or state["thread_id"]))


def task_brief(task: Task) -> str:
    return (
        f"Tâche {task['id']} : {task['title']}\n"
        f"Description : {task['description']}\n"
        f"Critère d'acceptation : {task['acceptance']}"
    )


def context_block(state: AgentState) -> str:
    parts = [f"Objectif global : {state['objective']}"]
    if state.get("history_summary"):
        parts.append(f"Résumé de l'historique :\n{state['history_summary']}")
    recent = state.get("history", [])[-5:]
    if recent:
        parts.append("Derniers événements :\n" + "\n".join(f"- {h}" for h in recent))
    return "\n\n".join(parts)


def add_history(state: AgentState, *events: str) -> list[str]:
    return [*state.get("history", []), *events]
