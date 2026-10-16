"""Cockpit interactif dans le terminal, façon Claude Code : on tape une demande, les agents
travaillent sous vos yeux, et chaque nouvelle demande continue le même projet."""

from __future__ import annotations

import subprocess
import time
from pathlib import Path

from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.syntax import Syntax
from rich.table import Table
from rich.tree import Tree

from agents import logs
from agents.cli import drive, initial_state, new_thread_id
from agents.config import Settings
from agents.llm.client import LLMClient, LLMError
from agents.logs import log_event
from agents.project import clean_name, last_thread, list_projects, read_history, set_last_thread
from agents.runtime import Runtime, open_runtime
from agents.tools.workspace import Workspace

AIDE = """\
[bold]Tapez une demande[/] en langage naturel : les agents la réalisent dans le projet courant.
Chaque nouvelle demande continue le même code (« ajoute… », « corrige… », « modifie… »).

[bold]Commandes[/]
  [cyan]/fichiers[/]            arborescence du projet
  [cyan]/voir[/] [dim]<fichier>[/]      afficher un fichier avec coloration
  [cyan]/rapport[/]             rapport de la dernière exécution
  [cyan]/historique[/]          demandes déjà réalisées dans ce projet
  [cyan]/projet[/] [dim]<nom>[/]       changer de projet (le crée s'il n'existe pas)
  [cyan]/projets[/]             lister les projets
  [cyan]/reprendre[/]           reprendre la dernière exécution interrompue
  [cyan]/check[/]               vérifier LM Studio, PostgreSQL, SearXNG, bac à sable
  [cyan]/effacer[/]             effacer l'écran
  [cyan]/quitter[/]             quitter (ou Ctrl+D)
  [cyan]![/][dim]commande[/]            lancer une commande dans le dossier du projet (ex. [dim]!python main.py[/])

[dim]Ctrl+C pendant une exécution : arrêt immédiat, l'état est sauvegardé (/reprendre au prochain lancement).[/]"""

# Libellés affichés pendant que l'agent travaille (phase de la tâche → activité).
_ACTIVITE = {
    "plan": "Le Manager planifie",
    "research": "La Recherche Web cherche",
    "develop": "Le Développeur écrit le code",
    "approve_deps": "Validation des dépendances",
    "test": "Le Testeur vérifie",
    "replan": "Le Manager replanifie",
    "finish": "Rédaction du rapport",
}


