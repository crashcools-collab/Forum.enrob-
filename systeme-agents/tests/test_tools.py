import pytest

from agents.nodes.tester import failure_signature
from agents.tools.sandbox import Sandbox
from agents.tools.search import html_to_text
from agents.tools.workspace import Workspace, WorkspaceError, parse_file_blocks


def test_workspace_refuses_escape(tmp_path):
    ws = Workspace(tmp_path / "ws")
    for bad in ["../evil.py", "a/../../x", "~/x", ".deps/x.py", ""]:
        with pytest.raises(WorkspaceError):
            ws.write_file(bad, "x")
    assert ws.write_file("/pkg/mod.py", "x = 1") == "pkg/mod.py"  # « / » initial ramené dans le workspace


def test_snapshot_respects_budget(tmp_path):
    ws = Workspace(tmp_path / "ws")
    ws.write_file("small.py", "a = 1")
    ws.write_file("big.py", "x = 1\n" * 2000)
    snap = ws.snapshot(token_budget=200, priority=["small.py"])
    assert "### FICHIER: small.py" in snap
    assert "non affichés (budget) : big.py" in snap


def test_parse_file_blocks():
    text = (
        "Voici le code.\n\n### FICHIER: fib.py\n```python\ndef fib(n):\n    return n\n```\n\n"
        "#### FILE: `pkg/util.py`\n```\nX = 1\n```\nFin."
    )
    assert parse_file_blocks(text) == [("fib.py", "def fib(n):\n    return n"), ("pkg/util.py", "X = 1")]


def test_failure_signature_ignores_numbers():
    a = "FAILED tests/test_a.py::test_x - assert 3 == 4\nE   at line 12 0x7f3a"
    b = "FAILED tests/test_a.py::test_x - assert 5 == 6\nE   at line 98 0x1234"
    c = "FAILED tests/test_a.py::test_y - KeyError"
    assert failure_signature(a) == failure_signature(b) != failure_signature(c)


def test_html_to_text():
    html = "<html><script>var x;</script><body><h1>Titre</h1><p>Texte  utile</p><nav>menu</nav></body></html>"
    assert html_to_text(html) == "Titre Texte utile"


def test_local_sandbox_runs_pytest(settings, tmp_path):
    ws = Workspace(tmp_path / "ws")
    ws.write_file("m.py", "def f():\n    return 1")
    ws.write_file("tests/test_m.py", "from m import f\n\ndef test_f():\n    assert f() == 1")
    assert Sandbox(settings).run_tests(ws.root).ok
    ws.write_file("tests/test_m.py", "from m import f\n\ndef test_f():\n    assert f() == 2")
    res = Sandbox(settings).run_tests(ws.root)
    assert not res.ok and "assert 1 == 2" in res.output
