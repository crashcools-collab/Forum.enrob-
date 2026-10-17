// Le cœur d'Envol : récupérer le code, le construire, le publier, revenir en arrière.
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, rmSync, cpSync, existsSync, statSync, appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { config, urlDuProjet } from './config.js';
import { base, sauver, trouverProjet, deploiementsDuProjet } from './stockage.js';

const executerFichier = promisify(execFile);

const dossierTravail = path.join(config.dossierDonnees, 'travail');
const dossierSites = path.join(config.dossierDonnees, 'sites');
const dossierJournaux = path.join(config.dossierDonnees, 'journaux');
for (const dossier of [dossierTravail, dossierSites, dossierJournaux]) {
  mkdirSync(dossier, { recursive: true });
}

// Si Envol a été arrêté en pleine construction, ces déploiements ne finiront jamais.
for (const dep of base.deploiements) {
  if (dep.statut === 'en_attente' || dep.statut === 'en_cours') {
    dep.statut = 'echec';
    dep.erreur = "Interrompu par un redémarrage d'Envol.";
  }
}
sauver();

// Une seule construction à la fois : les suivantes attendent leur tour.
let fileAttente = Promise.resolve();

// Personnes qui regardent un journal en direct : id du déploiement -> fonctions à prévenir.
const abonnes = new Map();

export function nouvelId(prefixe) {
  return `${prefixe}_${randomBytes(6).toString('hex')}`;
}

export function dossierDuDeploiement(dep) {
  return path.join(dossierSites, dep.projetId, dep.id);
}

export function lancerDeploiement(projet, declencheur) {
  const dep = {
    id: nouvelId('dep'),
    projetId: projet.id,
    statut: 'en_attente',
    declencheur, // "manuel" ou "github"
    creeLe: new Date().toISOString(),
    termineLe: null,
    commit: null,
    message: null,
    erreur: null,
  };
  base.deploiements.push(dep);
  sauver();
  ecrireJournal(dep.id, "En file d'attente…");
  fileAttente = fileAttente.then(() => construire(dep));
  return dep;
}

async function construire(dep) {
  const journal = (ligne) => ecrireJournal(dep.id, ligne);
  const travail = path.join(dossierTravail, dep.id);
  const debut = Date.now();
  dep.statut = 'en_cours';
  sauver();

  try {
    let projet = trouverProjet(dep.projetId);
    if (!projet) throw new Error('Projet supprimé avant le déploiement.');

    // 1. Récupération du code
    journal(`▶ Récupération de ${projet.depot} (branche ${projet.branche || 'par défaut'})`);
    const choixBranche = projet.branche ? ['--branch', projet.branche] : [];
    await executer('git', ['clone', '--depth', '1', ...choixBranche, '--', urlAvecJeton(projet), travail], {
      journal,
      masque: projet.jeton,
    });
    dep.commit = (await executerFichier('git', ['-C', travail, 'rev-parse', '--short', 'HEAD'])).stdout.trim();
    dep.message = (await executerFichier('git', ['-C', travail, 'log', '-1', '--pretty=%s'])).stdout.trim();
    sauver();
    journal(`✓ Commit ${dep.commit} — ${dep.message}`);

    // 2. Construction (facultative : un site déjà prêt est publié tel quel)
    const commandes = [projet.commandeInstallation, projet.commandeConstruction].filter(Boolean);
    if (commandes.length === 0) {
      journal('• Aucune commande de construction : les fichiers sont publiés tels quels.');
    } else if (config.utiliserDocker) {
      const script = commandes.join(' && ');
      journal(`▶ Construction dans Docker (${config.imageConstruction}) : ${script}`);
      const nomConteneur = `envol-${dep.id}`;
      await executer(
        'docker',
        [
          'run', '--rm', '--name', nomConteneur,
          '--user', `${process.getuid()}:${process.getgid()}`,
          '-e', 'HOME=/tmp', '-e', 'CI=1',
          '-v', `${travail}:/app`, '-w', '/app',
          config.imageConstruction, 'sh', '-c', script,
        ],
        { journal, nomConteneur },
      );
    } else {
      const script = commandes.join(' && ');
      journal(`▶ Construction directement sur la machine : ${script}`);
      await executer('sh', ['-c', script], { journal, cwd: travail });
    }

    // 3. Copie du résultat dans le dossier des sites
    const sortie = path.resolve(travail, projet.dossierSortie || '.');
    if (sortie !== travail && !sortie.startsWith(travail + path.sep)) {
      throw new Error('Le dossier de sortie doit être à l’intérieur du projet.');
    }
    if (!existsSync(sortie) || !statSync(sortie).isDirectory()) {
      throw new Error(`Dossier de sortie introuvable : « ${projet.dossierSortie || '.'} ».`);
    }
    const destination = dossierDuDeploiement(dep);
    cpSync(sortie, destination, { recursive: true, filter: (fichier) => path.basename(fichier) !== '.git' });

    // 4. Mise en ligne : on fait pointer le projet vers ce déploiement
    projet = trouverProjet(dep.projetId);
    if (!projet) {
      rmSync(destination, { recursive: true, force: true });
      throw new Error('Projet supprimé pendant le déploiement.');
    }
    projet.deploiementActif = dep.id;
    dep.statut = 'reussi';
    journal(`✓ En ligne : ${urlDuProjet(projet.slug)} (en ${Math.round((Date.now() - debut) / 1000)} s)`);
    nettoyerAnciens(projet);
  } catch (erreur) {
    dep.statut = 'echec';
    dep.erreur = erreur.message;
    journal(`✗ Échec : ${erreur.message}`);
  } finally {
    dep.termineLe = new Date().toISOString();
    sauver();
    rmSync(travail, { recursive: true, force: true });
    terminerJournal(dep.id);
  }
}

