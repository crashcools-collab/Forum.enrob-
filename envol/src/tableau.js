// Serveur du tableau de bord (privé) : l'interface + l'API qu'elle utilise.
import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { config, urlDuProjet } from './config.js';
import { base, sauver, trouverProjet, trouverDeploiement, deploiementsDuProjet } from './stockage.js';
import * as auth from './auth.js';
import {
  nouvelId, lancerDeploiement, activerDeploiement, supprimerProjet, lireJournal, suivreJournal,
} from './deploiement.js';
import { typeMime, lireCorps } from './outils.js';

const dossierPublic = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

class ErreurHttp extends Error {
  constructor(statut, message) {
    super(message);
    this.statut = statut;
  }
}

export function creerServeurTableau() {
  return http.createServer(async (requete, reponse) => {
    try {
      const url = new URL(requete.url, 'http://x');
      if (url.pathname.startsWith('/api/')) await routerApi(requete, reponse, url);
      else servirInterface(reponse, url.pathname);
    } catch (erreur) {
      const statut = erreur.statut ?? 500;
      if (statut === 500) console.error(erreur);
      if (!reponse.headersSent) envoyerJson(reponse, statut, { erreur: erreur.message });
    }
  });
}

function servirInterface(reponse, chemin) {
  const nom = chemin === '/' ? 'index.html' : path.basename(chemin);
  const fichier = path.join(dossierPublic, nom);
  if (!existsSync(fichier) || !statSync(fichier).isFile()) {
    reponse.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return reponse.end('Introuvable.');
  }
  reponse.writeHead(200, { 'Content-Type': typeMime(fichier), 'Cache-Control': 'no-cache' });
  createReadStream(fichier).pipe(reponse);
}

async function routerApi(requete, reponse, url) {
  const methode = requete.method;
  const morceaux = url.pathname.split('/').slice(2); // "/api/projets/x" -> ["projets", "x"]

  // Une page web d'un autre site ne doit pas pouvoir piloter Envol à ta place.
  if (methode !== 'GET' && !String(requete.headers['content-type'] ?? '').startsWith('application/json')) {
    throw new ErreurHttp(415, 'Format attendu : JSON.');
  }

  // --- Accessible sans être connecté ---
  if (methode === 'GET' && url.pathname === '/api/etat') {
    return envoyerJson(reponse, 200, {
      configure: auth.estConfigure(),
      connecte: auth.estConnecte(requete),
    });
  }
  if (methode === 'POST' && url.pathname === '/api/configuration') {
    if (auth.estConfigure()) throw new ErreurHttp(409, 'Le mot de passe est déjà défini.');
    const { motDePasse } = await lireJson(requete);
    if (typeof motDePasse !== 'string' || motDePasse.length < 10) {
      throw new ErreurHttp(400, 'Le mot de passe doit faire au moins 10 caractères.');
    }
    auth.definirMotDePasse(motDePasse);
    auth.ouvrirSession(reponse);
    return envoyerJson(reponse, 200, { ok: true });
  }
  if (methode === 'POST' && url.pathname === '/api/connexion') {
    if (!auth.estConfigure()) throw new ErreurHttp(409, "Envol n'est pas encore configuré.");
    const { motDePasse } = await lireJson(requete);
    const resultat = auth.verifierMotDePasse(String(motDePasse ?? ''));
    if (resultat.bloque) throw new ErreurHttp(429, 'Trop d’essais. Réessaie dans une minute.');
    if (!resultat.ok) throw new ErreurHttp(401, 'Mot de passe incorrect.');
    auth.ouvrirSession(reponse);
    return envoyerJson(reponse, 200, { ok: true });
  }

  // --- Tout le reste demande d'être connecté ---
  if (!auth.estConnecte(requete)) throw new ErreurHttp(401, 'Connexion requise.');

  if (methode === 'POST' && url.pathname === '/api/deconnexion') {
    auth.fermerSession(requete, reponse);
    return envoyerJson(reponse, 200, { ok: true });
  }

  if (morceaux[0] === 'projets') {
    const [, projetId, action] = morceaux;

    if (!projetId && methode === 'GET') {
      return envoyerJson(reponse, 200, base.projets.map(resumerProjet));
    }
    if (!projetId && methode === 'POST') {
      const champs = validerProjet(await lireJson(requete), null);
      const projet = {
        id: nouvelId('prj'),
        ...champs,
        secretWebhook: randomBytes(24).toString('hex'),
        deploiementActif: null,
        creeLe: new Date().toISOString(),
      };
      base.projets.push(projet);
      sauver();
      lancerDeploiement(projet, 'manuel');
      return envoyerJson(reponse, 201, resumerProjet(projet));
    }

    const projet = trouverProjet(projetId);
    if (!projet) throw new ErreurHttp(404, 'Projet introuvable.');

    if (!action && methode === 'GET') return envoyerJson(reponse, 200, detaillerProjet(projet));
    if (!action && methode === 'PUT') {
      Object.assign(projet, validerProjet(await lireJson(requete), projet));
      sauver();
      return envoyerJson(reponse, 200, detaillerProjet(projet));
    }
    if (!action && methode === 'DELETE') {
      supprimerProjet(projet);
      return envoyerJson(reponse, 200, { ok: true });
    }
    if (action === 'deployer' && methode === 'POST') {
      const dep = lancerDeploiement(projet, 'manuel');
      return envoyerJson(reponse, 202, dep);
    }
  }

  if (morceaux[0] === 'deploiements' && morceaux[1]) {
    const dep = trouverDeploiement(morceaux[1]);
    if (!dep) throw new ErreurHttp(404, 'Déploiement introuvable.');

    if (morceaux[2] === 'activer' && methode === 'POST') {
      try {
        activerDeploiement(trouverProjet(dep.projetId), dep);
      } catch (erreur) {
        throw new ErreurHttp(409, erreur.message);
      }
      return envoyerJson(reponse, 200, { ok: true });
    }
    if (morceaux[2] === 'journal' && methode === 'GET') return diffuserJournal(requete, reponse, dep);
  }

  throw new ErreurHttp(404, 'Route inconnue.');
}

