// Outils communs : sélecteurs, mémoire locale, formats français, lieu d'observation, couleurs d'étoiles.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const echap = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const Memoire = {
  lire(cle, defaut) { try { const v = localStorage.getItem('atlas-' + cle); return v === null ? defaut : JSON.parse(v); } catch { return defaut; } },
  ecrire(cle, v) { try { localStorage.setItem('atlas-' + cle, JSON.stringify(v)); } catch { /* stockage indisponible : on continue sans */ } }
};

const nombre = (v, dec = 0) => Number(v).toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const heure = d => d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—';
const dateCourte = d => d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const dateLongue = d => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const sansAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const POINTS_CARDINAUX = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
const cardinal = az => POINTS_CARDINAUX[Math.round(az / 22.5) % 16];
const raHeures = ra => { const h = ra / 15, hh = Math.floor(h), mm = Math.floor((h - hh) * 60); return `${hh} h ${String(mm).padStart(2, '0')} min`; };
const decDegres = dec => `${dec >= 0 ? '+' : '−'}${Math.abs(dec).toFixed(1).replace('.', ',')}°`;

// Indice de couleur B-V -> couleur RVB (température via la formule de Ballesteros)
function couleurEtoile(bv) {
  bv = Math.max(-0.4, Math.min(2.0, bv));
  const T = 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));
  const t = T / 100;
  let r, g, b;
  if (t <= 66) { r = 255; g = 99.47 * Math.log(t) - 161.12; b = t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04; }
  else { r = 329.7 * Math.pow(t - 60, -0.1332); g = 288.12 * Math.pow(t - 60, -0.0755); b = 255; }
  const c = v => Math.round(Math.max(0, Math.min(255, v)) * 0.65 + 255 * 0.35); // un peu pâli, comme à l'œil
  return { rgb: `rgb(${c(r)},${c(g)},${c(b)})`, temperature: Math.round(T) };
}

// Lieux proposés (latitude, longitude est positive)
const LIEUX = [
  ['Paris', 48.8566, 2.3522], ['Lyon', 45.764, 4.8357], ['Marseille', 43.2965, 5.3698], ['Toulouse', 43.6047, 1.4442],
  ['Bordeaux', 44.8378, -0.5792], ['Nantes', 47.2184, -1.5536], ['Lille', 50.6292, 3.0573], ['Strasbourg', 48.5734, 7.7521],
  ['Rennes', 48.1173, -1.6778], ['Montpellier', 43.6108, 3.8767], ['Nice', 43.7102, 7.262], ['Brest', 48.3904, -4.4861],
  ['Pic du Midi (observatoire)', 42.9364, 0.1425], ['Bruxelles', 50.8503, 4.3517], ['Genève', 46.2044, 6.1432], ['Luxembourg', 49.6116, 6.1319],
  ['Montréal', 45.5017, -73.5673], ['Québec', 46.8139, -71.208], ['Casablanca', 33.5731, -7.5898], ['Alger', 36.7538, 3.0588],
  ['Tunis', 36.8065, 10.1815], ['Dakar', 14.7167, -17.4677], ['Abidjan', 5.36, -4.0083], ['Kinshasa', -4.4419, 15.2663],
  ['Saint-Denis (La Réunion)', -20.8821, 55.4507], ['Fort-de-France (Martinique)', 14.6161, -61.0588], ['Pointe-à-Pitre (Guadeloupe)', 16.2411, -61.5331],
  ['Cayenne (Guyane)', 4.9224, -52.3135], ['Nouméa', -22.2758, 166.458], ['Papeete', -17.5516, -149.5585],
  ['Atacama (Chili, ciel parfait)', -24.627, -70.404], ['Mauna Kea (Hawaï)', 19.8207, -155.4681], ['Pôle Nord', 89.99, 0], ['Équateur (Quito)', -0.1807, -78.4678]
];
const Lieu = {
  courant: Memoire.lire('lieu', { nom: 'Paris', lat: 48.8566, lon: 2.3522 }),
  ecouteurs: [],
  definir(l) { this.courant = l; Memoire.ecrire('lieu', l); this.ecouteurs.forEach(f => f(l)); },
  surChangement(f) { this.ecouteurs.push(f); }
};

// Petite file d'événements entre modules (la fée écoute ce que fait l'utilisateur)
const Bus = {
  ec: {},
  sur(n, f) { (this.ec[n] = this.ec[n] || []).push(f); },
  emettre(n, d) { (this.ec[n] || []).forEach(f => f(d)); }
};

// Canvas net sur écran haute densité
function ajusterCanvas(canvas) {
  const r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: r.width, h: r.height };
}

// Sprite de halo doux réutilisable
function creerHalo(couleurCentre, taille = 64) {
  const c = document.createElement('canvas'); c.width = c.height = taille;
  const g = c.getContext('2d'), gr = g.createRadialGradient(taille / 2, taille / 2, 0, taille / 2, taille / 2, taille / 2);
  gr.addColorStop(0, couleurCentre); gr.addColorStop(0.25, couleurCentre.replace(/[\d.]+\)$/, '0.35)')); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, taille, taille);
  return c;
}

// Glisser / zoomer à la souris, au doigt et à la molette, sur n'importe quelle scène
function gestesScene(el, { glisser, zoomer, cliquer }) {
  const pointeurs = new Map();
  let distPince = 0, bouge = 0, depart = null;
  el.addEventListener('pointerdown', e => {
    el.setPointerCapture(e.pointerId); pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    bouge = 0; depart = { x: e.clientX, y: e.clientY };
    if (pointeurs.size === 2) { const [a, b] = [...pointeurs.values()]; distPince = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  el.addEventListener('pointermove', e => {
    if (!pointeurs.has(e.pointerId)) return;
    const p = pointeurs.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (pointeurs.size === 1) { bouge += Math.abs(dx) + Math.abs(dy); glisser(dx, dy); }
    else if (pointeurs.size === 2) {
      const [a, b] = [...pointeurs.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (distPince) zoomer(distPince / d); distPince = d; bouge = 99;
    }
  });
  const fin = e => {
    if (pointeurs.has(e.pointerId) && pointeurs.size === 1 && bouge < 6 && cliquer) {
      const r = el.getBoundingClientRect(); cliquer(depart.x - r.left, depart.y - r.top);
    }
    pointeurs.delete(e.pointerId); if (pointeurs.size < 2) distPince = 0;
  };
  el.addEventListener('pointerup', fin);
  el.addEventListener('pointercancel', e => { pointeurs.delete(e.pointerId); });
  el.addEventListener('wheel', e => { e.preventDefault(); zoomer(Math.exp(e.deltaY * 0.0012)); }, { passive: false });
}
