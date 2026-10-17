// Base de données d'Envol : un simple fichier JSON (suffisant pour un seul utilisateur).
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

mkdirSync(config.dossierDonnees, { recursive: true, mode: 0o700 });
const fichier = path.join(config.dossierDonnees, 'base.json');

export const base = {
  motDePasse: null, // "sel:empreinte" — jamais le mot de passe en clair
  projets: [],
  deploiements: [],
};

if (existsSync(fichier)) {
  Object.assign(base, JSON.parse(readFileSync(fichier, 'utf8')));
}

// Écriture "atomique" : on écrit un fichier temporaire puis on le renomme,
// pour ne jamais laisser une base à moitié écrite si le PC s'éteint.
export function sauver() {
  const temporaire = fichier + '.tmp';
  writeFileSync(temporaire, JSON.stringify(base, null, 2), { mode: 0o600 });
  renameSync(temporaire, fichier);
}

export function trouverProjet(id) {
  return base.projets.find((p) => p.id === id);
}

export function trouverDeploiement(id) {
  return base.deploiements.find((d) => d.id === id);
}

export function deploiementsDuProjet(projetId) {
  return base.deploiements
    .filter((d) => d.projetId === projetId)
    .sort((a, b) => b.creeLe.localeCompare(a.creeLe));
}
