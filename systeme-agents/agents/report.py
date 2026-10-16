"""Métriques d'exécution et rapport final (Markdown)."""

from __future__ import annotations

import time

from agents.config import Settings
from agents.state import AgentState


# En dessous, un taux ne veut rien dire (1 appel sur 1 = 100 %).
MIN_STRUCTURED_CALLS_FOR_ALERT = 5
MIN_TASKS_FOR_ALERT = 3


def compute_metrics(state: AgentState, settings: Settings) -> dict:
    calls = state.get("metrics", [])
    first = [m for m in calls if m["kind"] == "structured"]
    # « repaired » = JSON correct mais entouré de texte ou de balises, récupéré sans nouvel appel :
    # simple mise en forme. « invalid » = il a fallu un second appel : vraie erreur du modèle.
    cleaned = sum(1 for m in first if m["json"] == "repaired")
    invalid_before = sum(1 for m in first if m["json"] == "invalid")
    failed_after = sum(1 for m in calls if m["json"] == "failed")
    total_s = sum(m["duration_s"] for m in calls)
    completion = sum(m["completion_tokens"] for m in calls)

    tasks = [t for t in state.get("tasks", []) if t["status"] != "replaced"]
    tries = {t["id"]: t["attempts"] + (1 if t["status"] == "done" else 0) for t in tasks}
    heavy = [tid for tid, n in tries.items() if n >= settings.max_attempts]

    per_agent: dict[str, dict] = {}
    for m in calls:
        a = per_agent.setdefault(m["agent"], {"appels": 0, "duree_s": 0.0, "tokens_sortie": 0})
        a["appels"] += 1
        a["duree_s"] = round(a["duree_s"] + m["duration_s"], 1)
        a["tokens_sortie"] += m["completion_tokens"]

    metrics = {
        "llm_calls": len(calls),
        "llm_time_s": round(total_s, 1),
        "prompt_tokens": sum(m["prompt_tokens"] for m in calls),
        "completion_tokens": completion,
        "tokens_per_s": round(completion / total_s, 1) if total_s else 0.0,
        "structured_calls": len(first),
        "json_cleaned_rate": round(cleaned / len(first), 3) if first else 0.0,
        "json_invalid_rate_before_repair": round(invalid_before / len(first), 3) if first else 0.0,
        "json_invalid_rate_after_repair": round(failed_after / len(first), 3) if first else 0.0,
        "tries_per_task": tries,
        "tasks_at_max_tries": heavy,
        "per_agent": per_agent,
        "wall_time_min": round((time.time() - state.get("started_at", time.time())) / 60, 1),
    }
    alerts = []
    if (
        len(first) >= MIN_STRUCTURED_CALLS_FOR_ALERT
        and metrics["json_invalid_rate_before_repair"] > settings.alert_json_invalid_rate
    ):
        alerts.append(
            f"{metrics['json_invalid_rate_before_repair']:.0%} des sorties JSON ont demandé un second appel "
            f"(seuil {settings.alert_json_invalid_rate:.0%}) : la quantification limite probablement le modèle, "
            "essayez une version plus fine (IQ4_XS)."
        )
    if len(tasks) >= MIN_TASKS_FOR_ALERT and len(heavy) / len(tasks) > settings.alert_max_attempt_share:
        alerts.append(
            f"{len(heavy)}/{len(tasks)} tâches ont demandé {settings.max_attempts} tentatives ou plus : "
            "tâches trop grosses ou modèle trop limité."
        )
    metrics["alerts"] = alerts
    return metrics


_STATUS_LABEL = {"done": "validée", "blocked": "bloquée", "replaced": "redécoupée", "pending": "non traitée", "in_progress": "interrompue"}


def build_report(state: AgentState, settings: Settings, status: str) -> str:
    m = compute_metrics(state, settings)
    lines = [
        f"# Rapport d'exécution — {status}",
        "",
        f"**Objectif :** {state.get('objective', '')}",
        f"**Raison :** {state.get('final_reason', '')}",
        f"**Modèle :** {settings.llm_model} ({settings.llm_quant}), contexte {settings.llm_context}",
        "",
        "## Tâches",
        "",
        "| # | Tâche | Statut | Essais |",
        "|---|---|---|---|",
    ]
    for t in state.get("tasks", []):
        tries = m["tries_per_task"].get(t["id"], "—")
        lines.append(f"| {t['id']} | {t['title']} | {_STATUS_LABEL.get(t['status'], t['status'])} | {tries} |")
    lines += [
        "",
        "## Métriques",
        "",
        f"- Appels LLM : {m['llm_calls']} ({m['llm_time_s']} s de génération, {m['tokens_per_s']} tokens/s en moyenne)",
        f"- Tokens : {m['prompt_tokens']} en entrée, {m['completion_tokens']} en sortie",
        f"- Sorties JSON ({m['structured_calls']} appels structurés) : {m['json_invalid_rate_before_repair']:.0%} "
        f"ont demandé un second appel, {m['json_invalid_rate_after_repair']:.0%} ont échoué, "
        f"{m['json_cleaned_rate']:.0%} simplement nettoyées (texte ou balises autour du JSON)",
        f"- Durée totale : {m['wall_time_min']} min",
        "",
        "| Agent | Appels | Durée (s) | Tokens de sortie |",
        "|---|---|---|---|",
    ]
    for agent, a in sorted(m["per_agent"].items()):
        lines.append(f"| {agent} | {a['appels']} | {a['duree_s']} | {a['tokens_sortie']} |")
    if m["alerts"]:
        lines += ["", "## Alertes", ""] + [f"- {a}" for a in m["alerts"]]
    return "\n".join(lines) + "\n"
