"""Client OpenAI réel + CLI, face à un faux serveur imitant LM Studio (HTTP local)."""

from __future__ import annotations

import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

from agents import cli
from agents.config import get_settings
from agents.llm.client import OpenAIBackend
from tests.conftest import ScriptedBackend, fake_embed
from tests.test_graph import FIB_BUGGY, FIB_OK, FIB_TASK, FIB_TESTS, ANALYSIS


class FakeLMStudio:
    def __init__(self, script):
        self.backend = ScriptedBackend(script)
        self.requests: list[dict] = []
        outer = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *args):
                pass

            def _send(self, payload):
                body = json.dumps(payload).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def do_GET(self):
                self._send({"object": "list", "data": [{"id": "qwen-test", "object": "model"}, {"id": "embed-test", "object": "model"}]})

            def do_POST(self):
                req = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                outer.requests.append(req)
                if self.path.endswith("/embeddings"):
                    vecs = fake_embed(req["input"] if isinstance(req["input"], list) else [req["input"]])
                    self._send({"object": "list", "model": "embed-test",
                                "data": [{"object": "embedding", "index": i, "embedding": v} for i, v in enumerate(vecs)],
                                "usage": {"prompt_tokens": 1, "total_tokens": 1}})
                    return
                raw = outer.backend.chat(req["messages"])
                thinking = req.get("chat_template_kwargs", {}).get("enable_thinking", True)
                self._send({
                    "id": "x", "object": "chat.completion", "created": 0, "model": req["model"],
                    "choices": [{"index": 0, "finish_reason": "stop", "message": {
                        "role": "assistant", "content": raw.content,
                        "reasoning_content": "je réfléchis" if thinking else "",
                    }}],
                    "usage": {"prompt_tokens": 120, "completion_tokens": 60, "total_tokens": 180},
                })

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.url = f"http://127.0.0.1:{self.server.server_address[1]}/v1"
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def close(self):
        self.server.shutdown()


@pytest.fixture
def lmstudio():
    servers = []

    def _start(script):
        s = FakeLMStudio(script)
        servers.append(s)
        return s

    yield _start
    for s in servers:
        s.close()


def test_openai_backend_separates_reasoning(settings, lmstudio):
    srv = lmstudio({"query": [{"query": "q"}]})
    settings.llm_base_url, settings.llm_model = srv.url, "qwen-test"
    from agents import prompts

    raw = OpenAIBackend(settings).chat(
        [{"role": "system", "content": prompts.RESEARCH_QUERY}, {"role": "user", "content": "u"}],
        extra_body={"chat_template_kwargs": {"enable_thinking": True}},
        response_format={"type": "json_schema", "json_schema": {"name": "S", "schema": {"type": "object"}}},
    )
    assert raw.reasoning == "je réfléchis"
    assert json.loads(raw.content) == {"query": "q"}
    assert raw.completion_tokens == 60
    req = srv.requests[0]
    assert req["chat_template_kwargs"] == {"enable_thinking": True}
    assert req["response_format"]["type"] == "json_schema"


def test_cli_run_end_to_end(tmp_path, monkeypatch, lmstudio, capsys):
    srv = lmstudio(
        {
            "plan": [{"tasks": [FIB_TASK]}],
            "dev": [FIB_BUGGY, FIB_OK],
            "test_write": [FIB_TESTS],
            "test_analyze": [ANALYSIS],
        }
    )
    env = {
        "LLM_BASE_URL": srv.url,
        "LLM_MODEL": "qwen-test",
        "EMBED_MODEL": "embed-test",
        "EMBED_DIMS": "8",
        "DATABASE_URL": "",
        "SANDBOX_MODE": "local",
        "WORKSPACES_DIR": str(tmp_path / "ws"),
        "LOGS_DIR": str(tmp_path / "logs"),
        "SEARXNG_URL": "http://127.0.0.1:9",
    }
    for k, v in env.items():
        monkeypatch.setenv(k, v)
    monkeypatch.chdir(tmp_path)  # pas de .env du développeur
    get_settings.cache_clear()
    try:
        code = cli.main(["run", "crée une fonction fibonacci testée", "--thread-id", "cli1"])
        out = capsys.readouterr().out
        assert code == cli.EXIT_OK, out
        assert "SUCCESS" in out
        assert (tmp_path / "ws" / "cli1" / "fib.py").exists()
        log_lines = (tmp_path / "logs" / "cli1.jsonl").read_text(encoding="utf-8").splitlines()
        events = {json.loads(l)["event"] for l in log_lines}
        assert {"run_start", "plan", "manager_decision", "test_result", "llm_reasoning", "run_end"} <= events

        # check : LM Studio OK, SearXNG KO → code d'échec, sans exception.
        assert cli.main(["check"]) == cli.EXIT_FAILED
        out = capsys.readouterr().out
        assert "OK     LM Studio" in out and "ÉCHEC  SearXNG" in out
    finally:
        get_settings.cache_clear()
