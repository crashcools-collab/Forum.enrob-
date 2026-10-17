// Serveur public : sert chaque site selon son adresse (forum.tondomaine.fr -> projet "forum")
// et reçoit les signaux de GitHub pour redéployer automatiquement.
import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from './config.js';
import { base, trouverProjet, trouverDeploiement } from './stockage.js';
import { dossierDuDeploiement, lancerDeploiement } from './deploiement.js';
import { typeMime, lireCorps } from './outils.js';

export function creerServeurSites() {
  return http.createServer(async (requete, reponse) => {
    try {
      const url = new URL(requete.url, 'http://x');
      if (url.pathname.startsWith('/_envol/webhook/')) {
        return await recevoirWebhook(requete, reponse, url.pathname.split('/')[3]);
      }
      if (requete.method !== 'GET' && requete.method !== 'HEAD') {
        return repondre(reponse, 405, 'Méthode non autorisée.');
      }
      servirSite(requete, reponse, url);
    } catch (erreur) {
      console.error(erreur);
      if (!reponse.headersSent) repondre(reponse, 500, 'Erreur interne.');
    }
  });
}

function servirSite(requete, reponse, url) {
  // "forum.tondomaine.fr:8080" -> "forum"
  const hote = (requete.headers.host ?? '').split(':')[0].toLowerCase();
  const suffixe = '.' + config.domaine;
  const slug = hote.endsWith(suffixe) ? hote.slice(0, -suffixe.length) : null;

  const projet = slug && base.projets.find((p) => p.slug === slug);
  const dep = projet?.deploiementActif && trouverDeploiement(projet.deploiementActif);
  if (!dep) return repondre(reponse, 404, `Aucun site en ligne à l'adresse « ${hote} ».`);

  const racine = dossierDuDeploiement(dep);
  let chemin;
  try {
    chemin = path.join(racine, path.normalize(decodeURIComponent(url.pathname)));
  } catch {
    return repondre(reponse, 400, 'Adresse invalide.');
  }
  // Interdit de sortir du dossier du site (ex. /../../etc/passwd).
  if (chemin !== racine && !chemin.startsWith(racine + path.sep)) {
    return repondre(reponse, 403, 'Accès refusé.');
  }

  // Ordre de recherche : fichier exact, dossier/index.html, fichier.html, puis 404.html du site.
  const candidats = [chemin, path.join(chemin, 'index.html'), chemin + '.html'];
  const fichier = candidats.find((c) => existsSync(c) && statSync(c).isFile());
  if (fichier) return envoyerFichier(requete, reponse, fichier, 200);

  const page404 = path.join(racine, '404.html');
  if (existsSync(page404)) return envoyerFichier(requete, reponse, page404, 404);
  repondre(reponse, 404, 'Page introuvable.');
}

function envoyerFichier(requete, reponse, fichier, statut) {
  const type = typeMime(fichier);
  reponse.writeHead(statut, {
    'Content-Type': type,
    'Content-Length': statSync(fichier).size,
    // Le HTML est toujours revérifié pour qu'un nouveau déploiement se voie tout de suite.
    'Cache-Control': type.startsWith('text/html') ? 'no-cache' : 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
  });
  if (requete.method === 'HEAD') return reponse.end();
  createReadStream(fichier).pipe(reponse);
}

// GitHub prévient Envol à chaque "push". La signature prouve que le message vient bien de GitHub.
async function recevoirWebhook(requete, reponse, projetId) {
  if (requete.method !== 'POST') return repondre(reponse, 405, 'Méthode non autorisée.');
  const projet = trouverProjet(projetId);
  if (!projet) return repondre(reponse, 404, 'Projet inconnu.');

  const corps = await lireCorps(requete, 5 * 1024 * 1024);
  const attendue = 'sha256=' + createHmac('sha256', projet.secretWebhook).update(corps).digest('hex');
  const recue = String(requete.headers['x-hub-signature-256'] ?? '');
  if (recue.length !== attendue.length || !timingSafeEqual(Buffer.from(recue), Buffer.from(attendue))) {
    return repondre(reponse, 401, 'Signature invalide.');
  }

  const evenement = requete.headers['x-github-event'];
  if (evenement === 'ping') return repondre(reponse, 200, 'Envol est bien relié.');
  if (evenement !== 'push') return repondre(reponse, 202, 'Événement ignoré.');

  let donnees;
  try {
    donnees = JSON.parse(corps.toString('utf8'));
  } catch {
    return repondre(reponse, 400, 'Choisis « application/json » comme format dans GitHub.');
  }
  const branche = projet.branche || donnees.repository?.default_branch;
  if (donnees.ref !== `refs/heads/${branche}`) {
    return repondre(reponse, 202, `Branche ignorée (seule « ${branche} » est déployée).`);
  }
  const dep = lancerDeploiement(projet, 'github');
  repondre(reponse, 202, `Déploiement ${dep.id} lancé.`);
}

function repondre(reponse, statut, texte) {
  reponse.writeHead(statut, { 'Content-Type': 'text/plain; charset=utf-8' });
  reponse.end(texte + '\n');
}
