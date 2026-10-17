// Système solaire en 3D : vraies positions des planètes à la date choisie, orbites, ceintures, comète de Halley, sondes Voyager.
const Systeme = (() => {
  const { RAD } = Astro;
  const cam = new Camera3D({ yaw: -1.2, pitch: 0.55, dist: 34, min: 0.6, max: 400 });
  const ids = ['mercure', 'venus', 'terre', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune', 'pluton'];
  const NOMS = { mercure: 'Mercure', venus: 'Vénus', terre: 'Terre', mars: 'Mars', jupiter: 'Jupiter', saturne: 'Saturne', uranus: 'Uranus', neptune: 'Neptune', pluton: 'Pluton' };
  const RAYONS = { mercure: 2440, venus: 6052, terre: 6371, mars: 3390, jupiter: 69911, saturne: 58232, uranus: 25362, neptune: 24622, pluton: 1188 };
  const COULEURS = { mercure: '#b9b2a8', venus: '#f3e2b5', terre: '#6aa6ff', mars: '#e0795a', jupiter: '#e7caa0', saturne: '#ead9a6', uranus: '#a8dde6', neptune: '#6f8fe8', pluton: '#d8c4a8' };
  const VITESSES = [[-365, '−1 an/s'], [-30, '−1 mois/s'], [-1, '−1 jour/s'], [0, 'pause'], [1, '1 jour/s'], [7, '1 semaine/s'], [30, '1 mois/s'], [365, '1 an/s'], [3650, '10 ans/s']];
  const etat = { jd: Astro.jourJulien(new Date()), iv: 4, reel: false, orbites: true, noms: true, ceintures: true, suivi: null, selection: null };
  let canvas, ctx, W, H, actif = false, dernier = 0, positions = {}, touches = [];

  // Échelle : en mode « compressé », les distances sont ramenées par une racine carrée pour tout voir
  const echelle = r => etat.reel ? r : 4 * Math.sqrt(r);
  const transformer = p => { const r = Math.hypot(...p); if (r === 0) return [0, 0, 0]; const k = echelle(r) / r; return [p[0] * k, p[1] * k, p[2] * k]; };
  const rayonMonde = id => etat.reel ? 0.03 + 0.06 * Math.sqrt(RAYONS[id] / 6371) : 0.12 + 0.36 * Math.sqrt(RAYONS[id] / 69911);
  const rayonSoleil = () => etat.reel ? 0.5 : 1.3;

  // Ceintures d'astéroïdes et de Kuiper (points pseudo-aléatoires sur des orbites képlériennes simplifiées)
  let graine = 42; const alea = () => { graine = (graine * 16807) % 2147483647; return (graine - 1) / 2147483646; };
  const ceinture = (n, amin, amax, incl) => Array.from({ length: n }, () => ({ a: amin + alea() * (amax - amin), th: alea() * 2 * Math.PI, i: (alea() - 0.5) * incl * RAD, om: alea() * 2 * Math.PI }));
  const asteroides = ceinture(1600, 2.15, 3.3, 20), kuiper = ceinture(1300, 30, 50, 30);

  // Pôle de Saturne (anneaux) : AD 40,59°, Déc 83,54° -> écliptique
  const poleSaturne = (() => { const e = Astro.versVecteur(40.59, 83.54), c = Math.cos(23.43928 * RAD), s = Math.sin(23.43928 * RAD); return [e[0], e[1] * c + e[2] * s, -e[1] * s + e[2] * c]; })();
  // Sondes Voyager : direction (AD/Déc) et distance en UA à la mi-novembre 2026, vitesse en UA par an
  const VOYAGERS = [
    { nom: 'Voyager 1', ra: 258.0, dec: 12.0, ua: 173, vitesse: 3.57 },
    { nom: 'Voyager 2', ra: 301.5, dec: -60.0, ua: 144, vitesse: 3.2 }
  ].map(v => { const e = Astro.versVecteur(v.ra, v.dec), c = Math.cos(23.43928 * RAD), s = Math.sin(23.43928 * RAD); return { ...v, dir: [e[0], e[1] * c + e[2] * s, -e[1] * s + e[2] * c] }; });
  const JD_REF_VOYAGER = Astro.jourJulien(new Date('2026-11-15'));

  function orbite(id) {
    const el = Astro.elementsPlanete(id, etat.jd), pts = [];
    for (let k = 0; k <= 180; k++) pts.push(transformer(Astro.positionOrbite(el.a, el.e, el.i, el.Om, el.om, k * 2)));
    return pts;
  }
  function orbiteHalley() { const H0 = Astro.HALLEY, pts = []; for (let k = 0; k <= 240; k++) { const E = k / 240 * 2 * Math.PI, M = (E - H0.e * Math.sin(E)) / RAD; pts.push(transformer(Astro.positionOrbite(H0.a, H0.e, H0.i, H0.Om, H0.om, M))); } return pts; }

  function tracer3D(pts, couleur, largeur = 1) {
    ctx.strokeStyle = couleur; ctx.lineWidth = largeur; ctx.beginPath(); let ok = false;
    for (const p of pts) { const q = cam.projeter(p); if (!q) { ok = false; continue; } if (ok) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); ok = true; }
    ctx.stroke();
  }

  function dessiner() {
    ({ ctx, w: W, h: H } = ajusterCanvas(canvas));
    positions = {};
    for (const id of ids) positions[id] = transformer(Astro.helio(id, etat.jd));
    positions.halley = transformer(Astro.helioHalley(etat.jd));
    if (etat.suivi) cam.cible = positions[etat.suivi].slice();
    cam.preparer(W, H);
    touches = [];

    ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, W, H);
    // fond étoilé fixe
    graine = 99; ctx.fillStyle = '#fff';
    for (let i = 0; i < 260; i++) { ctx.globalAlpha = 0.15 + alea() * 0.5; ctx.fillRect(alea() * W, alea() * H, 1.2, 1.2); }
    ctx.globalAlpha = 1;

    // plan de l'écliptique : cercles de repère
    for (const r of etat.reel ? [1, 5, 10, 20, 30, 40] : [1, 5, 10, 20, 30, 50]) {
      const pts = []; for (let k = 0; k <= 120; k++) pts.push(transformer([r * Math.cos(k * Math.PI / 60), r * Math.sin(k * Math.PI / 60), 0]));
      tracer3D(pts, 'rgba(90,110,170,.13)');
    }
    if (etat.orbites) { for (const id of ids) tracer3D(orbite(id), COULEURS[id] + '55', id === etat.selection ? 2 : 1); tracer3D(orbiteHalley(), 'rgba(160,220,255,.22)'); }

    // ceintures
    if (etat.ceintures) {
      ctx.fillStyle = 'rgba(190,180,160,.55)';
      for (const b of [asteroides, kuiper]) for (const a of b) {
        const th = a.th + 2 * Math.PI * (etat.jd - 2451545) / (365.25 * Math.pow(a.a, 1.5));
        const p = transformer([a.a * Math.cos(th), a.a * Math.sin(th), a.a * Math.sin(a.i) * Math.sin(th - a.om)]);
        const q = cam.projeter(p); if (q) ctx.fillRect(q.x, q.y, 1.3, 1.3);
      }
    }

    // corps triés du plus lointain au plus proche
    const corps = [{ id: 'soleil', p: [0, 0, 0] }, ...ids.map(id => ({ id, p: positions[id] })), { id: 'halley', p: positions.halley },
      ...VOYAGERS.map(v => ({ id: v.nom, voyager: v, p: transformer(v.dir.map(x => x * (v.ua + v.vitesse * (etat.jd - JD_REF_VOYAGER) / 365.25))) }))];
    for (const c of corps) c.q = cam.projeter(c.p);
    corps.filter(c => c.q).sort((a, b) => b.q.z - a.q.z).forEach(c => dessinerCorps(c));
    majBarre();
  }

  function dessinerCorps(c) {
    const { x, y, k } = c.q;
    if (c.id === 'soleil') {
      const r = Math.max(6, rayonSoleil() * k);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
      g.addColorStop(0, 'rgba(255,240,200,.9)'); g.addColorStop(0.25, 'rgba(255,190,90,.35)'); g.addColorStop(1, 'rgba(255,150,50,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 5, 0, 2 * Math.PI); ctx.fill();
      dessinerSphere(ctx, x, y, r, Textures.de('soleil'), null);
      touches.push({ x, y, r: r + 6, id: 'soleil' });
      if (etat.noms) etiquette('Soleil', x, y + r + 12, '#ffe7a8');
      return;
    }
    if (c.id === 'halley') {
      const r = Math.hypot(...Astro.helioHalley(etat.jd));
      const dir = cam.versEcran(c.p.map(v => v / (Math.hypot(...c.p) || 1)));
      const L = Math.min(90, 30 / Math.max(r, 0.3)) * (r < 6 ? 1 : 0.1);
      const g = ctx.createLinearGradient(x, y, x + dir[0] * L, y - dir[1] * L);
      g.addColorStop(0, 'rgba(190,230,255,.8)'); g.addColorStop(1, 'rgba(190,230,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dir[0] * L, y - dir[1] * L); ctx.stroke();
      ctx.fillStyle = '#dff3ff'; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 2 * Math.PI); ctx.fill();
      touches.push({ x, y, r: 10, id: 'halley' });
      if (etat.noms) etiquette('Comète de Halley', x + 6, y + 12, '#bfe6ff');
      return;
    }
    if (c.voyager) {
      ctx.fillStyle = '#7be0a6'; ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 4, y + 3); ctx.lineTo(x - 4, y + 3); ctx.closePath(); ctx.fill();
      touches.push({ x, y, r: 10, id: c.id, voyager: c.voyager });
      if (etat.noms) etiquette(c.id, x + 7, y, '#7be0a6');
      return;
    }
    const id = c.id, r = Math.max(2.5, rayonMonde(id) * k);
    const L = cam.versEcran(c.p.map(v => -v / (Math.hypot(...c.p) || 1)));
    if (id === 'saturne') anneaux(c, r, k, true);
    dessinerSphere(ctx, x, y, r, Textures.de(id), L);
    if (id === 'saturne') anneaux(c, r, k, false);
    if (id === etat.selection) { ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r + 6, 0, 2 * Math.PI); ctx.stroke(); }
    touches.push({ x, y, r: r + 8, id });
    if (etat.noms) etiquette(NOMS[id], x + r + 6, y, id === etat.selection ? '#ffd27a' : '#e8ecf8');
  }

  function anneaux(c, r, k, arriere) {
    const n = poleSaturne, a = [n[1], -n[0], 0].map(v => v / Math.hypot(n[0], n[1])), b = [n[1] * a[2] - n[2] * a[1], n[2] * a[0] - n[0] * a[2], n[0] * a[1] - n[1] * a[0]];
    const R = rayonMonde('saturne'), zc = c.q.z;
    ctx.fillStyle = 'rgba(225,208,160,.7)';
    for (let s = 0; s < 64; s++) {
      const t0 = s / 64 * 2 * Math.PI, t1 = (s + 1) / 64 * 2 * Math.PI;
      const pt = (t, f) => cam.projeter([c.p[0] + R * f * (Math.cos(t) * a[0] + Math.sin(t) * b[0]), c.p[1] + R * f * (Math.cos(t) * a[1] + Math.sin(t) * b[1]), c.p[2] + R * f * (Math.cos(t) * a[2] + Math.sin(t) * b[2])]);
      const p0 = pt(t0, 1.24), p1 = pt(t1, 1.24), p2 = pt(t1, 2.27), p3 = pt(t0, 2.27);
      if (!p0 || !p1 || !p2 || !p3) continue;
      if ((p0.z > zc) !== arriere) continue;
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath(); ctx.fill();
    }
  }

  function etiquette(t, x, y, couleur) { ctx.font = '600 12px system-ui, sans-serif'; ctx.textBaseline = 'middle'; ctx.fillStyle = couleur; ctx.fillText(t, x, y); }

  // --- Interface ---
  function majBarre() {
    const d = Astro.jdVersDate(etat.jd);
    const el = $('#sys-date'); if (el) el.textContent = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const v = $('#sys-vitesse'); if (v) v.textContent = VITESSES[etat.iv][1];
  }
  function construire() {
    $('#systeme-barre').innerHTML = `
      <button class="btn petit" id="sys-moins">⏪</button><button class="btn petit" id="sys-pause">⏯</button><button class="btn petit" id="sys-plus">⏩</button>
      <span class="pastille" id="sys-vitesse"></span><b id="sys-date"></b><button class="btn petit" id="sys-auj">Aujourd’hui</button>
      <span class="sep"></span>
      <button class="btn petit" id="sys-echelle" aria-pressed="${etat.reel}">📏 Distances réelles</button>
      <button class="btn petit" id="sys-orbites" aria-pressed="${etat.orbites}">Orbites</button>
      <button class="btn petit" id="sys-ceintures" aria-pressed="${etat.ceintures}">Ceintures</button>
      <button class="btn petit" id="sys-noms" aria-pressed="${etat.noms}">Noms</button>
      <select id="sys-aller" aria-label="Aller vers"><option value="">Aller vers…</option><option value="soleil">Soleil (vue d’ensemble)</option>${ids.map(id => `<option value="${id}">${NOMS[id]}</option>`).join('')}</select>`;
    $('#sys-moins').onclick = () => { etat.iv = Math.max(0, etat.iv - 1); };
    $('#sys-plus').onclick = () => { etat.iv = Math.min(VITESSES.length - 1, etat.iv + 1); };
    $('#sys-pause').onclick = () => { etat.iv = etat.iv === 3 ? 4 : 3; };
    $('#sys-auj').onclick = () => { etat.jd = Astro.jourJulien(new Date()); };
    const bascule = (id, cle) => { $(id).onclick = e => { etat[cle] = !etat[cle]; e.currentTarget.setAttribute('aria-pressed', etat[cle]); if (cle === 'reel') { cam.dist = etat.reel ? 70 : 34; } }; };
    bascule('#sys-echelle', 'reel'); bascule('#sys-orbites', 'orbites'); bascule('#sys-ceintures', 'ceintures'); bascule('#sys-noms', 'noms');
    $('#sys-aller').onchange = e => { const v = e.target.value; e.target.value = ''; if (v === 'soleil') { etat.suivi = null; cam.cible = [0, 0, 0]; cam.dist = etat.reel ? 70 : 34; legendeAccueil(); } else if (v) choisir(v); };
    legendeAccueil();
  }
  function legendeAccueil() {
    etat.selection = null;
    $('#systeme-legende').innerHTML = `<h3>🪐 Le système solaire en 3D</h3><div class="corps">
      <p>Les planètes sont à leur <b>vraie position</b> pour la date affichée, calculée avec les éléments orbitaux du JPL (NASA). Fais tourner la vue à la souris ou au doigt, zoome à la molette, et clique sur une planète.</p>
      <p>Accélère le temps pour voir Mercure filer en 88 jours pendant que Neptune met 165 ans à faire un tour. En mode « distances réelles », remarque à quel point les planètes géantes sont loin.</p>
      <p class="petit">Les tailles des planètes sont agrandies, sinon elles seraient invisibles : à cette échelle, le Soleil ferait la taille d’un grain de sable.</p></div>`;
  }
  function choisir(id) {
    etat.selection = id;
    if (ids.includes(id)) { etat.suivi = id; cam.dist = Math.max(1.6, rayonMonde(id) * 9); }
    const info = Savoir.planetes[id];
    let html;
    if (id === 'soleil') { const s = Savoir.planetes.soleil; html = ficheHtml('Soleil', s); }
    else if (id === 'halley') html = `<h3>☄️ Comète de Halley</h3><div class="corps"><p>La plus célèbre des comètes revient tous les 76 ans environ. Dernier passage : février 1986. <b>Prochain passage au plus près du Soleil : juillet 2061.</b></p><p>Son orbite est très allongée et elle tourne « à l’envers » des planètes. Sa queue pointe toujours à l’opposé du Soleil, poussée par le vent solaire. Les poussières qu’elle sème donnent les étoiles filantes des Orionides (octobre) et des Êta Aquarides (mai).</p></div>`;
    else if (id.startsWith('Voyager')) {
      const v = VOYAGERS.find(x => x.nom === id), ua = v.ua + v.vitesse * (etat.jd - JD_REF_VOYAGER) / 365.25;
      html = `<h3>🛰️ ${id}</h3><div class="corps"><p>Lancée en 1977, elle est à environ <b>${nombre(ua)} UA</b> du Soleil à cette date, soit ${nombre(ua * 0.1496, 1)} milliards de km. Un message radio met environ ${nombre(ua * 499 / 3600, 1)} heures pour lui parvenir.</p>
        <p>${id === 'Voyager 1' ? 'Voyager 1 est l’objet humain le plus lointain. Vers la mi-novembre 2026, elle se trouve à <b>un jour-lumière</b> de la Terre. Elle a quitté la bulle du Soleil (l’héliosphère) en 2012.' : 'Voyager 2 est la seule sonde à avoir survolé Uranus (1986) et Neptune (1989). Elle est sortie de l’héliosphère en 2018.'}</p></div>`;
    } else html = ficheHtml(NOMS[id], info);
    $('#systeme-legende').innerHTML = html + `<div class="ligne" style="margin-top:8px">${ids.includes(id) || id === 'soleil' ? `<button class="btn petit" id="sys-ciel">🌌 Voir dans le ciel</button><button class="btn petit" id="sys-nasa">📷 Photos NASA</button>` : ''}<button class="btn petit" id="sys-retour">↩ Vue d’ensemble</button></div>`;
    const bc = $('#sys-ciel'); if (bc) bc.onclick = () => Ciel.montrer(id === 'terre' ? 'Lune' : NOMS[id] || 'Soleil');
    const bn = $('#sys-nasa'); if (bn) bn.onclick = () => Appli.ouvrirMedias(info && info.nasa ? info.nasa : NOMS[id]);
    $('#sys-retour').onclick = () => { etat.suivi = null; cam.cible = [0, 0, 0]; cam.dist = etat.reel ? 70 : 34; legendeAccueil(); };
    Bus.emettre('selection', { titre: NOMS[id] || id, type: 'systeme' });
  }
  const ficheHtml = (nom, i) => !i ? `<h3>${nom}</h3>` : `<h3>${i.icone || '🪐'} ${nom}</h3><div class="corps"><p>${i.resume}</p>
    <div class="chiffres-cles">${i.chiffres.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div><p>✨ ${i.fait}</p></div>`;

  function boucle(t) {
    const dt = Math.min(0.1, (t - dernier) / 1000); dernier = t;
    if (actif) { etat.jd += VITESSES[etat.iv][0] * dt; dessiner(); }
    requestAnimationFrame(boucle);
  }
  function init() {
    canvas = $('#systeme-canvas');
    cam.brancher($('#systeme-zone'), () => {}, (x, y) => {
      const t = touches.slice().reverse().find(t => Math.hypot(t.x - x, t.y - y) < Math.max(t.r, 10));
      if (t) choisir(t.id);
    });
    construire();
    requestAnimationFrame(boucle);
  }
  const activer = on => { actif = on; };
  return { init, activer, choisir, NOMS };
})();
