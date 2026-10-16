"""Agent Développeur : écrit le code sous forme de blocs de fichiers complets.

Les blocs « ### FICHIER: » plutôt que des appels d'outils JSON : du code échappé dans une
chaîne JSON est la première chose qu'un modèle quantifié casse (guillemets, retours à la ligne).
"""

from __future__ import annotations

import hashlib

from langgraph.types import interrupt

from agents import prompts
from agents.llm.client import estimate_tokens
from agents.logs import log_event
from agents.memory import format_recall
from agents.nodes.common import add_history, context_block, task_brief, workspace_for
from agents.state import AgentState, Deps, Task, find_task, replace_task
from agents.tools.workspace import WorkspaceError, parse_file_blocks

REQUIREMENTS = "requirements.txt"


def requirements_hash(content: str) -> str:
    lines = sorted(line.strip() for line in content.splitlines() if line.strip() and not line.startswith("#"))
    return hashlib.sha256("\n".join(lines).encode()).hexdigest()[:16]


def _after_failure(deps: Deps, task: Task, feedback: str) -> Task:
    attempts = task["attempts"] + 1
    phase = "replan" if attempts >= deps.settings.max_attempts else "develop"
    return {**task, "attempts": attempts, "feedback": feedback, "phase": phase}


def make_developer_node(deps: Deps):
    def developer(state: AgentState) -> dict:
        task = find_task(state, state["current_task_id"])
        assert task is not None
        ws = workspace_for(deps, state)

        fixed = "\n\n".join(
            [
                context_block(state),
                task_brief(task),
                f"Recherche :\n{state.get('research_notes', {}).get(str(task['id']), '(aucune)')}",
                f"Leçons d'exécutions précédentes :\n{format_recall(deps.memory.recall(task['description']))}",
                f"Rapport d'échec à corriger :\n{task['feedback']}" if task["feedback"] else "",
            ]
        )
        budget = deps.settings.prompt_budget_tokens - estimate_tokens(prompts.DEVELOPER + fixed)
        priority = [task["test_file"]] if task["test_file"] else []
        user = f"{fixed}\n\nÉtat actuel du workspace :\n\n{ws.snapshot(budget, priority=priority)}"

        answer = deps.llm.text(agent="developpeur", system=prompts.DEVELOPER, user=user, thinking=True)
        blocks = parse_file_blocks(answer)
        if not blocks and deps.llm.last_reasoning:
            # Le modèle a parfois écrit le code dans son raisonnement puis répondu à vide ou en prose.
            blocks = parse_file_blocks(deps.llm.last_reasoning)

        written, refused = [], []
        for path, content in blocks:
            norm = path.strip().replace("\\", "/").removeprefix("./")
            if norm.startswith("tests/") or norm == "REPORT.md":
                refused.append(f"{path} (réservé)")
                continue
            try:
                written.append(ws.write_file(norm, content))
            except WorkspaceError as exc:
                refused.append(f"{path} ({exc})")

        only_tests = bool(refused) and all(r.replace("\\", "/").lstrip("./").startswith("tests/") for r in refused)
        if not written and (only_tests or "AUCUN CODE" in answer.upper()):
            # Tâche de tests uniquement : c'est le travail du Testeur, on lui passe la main
            # sans compter d'échec (il écrira et exécutera les tests de cette tâche).
            updated = {**task, "phase": "test"}
            log_event("developer_done", message=f"tâche {task['id']} : rien à coder, passage au Testeur")
        elif not written:
            feedback = (
                "Ta réponse ne contenait aucun fichier valide. Respecte exactement le format "
                "« ### FICHIER: chemin » suivi d'un bloc ```python complet."
                + (f" Refusés : {', '.join(refused)}" if refused else "")
            )
            updated = _after_failure(deps, task, feedback)
            log_event("developer_done", message=f"tâche {task['id']} : aucun fichier exploitable")
            log_event("developer_unparsed", answer=answer[:6000], reasoning_tail=deps.llm.last_reasoning[-2000:])
        else:
            next_phase = "test"
            if ws.exists(REQUIREMENTS) and requirements_hash(ws.read_file(REQUIREMENTS)) != state.get("approved_requirements"):
                next_phase = "approve_deps"
            updated = {**task, "phase": next_phase}
            log_event("developer_done", message=f"tâche {task['id']} : {', '.join(written)}", refused=refused)

        return {
            "tasks": replace_task(state["tasks"], updated),
            "history": add_history(
                state, f"Développeur, tâche {task['id']} : {', '.join(written) or 'aucun fichier'}"
            ),
            "metrics": deps.llm.drain_metrics(),
        }

    return developer


def make_approve_deps_node(deps: Deps):
    """Validation humaine avant tout accès réseau (installation de dépendances)."""

    def approve_deps(state: AgentState) -> dict:
        task = find_task(state, state["current_task_id"])
        assert task is not None
        ws = workspace_for(deps, state)
        content = ws.read_file(REQUIREMENTS)
        digest = requirements_hash(content)

        if digest == state.get("approved_requirements"):
            return {"tasks": replace_task(state["tasks"], {**task, "phase": "test"})}

        # Le nœud est rejoué depuis le début à la reprise : tout ce qui précède est sans effet de bord.
        approved = interrupt(
            {
                "type": "dependencies",
                "question": "Autoriser l'installation de ces dépendances (accès réseau) ?",
                "task": task["title"],
                "requirements": content,
            }
        )

        if not approved:
            (ws.root / REQUIREMENTS).unlink(missing_ok=True)
            updated = _after_failure(
                deps,
                task,
                "Dépendances externes refusées par l'humain (requirements.txt supprimé). "
                "Réécris le code avec la bibliothèque standard uniquement.",
            )
            log_event("dependencies", message="refusées")
            return {
                "tasks": replace_task(state["tasks"], updated),
                "history": add_history(state, "Dépendances refusées par l'humain"),
            }

        result = deps.sandbox.install_requirements(ws.root)
        if not result.ok:
            updated = _after_failure(deps, task, f"Installation des dépendances échouée :\n{result.output[-1500:]}")
            log_event("dependencies", message="installation échouée")
            return {
                "tasks": replace_task(state["tasks"], updated),
                "history": add_history(state, "Installation des dépendances échouée"),
            }

        log_event("dependencies", message="installées")
        return {
            "tasks": replace_task(state["tasks"], {**task, "phase": "test"}),
            "approved_requirements": digest,
            "history": add_history(state, "Dépendances validées et installées"),
        }

    return approve_deps
