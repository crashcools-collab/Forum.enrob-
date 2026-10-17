// Mot de passe unique + sessions par cookie.
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { base, sauver } from './stockage.js';

const NOM_COOKIE = 'envol_session';
const DUREE_SESSION = 7 * 24 * 3600 * 1000; // 7 jours
const sessions = new Map(); // jeton -> date d'expiration

// Protection contre les essais en série : blocage d'une minute après 5 échecs.
let echecs = 0;
let bloqueJusqua = 0;

export function estConfigure() {
  return Boolean(base.motDePasse);
}

export function definirMotDePasse(motDePasse) {
  const sel = randomBytes(16).toString('hex');
  const empreinte = scryptSync(motDePasse, sel, 64).toString('hex');
  base.motDePasse = `${sel}:${empreinte}`;
  sauver();
}

export function verifierMotDePasse(motDePasse) {
  if (Date.now() < bloqueJusqua) return { ok: false, bloque: true };
  const [sel, empreinte] = base.motDePasse.split(':');
  const essai = scryptSync(motDePasse, sel, 64);
  const ok = timingSafeEqual(essai, Buffer.from(empreinte, 'hex'));
  if (ok) {
    echecs = 0;
  } else if (++echecs >= 5) {
    echecs = 0;
    bloqueJusqua = Date.now() + 60_000;
  }
  return { ok, bloque: false };
}

export function ouvrirSession(reponse) {
  const jeton = randomBytes(32).toString('hex');
  sessions.set(jeton, Date.now() + DUREE_SESSION);
  reponse.setHeader(
    'Set-Cookie',
    `${NOM_COOKIE}=${jeton}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${DUREE_SESSION / 1000}`,
  );
}

export function fermerSession(requete, reponse) {
  sessions.delete(lireJeton(requete));
  reponse.setHeader('Set-Cookie', `${NOM_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
}

export function estConnecte(requete) {
  const jeton = lireJeton(requete);
  const expiration = jeton && sessions.get(jeton);
  if (!expiration) return false;
  if (expiration < Date.now()) {
    sessions.delete(jeton);
    return false;
  }
  return true;
}

function lireJeton(requete) {
  const cookies = requete.headers.cookie ?? '';
  for (const morceau of cookies.split(';')) {
    const [nom, valeur] = morceau.trim().split('=');
    if (nom === NOM_COOKIE) return valeur;
  }
  return null;
}
