# Envol — ton hébergeur de sites perso

Un petit « Vercel » à toi, en français, qui tourne sur ton propre serveur Linux.

- Tu relies un dépôt GitHub, Envol le met en ligne sur `nom-du-projet.ton-domaine`.
- À chaque `push`, il reconstruit et republie automatiquement (webhook GitHub).
- Journal de construction en direct, historique, retour en arrière en un clic.
- Les constructions (`npm run build`…) tournent dans un conteneur Docker jetable.
- Aucune dépendance npm : uniquement Node.js (20 ou plus) et git.

> Envol sert des **sites statiques** (HTML/CSS/JS, ou le résultat d'un `build` :
> Vite, Astro, React, Vue…). Il ne fait pas tourner de serveurs (Node, PHP, Python).

## Installation sur ton serveur

```bash
git clone https://github.com/crashcools-collab/Forum.enrob-.git
cd Forum.enrob-/envol
sudo ./installer.sh
```

Le script installe ce qui manque (git, Node.js), crée un utilisateur système `envol`
(Envol ne tourne jamais en administrateur), et un service qui démarre avec le PC.
Le relancer plus tard **met à jour** Envol sans toucher à tes projets ni à tes réglages.

Ouvre ensuite **http://localhost:3000** sur le serveur et choisis ton mot de passe.

### Le tableau de bord depuis un autre appareil

Le tableau de bord n'écoute **que sur le serveur lui-même**, volontairement : il donne
le contrôle de la machine, il ne doit jamais être public. Pour y accéder ailleurs :

- **Depuis ton PC habituel** (serveur sans écran) : `ssh -L 3000:localhost:3000 toi@ip-du-serveur`,
  puis ouvre http://localhost:3000.
- **Depuis ton téléphone, partout** : installe [Tailscale](https://tailscale.com) sur le serveur
  et le téléphone, puis sur le serveur : `sudo tailscale serve --bg 3000`.

### Tester en local

Dans un navigateur sur le serveur, un projet nommé `forum` est visible sur
**http://forum.localhost:8080** (les adresses en `.localhost` fonctionnent sans réglage).

## Mettre tes sites sur Internet (tunnel Cloudflare)

Nécessaire pour partager tes sites et pour le déploiement automatique depuis GitHub.
Il te faut un nom de domaine géré par Cloudflare (compte gratuit).
Le tunnel ne rend public **que** le port des sites (8080), jamais le tableau de bord.

```bash
# 1. Installer cloudflared : https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
# 2. Se connecter et créer le tunnel
cloudflared tunnel login
cloudflared tunnel create envol          # note l'identifiant affiché
cloudflared tunnel route dns envol '*.tondomaine.fr'
```

Crée `/etc/cloudflared/config.yml` (remplace `ID` par l'identifiant du tunnel, et le chemin
par celui du fichier `.json` indiqué par `cloudflared tunnel create`) :

```yaml
tunnel: ID
credentials-file: /chemin/affiché/par/tunnel-create/ID.json
ingress:
  - hostname: "*.tondomaine.fr"
    service: http://127.0.0.1:8080
  - service: http_status:404
```

Puis :

```bash
sudo cloudflared service install
```

Enfin, dans `/etc/envol/envol.env` :

```
ENVOL_DOMAINE=tondomaine.fr
ENVOL_URL_PUBLIQUE=https://*.tondomaine.fr
```

et `sudo systemctl restart envol`. Ton projet `forum` est alors sur `https://forum.tondomaine.fr`.

## Utilisation

1. **+ Nouveau projet** : nom, adresse du dépôt (`https://github.com/...`).
   - Branche vide = branche par défaut du dépôt.
   - Dépôt privé : crée un jeton GitHub en lecture seule (*Settings → Developer settings →
     Fine-grained tokens*, accès « Contents: Read-only » sur ce dépôt) et colle-le.
   - Site déjà prêt (comme le forum, un simple `index.html`) : laisse la partie Construction vide.
   - Projet Vite/React : `npm ci`, `npm run build`, dossier `dist`.
2. **Déploiement automatique** : sur la page du projet, la carte « Déploiement automatique »
   donne les trois valeurs à coller dans *GitHub → Settings → Webhooks*.
3. **Retour en arrière** : bouton « Remettre en ligne » sur un ancien déploiement (instantané).

À savoir : si le dossier à publier est la racine du dépôt, **tous** ses fichiers sont publics
(sauf `.git`). Ne mets pas de secrets dans un dépôt que tu publies.

## Commandes utiles

| Besoin | Commande |
|---|---|
| Voir ce qui se passe | `journalctl -u envol -f` |
| Redémarrer | `sudo systemctl restart envol` |
| Changer un réglage | `sudo nano /etc/envol/envol.env` puis redémarrer |
| Mot de passe oublié | `sudo systemctl stop envol && cd /opt/envol && sudo -u envol ENVOL_DONNEES=/var/lib/envol node outils/reinitialiser-mot-de-passe.js && sudo systemctl start envol` |
| Sauvegarder | copier le dossier `/var/lib/envol` |
| Désinstaller | `sudo systemctl disable --now envol && sudo rm -rf /opt/envol /etc/envol /etc/systemd/system/envol.service` (et `/var/lib/envol` pour effacer les données) |

## Comment c'est construit

```
src/serveur.js      démarre les deux serveurs
src/tableau.js      tableau de bord privé (127.0.0.1:3000) : interface + API
src/sites.js        serveur public des sites (port 8080) + réception des webhooks GitHub
src/deploiement.js  git clone → construction (Docker) → publication → retour en arrière
src/auth.js         mot de passe (haché avec scrypt) et sessions
src/stockage.js     base de données (un fichier JSON)
public/             l'interface (HTML, CSS, JavaScript sans bibliothèque)
```

Données (`/var/lib/envol`) : `base.json`, `sites/<projet>/<déploiement>/`, `journaux/`.