// Envoie le journal existant, puis les nouvelles lignes en direct (Server-Sent Events).
function diffuserJournal(requete, reponse, dep) {
  reponse.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  const envoyer = (ligne) => reponse.write(`data: ${JSON.stringify(ligne)}\n\n`);
  const terminer = () => reponse.end('event: fin\ndata: null\n\n');

  for (const ligne of lireJournal(dep.id).split('\n')) if (ligne) envoyer(ligne);
  if (dep.statut !== 'en_attente' && dep.statut !== 'en_cours') return terminer();

  const seDesabonner = suivreJournal(dep.id, (ligne) => (ligne === null ? terminer() : envoyer(ligne)));
  requete.on('close', seDesabonner);
}

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
const BRANCHE = /^[A-Za-z0-9._\/-]+$/;

// Vérifie les champs d'un projet. `existant` vaut null à la création.
function validerProjet(entree, existant) {
  const texte = (valeur) => (typeof valeur === 'string' ? valeur.trim() : '');
  const champs = {
    slug: texte(entree.slug).toLowerCase(),
    depot: texte(entree.depot),
    branche: texte(entree.branche), // vide = branche par défaut du dépôt
    commandeInstallation: texte(entree.commandeInstallation),
    commandeConstruction: texte(entree.commandeConstruction),
    dossierSortie: texte(entree.dossierSortie),
  };

  if (!SLUG.test(champs.slug)) {
    throw new ErreurHttp(400, 'Nom : lettres minuscules, chiffres et tirets uniquement (40 max).');
  }
  if (base.projets.some((p) => p.slug === champs.slug && p !== existant)) {
    throw new ErreurHttp(409, `Le nom « ${champs.slug} » est déjà pris.`);
  }
  let adresse;
  try {
    adresse = new URL(champs.depot);
  } catch {
    throw new ErreurHttp(400, 'Adresse du dépôt invalide.');
  }
  if (adresse.protocol !== 'https:' || adresse.username || adresse.password) {
    throw new ErreurHttp(400, 'Le dépôt doit être une adresse https:// (sans identifiants dedans).');
  }
  if (champs.branche && (!BRANCHE.test(champs.branche) || champs.branche.startsWith('-'))) {
    throw new ErreurHttp(400, 'Nom de branche invalide.');
  }

  // Jeton : vide = on garde l'ancien ; "effacer" = case cochée dans l'interface.
  if (entree.effacerJeton) champs.jeton = '';
  else if (texte(entree.jeton)) champs.jeton = texte(entree.jeton);
  else champs.jeton = existant?.jeton ?? '';

  return champs;
}

function resumerProjet(projet) {
  const dernier = deploiementsDuProjet(projet.id)[0] ?? null;
  return {
    id: projet.id,
    slug: projet.slug,
    depot: projet.depot,
    branche: projet.branche,
    url: urlDuProjet(projet.slug),
    enLigne: Boolean(projet.deploiementActif),
    dernierDeploiement: dernier,
  };
}

function detaillerProjet(projet) {
  return {
    ...resumerProjet(projet),
    commandeInstallation: projet.commandeInstallation,
    commandeConstruction: projet.commandeConstruction,
    dossierSortie: projet.dossierSortie,
    aUnJeton: Boolean(projet.jeton), // le jeton lui-même ne repart jamais vers le navigateur
    deploiementActif: projet.deploiementActif,
    webhook: {
      chemin: `/_envol/webhook/${projet.id}`,
      secret: projet.secretWebhook,
    },
    deploiements: deploiementsDuProjet(projet.id),
  };
}

async function lireJson(requete) {
  try {
    return JSON.parse((await lireCorps(requete)).toString('utf8') || '{}');
  } catch {
    throw new ErreurHttp(400, 'JSON invalide.');
  }
}

function envoyerJson(reponse, statut, donnees) {
  reponse.writeHead(statut, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  reponse.end(JSON.stringify(donnees));
}