// Lance une commande et envoie chaque ligne affichée dans le journal.
function executer(commande, args, { journal, cwd, masque, nomConteneur } = {}) {
  return new Promise((resolve, reject) => {
    const enfant = spawn(commande, args, {
      cwd,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', CI: '1' },
    });

    const minuterie = setTimeout(() => {
      enfant.kill('SIGKILL');
      if (nomConteneur) spawn('docker', ['rm', '-f', nomConteneur]);
      reject(new Error(`Temps dépassé (${config.dureeMaxConstruction} min).`));
    }, config.dureeMaxConstruction * 60_000);

    for (const flux of [enfant.stdout, enfant.stderr]) {
      let reste = '';
      flux.on('data', (morceau) => {
        const lignes = (reste + morceau).split(/\r\n|\r|\n/);
        reste = lignes.pop();
        for (const ligne of lignes) if (ligne.trim()) journal(masquer(ligne, masque));
      });
      flux.on('end', () => {
        if (reste.trim()) journal(masquer(reste, masque));
      });
    }

    enfant.on('error', (erreur) => {
      clearTimeout(minuterie);
      reject(new Error(erreur.code === 'ENOENT' ? `Commande introuvable : ${commande}` : erreur.message));
    });
    enfant.on('close', (code) => {
      clearTimeout(minuterie);
      if (code === 0) resolve();
      else reject(new Error(`« ${commande} » s'est arrêté avec le code ${code}.`));
    });
  });
}

// Pour un dépôt privé, le jeton d'accès est glissé dans l'adresse… et jamais affiché.
function urlAvecJeton(projet) {
  if (!projet.jeton) return projet.depot;
  const url = new URL(projet.depot);
  url.username = url.hostname === 'github.com' ? 'x-access-token' : 'oauth2';
  url.password = projet.jeton;
  return url.toString();
}

function masquer(ligne, secret) {
  return secret ? ligne.split(secret).join('••••') : ligne;
}

// Garde les N derniers déploiements (et toujours celui en ligne), efface le reste.
function nettoyerAnciens(projet) {
  const aGarder = new Set(
    deploiementsDuProjet(projet.id)
      .slice(0, config.deploiementsGardes)
      .map((d) => d.id),
  );
  aGarder.add(projet.deploiementActif);
  base.deploiements = base.deploiements.filter((d) => {
    if (d.projetId !== projet.id || aGarder.has(d.id)) return true;
    if (d.statut === 'en_attente' || d.statut === 'en_cours') return true;
    rmSync(dossierDuDeploiement(d), { recursive: true, force: true });
    rmSync(fichierJournal(d.id), { force: true });
    return false;
  });
}

export function activerDeploiement(projet, dep) {
  if (dep.statut !== 'reussi' || !existsSync(dossierDuDeploiement(dep))) {
    throw new Error("Ce déploiement ne peut pas être remis en ligne.");
  }
  projet.deploiementActif = dep.id;
  sauver();
}

export function supprimerProjet(projet) {
  rmSync(path.join(dossierSites, projet.id), { recursive: true, force: true });
  for (const dep of deploiementsDuProjet(projet.id)) rmSync(fichierJournal(dep.id), { force: true });
  base.deploiements = base.deploiements.filter((d) => d.projetId !== projet.id);
  base.projets = base.projets.filter((p) => p.id !== projet.id);
  sauver();
}

// ---- Journaux ----

function fichierJournal(id) {
  return path.join(dossierJournaux, `${id}.log`);
}

function ecrireJournal(id, ligne) {
  const horodatee = `[${new Date().toLocaleTimeString('fr-FR')}] ${ligne}`;
  appendFileSync(fichierJournal(id), horodatee + '\n');
  for (const prevenir of abonnes.get(id) ?? []) prevenir(horodatee);
}

function terminerJournal(id) {
  for (const prevenir of abonnes.get(id) ?? []) prevenir(null);
  abonnes.delete(id);
}

export function lireJournal(id) {
  return existsSync(fichierJournal(id)) ? readFileSync(fichierJournal(id), 'utf8') : '';
}

// Retourne une fonction pour se désabonner.
export function suivreJournal(id, prevenir) {
  if (!abonnes.has(id)) abonnes.set(id, new Set());
  abonnes.get(id).add(prevenir);
  return () => abonnes.get(id)?.delete(prevenir);
}
