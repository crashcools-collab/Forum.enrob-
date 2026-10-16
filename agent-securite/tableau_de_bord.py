#!/usr/bin/env python3
"""
Tableau de bord local de Sentinelle : http://127.0.0.1:8765

Ce serveur peut arrêter des processus et modifier le pare-feu : il est donc lui-même une cible.
Protections :
  - écoute uniquement sur 127.0.0.1 (jamais sur le réseau) ;
  - jeton aléatoire à chaque démarrage, exigé dans un en-tête sur chaque appel d'API
    (un site web malveillant ouvert dans ton navigateur ne peut ni le lire ni l'envoyer) ;
  - contrôle des en-têtes Host / Origin / Sec-Fetch-Site (contre le DNS rebinding et le CSRF) ;
  - CSP stricte, aucune ressource externe, toutes les données affichées comme du texte (contre le XSS :
    les noms de processus sont écrits par n'importe quel programme, y compris un malware) ;
  - le navigateur n'envoie qu'un identifiant d'alerte : la commande exécutée vient toujours du code serveur.
"""
from __future__ import annotations

import argparse
import hmac
import json
import os
import secrets
import subprocess
import sys
import threading
import time
import urllib.request
import webbrowser
from dataclasses import asdict
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import sentinelle as S

DOSSIER_STATIQUE = Path(__file__).resolve().parent / "interface"
FICHIERS_STATIQUES = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/app.css": ("app.css", "text/css; charset=utf-8"),
    "/app.js": ("app.js", "text/javascript; charset=utf-8"),
}
TAILLE_MAX_CORPS = 10_000
CSP = ("default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; "
       "frame-ancestors 'none'; base-uri 'none'; form-action 'none'")


