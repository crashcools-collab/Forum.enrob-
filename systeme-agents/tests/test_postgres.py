"""Intégration PostgreSQL : reprise après interruption dans un nouveau runtime.

Lancé seulement si TEST_DATABASE_URL pointe vers une base avec pgvector, par exemple :
    TEST_DATABASE_URL=postgresql://agents:agents@localhost:5432/agents pytest tests/test_postgres.py
"""

from __future__ import annotations

import os
import uuid

import pytest
from langgraph.types import Command

from agents.graph import recursion_limit
from agents.runtime import open_runtime
from tests.test_graph import FIB_OK, FIB_TASK, FIB_TESTS, initial_state

DB_URL = os.environ.get("TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not DB_URL, reason="TEST_DATABASE_URL non défini")


def test_interrupt_then_resume_in_new_runtime(settings, make_llm):
    settings.database_url = DB_URL
    thread_id = f"test-{uuid.uuid4().hex[:8]}"
    with_req = FIB_OK + "### FICHIER: requirements.txt\n```\nrequests==2.32.3\n```\n"
    script = {"plan": [{"tasks": [FIB_TASK]}], "dev": [with_req, FIB_OK], "test_write": [FIB_TESTS]}

    llm1, _ = make_llm(script)
    with open_runtime(settings, llm=llm1) as rt:
        assert rt.persistent
        config = {"configurable": {"thread_id": thread_id}, "recursion_limit": recursion_limit(rt.deps)}
        paused = rt.graph.invoke(initial_state("fib", thread_id), config)
        assert "__interrupt__" in paused

    # Nouveau runtime, nouvelle connexion : l'état vient uniquement de PostgreSQL.
    llm2, backend2 = make_llm({**script, "dev": [FIB_OK]})
    with open_runtime(settings, llm=llm2) as rt:
        snapshot = rt.graph.get_state(config)
        assert snapshot.next == ("approve_deps",)
        final = rt.graph.invoke(Command(resume=False), config)
        assert final["final_status"] == "SUCCESS"
        assert "plan" not in backend2.count  # le plan n'est pas refait
        # La mémoire vectorielle persiste et se retrouve par similarité.
        assert rt.deps.memory.recall("Fonction fibonacci")
