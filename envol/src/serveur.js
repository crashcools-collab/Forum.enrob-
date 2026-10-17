// Point d'entrée : démarre le tableau de bord (privé) et le serveur des sites (public).
import { config } from './config.js';
import { creerServeurTableau } from './tableau.js';
import { creerServeurSites } from './sites.js';

creerServeurTableau().listen(config.portTableau, config.hoteTableau, () => {
  console.log(`Tableau de bord : http://${config.hoteTableau}:${config.portTableau}`);
});

creerServeurSites().listen(config.portSites, config.hoteSites, () => {
  console.log(`Sites : http://<projet>.${config.domaine}:${config.portSites}`);
  console.log(`Docker pour les constructions : ${config.utiliserDocker ? 'oui' : 'non'}`);
});