class Etat:
    """État partagé entre le serveur web, les scans et la surveillance automatique."""

    def __init__(self, args, audit: S.Audit):
        self.args = args
        self.audit = audit
        self.verrou = threading.Lock()
        self.scan_en_cours = False
        self.debut_scan = None
        self.phase = ""
        self.alertes: list[S.Alerte] = []
        self.analyse = None
        self.dernier_scan = None
        self.duree_scan = None
        self.erreur_ia = None
        self.actions_faites: list[dict] = []
        self.surveillance = {"active": False, "intervalle": 300, "prochain": None, "ia": True}
        self.lmstudio = {}
        self.lmstudio_maj = 0.0

    # --- scans -----------------------------------------------------------------------

    def lancer_scan(self, avec_ia: bool, origine: str) -> bool:
        with self.verrou:
            if self.scan_en_cours:
                return False
            self.scan_en_cours = True
            self.debut_scan = time.time()
            self.phase = "Collecte et règles"
        threading.Thread(target=self._scanner, args=(avec_ia, origine), daemon=True).start()
        return True

    def _scanner(self, avec_ia: bool, origine: str) -> None:
        try:
            alertes = S.scanner(self.args, self.audit)
            ids_graves = {a.id for a in alertes if a.gravite != "INFO"}
            ids_avant = {a.id for a in self.alertes if a.gravite != "INFO"}
            analyse, erreur = self.analyse, None
            # En surveillance, on ne réinterroge le modèle que si les alertes ont changé.
            if avec_ia and (origine == "manuel" or ids_graves != ids_avant or self.analyse is None):
                self.phase = "Analyse par LM Studio"
                erreurs: list = []
                self.args.sans_llm = False
                analyse = S.analyser_llm(self.args, alertes, self.audit, erreurs)
                erreur = erreurs[0] if erreurs else None
            elif not avec_ia:
                analyse = None
            with self.verrou:
                self.alertes, self.analyse, self.erreur_ia = alertes, analyse, erreur
                self.dernier_scan = S.maintenant()
                self.duree_scan = round(time.time() - self.debut_scan, 1)
        except Exception as e:  # le serveur doit survivre à un scan raté
            self.audit.log("scan_erreur", erreur=repr(e))
            with self.verrou:
                self.erreur_ia = f"Le scan a échoué : {e}"
        finally:
            with self.verrou:
                self.scan_en_cours = False
                self.phase = ""

    def boucle_surveillance(self) -> None:
        while True:
            sv = self.surveillance
            if sv["active"] and sv["prochain"] and time.time() >= sv["prochain"]:
                if self.lancer_scan(sv["ia"], "surveillance"):
                    sv["prochain"] = time.time() + sv["intervalle"]
            time.sleep(2)

    # --- LM Studio -------------------------------------------------------------------

    def etat_lmstudio(self) -> dict:
        if time.time() - self.lmstudio_maj < 15:
            return self.lmstudio
        port = self.args.port_lmstudio
        code = S.sonder_lmstudio(port)
        modeles = []
        if code == 200:
            try:
                opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
                with opener.open(f"http://127.0.0.1:{port}/v1/models", timeout=3) as r:
                    modeles = [m["id"] for m in json.loads(r.read()).get("data", [])][:10]
            except (OSError, ValueError, KeyError):
                pass
        expose = None
        try:
            ecoutes = [c for c in S.psutil.net_connections(kind="inet")
                       if c.laddr and c.laddr.port == port and c.status == "LISTEN"]
            if ecoutes:
                expose = any(not S.est_loopback(c.laddr.ip) for c in ecoutes)
        except (S.psutil.Error, OSError):
            pass
        self.lmstudio = {"port": port, "actif": code is not None, "code_http": code,
                         "authentification": code in (401, 403), "expose": expose,
                         "modeles": modeles, "modele_force": self.args.modele}
        self.lmstudio_maj = time.time()
        return self.lmstudio

    # --- sérialisation ---------------------------------------------------------------

    def vers_json(self) -> dict:
        with self.verrou:
            alertes = []
            faites = {a["alerte_id"]: a for a in self.actions_faites}
            for a in self.alertes:
                d = asdict(a)
                if a.action:
                    libelle, cmd = S.decrire_action(a.action)
                    d["action_libelle"], d["action_commande"] = libelle, " ".join(cmd) if cmd else None
                    d["action_executable"] = bool(cmd) or a.action["type"] == "arreter_processus"
                d["action_resultat"] = faites.get(a.id, {}).get("resultat")
                alertes.append(d)
            ref = S.charger_reference()
            sv = dict(self.surveillance)
            sv["dans"] = max(0, int(sv["prochain"] - time.time())) if sv["active"] and sv["prochain"] else None
            return {
                "version": S.VERSION, "machine": S.platform.node(), "os": S.platform.platform(),
                "admin": est_admin(), "scan_en_cours": self.scan_en_cours, "phase": self.phase,
                "scan_depuis": round(time.time() - self.debut_scan) if self.scan_en_cours else None,
                "dernier_scan": self.dernier_scan, "duree_scan": self.duree_scan,
                "alertes": alertes, "analyse": self.analyse, "erreur_ia": self.erreur_ia,
                "reference": {"existe": ref is not None, "cree_le": ref.get("cree_le") if ref else None},
                "surveillance": sv, "actions": self.actions_faites[-20:][::-1],
                "dossier": str(S.HOME_DIR),
            }


def est_admin() -> bool:
    try:
        if S.IS_WIN:
            import ctypes
            return bool(ctypes.windll.shell32.IsUserAnAdmin())
        return os.geteuid() == 0
    except (AttributeError, OSError):
        return False


def ouvrir_navigateur(url: str) -> None:
    if S.IS_WIN and est_admin():
        # Passer par explorer.exe ouvre le navigateur SANS les droits administrateur de ce serveur.
        subprocess.Popen(["explorer.exe", url])
    else:
        webbrowser.open(url)


def lire_fin_journal(fichier: Path, n: int) -> list[dict]:
    if not fichier.exists():
        return []
    with fichier.open("rb") as f:
        f.seek(0, 2)
        taille = f.tell()
        f.seek(max(0, taille - 2_000_000))
        lignes = f.read().decode("utf-8", errors="replace").splitlines()[-n:]
    res = []
    for l in lignes:
        try:
            res.append(json.loads(l))
        except json.JSONDecodeError:
            continue
    return res


def historique(audit: S.Audit) -> list[dict]:
    scans = [e for e in lire_fin_journal(audit.fichier, 5000) if e.get("evenement") == "scan"][-40:]
    return [{"ts": e["ts"], **{g: sum(a.get("gravite") == g for a in e.get("alertes", [])) for g in S.GRAVITES}}
            for e in scans]


