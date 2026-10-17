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

## Appli « Bons de livraison » (`bons/`)

Appli pour téléphone, à part de l'OS, pour gérer les bons de livraison d'enrobé sur le chantier.
Lien : `https://<compte>.github.io/<dépôt>/bons/` (également accessible depuis le menu de l'OS).

- **Photo du bon** avec le bouton + : la photo est gardée comme preuve.
- **Lecture automatique** du bon (facultative) : avec une clé Mistral, l'IA remplit n° de bon, tonnage net,
  formule, heure, température, camion. Sans clé, on tape juste le tonnage : tous les calculs marchent sans IA.
- **Totaux du jour** par chantier : camions, tonnes, t/camion, épaisseur moyenne (cm et kg/m²)
  comparée à l'épaisseur prévue (densité et tolérance réglables).
- **Alertes** : n° de bon en double, tonnage anormal, température sous le seuil choisi.
- **Envoi au bureau** : récap texte (WhatsApp, SMS, partage), export CSV pour Excel, rapport PDF avec photos.
- **Sans réseau** : l'appli s'ouvre hors ligne une fois installée ; les bons photographiés hors réseau
  sont lus par l'IA au retour du réseau.

### Installer sur le téléphone du chef
1. Ouvrir le lien dans Chrome (Android) ou Safari (iPhone).
2. Android : menu ⋮ → « Installer l'application ». iPhone : Partager → « Sur l'écran d'accueil ».
3. L'icône « Bons » apparaît comme une appli normale.

### Données
Tout reste **dans le téléphone** (localStorage + IndexedDB pour les photos), rien n'est envoyé sauf la photo
à Mistral quand la lecture IA est activée. Faire une **sauvegarde** (Réglages → Sauvegarder) chaque semaine.