class Cockpit:
    def __init__(self, settings: Settings, project: str, console: Console | None = None, llm: LLMClient | None = None):
        self.s = settings
        self.project = clean_name(project)
        self.console = console or Console(highlight=False)
        self.llm = llm
        self.activity = ""
        self.activity_since = time.monotonic()
        self.status = None

    # ------------------------------------------------------------------ utilitaires

    @property
    def ws(self) -> Workspace:
        return Workspace(Path(self.s.workspaces_dir) / self.project)

    def _set_activity(self, text: str) -> None:
        self.activity = text
        self.activity_since = time.monotonic()

    def _tick(self) -> None:
        if self.status is not None:
            elapsed = int(time.monotonic() - self.activity_since)
            self.status.update(f"[bold cyan]{self.activity}[/] [dim]· {elapsed} s · Ctrl+C pour arrêter[/]")

    def _print_event(self, event: str, fields: dict) -> None:
        c, msg = self.console, fields.get("message", "")
        if event == "plan":
            c.print(f"[bold]Plan[/] : {msg}")
            for i, title in enumerate(fields.get("tasks", []), start=1):
                c.print(f"   [dim]{i}.[/] {title}")
        elif event == "manager_decision":
            if msg.startswith("itération"):
                phase = msg.split("→ ", 1)[1].split(" ", 1)[0] if "→ " in msg else ""
                detail = msg.split("(", 1)[1].rstrip(")") if "(" in msg else ""
                self._set_activity(f"{_ACTIVITE.get(phase, phase)} — {detail.split(',')[0]}")
            else:
                c.print(f"[bold]{msg}[/]")
        elif event == "llm_call":
            c.print(f"   [dim]· {msg}[/]")
        elif event == "developer_done":
            ok = "aucun fichier" not in msg
            c.print(f"[{'green' if ok else 'yellow'}]{'✎' if ok else '!'} Développeur[/] {msg}")
        elif event == "test_result":
            ok = "VALIDÉE" in msg
            c.print(f"[{'green' if ok else 'red'}]{'✓' if ok else '✗'} Testeur[/] {msg}")
        elif event == "research_done":
            c.print(f"[blue]⌕ Recherche[/] {msg}")
        elif event == "replan":
            c.print(f"[yellow]↻ Manager[/] {msg}")
        elif event in ("dependencies", "warning"):
            c.print(f"[yellow]! {msg}[/]")
        elif event == "run_end":
            self._set_activity("Rédaction du rapport")

    def _ask(self, payload: dict) -> bool | None:
        if self.status is not None:
            self.status.stop()
        self.console.print(
            Panel(
                f"{payload.get('question')}\n\n[dim]Tâche : {payload.get('task')}[/]\n\n{payload.get('requirements', '')}",
                title="Validation requise",
                border_style="yellow",
            )
        )
        answer = self.console.input("Autoriser ? [o/N] ").strip().lower() in {"o", "oui", "y", "yes"}
        if self.status is not None:
            self.status.start()
        return answer

    # ------------------------------------------------------------------ exécution

    def _execute(self, rt: Runtime, thread_id: str, inputs) -> None:
        logs.configure(Path(self.s.logs_dir) / f"{thread_id}.jsonl")
        set_last_thread(self.ws, thread_id)
        self._set_activity(_ACTIVITE["plan"] if isinstance(inputs, dict) else "Reprise")
        start = time.monotonic()
        try:
            with self.console.status("", spinner="dots") as status:
                self.status = status
                values = drive(rt, thread_id, inputs, self._ask, on_tick=self._tick)
        except LLMError as exc:
            self.console.print(f"[red]Erreur LLM :[/] {exc}\n[dim]État sauvegardé : /reprendre une fois LM Studio prêt.[/]")
            return
        finally:
            self.status = None
        if values is None:
            self.console.print("[yellow]Exécution en pause.[/] /reprendre pour continuer.")
            return
        self._summary(values, time.monotonic() - start)

    def _summary(self, values: dict, seconds: float) -> None:
        status = values.get("final_status") or "?"
        color = {"SUCCESS": "green", "PARTIAL": "yellow"}.get(status, "red")
        table = Table(show_header=True, header_style="bold", box=None, padding=(0, 2))
        table.add_column("#", style="dim")
        table.add_column("Tâche")
        table.add_column("Statut")
        labels = {"done": "[green]validée[/]", "blocked": "[red]bloquée[/]", "replaced": "[dim]redécoupée[/]"}
        for t in values.get("tasks", []):
            table.add_row(str(t["id"]), t["title"], labels.get(t["status"], t["status"]))
        self.console.print(
            Panel(
                table,
                title=f"[bold {color}]{status}[/] [dim]· {seconds / 60:.1f} min[/]",
                subtitle=f"[dim]{values.get('final_reason', '')} · /fichiers · /rapport[/]",
                border_style=color,
            )
        )

    def run_objective(self, rt: Runtime, objective: str) -> None:
        thread_id = new_thread_id()
        log_event("run_start", message=f"{self.project} / {thread_id} : {objective}")
        self._execute(rt, thread_id, initial_state(objective, thread_id, project=self.project))

    def resume(self, rt: Runtime) -> None:
        thread_id = last_thread(self.ws)
        if not thread_id:
            self.console.print("[dim]Aucune exécution à reprendre dans ce projet.[/]")
            return
        snapshot = rt.graph.get_state({"configurable": {"thread_id": thread_id}})
        if not snapshot.values or not snapshot.next:
            self.console.print("[dim]La dernière exécution est déjà terminée.[/]")
            return
        interrupts = [i for task in snapshot.tasks for i in task.interrupts]
        if interrupts:
            from langgraph.types import Command

            decision = self._ask(interrupts[0].value)
            self._execute(rt, thread_id, Command(resume=decision))
        else:
            self._execute(rt, thread_id, None)

    # ------------------------------------------------------------------ commandes

    def show_files(self) -> None:
        files = self.ws.list_files()
        if not files:
            self.console.print("[dim]Projet vide.[/]")
            return
        tree = Tree(f"[bold]{self.project}[/] [dim]{self.ws.root}[/]")
        nodes: dict[str, Tree] = {}
        for rel in files:
            parent = tree
            parts = rel.split("/")
            for depth in range(len(parts) - 1):
                key = "/".join(parts[: depth + 1])
                if key not in nodes:
                    nodes[key] = parent.add(f"[bold blue]{parts[depth]}/[/]")
                parent = nodes[key]
            parent.add(parts[-1])
        self.console.print(tree)

    def show_file(self, rel: str) -> None:
        try:
            content = self.ws.read_file(rel)
        except Exception as exc:
            self.console.print(f"[red]{exc}[/]")
            return
        if rel.endswith(".md"):
            self.console.print(Markdown(content))
        else:
            lexer = Syntax.guess_lexer(rel, code=content)
            self.console.print(Syntax(content, lexer, line_numbers=True, word_wrap=True))

    def show_history(self) -> None:
        past = read_history(self.ws, limit=20)
        if not past:
            self.console.print("[dim]Aucune demande réalisée dans ce projet.[/]")
        for h in past:
            color = "green" if h["status"] == "SUCCESS" else "yellow"
            self.console.print(f"[dim]{h['date']}[/] [{color}]{h['status']}[/] {h['objective']}")

    def run_shell(self, command: str) -> None:
        self.ws.root.mkdir(parents=True, exist_ok=True)
        self.console.print(f"[dim]$ {command}  (dans {self.ws.root})[/]")
        try:
            res = subprocess.run(command, shell=True, cwd=self.ws.root, capture_output=True, text=True, timeout=300)
        except subprocess.TimeoutExpired:
            self.console.print("[red]Commande arrêtée après 5 min.[/]")
            return
        out = (res.stdout + res.stderr).rstrip()
        if out:
            self.console.print(out, markup=False, highlight=False)
        if res.returncode:
            self.console.print(f"[red]code de sortie {res.returncode}[/]")

    def banner(self) -> None:
        self.console.print(
            Panel(
                f"[bold]Système multi-agents[/]  [dim]Manager · Développeur · Recherche · Testeur · Mémoire[/]\n"
                f"Modèle   [cyan]{self.s.llm_model}[/]\n"
                f"Projet   [cyan]{self.project}[/]  [dim]{self.ws.root}[/]\n"
                f"[dim]/aide pour les commandes · /quitter pour sortir[/]",
                border_style="cyan",
            )
        )

    # ------------------------------------------------------------------ boucle

    def handle(self, rt: Runtime, line: str) -> bool:
        """Traite une ligne saisie. Renvoie False pour quitter."""
        line = line.strip()
        if not line:
            return True
        if line.startswith("!"):
            self.run_shell(line[1:].strip())
            return True
        if not line.startswith("/"):
            self.run_objective(rt, line)
            return True

        cmd, _, arg = line[1:].partition(" ")
        cmd, arg = cmd.lower(), arg.strip()
        if cmd in ("quitter", "quit", "exit", "q"):
            return False
        if cmd in ("aide", "help", "?"):
            self.console.print(AIDE)
        elif cmd == "fichiers":
            self.show_files()
        elif cmd == "voir":
            self.show_file(arg) if arg else self.console.print("[dim]Usage : /voir <fichier>[/]")
        elif cmd == "rapport":
            self.show_file("REPORT.md") if self.ws.exists("REPORT.md") else self.console.print("[dim]Pas encore de rapport.[/]")
        elif cmd == "historique":
            self.show_history()
        elif cmd == "projet":
            if arg:
                self.project = clean_name(arg)
                self.ws.root.mkdir(parents=True, exist_ok=True)
            self.console.print(f"Projet courant : [cyan]{self.project}[/] [dim]{self.ws.root}[/]")
        elif cmd == "projets":
            for name in list_projects(Path(self.s.workspaces_dir)) or ["(aucun)"]:
                self.console.print(("[cyan]› " if name == self.project else "  ") + name)
        elif cmd == "reprendre":
            self.resume(rt)
        elif cmd == "check":
            from agents.checks import run_checks

            for name, ok, detail in run_checks(self.s, self.llm or LLMClient(self.s)):
                self.console.print(f"[{'green' if ok else 'red'}]{'OK   ' if ok else 'ÉCHEC'}[/] {name} [dim]{detail}[/]")
        elif cmd in ("effacer", "clear"):
            self.console.clear()
        else:
            self.console.print(f"[red]Commande inconnue : /{cmd}[/] [dim](/aide)[/]")
        return True

    def loop(self, read_line=None) -> int:
        read_line = read_line or (lambda: self.console.input("[bold cyan]› [/]"))
        self.banner()
        runtime = open_runtime(self.s, llm=self.llm)
        try:
            rt = runtime.__enter__()
        except Exception as exc:  # PostgreSQL arrêté, mauvais DATABASE_URL…
            self.console.print(
                f"[red]Démarrage impossible :[/] {exc}\n[dim]Docker Desktop est-il lancé ? Puis : docker compose up -d[/]"
            )
            return 1
        logs.set_printer(self._print_event)
        try:
            if not rt.persistent:
                self.console.print("[yellow]DATABASE_URL vide : mode mémoire, pas de reprise possible.[/]")
            while True:
                try:
                    line = read_line()
                except EOFError:
                    break
                except KeyboardInterrupt:
                    self.console.print()
                    continue
                if not self.handle(rt, line):
                    break
        finally:
            logs.set_printer(None)
            runtime.__exit__(None, None, None)
        self.console.print("[dim]À bientôt.[/]")
        return 0
