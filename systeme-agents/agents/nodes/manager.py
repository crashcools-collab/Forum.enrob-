"""Manager : planification (LLM), routage (déterministe), replanification (LLM), rapport final.

Le routage est volontairement déterministe : choisir le prochain agent à partir de l'état
est une règle simple, et la confier à un modèle quantifié ajouterait des erreurs sans rien
apporter. Le LLM sert là où il faut du jugement : découper l'objectif et réagir aux échecs.
"""

from __future__ import annotations

import time

from agents import prompts
from agents.llm.client import LLMFormatError, estimate_tokens
from agents.logs import log_event
from agents.memory import format_recall
from agents.nodes.common import add_history, context_block, task_brief, workspace_for
from agents.report import build_report
from agents.schemas import Plan, Replan
from agents.state import AgentState, Deps, Task, find_task, new_task, replace_task

HISTORY_TOKEN_LIMIT = 2500


def make_plan_node(deps: Deps):
    def plan(state: AgentState) -> dict:
        lessons = deps.memory.recall(state["objective"])
        user = (
            f"Objectif : {state['objective']}\n\n"
            f"Leçons d'exécutions précédentes :\n{format_recall(lessons)}"
        )
        try:
            result = deps.llm.structured(
                agent="manager", system=prompts.MANAGER_PLAN, user=user, schema=Plan, thinking=True
            )
        except LLMFormatError as exc:
            log_event("plan", message=f"Échec de la planification : {exc}")
            return {
                "tasks": [],
                "final_status": "FAILED",
                "final_reason": "Le Manager n'a pas pu produire de plan valide.",
                "metrics": deps.llm.drain_metrics(),
            }

        tasks: list[Task] = []
        for i, planned in enumerate(result.tasks, start=1):
            # Seules les dépendances vers des tâches antérieures sont gardées : pas de cycle possible.
            tasks.append(new_task(i, planned, sorted({d for d in planned.depends_on if 0 < d < i})))
        log_event("plan", message=f"{len(tasks)} tâche(s)", tasks=[t["title"] for t in tasks])
        return {
            "tasks": tasks,
            "history": add_history(state, f"Plan : {len(tasks)} tâches — " + " | ".join(t["title"] for t in tasks)),
            "metrics": deps.llm.drain_metrics(),
        }

    return plan


def _budget_exceeded(deps: Deps, state: AgentState, iteration: int) -> str | None:
    s = deps.settings
    if iteration > s.max_iterations:
        return f"nombre d'itérations maximal atteint ({s.max_iterations})"
    if len(state.get("metrics", [])) >= s.max_llm_calls:
        return f"nombre d'appels LLM maximal atteint ({s.max_llm_calls})"
    if time.time() - state.get("started_at", time.time()) > s.max_duration_min * 60:
        return f"durée maximale atteinte ({s.max_duration_min} min)"
    return None


def make_route_node(deps: Deps):
    def route(state: AgentState) -> dict:
        iteration = state.get("iteration", 0) + 1
        update: dict = {"iteration": iteration}

        if state.get("final_status"):
            update["next_agent"] = "finish"
            return update

        reason = _budget_exceeded(deps, state, iteration)
        if reason:
            log_event("manager_decision", message=f"Arrêt : {reason}")
            return {**update, "next_agent": "finish", "final_status": "PARTIAL", "final_reason": reason}

        tasks = list(state.get("tasks", []))
        # Une tâche dont une dépendance est bloquée ne pourra jamais aboutir.
        blocked_ids = {t["id"] for t in tasks if t["status"] == "blocked"}
        changed = True
        while changed:
            changed = False
            for t in tasks:
                if t["status"] == "pending" and blocked_ids.intersection(t["depends_on"]):
                    t = {**t, "status": "blocked"}
                    tasks = replace_task(tasks, t)
                    blocked_ids.add(t["id"])
                    changed = True
        update["tasks"] = tasks

        current = find_task({"tasks": tasks}, state.get("current_task_id"))
        if current is None or current["status"] != "in_progress":
            done_ids = {t["id"] for t in tasks if t["status"] in ("done", "replaced")}
            ready = [t for t in tasks if t["status"] == "pending" and set(t["depends_on"]) <= done_ids]
            if not ready:
                if all(t["status"] in ("done", "replaced") for t in tasks):
                    status, why = "SUCCESS", "toutes les tâches sont validées par le Testeur"
                else:
                    status, why = "FAILED", "des tâches sont bloquées"
                log_event("manager_decision", message=f"Fin : {status} ({why})")
                return {**update, "next_agent": "finish", "final_status": status, "final_reason": why}
            current = {**ready[0], "status": "in_progress"}
            update["tasks"] = replace_task(tasks, current)
            update["current_task_id"] = current["id"]

        update["next_agent"] = current["phase"]
        log_event(
            "manager_decision",
            message=f"itération {iteration} → {current['phase']} (tâche {current['id']} : {current['title']}, "
            f"tentatives {current['attempts']})",
        )

        history = state.get("history", [])
        if estimate_tokens("\n".join(history)) > HISTORY_TOKEN_LIMIT and len(history) > 5:
            old, recent = history[:-5], history[-5:]
            summary = deps.llm.text(
                agent="manager",
                system=prompts.HISTORY_SUMMARY,
                user=f"Résumé précédent :\n{state.get('history_summary', '')}\n\nÉvénements :\n" + "\n".join(old),
                thinking=False,
            )
            update["history_summary"] = summary
            update["history"] = recent
            update["metrics"] = deps.llm.drain_metrics()
        return update

    return route


