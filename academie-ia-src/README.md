# Sources de l'Académie IA

Le site `academie-ia/` est généré à partir de ce dossier. Ne modifie pas `academie-ia/` à la main : modifie les sources puis reconstruis.

## Reconstruire le site

```bash
node academie-ia-src/build.mjs
```

Prérequis : Node.js 18 ou plus, Python 3 avec Pillow (pour les icônes).

## Organisation

- `sources/01-head.html` : styles (copiés dans `assets/style.css`).
- `sources/02-body.html` : contenu fixe de chaque page (une `<section id="v-…">` par page).
- `sources/03…06*.js` : toutes les données (cours, encyclopédie, histoire, outils, prompts, ressources, quiz, glossaire…).
- `app.js` : moteur commun à toutes les pages.
- `build.mjs` : répartit les données par page, génère les pages, la recherche, le manifeste, le service worker et les icônes.
- `icones.py` : dessine les icônes de l'application.

## Ajouter du contenu

- Un cours : ajouter un objet dans un fichier `03*-cours.js` (`COURS.push({...})`) et son niveau dans `NIV_COURS`.
- Un chapitre d'encyclopédie : `ENCYCLO.push({...})` et son niveau dans `NIV_ENC`.
- Un événement : `HIST.push({d:'AAAA-MM-JJ', a, c, t, w})`.
- Une ressource : ajouter une ligne dans `RESSOURCES`.

Le script vérifie que chaque cours et chaque chapitre a un niveau, et que chaque page a sa section.
