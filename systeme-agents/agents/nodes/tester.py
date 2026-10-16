"""Agent Testeur : écrit les tests d'une tâche, les exécute dans le bac à sable, analyse les échecs.

Le verdict vient du code de sortie de pytest, jamais d'un avis du modèle. Les tests d'une
tâche sont écrits une fois, à partir du critère d'acceptation ; ils ne sont réécrits (une seule
fois) que si l'analyse conclut que le test lui-même est faux. Sans cette règle, le plus simple
pour « réussir » serait d'affaiblir les tests.
"""

from __future__ import annotations

import hashlib
import re

from agents import prompts
from agents.llm.client import LLMFormatError, estimate_tokens
from agents.logs import log_event
from agents.nodes.common import add_history, context_block, task_brief, workspace_for
from agents.schemas import FailureAnalysis
from agents.state import AgentState, Deps, Task, find_task, replace_task
from agents.tools.workspace import parse_file_blocks, unnamed_code_blocks

PYTEST_NO_TESTS = 5
MAX_TEST_REWRITES = 1


def test_file_for(state: AgentState, task: Task) -> str:
    """Dans un projet, plusieurs exécutions numérotent leurs tâches à partir de 1 : le suffixe
    de l'exécution évite d'écraser les tests (de non-régression) des demandes précédentes."""
    if state.get("project"):
        tag = re.sub(r"\W", "", state["thread_id"])[-6:]
        return f"tests/test_{tag}_tache_{task['id']}.py"
    return f"tests/test_tache_{task['id']}.py"


def failure_signature(output: str) -> str:
    """Empreinte d'un échec, insensible aux numéros de ligne, adresses et durées."""
    lines = [l for l in output.splitlines() if l.startswith(("FAILED", "ERROR", "E ")) or "Error" in l]
    normalized = re.sub(r"0x[0-9a-f]+|\d+(\.\d+)?", "#", "\n".join(lines[:30]))
    return hashlib.sha1(normalized.encode()).hexdigest()[:12]


def make_tester_node(deps: Deps):
    def write_tests(state: AgentState, task: Task) -> str | None:
        ws = workspace_for(deps, state)
        target = test_file_for(state, task)
        budget = deps.settings.prompt_budget_tokens // 2
        user = (
            f"{context_block(state)}\n\n{task_brief(task)}\n\n"
            f"Nom du fichier à produire : {target}\n\n"
            f"Code actuel du workspace :\n\n{ws.snapshot(budget, exclude_prefix='tests/')}"
        )
        answer = deps.llm.text(agent="testeur", system=prompts.TESTER_WRITE, user=user, thinking=True)
        blocks = [c for p, c in parse_file_blocks(answer) if "test" in p]
        if not blocks:
            # Le chemin cible est connu : un bloc sans nom qui contient des tests suffit.
            blocks = [c for c in unnamed_code_blocks(answer) if "def test" in c]
        if not blocks:
            log_event("tester_unparsed", answer=answer[:6000])
            return None
        return ws.write_file(target, blocks[0])

    def tester(state: AgentState) -> dict:
        task = find_task(state, state["current_task_id"])
        assert task is not None
        ws = workspace_for(deps, state)
        history: list[str] = []

        if not task["test_file"] or not ws.exists(task["test_file"]):
            test_file = write_tests(state, task)
            if test_file is None:
                attempts = task["attempts"] + 1
                updated = {
                    **task,
                    "attempts": attempts,
                    "phase": "replan" if attempts >= deps.settings.max_attempts else "test",
                }
                log_event("test_result", message=f"tâche {task['id']} : le Testeur n'a produit aucun test exploitable")
                return {
                    "tasks": replace_task(state["tasks"], updated),
                    "history": add_history(state, f"Testeur, tâche {task['id']} : aucun test exploitable"),
                    "metrics": deps.llm.drain_metrics(),
                }
            task = {**task, "test_file": test_file}
            history.append(f"Testeur, tâche {task['id']} : tests écrits ({test_file})")

        result = deps.sandbox.run_tests(ws.root)
        attempt_no = task["attempts"] + 1
        report = {"task_id": task["id"], "attempt": attempt_no, "exit_code": result.exit_code, "output_tail": result.output[-3000:]}

        if result.ok:
            updated = {**task, "status": "done", "feedback": ""}
            deps.memory.remember(
                f"Tâche « {task['title']} » réussie après {task['attempts']} échec(s)."
                + (f" Dernière difficulté : {task['feedback'][:300]}" if task["feedback"] else ""),
                kind="tache",
            )
            log_event("test_result", message=f"tâche {task['id']} VALIDÉE (tentative {attempt_no})")
            return {
                "tasks": replace_task(state["tasks"], updated),
                "current_task_id": None,
                "test_reports": [{**report, "passed": True}],
                "history": add_history(state, *history, f"Tâche {task['id']} validée par les tests"),
                "metrics": deps.llm.drain_metrics(),
            }

        if result.exit_code == PYTEST_NO_TESTS:
            analysis = FailureAnalysis(
                probable_cause="Aucun test collecté par pytest.",
                fix_hint="Le fichier de test doit contenir des fonctions test_*.",
                test_is_wrong=True,
            )
        else:
            code_budget = deps.settings.prompt_budget_tokens // 2 - estimate_tokens(result.output[-4000:])
            try:
                analysis = deps.llm.structured(
                    agent="testeur",
                    system=prompts.TESTER_ANALYZE,
                    user=(
                        f"{task_brief(task)}\n\nSortie pytest :\n{result.output[-4000:]}\n\n"
                        f"Code et tests :\n\n{ws.snapshot(code_budget, priority=[task['test_file']])}"
                    ),
                    schema=FailureAnalysis,
                    thinking=True,
                )
            except LLMFormatError:
                analysis = FailureAnalysis(
                    probable_cause="Analyse automatique indisponible, voir la sortie pytest.",
                    fix_hint="Corrige l'erreur indiquée par la sortie pytest.",
                    test_is_wrong=False,
                )

        signature = failure_signature(result.output)
        repeat = task["repeat_failures"] + 1 if signature == task["last_failure_sig"] else 0
        attempts = task["attempts"] + 1
        feedback = (
            f"Cause probable : {analysis.probable_cause}\nCorrection : {analysis.fix_hint}\n"
            f"Sortie pytest (fin) :\n{result.output[-1500:]}"
        )
        updated: Task = {**task, "attempts": attempts, "feedback": feedback, "last_failure_sig": signature, "repeat_failures": repeat}

        if attempts >= deps.settings.max_attempts:
            updated["phase"] = "replan"
        elif analysis.test_is_wrong and task["test_rewrites"] < MAX_TEST_REWRITES:
            (ws.root / task["test_file"]).unlink(missing_ok=True)
            updated.update(test_file=None, test_rewrites=task["test_rewrites"] + 1, phase="test")
        elif repeat >= 1:
            # Même échec deux fois de suite : le Développeur tourne en rond, le Manager reprend la main.
            updated["phase"] = "replan"
        else:
            updated["phase"] = "develop"

        log_event(
            "test_result",
            message=f"tâche {task['id']} ÉCHEC (tentative {attempt_no}) → {updated['phase']} : {analysis.probable_cause[:150]}",
        )
        return {
            "tasks": replace_task(state["tasks"], updated),
            "test_reports": [{**report, "passed": False, "probable_cause": analysis.probable_cause}],
            "history": add_history(state, *history, f"Tâche {task['id']} : échec ({analysis.probable_cause[:120]})"),
            "metrics": deps.llm.drain_metrics(),
        }

    return tester
