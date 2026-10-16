"""État partagé du graphe et dépendances injectées dans les nœuds."""

from __future__ import annotations

import operator
from dataclasses import dataclass
from typing import Annotated, Literal, TypedDict

from agents.config import Settings
from agents.llm.client import LLMClient
from agents.memory import Memory
from agents.tools.sandbox import Sandbox
from agents.tools.search import WebSearch

TaskStatus = Literal["pending", "in_progress", "done", "blocked", "replaced"]
# Phase de la tâche courante : détermine le prochain agent.
TaskPhase = Literal["research", "develop", "approve_deps", "test", "replan"]
FinalStatus = Literal["SUCCESS", "PARTIAL", "FAILED"]


class Task(TypedDict):
    id: int
    title: str
    description: str
    acceptance: str
    needs_research: bool
    depends_on: list[int]
    status: TaskStatus
    phase: TaskPhase
    attempts: int
    depth: int  # niveau de redécoupage (0 = tâche du plan initial)
    test_file: str | None
    test_rewrites: int
    feedback: str  # dernier retour du Testeur pour le Développeur
    last_failure_sig: str
    repeat_failures: int


class AgentState(TypedDict, total=False):
    objective: str
    thread_id: str
    project: str  # dossier de travail partagé entre exécutions (vide = un dossier par exécution)
    tasks: list[Task]
    current_task_id: int | None
    next_agent: str
    research_notes: dict[str, str]  # clé : id de tâche (str pour la sérialisation JSON)
    test_reports: Annotated[list[dict], operator.add]
    history: list[str]
    history_summary: str
    iteration: int
    started_at: float
    approved_requirements: str  # empreinte du requirements.txt déjà validé et installé
    metrics: Annotated[list[dict], operator.add]
    final_status: FinalStatus | None
    final_reason: str
    report: str


@dataclass
class Deps:
    settings: Settings
    llm: LLMClient
    memory: Memory
    sandbox: Sandbox
    search: WebSearch


def find_task(state: AgentState, task_id: int | None) -> Task | None:
    for task in state.get("tasks", []):
        if task["id"] == task_id:
            return task
    return None


def replace_task(tasks: list[Task], updated: Task) -> list[Task]:
    return [updated if t["id"] == updated["id"] else t for t in tasks]


def new_task(task_id: int, planned, depends_on: list[int], depth: int = 0) -> Task:
    return Task(
        id=task_id,
        title=planned.title,
        description=planned.description,
        acceptance=planned.acceptance,
        needs_research=planned.needs_research,
        depends_on=depends_on,
        status="pending",
        phase="research" if planned.needs_research else "develop",
        attempts=0,
        depth=depth,
        test_file=None,
        test_rewrites=0,
        feedback="",
        last_failure_sig="",
        repeat_failures=0,
    )