def make_replan_node(deps: Deps):
    def replan(state: AgentState) -> dict:
        task = find_task(state, state["current_task_id"])
        assert task is not None
        tasks = state["tasks"]
        reports = [r for r in state.get("test_reports", []) if r["task_id"] == task["id"]][-3:]
        failures = "\n\n".join(
            f"Tentative {r['attempt']} : {r.get('probable_cause', '')}\n{r.get('output_tail', '')[-800:]}" for r in reports
        ) or task["feedback"]

        decision: Replan | None = None
        if task["depth"] < deps.settings.max_replan_depth:
            try:
                decision = deps.llm.structured(
                    agent="manager",
                    system=prompts.MANAGER_REPLAN,
                    user=f"{context_block(state)}\n\n{task_brief(task)}\n\nÉchecs :\n{failures}",
                    schema=Replan,
                    thinking=True,
                )
            except LLMFormatError:
                decision = None

        if decision is None or decision.decision == "block" or not decision.new_tasks:
            why = decision.reason if decision else "profondeur de redécoupage maximale ou réponse invalide"
            blocked = {**task, "status": "blocked"}
            log_event("replan", message=f"Tâche {task['id']} bloquée : {why}")
            return {
                "tasks": replace_task(tasks, blocked),
                "current_task_id": None,
                "history": add_history(state, f"Tâche {task['id']} bloquée : {why}"),
                "metrics": deps.llm.drain_metrics(),
            }

        next_id = max(t["id"] for t in tasks) + 1
        new_ids = list(range(next_id, next_id + len(decision.new_tasks)))
        children: list[Task] = []
        for offset, planned in enumerate(decision.new_tasks):
            own_id = new_ids[offset]
            relative = {new_ids[d - 1] for d in planned.depends_on if 0 < d <= offset}
            children.append(new_task(own_id, planned, sorted(set(task["depends_on"]) | relative), depth=task["depth"] + 1))

        updated: list[Task] = []
        for t in tasks:
            if t["id"] == task["id"]:
                updated.append({**t, "status": "replaced"})
            elif task["id"] in t["depends_on"]:
                # Les tâches qui attendaient l'originale attendent désormais toutes ses sous-tâches.
                updated.append({**t, "depends_on": sorted((set(t["depends_on"]) - {task["id"]}) | set(new_ids))})
            else:
                updated.append(t)
        # Les sous-tâches s'insèrent juste après la tâche remplacée (ordre d'exécution).
        idx = next(i for i, t in enumerate(updated) if t["id"] == task["id"])
        updated = updated[: idx + 1] + children + updated[idx + 1 :]

        log_event("replan", message=f"Tâche {task['id']} redécoupée en {len(children)} : {decision.reason}")
        return {
            "tasks": updated,
            "current_task_id": None,
            "history": add_history(
                state, f"Tâche {task['id']} redécoupée ({decision.reason}) : " + " | ".join(c["title"] for c in children)
            ),
            "metrics": deps.llm.drain_metrics(),
        }

    return replan


def make_finish_node(deps: Deps):
    def finish(state: AgentState) -> dict:
        status = state.get("final_status") or "FAILED"
        report = build_report(state, deps.settings, status)
        ws = workspace_for(deps, state)
        ws.write_file("REPORT.md", report)
        deps.memory.remember(
            f"Objectif « {state['objective'][:200]} » : {status} ({state.get('final_reason', '')}). "
            + "; ".join(f"{t['title']} → {t['status']} ({t['attempts']} échec(s))" for t in state.get("tasks", [])),
            kind="objectif",
        )
        log_event("run_end", message=f"{status} — {state.get('final_reason', '')}", report=str(ws.root / "REPORT.md"))
        return {"final_status": status, "report": report, "next_agent": "end"}

    return finish
