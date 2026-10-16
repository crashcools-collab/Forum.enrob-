"""Cockpit : deux demandes successives sur le même projet, commandes, exécution du code produit."""

from __future__ import annotations

import io
import sys

from rich.console import Console

from agents.shell import Cockpit
from tests.conftest import file_block
from tests.test_graph import FIB_OK, FIB_TASK, FIB_TESTS

CARRE_TASK = {
    "title": "Fonction carré",
    "description": "Créer carre.py avec carre(x: int) -> int",
    "acceptance": "carre(3) == 9",
    "needs_research": False,
    "depends_on": [],
}
CARRE_OK = file_block("carre.py", "def carre(x):\n    return x * x")
CARRE_TESTS = file_block("tests/t.py", "from carre import carre\n\ndef test_carre():\n    assert carre(3) == 9")


def test_cockpit_session(settings, make_llm):
    llm, backend = make_llm(
        {
            "plan": [{"tasks": [FIB_TASK]}, {"tasks": [CARRE_TASK]}],
            "dev": [FIB_OK, CARRE_OK],
            "test_write": [FIB_TESTS, CARRE_TESTS],
        }
    )
    out = io.StringIO()
    console = Console(file=out, width=140, force_terminal=False, color_system=None)
    inputs = iter(
        [
            "/aide",
            "crée une fonction fibonacci testée",
            "/fichiers",
            "/voir fib.py",
            f'!"{sys.executable}" -c "from fib import fib; print(fib(10))"',
            "ajoute une fonction carré",
            "/historique",
            "/rapport",
            "/inconnue",
            "/quitter",
        ]
    )
    code = Cockpit(settings, "mon projet", console=console, llm=llm).loop(read_line=lambda: next(inputs))
    text = out.getvalue()

    assert code == 0
    assert "mon-projet" in text  # nom de projet nettoyé
    assert text.count("SUCCESS") >= 2
    assert "def fib(n):" in text  # /voir
    assert "\n55\n" in text  # !commande exécutée dans le projet
    assert "Commande inconnue" in text

    ws = settings.workspaces_dir / "mon-projet"
    assert (ws / "fib.py").exists() and (ws / "carre.py").exists()
    # Les tests de la première demande ne sont pas écrasés par ceux de la seconde.
    assert len(list((ws / "tests").glob("test_*.py"))) == 2
    # Le second plan connaît le projet existant.
    second_plan = [c for c in backend.calls if c["role"] == "plan"][1]["messages"][1]["content"]
    assert "Ce projet existe déjà" in second_plan and "fib.py" in second_plan
    assert "crée une fonction fibonacci testée → SUCCESS" in second_plan


def test_cockpit_reports_startup_failure(settings, make_llm):
    settings.database_url = "postgresql://x:y@127.0.0.1:1/z"
    llm, _ = make_llm({})
    out = io.StringIO()
    console = Console(file=out, width=140, force_terminal=False, color_system=None)
    code = Cockpit(settings, "p", console=console, llm=llm).loop(read_line=lambda: "/quitter")
    assert code == 1
    assert "Démarrage impossible" in out.getvalue()
