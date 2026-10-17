// Prépare les données du ciel à partir du catalogue d3-celestial (Olaf Frohn, licence BSD-3).
// Usage : node atlas-univers-src/prep.mjs <dossier contenant stars.6.json, constellations*.json, starnames.json, mw.json, messier.json>
// Produit atlas-univers-src/donnees/ciel.json, compact, embarqué ensuite dans l'atlas par build.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) { console.error('Indique le dossier des fichiers d3-celestial.'); process.exit(1); }
const lire = f => JSON.parse(readFileSync(join(src, f), 'utf8'));
const ici = dirname(fileURLToPath(import.meta.url));
const ra = lon => (lon < 0 ? lon + 360 : lon);
const r2 = v => Math.round(v * 100) / 100;

// Étoiles (jusqu'à la magnitude 6), triées de la plus brillante à la plus faible
const noms = lire('starnames.json');
const etoilesBrutes = lire('stars.6.json').features
  .map(f => ({ id: String(f.id), ra: ra(f.geometry.coordinates[0]), dec: f.geometry.coordinates[1], mag: f.properties.mag, bv: parseFloat(f.properties.bv) }))
  .sort((a, b) => a.mag - b.mag);
const etoiles = [], nomsEtoiles = [];
etoilesBrutes.forEach((e, i) => {
  etoiles.push(Math.round(e.ra * 100), Math.round(e.dec * 100), Math.round(e.mag * 100), Math.round((isNaN(e.bv) ? 0.6 : e.bv) * 100));
  const n = noms[e.id];
  if (n && (n.name || (n.desig && e.mag < 4.5))) nomsEtoiles.push([i, n.name || '', n.bayer || n.flam || '', n.c || '']);
});

// Constellations : lignes, noms français et position du nom
const lignes = {};
for (const f of lire('constellations.lines.json').features)
  lignes[f.id] = f.geometry.coordinates.map(l => l.flatMap(([lon, lat]) => [r2(ra(lon)), r2(lat)]));
const constel = lire('constellations.json').features.map(f => {
  const p = f.properties, [lon, lat] = f.geometry.coordinates;
  return [f.id, p.fr || p.name, p.name, r2(ra(lon)), r2(lat), +p.rank];
});

// Objets de Messier
const messier = lire('messier.json').features.map(f => {
  const p = f.properties, [lon, lat] = f.geometry.coordinates;
  return [p.name, p.desig, p.alt || '', p.type, p.mag, p.dim, r2(ra(lon)), r2(lat)];
});

// Voie lactée : on échantillonne la sphère et on compte dans combien de contours (ol1 à ol5) tombe chaque point.
// Le test se fait en coordonnées galactiques, où la bande est horizontale et ne contient aucun pôle.
const G = [[-0.0548755604, -0.8734370902, -0.4838350155], [0.4941094279, -0.4448296300, 0.7469822445], [-0.8676661490, -0.1980763734, 0.4559837762]];
const rad = Math.PI / 180;
function versGal(raDeg, decDeg) {
  const a = raDeg * rad, d = decDeg * rad, e = [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
  const g = G.map(l => l[0] * e[0] + l[1] * e[1] + l[2] * e[2]);
  return [((Math.atan2(g[1], g[0]) / rad) + 360) % 360, Math.asin(g[2]) / rad];
}
const niveaux = lire('mw.json').features.map(f => {
  const segs = [];
  for (const poly of f.geometry.coordinates) for (const anneau of poly) {
    const pts = anneau.map(([lon, lat]) => versGal(ra(lon), lat));
    for (let i = 0; i + 1 < pts.length; i++) segs.push([pts[i], pts[i + 1]]);
  }
  return segs;
});
function dedans(segs, l, b) {
  // Rayon de (l,b) vers le pôle nord galactique : parité des croisements
  let n = 0;
  for (const [[l1, b1], [l2, b2]] of segs) {
    let dl = l2 - l1; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
    if (dl === 0) continue;
    let t = (l - l1); if (t > 180) t -= 360; if (t < -180) t += 360;
    t /= dl;
    if (t < 0 || t >= 1) continue;
    if (b1 + t * (b2 - b1) > b) n++;
  }
  return n % 2 === 1;
}
const N = 26000, vl = [];
for (let i = 0; i < N; i++) {
  const z = 1 - (2 * i + 1) / N, phi = i * Math.PI * (3 - Math.sqrt(5));
  const dec = Math.asin(z) / rad, raDeg = (((phi / rad) % 360) + 360) % 360;
  const [l, b] = versGal(raDeg, dec);
  if (Math.abs(b) > 45) continue;
  let niv = 0;
  for (const segs of niveaux) if (dedans(segs, l, b)) niv++;
  if (niv) vl.push(Math.round(raDeg * 10), Math.round(dec * 10), niv);
}

const sortie = { source: 'd3-celestial (c) 2015 Olaf Frohn, licence BSD-3', etoiles, nomsEtoiles, lignes, constel, messier, vl };
writeFileSync(join(ici, 'donnees', 'ciel.json'), JSON.stringify(sortie));
console.log(`étoiles ${etoiles.length / 4}, noms ${nomsEtoiles.length}, constellations ${constel.length}, Messier ${messier.length}, points Voie lactée ${vl.length / 3}`);