def resume_journal(audit: S.Audit) -> list[dict]:
    res = []
    for e in lire_fin_journal(audit.fichier, 150)[::-1]:
        detail = {k: v for k, v in e.items() if k not in ("ts", "evenement")}
        if "alertes" in detail and isinstance(detail["alertes"], list):
            detail["alertes"] = f"{len(detail['alertes'])} alerte(s)"
        res.append({"ts": e.get("ts"), "evenement": e.get("evenement"),
                    "detail": S.nettoyer(json.dumps(detail, ensure_ascii=False, default=str), 400)})
    return res


class Gestionnaire(BaseHTTPRequestHandler):
    server_version = "Sentinelle"
    sys_version = ""

    def log_message(self, *a):
        pass

    # --- sécurité --------------------------------------------------------------------

    def _origine_ok(self) -> bool:
        srv = self.server
        if self.headers.get("Host", "") not in srv.hotes_valides:
            return False  # DNS rebinding : un domaine externe qui pointe vers 127.0.0.1
        origin = self.headers.get("Origin")
        if origin and origin not in srv.origines_valides:
            return False
        site = self.headers.get("Sec-Fetch-Site")
        return site in (None, "same-origin", "none")

    def _jeton_ok(self) -> bool:
        return hmac.compare_digest(self.headers.get("X-Sentinelle-Jeton", ""), self.server.jeton)

    def _envoyer(self, code: int, corps: bytes, type_contenu: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", type_contenu)
        self.send_header("Content-Length", str(len(corps)))
        self.send_header("Content-Security-Policy", CSP)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corps)

    def _json(self, code: int, donnees) -> None:
        self._envoyer(code, json.dumps(donnees, ensure_ascii=False, default=str).encode("utf-8"),
                      "application/json; charset=utf-8")

    def _corps(self) -> dict:
        n = int(self.headers.get("Content-Length") or 0)
        if n > TAILLE_MAX_CORPS:
            raise ValueError("corps trop volumineux")
        donnees = json.loads(self.rfile.read(n) or b"{}")
        if not isinstance(donnees, dict):
            raise ValueError("objet JSON attendu")
        return donnees

    # --- routes ----------------------------------------------------------------------

    def do_GET(self):
        if not self._origine_ok():
            return self._json(403, {"erreur": "origine refusée"})
        chemin = self.path.split("?")[0]
        if chemin in FICHIERS_STATIQUES:
            nom, type_contenu = FICHIERS_STATIQUES[chemin]
            return self._envoyer(200, (DOSSIER_STATIQUE / nom).read_bytes(), type_contenu)
        if not chemin.startswith("/api/"):
            return self._json(404, {"erreur": "introuvable"})
        if not self._jeton_ok():
            return self._json(401, {"erreur": "jeton invalide — rouvre le lien affiché dans la console"})
        etat: Etat = self.server.etat
        if chemin == "/api/etat":
            d = etat.vers_json()
            d["lmstudio"] = etat.etat_lmstudio()
            return self._json(200, d)
        if chemin == "/api/historique":
            return self._json(200, historique(etat.audit))
        if chemin == "/api/journal":
            return self._json(200, resume_journal(etat.audit))
        if chemin == "/api/rapport":
            with etat.verrou:
                texte = S.rapport(etat.alertes, etat.analyse)
            return self._envoyer(200, texte.encode("utf-8"), "text/markdown; charset=utf-8")
        return self._json(404, {"erreur": "introuvable"})

    def do_POST(self):
        if not self._origine_ok() or not self._jeton_ok():
            return self._json(403, {"erreur": "requête refusée"})
        if not self.headers.get("Content-Type", "").startswith("application/json"):
            return self._json(415, {"erreur": "JSON attendu"})
        try:
            corps = self._corps()
        except (ValueError, json.JSONDecodeError) as e:
            return self._json(400, {"erreur": str(e)})
        etat: Etat = self.server.etat
        chemin = self.path

        if chemin == "/api/scan":
            ok = etat.lancer_scan(bool(corps.get("ia", True)), "manuel")
            return self._json(202 if ok else 409, {"ok": ok, "message": None if ok else "Un scan est déjà en cours."})

        if chemin == "/api/reference":
            S.creer_reference(etat.audit)
            return self._json(200, {"ok": True})

        if chemin == "/api/surveillance":
            intervalle = corps.get("intervalle", 300)
            if not isinstance(intervalle, int) or not 60 <= intervalle <= 86400:
                return self._json(400, {"erreur": "intervalle entre 60 et 86400 secondes"})
            active = bool(corps.get("active"))
            etat.surveillance.update(active=active, intervalle=intervalle, ia=bool(corps.get("ia", True)),
                                     prochain=time.time() if active else None)
            etat.audit.log("surveillance", active=active, intervalle=intervalle)
            return self._json(200, {"ok": True})

        if chemin == "/api/action":
            # Double confirmation : le client doit renvoyer « OUI » tapé par l'utilisateur.
            if corps.get("confirmation") != "OUI":
                return self._json(400, {"erreur": "confirmation « OUI » manquante"})
            with etat.verrou:
                alerte = next((a for a in etat.alertes if a.id == corps.get("alerte_id")), None)
            if not alerte or not alerte.action:
                return self._json(404, {"erreur": "alerte inconnue ou sans action (relance un scan)"})
            libelle, _ = S.decrire_action(alerte.action)
            etat.audit.log("action_proposee", alerte=alerte.id, action=alerte.action, accepte=True, via="tableau_de_bord")
            resultat = S.executer_action(alerte.action, etat.audit)
            entree = {"ts": S.maintenant(), "alerte_id": alerte.id, "titre": alerte.titre,
                      "libelle": libelle, "resultat": resultat}
            with etat.verrou:
                etat.actions_faites.append(entree)
            return self._json(200, entree)

        return self._json(404, {"erreur": "introuvable"})


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    p = argparse.ArgumentParser(description="Tableau de bord local de Sentinelle")
    p.add_argument("--port", type=int, default=8765, help="port du tableau de bord (toujours sur 127.0.0.1)")
    p.add_argument("--url-lmstudio", default=os.environ.get("LMSTUDIO_URL", "http://127.0.0.1:1234/v1"))
    p.add_argument("--port-lmstudio", type=int, default=1234)
    p.add_argument("--modele")
    p.add_argument("--autoriser-llm-distant", action="store_true")
    p.add_argument("--timeout-llm", type=int, default=180)
    p.add_argument("--sans-navigateur", action="store_true", help="ne pas ouvrir le navigateur automatiquement")
    args = p.parse_args()
    args.sans_llm = False

    if S.psutil is None:
        print("Module manquant : pip install psutil")
        return 1
    audit = S.Audit(S.HOME_DIR)
    etat = Etat(args, audit)
    try:
        serveur = ThreadingHTTPServer(("127.0.0.1", args.port), Gestionnaire)
    except OSError as e:
        print(f"Impossible d'ouvrir le port {args.port} ({e}). Le tableau de bord tourne peut-être déjà ; "
              "sinon choisis un autre port avec --port.")
        return 1
    port = serveur.server_address[1]
    serveur.etat = etat
    serveur.jeton = secrets.token_urlsafe(24)
    serveur.hotes_valides = {f"127.0.0.1:{port}", f"localhost:{port}"}
    serveur.origines_valides = {f"http://{h}" for h in serveur.hotes_valides}
    threading.Thread(target=etat.boucle_surveillance, daemon=True).start()

    url = f"http://127.0.0.1:{port}/?jeton={serveur.jeton}"
    audit.log("tableau_de_bord_demarre", port=port, admin=est_admin())
    print(f"Tableau de bord Sentinelle : {url}\n"
          "Si le navigateur ne s'ouvre pas, copie ce lien dans la barre d'adresse.\n"
          "Ce lien contient un jeton secret valable jusqu'à l'arrêt du serveur : ne le partage pas.\n"
          + ("" if est_admin() else "⚠ Pas lancé en administrateur : visibilité réduite et actions de pare-feu impossibles.\n")
          + "Ctrl+C pour arrêter.")
    if not args.sans_navigateur:
        ouvrir_navigateur(url)
    etat.lancer_scan(True, "manuel")
    try:
        serveur.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
