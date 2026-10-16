"""Bac à sable Docker réel. Lancé seulement si l'image existe et RUN_DOCKER_TESTS=1 :
    docker build -t agents-sandbox:latest sandbox/
    RUN_DOCKER_TESTS=1 pytest tests/test_docker_sandbox.py
"""

from __future__ import annotations

import os

import pytest

from agents.tools.sandbox import Sandbox
from agents.tools.workspace import Workspace

pytestmark = pytest.mark.skipif(os.environ.get("RUN_DOCKER_TESTS") != "1", reason="RUN_DOCKER_TESTS != 1")


@pytest.fixture
def docker_settings(settings):
    settings.sandbox_mode = "docker"
    settings.sandbox_timeout_s = 10
    return settings


def _ws(tmp_path, test_body: str) -> Workspace:
    ws = Workspace(tmp_path / "ws")
    ws.write_file("tests/test_x.py", test_body)
    return ws


def test_pass_and_fail(docker_settings, tmp_path):
    sb = Sandbox(docker_settings)
    assert "docker" in sb.check()
    ws = _ws(tmp_path, "def test_ok():\n    assert 1 + 1 == 2")
    assert sb.run_tests(ws.root).ok
    ws.write_file("tests/test_x.py", "def test_ko():\n    assert 1 == 2")
    res = sb.run_tests(ws.root)
    assert not res.ok and "assert 1 == 2" in res.output


def test_no_network(docker_settings, tmp_path):
    body = (
        "import socket, pytest\n\n"
        "def test_net():\n"
        "    with pytest.raises(OSError):\n"
        "        socket.create_connection(('1.1.1.1', 53), timeout=3)\n"
    )
    assert Sandbox(docker_settings).run_tests(_ws(tmp_path, body).root).ok


def test_timeout_kills(docker_settings, tmp_path):
    res = Sandbox(docker_settings).run_tests(_ws(tmp_path, "import time\n\ndef test_long():\n    time.sleep(60)").root)
    assert res.timed_out and not res.ok


def test_cannot_write_outside_workspace(docker_settings, tmp_path):
    body = "import pathlib\n\ndef test_w():\n    pathlib.Path('/work/sortie.txt').write_text('ok')\n"
    ws = _ws(tmp_path, body)
    assert Sandbox(docker_settings).run_tests(ws.root).ok
    assert (ws.root / "sortie.txt").read_text() == "ok"  # seul /work est monté
