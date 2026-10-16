"""`python -m agents check` : tout ce qui doit être prêt avant une exécution."""

from __future__ import annotations

from agents.config import Settings
from agents.llm.client import LLMClient
from agents.tools.sandbox import Sandbox
from agents.tools.search import WebSearch


def _check_llm(settings: Settings, llm: LLMClient) -> list[tuple[str, bool, str]]:
    results = []
    try:
        models = llm.backend.list_models()
    except Exception as exc:
        return [("LM Studio", False, str(exc))]
    results.append(("LM Studio", True, f"{settings.llm_base_url} ({len(models)} modèle(s))"))
    for label, name in (("Modèle principal", settings.llm_model), ("Modèle d'embeddings", settings.embed_model)):
        ok = name in models
        detail = name if ok else f"{name} absent. Disponibles : {', '.join(models) or 'aucun'}"
        results.append((label, ok, detail))
    if not results[1][1]:
        return results

    try:
        raw = llm.backend.chat(
            [{"role": "user", "content": "Réponds uniquement : OK"}],
            max_tokens=200,
            temperature=0.0,
            extra_body={"chat_template_kwargs": {"enable_thinking": False}},
        )
        respected = not raw.reasoning and "<think>" not in raw.content
        results.append(
            (
                "Désactivation du thinking",
                True,
                "respectée" if respected else "IGNORÉE par le serveur : le thinking restera actif partout "
                "(plus lent, prévoir un max_tokens large)",
            )
        )
    except Exception as exc:
        results.append(("Appel de test", False, str(exc)))

    if results[2][1]:
        try:
            dims = len(llm.backend.embed(["test"])[0])
            ok = dims == settings.embed_dims
            results.append(("Dimension des embeddings", ok, f"{dims}" + ("" if ok else f" ≠ EMBED_DIMS={settings.embed_dims}")))
        except Exception as exc:
            results.append(("Embeddings", False, str(exc)))
    return results


def _check_postgres(settings: Settings) -> tuple[str, bool, str]:
    if not settings.database_url:
        return ("PostgreSQL", True, "désactivé (mode mémoire, pas de reprise possible)")
    try:
        import psycopg

        with psycopg.connect(settings.database_url, connect_timeout=5) as conn:
            row = conn.execute("select 1 from pg_available_extensions where name = 'vector'").fetchone()
        if not row:
            return ("PostgreSQL", False, "connecté, mais l'extension pgvector n'est pas installée")
        return ("PostgreSQL", True, "connecté, pgvector disponible")
    except Exception as exc:
        return ("PostgreSQL", False, f"{exc}".strip())


def run_checks(settings: Settings, llm: LLMClient) -> list[tuple[str, bool, str]]:
    results = _check_llm(settings, llm)
    results.append(_check_postgres(settings))
    try:
        results.append(("SearXNG", True, WebSearch(settings).check()))
    except Exception as exc:
        results.append(("SearXNG", False, str(exc)))
    try:
        results.append(("Bac à sable", True, Sandbox(settings).check()))
    except Exception as exc:
        results.append(("Bac à sable", False, str(exc)))
    return results
