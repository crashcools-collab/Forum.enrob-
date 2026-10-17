// Réglages d'Envol. Chaque valeur peut être changée par une variable d'environnement
// (voir le fichier envol.env installé dans /etc/envol/).
import path from 'node:path';

export const config = {
  // Tableau de bord : réservé à toi, écoute seulement sur la machine elle-même.
  hoteTableau: process.env.ENVOL_HOTE_TABLEAU ?? '127.0.0.1',
  portTableau: Number(process.env.ENVOL_PORT_TABLEAU ?? 3000),

  // Serveur des sites : c'est lui que le tunnel Cloudflare rend public.
  hoteSites: process.env.ENVOL_HOTE_SITES ?? '127.0.0.1',
  portSites: Number(process.env.ENVOL_PORT_SITES ?? 8080),

  // Domaine des sites : "localhost" en local (forum.localhost:8080),
  // ton vrai domaine une fois le tunnel en place (forum.tondomaine.fr).
  domaine: (process.env.ENVOL_DOMAINE ?? 'localhost').toLowerCase(),

  // Adresse publique des sites, utilisée pour afficher les liens.
  // Vide = http://<projet>.<domaine>:<portSites>
  urlPublique: process.env.ENVOL_URL_PUBLIQUE ?? '',

  dossierDonnees: path.resolve(process.env.ENVOL_DONNEES ?? './donnees'),

  // Les commandes de construction tournent dans un conteneur Docker jetable.
  utiliserDocker: (process.env.ENVOL_DOCKER ?? 'oui') !== 'non',
  imageConstruction: process.env.ENVOL_IMAGE ?? 'node:22-alpine',

  // Nombre de déploiements gardés par projet (pour pouvoir revenir en arrière).
  deploiementsGardes: Number(process.env.ENVOL_DEPLOIEMENTS_GARDES ?? 10),

  // Durée maximale d'une construction, en minutes.
  dureeMaxConstruction: Number(process.env.ENVOL_DUREE_MAX ?? 15),
};

// Adresse à laquelle un projet est visible.
export function urlDuProjet(slug) {
  if (config.urlPublique) return config.urlPublique.replace('*', slug);
  return `http://${slug}.${config.domaine}:${config.portSites}`;
}
