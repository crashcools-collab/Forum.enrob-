// Mot de passe oublié ? Arrête Envol, lance ce script, redémarre Envol :
// le tableau de bord te redemandera d'en choisir un nouveau.
import { base, sauver } from '../src/stockage.js';

base.motDePasse = null;
sauver();
console.log('Mot de passe effacé. Redémarre Envol puis ouvre le tableau de bord pour en choisir un nouveau.');
