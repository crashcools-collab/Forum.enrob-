"""Scénarios de bout en bout : LLM simulé, vrai pytest dans le bac à sable (mode local)."""

from __future__ import annotations

import time

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.store.memory import InMemoryStore
from langgraph.types import Command

from agents.graph import build_graph, recursion_limit
from agents.runtime import make_deps
from tests.conftest import fake_embed, file_block

FIB_TASK = {
    "title": "Fonction fibonacci",
    "description": "Créer fib.py avec fib(n)",
    "acceptance": "fib(0)==0, fib(10)==55, fib(-1) lève ValueError",
    "needs_research": False,
    "depends_on": [],
}
FIB_TESTS = file_block(
    "tests/test_tache_1.py",
    """
import pytest
from fib import fib

def test_base():
    assert fib(0) == 0 and fib(1) == 1

def test_dix():
    assert fib(10) == 55

def test_negatif():
    with pytest.raises(ValueError):
        fib(-1)
""",
)
FIB_BUGGY = file_block("fib.py", "def fib(n):\n    return n")
FIB_OK = file_block(
    "fib.py",
    """
def fib(n):
    if n < 0:
        raise ValueError("n doit être positif")
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
""",
)
ANALYSIS = {"probable_cause": "fib renvoie n", "fix_hint": "implémenter la récurrence", "test_is_wrong": False}


def initial_state(objective: str, thread_id: str = "t1") -> dict:
    return {
        "objective": objective,
        "thread_id": thread_id,
        "tasks": [],
        "current_task_id": None,
        "research_notes": {},
        "history": [],
        "history_summary": "",
        "iteration": 0,
        "started_at": time.time(),
        "approved_requirements": "",
        "final_status": None,
        "final_reason": "",
    }


def make_graph(settings, llm):
    store = InMemoryStore(index={"dims": 8, "embed": fake_embed, "fields": ["text"]})
    deps = make_deps(settings, llm=llm, store=store)
    graph = build_graph(deps, checkpointer=InMemorySaver(), store=store)
    config = {"configurable": {"thread_id": "t1"}, "recursion_limit": recursion_limit(deps)}
    return graph, config, deps


def test_success_after_one_fix(settings, make_llm):
    llm, backend = make_llm(
        {
            "plan": [{"tasks": [FIB_TASK]}],
            "dev": [FIB_BUGGY, FIB_OK],
            "test_write": [FIB_TESTS],
            "test_analyze": [ANALYSIS],
        }
    )
    graph, config, deps = make_graph(settings, llm)
    final = graph.invoke(initial_state("crée une fonction fibonacci testée"), config)

    assert final["final_status"] == "SUCCESS"
    task = final["tasks"][0]
    assert task["status"] == "done" and task["attempts"] == 1
    assert [r["passed"] for r in final["test_reports"]] == [False, True]
    # Le second passage du Développeur reçoit le rapport d'échec.
    dev_calls = [c for c in backend.calls if c["role"] == "dev"]
    assert "fib renvoie n" in dev_calls[1]["messages"][1]["content"]
    # Les tests ne sont écrits qu'une fois.
    assert backend.count["test_write"] == 1
    report = (settings.workspaces_dir / "t1" / "REPORT.md").read_text(encoding="utf-8")
    assert "SUCCESS" in report and "Fonction fibonacci" in report
    # La leçon est mémorisée.
    assert deps.memory.recall("fibonacci")


def test_developer_cannot_touch_tests(settings, make_llm):
    cheat = FIB_OK + file_block("tests/test_tache_1.py", "def test_ok():\n    assert True")
    llm, _ = make_llm({"plan": [{"tasks": [FIB_TASK]}], "dev": [cheat], "test_write": [FIB_TESTS]})
    graph, config, _ = make_graph(settings, llm)
    final = graph.invoke(initial_state("fib"), config)
    assert final["final_status"] == "SUCCESS"
    test_file = (settings.workspaces_dir / "t1" / "tests" / "test_tache_1.py").read_text(encoding="utf-8")
    assert "fib(10) == 55" in test_file


def test_repeated_failure_triggers_replan_then_success(settings, make_llm):
    sub_task = {**FIB_TASK, "title": "Fib itératif simple"}
    llm, backend = make_llm(
        {
            "plan": [{"tasks": [FIB_TASK]}],
            # Même bug deux fois → escalade au Manager, puis la sous-tâche réussit.
            "dev": [FIB_BUGGY, FIB_BUGGY, FIB_OK],
            "test_write": [FIB_TESTS, file_block("tests/x.py", FIB_TESTS.split("```python\n")[1].split("```")[0])],
            "test_analyze": [ANALYSIS],
            "replan": [{"decision": "split", "reason": "approche trop vague", "new_tasks": [sub_task]}],
        }
    )
    graph, config, _ = make_graph(settings, llm)
    final = graph.invoke(initial_state("fib"), config)

    assert backend.count["replan"] == 1
    statuses = {t["title"]: t["status"] for t in final["tasks"]}
    assert statuses == {"Fonction fibonacci": "replaced", "Fib itératif simple": "done"}
    assert final["final_status"] == "SUCCESS"


def test_dependencies_require_human_approval(settings, make_llm):
    with_req = FIB_OK + "### FICHIER: requirements.txt\n```\nrequests==2.32.3\n```\n"
    llm, _ = make_llm(
        {"plan": [{"tasks": [FIB_TASK]}], "dev": [with_req, FIB_OK], "test_write": [FIB_TESTS]}
    )
    graph, config, _ = make_graph(settings, llm)
    paused = graph.invoke(initial_state("fib"), config)

    assert "__interrupt__" in paused
    payload = paused["__interrupt__"][0].value
    assert payload["type"] == "dependencies" and "requests" in payload["requirements"]

    final = graph.invoke(Command(resume=False), config)
    assert final["final_status"] == "SUCCESS"
    assert not (settings.workspaces_dir / "t1" / "requirements.txt").exists()
    assert final["tasks"][0]["attempts"] == 1


