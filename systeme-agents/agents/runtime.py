"""Construction des dépendances et de la persistance (PostgreSQL ou mémoire)."""

from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass

from agents.config import Settings
from agents.graph import build_graph
from agents.llm.client import LLMClient
from agents.memory import Memory
from agents.state import Deps
from agents.tools.sandbox import Sandbox
from agents.tools.search import WebSearch


@dataclass
class Runtime:
    deps: Deps
    graph: object
    persistent: bool


def make_deps(settings: Settings, llm: LLMClient | None = None, store=None, search: WebSearch | None = None) -> Deps:
    llm = llm or LLMClient(settings)
    return Deps(
        settings=settings,
        llm=llm,
        memory=Memory(store),
        sandbox=Sandbox(settings),
        search=search or WebSearch(settings),
    )


@contextmanager
def open_runtime(settings: Settings, llm: LLMClient | None = None) -> Iterator[Runtime]:
    llm = llm or LLMClient(settings)
    index = {"dims": settings.embed_dims, "embed": llm.embed, "fields": ["text"]}

    if settings.database_url:
        from langgraph.checkpoint.postgres import PostgresSaver
        from langgraph.store.postgres import PostgresStore

        with (
            PostgresSaver.from_conn_string(settings.database_url) as saver,
            PostgresStore.from_conn_string(settings.database_url, index=index) as store,
        ):
            saver.setup()
            store.setup()
            deps = make_deps(settings, llm=llm, store=store)
            yield Runtime(deps=deps, graph=build_graph(deps, checkpointer=saver, store=store), persistent=True)
    else:
        from langgraph.checkpoint.memory import InMemorySaver
        from langgraph.store.memory import InMemoryStore

        store = InMemoryStore(index=index)
        deps = make_deps(settings, llm=llm, store=store)
        yield Runtime(deps=deps, graph=build_graph(deps, checkpointer=InMemorySaver(), store=store), persistent=False)
