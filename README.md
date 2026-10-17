[README.md](https://github.com/user-attachments/files/28601931/README.md)
# COLAS · OS Équipe Enrobé

Tableau de bord interne (fichier HTML unique) : forum, calendrier, calculatrice,
bot maths (Mistral), documents, et **messagerie temps réel** pour l'équipe.

## Fichiers à héberger
- `index.html` → c'est toute l'app.
- `formation-ia.html` → l'Académie IA, une formation complète et autonome sur l'intelligence artificielle, à jour au 17 octobre 2026 : parcours en 5 niveaux (novice à expert), encyclopédie de 27 chapitres, pile de l'IA (des puces aux applications), histoire datée de 1943 à aujourd'hui, 20 cours (ChatGPT, Claude, Gemini, Vibe, Copilot, GitHub, Hugging Face, Cursor, API, agents, automatisation, sites web, Claude Code, Codex, cybersécurité, jeux vidéo…), panorama des outils, méthode de prompt, atelier, bibliothèque de prompts, 88 ressources GitHub et Hugging Face, quiz et glossaire. Progression stockée localement dans le navigateur.

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