def test_budget_exhausted_gives_partial(settings, make_llm):
    settings.max_iterations = 3
    llm, _ = make_llm(
        {"plan": [{"tasks": [FIB_TASK]}], "dev": [FIB_BUGGY], "test_write": [FIB_TESTS], "test_analyze": [ANALYSIS]}
    )
    graph, config, _ = make_graph(settings, llm)
    final = graph.invoke(initial_state("fib"), config)
    assert final["final_status"] == "PARTIAL"
    assert "itérations" in final["final_reason"]


def test_invalid_plan_fails_cleanly(settings, make_llm):
    llm, _ = make_llm({"plan": ["je ne sais pas"]})
    graph, config, _ = make_graph(settings, llm)
    final = graph.invoke(initial_state("objectif flou"), config)
    assert final["final_status"] == "FAILED"
    assert "Alertes" in final["report"]  # 100 % de JSON invalides → alerte


def test_blocked_task_blocks_dependants(settings, make_llm):
    second = {**FIB_TASK, "title": "Utilise fib", "depends_on": [1]}
    llm, _ = make_llm(
        {
            "plan": [{"tasks": [FIB_TASK, second]}],
            "dev": [FIB_BUGGY],
            "test_write": [FIB_TESTS],
            "test_analyze": [ANALYSIS],
            "replan": [{"decision": "block", "reason": "impossible", "new_tasks": []}],
        }
    )
    graph, config, _ = make_graph(settings, llm)
    final = graph.invoke(initial_state("fib"), config)
    assert final["final_status"] == "FAILED"
    assert [t["status"] for t in final["tasks"]] == ["blocked", "blocked"]


def test_research_unavailable_does_not_stop_run(settings, make_llm):
    task = {**FIB_TASK, "needs_research": True}
    llm, _ = make_llm(
        {"plan": [{"tasks": [task]}], "query": [{"query": "fibonacci python"}], "dev": [FIB_OK], "test_write": [FIB_TESTS]}
    )
    graph, config, _ = make_graph(settings, llm)
    final = graph.invoke(initial_state("fib"), config)
    assert final["final_status"] == "SUCCESS"
    assert "indisponible" in final["research_notes"]["1"]


def test_code_in_reasoning_and_unnamed_test_block(settings, make_llm):
    unnamed_tests = "```python\n" + FIB_TESTS.split("```python\n")[1]
    llm, _ = make_llm(
        {
            "plan": [{"tasks": [FIB_TASK]}],
            # Le code est dans le raisonnement, la réponse finale n'est que de la prose.
            "dev": [("J'ai écrit fib.py.", "Brouillon :\n" + FIB_OK)],
            "test_write": [unnamed_tests],
        }
    )
    graph, config, _ = make_graph(settings, llm)
    final = graph.invoke(initial_state("fib"), config)
    assert final["final_status"] == "SUCCESS"
    assert final["tasks"][0]["attempts"] == 0


def test_tests_only_task_is_removed_from_plan(settings, make_llm):
    tests_task = {**FIB_TASK, "title": "Tests unitaires pytest", "depends_on": [1]}
    third = {**FIB_TASK, "title": "Utilise fib", "depends_on": [1, 2]}
    llm, backend = make_llm(
        {"plan": [{"tasks": [FIB_TASK, tests_task, third]}], "dev": [FIB_OK], "test_write": [FIB_TESTS]}
    )
    graph, config, _ = make_graph(settings, llm)
    final = graph.invoke(initial_state("fib"), config)
    assert final["final_status"] == "SUCCESS"
    assert [(t["id"], t["title"], t["depends_on"]) for t in final["tasks"]] == [
        (1, "Fonction fibonacci", []),
        (2, "Utilise fib", [1]),
    ]


def test_existing_tests_only_task_skips_developer(settings, make_llm):
    """Une tâche de tests déjà planifiée (ancien plan, replanification) va droit au Testeur."""
    from agents.nodes.developer import make_developer_node
    from agents.state import new_task
    from agents.schemas import PlannedTask

    llm, backend = make_llm({"dev": [FIB_OK]})
    _, _, deps = make_graph(settings, llm)
    task = {**new_task(2, PlannedTask(**{**FIB_TASK, "title": "Tests unitaires pytest"}), []), "status": "in_progress"}
    state = {**initial_state("fib"), "tasks": [task], "current_task_id": 2}
    update = make_developer_node(deps)(state)
    assert update["tasks"][0]["phase"] == "test" and update["tasks"][0]["attempts"] == 0
    assert backend.count["dev"] == 0


def test_unnamed_test_blocks_go_to_tester(settings, make_llm):
    unnamed = "```python\nimport pytest\nfrom fib import fib\n\ndef test_x():\n    assert fib(1) == 1\n```"
    llm, _ = make_llm({"plan": [{"tasks": [FIB_TASK]}], "dev": [FIB_OK, unnamed], "test_write": [FIB_TESTS]})
    graph, config, deps = make_graph(settings, llm)
    from agents.nodes.developer import make_developer_node

    final = graph.invoke(initial_state("fib"), config)
    assert final["final_status"] == "SUCCESS"
    # Second passage direct du nœud : réponse sans nom ne contenant que des tests → Testeur, sans échec.
    state = {**final, "tasks": [{**final["tasks"][0], "status": "in_progress", "phase": "develop"}], "current_task_id": 1}
    update = make_developer_node(deps)(state)
    assert update["tasks"][0]["phase"] == "test" and update["tasks"][0]["attempts"] == 0
