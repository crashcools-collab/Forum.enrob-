#!/usr/bin/env bash
# Installe (ou met à jour) Envol sur un serveur Linux avec systemd.
# Utilisation, depuis le dossier envol/ :   sudo ./installer.sh
set -euo pipefail

DOSSIER_APPLI=/opt/envol
DOSSIER_DONNEES=/var/lib/envol
FICHIER_REGLAGES=/etc/envol/envol.env
UTILISATEUR=envol
SOURCE="$(cd "$(dirname "$0")" && pwd)"

etape() { printf '\n\033[1;34m▶ %s\033[0m\n' "$1"; }
ok()    { printf '\033[1;32m✓ %s\033[0m\n' "$1"; }
alerte(){ printf '\033[1;33m! %s\033[0m\n' "$1"; }
stop()  { printf '\033[1;31m✗ %s\033[0m\n' "$1"; exit 1; }

[ "$(id -u)" -eq 0 ] || stop "Lance ce script avec sudo : sudo ./installer.sh"
command -v systemctl >/dev/null || stop "systemd est nécessaire (présent sur Ubuntu, Debian, Fedora, Mint…)."
[ -f "$SOURCE/src/serveur.js" ] || stop "Lance le script depuis le dossier envol/."

etape "Vérification des outils"
if ! command -v git >/dev/null; then
  if command -v apt-get >/dev/null; then apt-get update -qq && apt-get install -y -qq git
  elif command -v dnf >/dev/null; then dnf install -y -q git
  else stop "Installe git puis relance le script."; fi
fi
ok "git $(git --version | awk '{print $3}')"

version_node() { node -e 'console.log(process.versions.node.split(".")[0])' 2>/dev/null || echo 0; }
if [ "$(version_node)" -lt 20 ]; then
  if command -v apt-get >/dev/null; then
    etape "Installation de Node.js 22 (dépôt officiel NodeSource)"
    apt-get install -y -qq curl ca-certificates
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y -qq nodejs
  elif command -v dnf >/dev/null; then
    dnf install -y -q nodejs
  fi
  [ "$(version_node)" -ge 20 ] || stop "Node.js 20 ou plus est nécessaire. Installe-le puis relance le script."
fi
ok "Node.js $(node --version)"

if command -v docker >/dev/null && docker info >/dev/null 2>&1; then
  AVEC_DOCKER=oui
  ok "Docker présent : les constructions tourneront dans des conteneurs isolés."
else
  AVEC_DOCKER=non
  alerte "Docker absent : les commandes de construction tourneront directement sur la machine."
  alerte "Pour l'activer plus tard : curl -fsSL https://get.docker.com | sudo sh, puis relance ce script."
fi

etape "Utilisateur système « $UTILISATEUR »"
if ! id "$UTILISATEUR" >/dev/null 2>&1; then
  useradd --system --home-dir "$DOSSIER_DONNEES" --shell /usr/sbin/nologin "$UTILISATEUR"
fi
if [ "$AVEC_DOCKER" = oui ]; then usermod -aG docker "$UTILISATEUR"; fi
ok "Envol ne tourne pas en administrateur (root)."

etape "Copie des fichiers dans $DOSSIER_APPLI"
mkdir -p "$DOSSIER_APPLI"
rm -rf "$DOSSIER_APPLI/src" "$DOSSIER_APPLI/public" "$DOSSIER_APPLI/outils"
cp -r "$SOURCE/src" "$SOURCE/public" "$SOURCE/outils" "$SOURCE/package.json" "$DOSSIER_APPLI/"
chown -R root:root "$DOSSIER_APPLI"
install -d -o "$UTILISATEUR" -g "$UTILISATEUR" -m 700 "$DOSSIER_DONNEES"
ok "Fichiers en place, données dans $DOSSIER_DONNEES"

etape "Réglages ($FICHIER_REGLAGES)"
mkdir -p "$(dirname "$FICHIER_REGLAGES")"
if [ ! -f "$FICHIER_REGLAGES" ]; then
  cat > "$FICHIER_REGLAGES" <<EOF
# Réglages d'Envol. Après une modification : sudo systemctl restart envol

# Ton domaine une fois le tunnel Cloudflare en place (ex. tondomaine.fr).
ENVOL_DOMAINE=localhost
# Adresse publique des sites, l'étoile est remplacée par le nom du projet.
# ENVOL_URL_PUBLIQUE=https://*.tondomaine.fr

ENVOL_PORT_TABLEAU=3000
ENVOL_PORT_SITES=8080
ENVOL_DONNEES=$DOSSIER_DONNEES
ENVOL_DOCKER=$AVEC_DOCKER
ENVOL_IMAGE=node:22-alpine
ENVOL_DEPLOIEMENTS_GARDES=10
EOF
  ok "Fichier de réglages créé."
else
  sed -i "s/^ENVOL_DOCKER=.*/ENVOL_DOCKER=$AVEC_DOCKER/" "$FICHIER_REGLAGES"
  ok "Réglages existants conservés."
fi

etape "Service de démarrage automatique"
cat > /etc/systemd/system/envol.service <<EOF
[Unit]
Description=Envol — hébergeur de sites perso
After=network-online.target docker.service
Wants=network-online.target

[Service]
User=$UTILISATEUR
Group=$UTILISATEUR
WorkingDirectory=$DOSSIER_APPLI
EnvironmentFile=$FICHIER_REGLAGES
Environment=HOME=$DOSSIER_DONNEES
ExecStart=$(command -v node) $DOSSIER_APPLI/src/serveur.js
Restart=on-failure
RestartSec=3
# Protections : Envol ne peut écrire que dans son dossier de données.
NoNewPrivileges=true
ProtectSystem=full
ProtectHome=true
PrivateTmp=true
ReadWritePaths=$DOSSIER_DONNEES

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable envol >/dev/null 2>&1
systemctl restart envol
sleep 2
systemctl is-active --quiet envol || { journalctl -u envol -n 30 --no-pager; stop "Envol n'a pas démarré (voir ci-dessus)."; }
ok "Envol tourne et redémarrera tout seul avec le PC."

PORT=$(grep -E '^ENVOL_PORT_TABLEAU=' "$FICHIER_REGLAGES" | cut -d= -f2)
printf '\n\033[1m🎉 Installation terminée.\033[0m\n'
printf '   Tableau de bord : \033[1mhttp://localhost:%s\033[0m  (à ouvrir sur ce PC)\n' "${PORT:-3000}"
printf '   Journal du service : journalctl -u envol -f\n'
printf '   Réglages : %s\n\n' "$FICHIER_REGLAGES"
