[README.md](https://github.com/user-attachments/files/28601931/README.md)
# COLAS · OS Équipe Enrobé

Tableau de bord interne (fichier HTML unique) : forum, calendrier, calculatrice,
bot maths (Mistral), documents, et **messagerie temps réel** pour l'équipe.

## Fichier à héberger
- `index.html` → c'est toute l'app. Rien d'autre n'est nécessaire.

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
