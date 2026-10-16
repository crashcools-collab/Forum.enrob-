"""Agent Recherche Web : une requête SearXNG, lecture des meilleures pages, synthèse sourcée."""

from __future__ import annotations

from agents import prompts
from agents.llm.client import LLMFormatError
from agents.logs import log_event
from agents.nodes.common import add_history, context_block, task_brief
from agents.schemas import ResearchNote, SearchQuery
from agents.state import AgentState, Deps, find_task, replace_task
from agents.tools.search import SearchError

PAGES_TO_READ = 2


def make_researcher_node(deps: Deps):
    def researcher(state: AgentState) -> dict:
        task = find_task(state, state["current_task_id"])
        assert task is not None
        notes = dict(state.get("research_notes", {}))

        try:
            query = deps.llm.structured(
                agent="recherche",
                system=prompts.RESEARCH_QUERY,
                user=f"{context_block(state)}\n\n{task_brief(task)}",
                schema=SearchQuery,
            ).query
            hits = deps.search.search(query)
            if not hits:
                note = f"Recherche « {query} » : aucun résultat."
            else:
                extracts = []
                for hit in hits[:PAGES_TO_READ]:
                    extracts.append(f"URL : {hit.url}\nTitre : {hit.title}\n{deps.search.fetch_text(hit.url)}")
                extracts += [f"URL : {h.url}\nTitre : {h.title}\nExtrait : {h.snippet}" for h in hits[PAGES_TO_READ:]]
                result = deps.llm.structured(
                    agent="recherche",
                    system=prompts.RESEARCH_SUMMARY,
                    user=f"{task_brief(task)}\n\nExtraits :\n\n" + "\n\n---\n\n".join(extracts),
                    schema=ResearchNote,
                )
                note = result.summary + ("\nSources : " + ", ".join(result.sources) if result.sources else "")
        except SearchError as exc:
            note = f"Recherche indisponible ({exc}). Le Développeur doit s'appuyer sur ses connaissances."
            log_event("warning", message=str(exc))
        except LLMFormatError as exc:
            note = f"Synthèse de recherche impossible ({exc})."

        notes[str(task["id"])] = note
        updated = {**task, "phase": "develop"}
        log_event("research_done", message=f"tâche {task['id']} : {note[:150]}")
        return {
            "research_notes": notes,
            "tasks": replace_task(state["tasks"], updated),
            "history": add_history(state, f"Recherche pour la tâche {task['id']} terminée"),
            "metrics": deps.llm.drain_metrics(),
        }

    return researcher
