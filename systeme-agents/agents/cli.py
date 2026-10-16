"""Ligne de commande : run, resume, check."""

from __future__ import annotations

import argparse
import os
import sys
import threading
import time
import uuid
from pathlib import Path

from langgraph.types import Command

from agents import logs
from agents.config import Settings, get_settings
from agents.graph import recursion_limit
from agents.llm.client import LLMClient, LLMError
from agents.logs import log_event
from agents.runtime import Runtime, open_runtime

EXIT_OK, EXIT_FAILED, EXIT_WAITING_HUMAN, EXIT_ERROR = 0, 1, 3, 4


def _ask_approval(payload: dict, auto: str | None) -> bool | None:
    print("\n=== VALIDATION HUMAINE REQUISE ===", file=sys.stderr)
    print(f"{payload.get('question')}\nTâche : {payload.get('task')}\n\n{payload.get('requirements', '')}", file=sys.stderr)
    if auto == "yes":
        print("→ approuvé automatiquement (--approve-deps yes)", file=sys.stderr)
        return True
    if auto == "no":
        print("→ refusé automatiquement (--approve-deps no)", file=sys.stderr)
        return False
    if not sys.stdin.isatty():
        return None
    return input("Autoriser ? [o/N] ").strip().lower() in {"o", "oui", "y", "yes"}


def _interruptible(fn, thread_id: str):
    """Exécute `fn` dans un thread pour que Ctrl+C réponde tout de suite.

    Sous Windows, Python ne traite Ctrl+C qu'au retour d'un appel bloquant : sans ça,
    il faut attendre la fin de la génération en cours (plusieurs minutes). On quitte
    brutalement : l'état est sauvegardé après chaque nœud, `resume` rejoue le nœud coupé.
    """
    result: dict = {}

    def target():
        try:
            result["value"] = fn()
        except BaseException as exc:  # transmis au thread principal
            result["error"] = exc

    worker = threading.Thread(target=target, daemon=True)
    worker.start()
    try:
        while worker.is_alive():
            worker.join(0.3)
    except KeyboardInterrupt:
        print(
            f"\nInterrompu. L'état est sauvegardé. Pour reprendre :\n  python -m agents resume {thread_id}",
            file=sys.stderr,
            flush=True,
        )
        os._exit(EXIT_ERROR)
    if "error" in result:
        raise result["error"]
    return result.get("value")


def _drive(rt: Runtime, thread_id: str, inputs, auto_approve: str | None) -> int:
    config = {"configurable": {"thread_id": thread_id}, "recursion_limit": recursion_limit(rt.deps)}

    def consume(stream_inputs):
        pending = None
        for chunk in rt.graph.stream(stream_inputs, config, stream_mode="updates"):
            if "__interrupt__" in chunk:
                pending = chunk["__interrupt__"][0].value
        return pending

    while True:
        pending = _interruptible(lambda: consume(inputs), thread_id)
        if pending is None:
            break
        decision = _ask_approval(pending, auto_approve)
        if decision is None:
            print(
                f"\nExécution en pause. Reprenez avec :\n  python -m agents resume {thread_id} --approve-deps yes|no",
                file=sys.stderr,
            )
            return EXIT_WAITING_HUMAN
        inputs = Command(resume=decision)

    values = rt.graph.get_state(config).values
    print(values.get("report", "(pas de rapport)"))
    workspace = Path(rt.deps.settings.workspaces_dir) / thread_id
    print(f"\nWorkspace : {workspace.resolve()}\nJournal : {(Path(rt.deps.settings.logs_dir) / f'{thread_id}.jsonl').resolve()}")
    return EXIT_OK if values.get("final_status") == "SUCCESS" else EXIT_FAILED


def cmd_run(settings: Settings, objective: str, thread_id: str | None, auto_approve: str | None) -> int:
    thread_id = thread_id or time.strftime("%Y%m%d-%H%M%S-") + uuid.uuid4().hex[:6]
    logs.configure(Path(settings.logs_dir) / f"{thread_id}.jsonl")
    log_event("run_start", message=f"thread {thread_id} : {objective}")
    with open_runtime(settings) as rt:
        if not rt.persistent:
            log_event("warning", message="DATABASE_URL vide : mode mémoire, reprise impossible après arrêt")
        initial = {
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
        return _drive(rt, thread_id, initial, auto_approve)


def cmd_resume(settings: Settings, thread_id: str, auto_approve: str | None) -> int:
    if not settings.database_url:
        print("La reprise nécessite PostgreSQL (DATABASE_URL).", file=sys.stderr)
        return EXIT_ERROR
    logs.configure(Path(settings.logs_dir) / f"{thread_id}.jsonl")
    log_event("run_start", message=f"reprise du thread {thread_id}")
    with open_runtime(settings) as rt:
        config = {"configurable": {"thread_id": thread_id}}
        snapshot = rt.graph.get_state(config)
        if not snapshot.values:
            print(f"Thread inconnu : {thread_id}", file=sys.stderr)
            return EXIT_ERROR
        if not snapshot.next:
            print(snapshot.values.get("report", "Exécution déjà terminée."))
            return EXIT_OK if snapshot.values.get("final_status") == "SUCCESS" else EXIT_FAILED
        interrupts = [i for task in snapshot.tasks for i in task.interrupts]
        if interrupts:
            decision = _ask_approval(interrupts[0].value, auto_approve)
            if decision is None:
                print("Précisez --approve-deps yes|no.", file=sys.stderr)
                return EXIT_WAITING_HUMAN
            return _drive(rt, thread_id, Command(resume=decision), auto_approve)
        return _drive(rt, thread_id, None, auto_approve)


def cmd_check(settings: Settings) -> int:
    from agents.checks import run_checks

    results = run_checks(settings, LLMClient(settings))
    width = max(len(name) for name, _, _ in results)
    for name, ok, detail in results:
        print(f"{'OK    ' if ok else 'ÉCHEC '} {name.ljust(width)}  {detail}")
    return EXIT_OK if all(ok for _, ok, _ in results) else EXIT_FAILED


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m agents", description="Système multi-agents autonome")
    sub = parser.add_subparsers(dest="command", required=True)

    p_run = sub.add_parser("run", help="lancer un objectif")
    p_run.add_argument("objective")
    p_run.add_argument("--thread-id")
    p_run.add_argument("--approve-deps", choices=["yes", "no"], help="réponse automatique aux demandes de dépendances")

    p_resume = sub.add_parser("resume", help="reprendre une exécution interrompue")
    p_resume.add_argument("thread_id")
    p_resume.add_argument("--approve-deps", choices=["yes", "no"])

    sub.add_parser("check", help="vérifier LM Studio, PostgreSQL, SearXNG et le bac à sable")

    args = parser.parse_args(argv)
    settings = get_settings()
    try:
        if args.command == "run":
            return cmd_run(settings, args.objective, args.thread_id, args.approve_deps)
        if args.command == "resume":
            return cmd_resume(settings, args.thread_id, args.approve_deps)
        return cmd_check(settings)
    except LLMError as exc:
        print(f"\nErreur LLM : {exc}\nL'état est sauvegardé : corrigez puis lancez `resume`.", file=sys.stderr)
        return EXIT_ERROR
    except KeyboardInterrupt:
        print("\nInterrompu. L'état est sauvegardé : `python -m agents resume <thread_id>`.", file=sys.stderr)
        return EXIT_ERROR
