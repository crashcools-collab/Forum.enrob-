[README.md](https://github.com/user-attachments/files/28601931/README.md)
# COLAS · OS Équipe Enrobé

Tableau de bord interne (fichier HTML unique) : forum, calendrier, calculatrice,
bot maths (Mistral), documents, et **messagerie temps réel** pour l'équipe.

## Fichiers à héberger
- `index.html` → c'est toute l'app.
- `academie-ia/` → l'Académie IA, site complet sur l'intelligence artificielle (17 pages), à jour au 17 octobre 2026 : parcours en 5 niveaux, encyclopédie (37 chapitres), pile de l'IA, histoire de 1943 à aujourd'hui (172 événements), 41 cours (213 chapitres, dont une filière pour créer toute sorte de programme : scripts, logiciels, applications mobiles et web, extensions, outils en ligne de commande, objets connectés), panorama de 71 outils, méthode et prompts, 88 ressources GitHub et Hugging Face, quiz, glossaire, recherche dans toute la formation. Installable comme application (fonctionne hors connexion une fois en ligne).
- `academie-ia-fichier-unique.html` → la même formation en un seul fichier HTML (pratique à envoyer ou à copier sur une clé USB), générée automatiquement avec le site.
- `academie-ia-src/` → sources du site ; reconstruire avec `node academie-ia-src/build.mjs`.
- `Lancer-Academie-IA.bat` → lanceur Windows : menu pour ouvrir chaque page et installer les outils de pratique (Ollama, Python, Git, VS Code).
- `formation-ia.html` → redirige vers `academie-ia/index.html`.
- `atlas-univers/index.html` → l’Atlas de l’Univers, en un seul fichier qui fonctionne hors connexion : le vrai ciel en direct pour ta ville (5 044 étoiles, constellations, Voie lactée, objets de Messier, planètes et Lune calculées), « Ce soir » (que voir cette nuit), système solaire et univers en 3D, découvertes, 8 démonstrations interactives, encyclopédie avec 13 schémas, quiz, défis d’observation, calendrier (éclipses, étoiles filantes, phases, oppositions), la formation « L’Odyssée cosmique » (14 chapitres, 56 scènes racontées avec un fil rouge, 27 rebondissements, 26 questions, missions et diplôme téléchargeable) et Stella, la fée guide qui répond avec la base interne. Seul l’onglet « Photos et vidéos NASA » utilise internet (API officielle de la NASA uniquement).
- `atlas-univers-src/` → sources de l’atlas ; reconstruire avec `node atlas-univers-src/build.mjs`. Les données du ciel (`donnees/ciel.json`) viennent du catalogue d3-celestial (© Olaf Frohn, licence BSD-3) via `prep.mjs`.
- `Lancer-Atlas-Univers.bat` → lanceur Windows : menu pour ouvrir chaque partie de l’atlas ou la visite guidée.

## Activer la messagerie (une seule fois)

1. Créer un projet gratuit sur https://supabase.com
2. **SQL Editor** → coller et exécuter :

```sql
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  channel text not null default 'general',
  client_id text,
  pseudo text not null,
  color text,
  text text not null,
  created_at timestamptz default now()
);
alter table messages enable row level security;
create policy "lecture" on messages for select using (true);
create policy "ecriture" on messages for insert with check (true);
create policy "suppression" on messages for delete using (true);
alter publication supabase_realtime add table messages;
```

3. **Project Settings → Les clés API** → copier l'URL du projet et la clé **anon (publique)**.
4. Dans `index.html`, tout en haut du `<script>`, remplir :

```js
const SUPABASE_URL  = 'https://xxxx.supabase.co';
const SUPABASE_ANON = 'cle_publique_anon';
```

> La clé `anon` est faite pour être publique (l'accès est cadré par les règles RLS). Aucun secret sensible ne doit aller dans ce fichier.

## Hébergement
- GitHub Pages (repo public, ou privé avec plan Pro) **ou** Cloudflare Pages.
- Le lien obtenu se partage à l'équipe.

## Local vs partagé
- **Partagé entre toute l'équipe (via Supabase)** : la messagerie.
- **Local à chaque appareil (navigateur)** : forum, calendrier, documents, bot.
