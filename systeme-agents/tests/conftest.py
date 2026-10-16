"""Outils de test : faux serveur LLM scripté par rôle, réglages isolés."""

from __future__ import annotations

import hashlib
import json
import os
from collections import defaultdict

import pytest

from agents import prompts
from agents.config import Settings
from agents.llm.client import LLMClient, RawResponse

ROLE_PROMPTS = {
    "plan": prompts.MANAGER_PLAN,
    "replan": prompts.MANAGER_REPLAN,
    "query": prompts.RESEARCH_QUERY,
    "summary": prompts.RESEARCH_SUMMARY,
    "dev": prompts.DEVELOPER,
    "test_write": prompts.TESTER_WRITE,
    "test_analyze": prompts.TESTER_ANALYZE,
    "history": prompts.HISTORY_SUMMARY,
}


def fake_embed(texts: list[str]) -> list[list[float]]:
    out = []
    for t in texts:
        digest = hashlib.sha256(t.encode()).digest()
        out.append([b / 255 for b in digest[:8]])
    return out


class ScriptedBackend:
    """Renvoie, pour chaque rôle, les réponses prévues dans l'ordre (la dernière est répétée)."""

    def __init__(self, script: dict[str, list]):
        self.script = {k: list(v) for k, v in script.items()}
        self.calls: list[dict] = []
        self.count = defaultdict(int)

    def _role(self, messages: list[dict]) -> str:
        system = messages[0]["content"] if messages[0]["role"] == "system" else ""
        for role, text in ROLE_PROMPTS.items():
            if system.startswith(text):
                return role
        raise AssertionError(f"Rôle inconnu : {system[:80]}")

    def chat(self, messages, **params):
        role = self._role(messages)
        self.calls.append({"role": role, "messages": messages, "params": params})
        queue = self.script.get(role)
        if not queue:
            raise AssertionError(f"Aucune réponse prévue pour le rôle {role}")
        reply = queue.pop(0) if len(queue) > 1 else queue[0]
        self.count[role] += 1
        content = reply if isinstance(reply, str) else json.dumps(reply, ensure_ascii=False)
        return RawResponse(content=content, reasoning="", prompt_tokens=100, completion_tokens=50)

    def embed(self, texts):
        return fake_embed(texts)

    def list_models(self):
        return ["fake"]


@pytest.fixture
def settings(tmp_path) -> Settings:
    return Settings(
        _env_file=None,
        database_url="",
        # TEST_SANDBOX_MODE=docker rejoue les scénarios dans le vrai bac à sable.
        sandbox_mode=os.environ.get("TEST_SANDBOX_MODE", "local"),
        workspaces_dir=tmp_path / "workspaces",
        logs_dir=tmp_path / "logs",
        embed_dims=8,
        searxng_url="http://127.0.0.1:9",
        max_iterations=40,
    )


@pytest.fixture
def make_llm(settings):
    def _make(script: dict[str, list]) -> tuple[LLMClient, ScriptedBackend]:
        backend = ScriptedBackend(script)
        return LLMClient(settings, backend=backend), backend

    return _make


def file_block(path: str, content: str) -> str:
    return f"### FICHIER: {path}\n```python\n{content.strip()}\n```\n"
