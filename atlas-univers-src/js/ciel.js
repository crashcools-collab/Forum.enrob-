// Planétarium : le vrai ciel pour ton lieu et ton heure (projection stéréographique, comme dans un dôme).
const Ciel = (() => {
  const D = CIEL;
  const { RAD, DEG } = Astro;
  let canvas, ctx, W = 1, H = 1, S = 1, cx = 0, cy = 0;
  const vue = Memoire.lire('vue-ciel', { az: 180, alt: 30, fov: 110 });
  const opt = Object.assign({ constellations: true, nomsConstel: true, nomsEtoiles: true, grille: false, grilleEq: false, ecliptique: false,
    sol: true, atmosphere: true, voieLactee: true, messier: true, planetes: true }, Memoire.lire('options-ciel', {}));
  const VITESSES = [[-86400, '−1 jour/s'], [-3600, '−1 h/s'], [-600, '−10 min/s'], [-60, '−1 min/s'], [1, 'temps réel'], [60, '1 min/s'], [600, '10 min/s'], [3600, '1 h/s'], [86400, '1 jour/s'], [604800, '1 semaine/s']];
  const temps = { date: new Date(), iv: 4, pause: false, dernier: performance.now() };
  let suivi = null, selection = null, sale = true, animation = null, mobiles = [], M = null, jdCourant = 0, soleilAlt = 0;
  let touches = [];

  const vec = (ra, dec) => Astro.versVecteur(ra, dec);

  // --- Données préparées une fois ---
  const NOMS_FR = { Vega: 'Véga', Betelgeuse: 'Bételgeuse', Altair: 'Altaïr', Antares: 'Antarès', Aldebaran: 'Aldébaran', Polaris: 'Étoile polaire',
    Regulus: 'Régulus', Spica: 'Spica (l’Épi)', 'Rigil Kentaurus': 'Alpha du Centaure', Toliman: 'Alpha du Centaure B', Fomalhaut: 'Fomalhaut', Deneb: 'Deneb' };
  const DIST_AL = { Sirius: 8.6, Canopus: 310, Arcturus: 36.7, 'Rigil Kentaurus': 4.37, Toliman: 4.37, Vega: 25, Capella: 42.9, Rigel: 860, Procyon: 11.5,
    Achernar: 139, Betelgeuse: 550, Hadar: 390, Altair: 16.7, Acrux: 320, Aldebaran: 65, Antares: 550, Spica: 250, Pollux: 34, Fomalhaut: 25, Deneb: 2600,
    Mimosa: 280, Regulus: 79, Adhara: 430, Castor: 51, Shaula: 570, Gacrux: 88, Bellatrix: 250, Elnath: 134, Alnilam: 2000, Alnitak: 1260, Mintaka: 1200,
    Alioth: 83, Dubhe: 123, Mirfak: 510, Polaris: 433, Alkaid: 104, Algol: 90, Mizar: 83, Alcor: 82, Alpheratz: 97, Saiph: 650, Denebola: 36, Thuban: 300,
    Albireo: 430, Sadr: 1800, Merak: 79, Kochab: 131, Hamal: 66, Alphard: 177, Rasalhague: 49, Alcyone: 440, Algieba: 130, Diphda: 96, Phecda: 84,
    Megrez: 81, Caph: 55, Navi: 550, Markab: 133, Scheat: 196, Enif: 690, Almach: 350, Mirach: 197, Menkar: 250, 'Kaus Australis': 143, Nunki: 228 };
  const MESSIER_FR = { M1: 'Nébuleuse du Crabe', M6: 'Amas du Papillon', M7: 'Amas de Ptolémée', M8: 'Nébuleuse de la Lagune', M11: 'Amas du Canard sauvage',
    M13: 'Grand amas d’Hercule', M16: 'Nébuleuse de l’Aigle (Piliers de la Création)', M17: 'Nébuleuse Oméga', M20: 'Nébuleuse Trifide', M24: 'Nuage stellaire du Sagittaire',
    M27: 'Nébuleuse de l’Haltère', M31: 'Galaxie d’Andromède', M32: 'Satellite d’Andromède', M33: 'Galaxie du Triangle', M42: 'Grande nébuleuse d’Orion',
    M44: 'Amas de la Crèche', M45: 'Les Pléiades', M51: 'Galaxie du Tourbillon', M57: 'Nébuleuse de l’Anneau', M63: 'Galaxie du Tournesol',
    M64: 'Galaxie de l’Œil noir', M76: 'Petite Haltère', M81: 'Galaxie de Bode', M82: 'Galaxie du Cigare', M83: 'Galaxie du Moulinet austral',
    M87: 'Virgo A (trou noir photographié)', M97: 'Nébuleuse du Hibou', M101: 'Galaxie du Moulinet', M104: 'Galaxie du Sombrero', M110: 'Satellite d’Andromède' };
  const MESSIER_DIST = { M1: 6500, M6: 1600, M7: 980, M8: 4100, M11: 6200, M13: 22200, M16: 7000, M17: 5500, M20: 5200, M27: 1360, M31: 2.5e6, M32: 2.5e6,
    M33: 2.73e6, M42: 1344, M44: 577, M45: 444, M51: 23e6, M57: 2300, M81: 11.8e6, M82: 11.5e6, M87: 53.5e6, M97: 2030, M101: 21e6, M104: 31e6, M3: 33900, M5: 24500, M92: 26700, M22: 10400 };
  const TYPES = { gc: 'Amas globulaire', oc: 'Amas ouvert', sfr: 'Nébuleuse (pouponnière d’étoiles)', pn: 'Nébuleuse planétaire', snr: 'Reste de supernova',
    s: 'Galaxie spirale', e: 'Galaxie elliptique', i: 'Galaxie irrégulière', rn: 'Nébuleuse par réflexion', pos: 'Groupe d’étoiles' };

  const nbEtoiles = D.etoiles.length / 4;
  const vecE = new Float32Array(nbEtoiles * 3), magE = new Float32Array(nbEtoiles), coulE = [], tempE = new Int32Array(nbEtoiles);
  for (let i = 0; i < nbEtoiles; i++) {
    const v = vec(D.etoiles[i * 4] / 100, D.etoiles[i * 4 + 1] / 100);
    vecE[i * 3] = v[0]; vecE[i * 3 + 1] = v[1]; vecE[i * 3 + 2] = v[2];
    magE[i] = D.etoiles[i * 4 + 2] / 100;
    const c = couleurEtoile(D.etoiles[i * 4 + 3] / 100); coulE.push(c.rgb); tempE[i] = c.temperature;
  }
  const nomEtoile = new Map(D.nomsEtoiles.map(([i, nom, bayer, c]) => [i, { nom, bayer, c }]));
  const constels = D.constel.map(([id, fr, la, ra, dec, rang]) => ({ id, fr, la, v: vec(ra, dec), ra, dec, rang }));
  const constelParId = Object.fromEntries(constels.map(c => [c.id, c]));
  const lignesConst = Object.entries(D.lignes).map(([id, polys]) => ({ id, polys: polys.map(l => { const p = []; for (let k = 0; k < l.length; k += 2) p.push(vec(l[k], l[k + 1])); return p; }) }));
  const vl = [];
  for (let i = 0; i < D.vl.length; i += 3) vl.push({ v: vec(D.vl[i] / 10, D.vl[i + 1] / 10), n: D.vl[i + 2] });
  // Nuages de Magellan (absents du contour de la Voie lactée)
  for (const [ra, dec, r, n] of [[80.9, -69.75, 4, 3], [13.2, -72.8, 2, 2]])
    for (let k = 0; k < 40; k++) { const a = Math.random() * 2 * Math.PI, d = Math.sqrt(Math.random()) * r; vl.push({ v: vec(ra + d * Math.cos(a) / Math.cos(dec * RAD), dec + d * Math.sin(a)), n: n - (d > r * .6 ? 1 : 0) || 1 }); }
  const messier = D.messier.map(([id, ngc, alt, type, mag, dim, ra, dec]) => ({ id, ngc, alt, type, mag, dim, ra, dec, v: vec(ra, dec), nom: MESSIER_FR[id] || alt || ngc }));

  const nomAffiche = i => { const n = nomEtoile.get(i); if (!n) return null; if (n.nom) return NOMS_FR[n.nom] || n.nom; return `${n.bayer} ${constelParId[n.c] ? constelParId[n.c].la : n.c}`; };

  // --- Projection ---
  let F = [1, 0, 0], R = [0, 1, 0], U = [0, 0, 1];
  function camera() {
    const a = vue.az * RAD, h = vue.alt * RAD;
    F = [Math.cos(h) * Math.cos(a), Math.cos(h) * Math.sin(a), Math.sin(h)];
    R = [-Math.sin(a), Math.cos(a), 0];
    U = [-Math.sin(h) * Math.cos(a), -Math.sin(h) * Math.sin(a), Math.cos(h)];
    S = (Math.max(W, H) / 2) / (2 * Math.tan(vue.fov * RAD / 4));
    cx = W / 2; cy = H / 2;
  }
  const P = { x: 0, y: 0, z: 0 };
  function projH(n, e, u) { // vecteur horizontal -> écran
    const z = n * F[0] + e * F[1] + u * F[2];
    if (z < -0.98) return false;
    const k = 2 / (1 + z) * S;
    P.x = cx + (n * R[0] + e * R[1]) * k;
    P.y = cy - (n * U[0] + e * U[1] + u * U[2]) * k;
    P.z = z;
    return P.x > -200 && P.x < W + 200 && P.y > -200 && P.y < H + 200;
  }
  const versH = v => [M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2], M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2], M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]];
  const projEq = v => { const h = versH(v); return projH(h[0], h[1], h[2]) ? h : null; };
  // Écran -> direction horizontale (inverse stéréographique)
  function ecranVersH(x, y) {
    const X = (x - cx) / S, Y = -(y - cy) / S, r2 = X * X + Y * Y;
    const z = (4 - r2) / (4 + r2), k = (1 + z) / 2;
    const a = X * k, b = Y * k;
    return [F[0] * z + R[0] * a + U[0] * b, F[1] * z + R[1] * a + U[1] * b, F[2] * z + R[2] * a + U[2] * b];
  }

  function tracer(points, couleur, epaisseur = 1, pointille = null) {
    ctx.strokeStyle = couleur; ctx.lineWidth = epaisseur; ctx.setLineDash(pointille || []);
    ctx.beginPath();
    let px = null, py = null;
    for (const h of points) {
      const ok = projH(h[0], h[1], h[2]) || (P.z > -0.98);
      if (ok && P.z > -0.6 && px !== null && Math.abs(P.x - px) < W * 0.6 && Math.abs(P.y - py) < H * 0.6) ctx.lineTo(P.x, P.y);
      else ctx.moveTo(P.x, P.y);
      if (P.z > -0.6) { px = P.x; py = P.y; } else px = null;
    }
    ctx.stroke(); ctx.setLineDash([]);
  }

  // --- Couleur du ciel selon la hauteur du Soleil ---
  function couleurCiel(alt) {
    const pal = [[-18, [3, 5, 12]], [-12, [7, 12, 30]], [-6, [20, 34, 74]], [0, [62, 98, 160]], [10, [86, 140, 210]]];
    if (!opt.atmosphere) return 'rgb(3,5,12)';
    if (alt <= pal[0][0]) return `rgb(${pal[0][1]})`;
    for (let i = 1; i < pal.length; i++) if (alt <= pal[i][0]) {
      const t = (alt - pal[i - 1][0]) / (pal[i][0] - pal[i - 1][0]);
      return `rgb(${pal[i][1].map((c, k) => Math.round(pal[i - 1][1][k] + (c - pal[i - 1][1][k]) * t))})`;
    }
    return `rgb(${pal[4][1]})`;
  }
  const limiteSoleil = alt => !opt.atmosphere ? 7 : alt < -18 ? 6.5 : alt < -12 ? 4.6 + (alt + 18) * -0.32 + 1.9 : alt < -6 ? 4.6 - (alt + 12) * 0.35 : alt < 0 ? 2.5 - (alt + 6) * 0.55 : -3.5;

  const halo = {};
  const haloDe = c => halo[c] || (halo[c] = creerHalo(c.replace('rgb', 'rgba').replace(')', ',1)'), 64));
  let haloVL;

  // --- Dessin ---
  function dessiner() {
    ({ ctx, w: W, h: H } = ajusterCanvas(canvas));
    camera();
    jdCourant = Astro.jourJulien(temps.date);
    M = Astro.matriceHorizon(jdCourant, Lieu.courant.lat, Lieu.courant.lon);
    mobiles = Astro.astresMobiles(jdCourant);
    const sol = mobiles[0], hSol = versH(sol.eq);
    soleilAlt = Math.asin(hSol[2]) * DEG;
    if (suivi) { const o = objetPosition(suivi); if (o) { vue.az = o.az; vue.alt = o.alt; camera(); } }
    touches = [];

    ctx.fillStyle = couleurCiel(soleilAlt); ctx.fillRect(0, 0, W, H);
    // lueur crépusculaire du côté du Soleil
    if (opt.atmosphere && soleilAlt > -18 && projH(hSol[0], hSol[1], Math.max(hSol[2], -0.05))) {
      const g = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, Math.max(W, H) * 0.8);
      const f = Math.min(1, (soleilAlt + 18) / 18);
      g.addColorStop(0, `rgba(255,170,100,${0.45 * f})`); g.addColorStop(0.4, `rgba(255,120,80,${0.12 * f})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    const limite = Math.min(limiteSoleil(soleilAlt), vue.fov > 140 ? 5.6 : vue.fov > 80 ? 6.1 : 6.6);
    const nuit = Math.max(0, Math.min(1, (limite - 2.5) / 4));

    // Voie lactée
    if (opt.voieLactee && nuit > 0.3) {
      if (!haloVL) { haloVL = document.createElement('canvas'); haloVL.width = haloVL.height = 64; const g = haloVL.getContext('2d'), d = g.createRadialGradient(32, 32, 0, 32, 32, 32); d.addColorStop(0, 'rgba(190,205,255,1)'); d.addColorStop(0.45, 'rgba(190,205,255,.45)'); d.addColorStop(1, 'rgba(190,205,255,0)'); g.fillStyle = d; g.fillRect(0, 0, 64, 64); }
      ctx.globalCompositeOperation = 'lighter';
      const r = Math.max(5, 3.4 * RAD * S);
      for (const p of vl) {
        const h = versH(p.v);
        if (opt.sol && h[2] < -0.02) continue;
        if (!projH(h[0], h[1], h[2])) continue;
        const k = 2 / (1 + P.z);
        ctx.globalAlpha = Math.min(1, 0.022 * p.n * nuit * (h[2] < 0.15 && opt.atmosphere ? Math.max(0.2, h[2] / 0.15) : 1));
        const t = r * k;
        ctx.drawImage(haloVL, P.x - t, P.y - t, t * 2, t * 2);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }

    // Grilles
    if (opt.grille) {
      for (let alt = -60; alt <= 75; alt += 15) { const pts = []; for (let a = 0; a <= 360; a += 3) pts.push([Math.cos(alt * RAD) * Math.cos(a * RAD), Math.cos(alt * RAD) * Math.sin(a * RAD), Math.sin(alt * RAD)]); tracer(pts, 'rgba(120,200,140,.28)'); }
      for (let a = 0; a < 360; a += 30) { const pts = []; for (let alt = -90; alt <= 90; alt += 3) pts.push([Math.cos(alt * RAD) * Math.cos(a * RAD), Math.cos(alt * RAD) * Math.sin(a * RAD), Math.sin(alt * RAD)]); tracer(pts, 'rgba(120,200,140,.28)'); }
    }
    if (opt.grilleEq) {
      for (let d = -75; d <= 75; d += 15) { const pts = []; for (let r = 0; r <= 360; r += 3) pts.push(versH(vec(r, d))); tracer(pts, d === 0 ? 'rgba(120,170,255,.55)' : 'rgba(120,170,255,.22)'); }
      for (let r = 0; r < 360; r += 30) { const pts = []; for (let d = -88; d <= 88; d += 4) pts.push(versH(vec(r, d))); tracer(pts, 'rgba(120,170,255,.22)'); }
    }
    if (opt.ecliptique) {
      const pts = []; for (let l = 0; l <= 360; l += 2) pts.push(versH(Astro.eclVersEq([Math.cos(l * RAD), Math.sin(l * RAD), 0])));
      tracer(pts, 'rgba(255,200,90,.6)', 1.2, [6, 5]);
    }

    // Constellations
    if (opt.constellations) {
      for (const c of lignesConst) for (const poly of c.polys) tracer(poly.map(versH), selection && selection.type === 'constellation' && selection.id === c.id ? 'rgba(255,210,122,.9)' : 'rgba(110,150,255,.42)', selection && selection.id === c.id ? 2 : 1);
    }

    // Étoiles
    const zoom = Math.min(2.2, Math.max(0.8, Math.sqrt(90 / vue.fov)));
    const limNoms = vue.fov > 130 ? 0.6 : vue.fov > 70 ? 1.6 : vue.fov > 35 ? 2.6 : vue.fov > 15 ? 3.6 : 5;
    ctx.font = '12px system-ui, sans-serif'; ctx.textBaseline = 'middle';
    for (let i = nbEtoiles - 1; i >= 0; i--) {
      let m = magE[i];
      if (m > limite + 0.6) continue;
      const v0 = vecE[i * 3], v1 = vecE[i * 3 + 1], v2 = vecE[i * 3 + 2];
      const n = M[0][0] * v0 + M[0][1] * v1 + M[0][2] * v2, e = M[1][0] * v0 + M[1][1] * v1 + M[1][2] * v2, u = M[2][0] * v0 + M[2][1] * v1 + M[2][2] * v2;
      if (opt.sol && u < -0.005) continue;
      if (opt.atmosphere && u > 0) m += 0.2 / Math.max(u, 0.04) - 0.2; // extinction près de l'horizon
      if (m > limite) continue;
      if (!projH(n, e, u)) continue;
      const r = (0.6 + Math.max(0, limite - m) * 0.5) * zoom;
      const a = Math.max(0.18, Math.min(1, (limite - m) / 2.2));
      if (m < 1.6 && nuit > 0.2) {
        const t = r * 5;
        ctx.globalAlpha = 0.5 * a; ctx.drawImage(haloDe(coulE[i]), P.x - t, P.y - t, t * 2, t * 2);
      }
      ctx.globalAlpha = a; ctx.fillStyle = coulE[i];
      ctx.beginPath(); ctx.arc(P.x, P.y, r, 0, 2 * Math.PI); ctx.fill();
      ctx.globalAlpha = 1;
      if (m < 5.2) touches.push({ x: P.x, y: P.y, r: r + 4, type: 'etoile', i, m });
      if (opt.nomsEtoiles && m < limNoms) { const nm = nomAffiche(i); if (nm) { ctx.fillStyle = 'rgba(220,228,255,.82)'; ctx.fillText(nm, P.x + r + 4, P.y); } }
    }

    // Objets de Messier
    if (opt.messier) {
      const limM = vue.fov > 120 ? 5 : vue.fov > 60 ? 7.5 : 11;
      for (const o of messier) {
        if (o.mag > limM || o.mag > limite + 1.5) continue;
        const h = versH(o.v);
        if (opt.sol && h[2] < 0) continue;
        if (!projH(h[0], h[1], h[2])) continue;
        dessinerIconeMessier(o, P.x, P.y);
        touches.push({ x: P.x, y: P.y, r: 10, type: 'messier', o, m: o.mag + 2 });
      }
    }

    // Astres mobiles
    if (opt.planetes) {
      const ordre = mobiles.slice().sort((a, b) => b.distUA - a.distUA);
      for (const a of ordre) {
        const h = versH(a.eq);
        if (a.type === 'lune') { // parallaxe : on observe depuis la surface, pas depuis le centre de la Terre
          const d = a.distKm / 6371; h[0] *= d; h[1] *= d; h[2] = h[2] * d - 1; const n = Math.hypot(...h); h[0] /= n; h[1] /= n; h[2] /= n;
          a.h = h;
        }
        a.alt = Math.asin(Math.max(-1, Math.min(1, h[2]))) * DEG; a.az = Astro.norm360(Math.atan2(h[1], h[0]) * DEG);
        if (opt.sol && h[2] < -0.01) continue;
        if (a.type === 'planete' && a.mag > limite + 1) continue;
        if (!projH(h[0], h[1], h[2])) continue;
        const x = P.x, y = P.y;
        if (a.type === 'soleil') dessinerSoleil(x, y);
        else if (a.type === 'lune') dessinerLune(a, h, hSol, x, y);
        else dessinerPlanete(a, x, y, nuit);
        const r = a.type === 'planete' ? 9 : Math.max(12, 0.27 * RAD * S);
        touches.push({ x, y, r, type: a.type, a, m: -30 });
        ctx.fillStyle = a.type === 'planete' ? '#ffd27a' : '#fff1c4'; ctx.font = '600 13px system-ui, sans-serif';
        ctx.fillText(a.nom, x + r * (a.type === 'planete' ? 0.8 : 1) + 5, y);
      }
    }

    // Sol et horizon
    dessinerSol(hSol);

    // Noms des constellations
    if (opt.nomsConstel && opt.constellations) {
      ctx.font = '600 12px system-ui, sans-serif'; ctx.textAlign = 'center';
      for (const c of constels) {
        if (vue.fov > 150 && c.rang > 1) continue;
        if (vue.fov > 100 && c.rang > 2) continue;
        const h = versH(c.v);
        if (opt.sol && h[2] < 0.02) continue;
        if (!projH(h[0], h[1], h[2])) continue;
        ctx.fillStyle = selection && selection.id === c.id ? '#ffd27a' : 'rgba(150,180,255,.78)';
        ctx.fillText(c.fr.toUpperCase(), P.x, P.y);
        touches.push({ x: P.x, y: P.y, r: 26, type: 'constellation', c, m: 50 });
      }
      ctx.textAlign = 'left';
    }

    // Repère de sélection (visible même sous l'horizon)
    if (selection) {
      const pos = objetPosition(selection);
      if (pos && projH(pos.h[0], pos.h[1], pos.h[2])) {
        const t = performance.now() / 600, r = 16 + Math.sin(t) * 2;
        ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 1.6;
        for (let k = 0; k < 4; k++) { const a0 = k * Math.PI / 2 + Math.PI / 4; ctx.beginPath(); ctx.arc(P.x, P.y, r, a0 - 0.45, a0 + 0.45); ctx.stroke(); }
        sale = true;
      }
    }
    majInfos();
  }

  function dessinerIconeMessier(o, x, y) {
    ctx.strokeStyle = 'rgba(255,150,210,.75)'; ctx.lineWidth = 1;
    const t = o.type;
    ctx.beginPath();
    if ('seis'.includes(t) && t.length === 1) ctx.ellipse(x, y, 7, 3.5, -0.5, 0, 2 * Math.PI);
    else if (t === 'gc') { ctx.arc(x, y, 5, 0, 2 * Math.PI); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); }
    else if (t === 'oc' || t === 'pos') { ctx.setLineDash([2, 2]); ctx.arc(x, y, 6, 0, 2 * Math.PI); }
    else if (t === 'pn') { ctx.arc(x, y, 4, 0, 2 * Math.PI); ctx.moveTo(x - 7, y); ctx.lineTo(x - 4, y); ctx.moveTo(x + 4, y); ctx.lineTo(x + 7, y); }
    else ctx.rect(x - 5, y - 5, 10, 10);
    ctx.stroke(); ctx.setLineDash([]);
    if (vue.fov < 120 || o.mag < 4.5) { ctx.fillStyle = 'rgba(255,170,220,.85)'; ctx.font = '11px system-ui, sans-serif'; ctx.fillText(o.id, x + 8, y + 6); }
  }

  function dessinerSoleil(x, y) {
    const r = Math.max(9, 0.267 * RAD * S);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
    g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(0.18, 'rgba(255,230,150,.9)'); g.addColorStop(0.4, 'rgba(255,200,100,.25)'); g.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 6, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
  }

  function dessinerLune(a, h, hSol, x, y) {
    const r = Math.max(10, 0.26 * RAD * S);
    // direction du Soleil sur l'écran : petit pas depuis la Lune vers le Soleil
    const d = h[0] * hSol[0] + h[1] * hSol[1] + h[2] * hSol[2];
    const p = [h[0] + 0.02 * (hSol[0] - d * h[0]), h[1] + 0.02 * (hSol[1] - d * h[1]), h[2] + 0.02 * (hSol[2] - d * h[2])];
    projH(p[0], p[1], p[2]);
    const ang = Math.atan2(P.y - y, P.x - x);
    const i = (180 - a.elongation) * RAD; // angle de phase
    const g = ctx.createRadialGradient(x, y, r, x, y, r * 3.5);
    g.addColorStop(0, `rgba(230,235,255,${0.25 * a.eclairement})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3.5, 0, 2 * Math.PI); ctx.fill();
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = 'rgba(40,44,60,.92)'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#f2efe4'; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
    for (let k = 20; k >= -20; k--) { const yy = r * k / 20; ctx.lineTo(-Math.cos(i) * Math.sqrt(Math.max(0, r * r - yy * yy)), yy); }
    ctx.closePath(); ctx.fill();
    // quelques mers lunaires pour le réalisme
    ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(120,120,130,.28)';
    for (const [mx, my, mr] of [[-.25, -.3, .28], [.2, -.15, .22], [.05, .25, .2], [-.35, .2, .15]]) { ctx.beginPath(); ctx.arc(mx * r, my * r, mr * r, 0, 2 * Math.PI); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  function dessinerPlanete(a, x, y, nuit) {
    const tailleReelle = 2 * a.rayon / (a.distUA * 1.496e8) * S; // diamètre apparent en pixels
    const r = Math.max(2.4 + Math.max(0, 2 - a.mag) * 0.9, tailleReelle / 2);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    g.addColorStop(0, a.couleur); g.addColorStop(0.3, a.couleur + '55'); g.addColorStop(1, a.couleur + '00');
    ctx.globalAlpha = 0.5 + nuit * 0.5; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, 2 * Math.PI); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = a.couleur; ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
    if (a.id === 'saturne' && r > 3) { ctx.strokeStyle = '#e8d7a0'; ctx.lineWidth = Math.max(1, r * 0.25); ctx.beginPath(); ctx.ellipse(x, y, r * 2.2, r * 0.7, -0.4, 0, 2 * Math.PI); ctx.stroke(); }
  }

  function dessinerSol(hSol) {
    const pts = [];
    for (let a = 0; a <= 360; a += 2) { const ar = a * RAD; projH(Math.cos(ar), Math.sin(ar), 0); pts.push([Math.max(-1e5, Math.min(1e5, P.x)), Math.max(-1e5, Math.min(1e5, P.y)), P.z]); }
    ctx.beginPath(); pts.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    if (opt.sol) {
      const jour = Math.max(0, Math.min(1, (soleilAlt + 8) / 14));
      ctx.fillStyle = `rgba(${Math.round(8 + 40 * jour)},${Math.round(14 + 50 * jour)},${Math.round(12 + 26 * jour)},.97)`;
      const centreSol = vue.alt < 0, dedans = ctx.isPointInPath(cx, cy);
      if (centreSol === dedans) ctx.fill();
      else { ctx.save(); ctx.beginPath(); ctx.rect(-10, -10, W + 20, H + 20); pts.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill('evenodd'); ctx.restore(); }
    }
    ctx.strokeStyle = opt.sol ? 'rgba(140,190,150,.7)' : 'rgba(140,190,150,.5)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); let prec = null;
    for (const [x, y, z] of pts) { if (z > -0.7 && prec && Math.abs(x - prec[0]) < W) ctx.lineTo(x, y); else ctx.moveTo(x, y); prec = z > -0.7 ? [x, y] : null; }
    ctx.stroke();
    ctx.font = '700 15px system-ui, sans-serif'; ctx.textAlign = 'center';
    for (const [nom, az] of [['N', 0], ['NE', 45], ['E', 90], ['SE', 135], ['S', 180], ['SO', 225], ['O', 270], ['NO', 315]]) {
      if (projH(Math.cos(az * RAD), Math.sin(az * RAD), 0) && P.z > -0.5) { ctx.fillStyle = nom.length === 1 ? '#ffb27a' : 'rgba(255,178,122,.6)'; ctx.fillText(nom, P.x, P.y + 16); }
    }
    ctx.textAlign = 'left';
  }

  // --- Positions et objets ---
  function objetPosition(o) {
    let h;
    if (o.type === 'etoile') h = versH([vecE[o.i * 3], vecE[o.i * 3 + 1], vecE[o.i * 3 + 2]]);
    else if (o.type === 'messier') h = versH(o.o.v);
    else if (o.type === 'constellation') h = versH(o.c.v);
    else { const a = mobiles.find(m => m.id === o.id); if (!a) return null; h = a.h || versH(a.eq); }
    if (!h) return null;
    return { h, alt: Math.asin(Math.max(-1, Math.min(1, h[2]))) * DEG, az: Astro.norm360(Math.atan2(h[1], h[0]) * DEG) };
  }
  const vecteurObjet = o => o.type === 'etoile' ? [vecE[o.i * 3], vecE[o.i * 3 + 1], vecE[o.i * 3 + 2]] : o.type === 'messier' ? o.o.v : o.type === 'constellation' ? o.c.v : null;

  // Catalogue de recherche
  let catalogue = null;
  function construireCatalogue() {
    catalogue = [
      { cle: 'soleil', nom: 'Soleil', detail: 'notre étoile', type: 'soleil', id: 'soleil' },
      { cle: 'lune', nom: 'Lune', detail: 'notre satellite', type: 'lune', id: 'lune' },
      ...Astro.PLANETES.map(p => ({ cle: sansAccents(p.nom), nom: p.nom, detail: 'planète', type: 'planete', id: p.id })),
      ...messier.map(o => ({ cle: sansAccents(`${o.id} ${o.nom} ${o.ngc} ${o.alt}`), nom: `${o.id} – ${o.nom}`, detail: TYPES[o.type] || '', type: 'messier', id: o.id, o })),
      ...constels.map(c => ({ cle: sansAccents(`${c.fr} ${c.la} ${c.id}`), nom: c.fr, detail: `constellation (${c.la})`, type: 'constellation', id: c.id, c })),
      ...D.nomsEtoiles.filter(n => n[1]).map(([i, nom, , c]) => ({ cle: sansAccents(`${nom} ${NOMS_FR[nom] || ''}`), nom: NOMS_FR[nom] || nom, detail: `étoile, ${constelParId[c] ? constelParId[c].fr : c}`, type: 'etoile', id: 'e' + i, i }))
    ];
  }
  function chercher(texte, max = 12) {
    if (!catalogue) construireCatalogue();
    const t = sansAccents(texte.trim());
    if (!t) return [];
    const res = [];
    for (const c of catalogue) {
      const p = c.cle.indexOf(t);
      if (p === -1) continue;
      res.push([p === 0 ? 0 : c.cle.includes(' ' + t) ? 1 : 2, c]);
    }
    return res.sort((a, b) => a[0] - b[0]).slice(0, max).map(r => r[1]);
  }
  const objetDepuisCatalogue = c => c.type === 'etoile' ? { type: 'etoile', i: c.i, id: c.id } : c.type === 'messier' ? { type: 'messier', o: c.o, id: c.id } : c.type === 'constellation' ? { type: 'constellation', c: c.c, id: c.id } : { type: c.type, id: c.id };

  // --- Fiche d'information ---
  function leverCoucherTexte(fnVec, seuil) {
    const jd0 = jdCourant - 1 / 12;
    const r = Astro.leverCoucher(fnVec, jd0, Lieu.courant.lat, Lieu.courant.lon, seuil);
    if (r.lever === null && r.coucher === null) return r.max > seuil ? 'toujours au-dessus de l’horizon ici (circumpolaire)' : 'ne se lève pas ici aujourd’hui';
    const f = jd => jd === null ? '—' : heure(Astro.jdVersDate(jd));
    return `lever ${f(r.lever)} · coucher ${f(r.coucher)} · plus haut ${Math.round(r.max)}° à ${f(r.jdMax)}`;
  }

  function afficherFiche(o) {
    const fiche = $('#fiche-astre');
    const pos = objetPosition(o);
    let titre = '', lignes = [], texte = '', requeteNasa = null, cleSavoir = null;
    const visible = pos && pos.alt > 0;
    const posTexte = pos ? `${Math.round(pos.alt)}° de hauteur, vers ${cardinal(pos.az)} (${Math.round(pos.az)}°)` : '—';
    if (o.type === 'etoile') {
      const n = nomEtoile.get(o.i) || {}, mag = magE[o.i], ra = D.etoiles[o.i * 4] / 100, dec = D.etoiles[o.i * 4 + 1] / 100;
      titre = nomAffiche(o.i) || `Étoile de magnitude ${nombre(mag, 1)}`;
      const c = constelParId[n.c];
      lignes = [['Constellation', c ? c.fr : '—'], ['Éclat (magnitude)', nombre(mag, 2)], ['Couleur, température', `${descriptionCouleur(tempE[o.i])}, environ ${nombre(Math.round(tempE[o.i] / 100) * 100)} °C`],
        ['Distance', DIST_AL[n.nom] ? `${nombre(DIST_AL[n.nom], DIST_AL[n.nom] < 10 ? 1 : 0)} années-lumière` : 'non renseignée ici'],
        ['Lumière partie en', DIST_AL[n.nom] ? anneeDepart(DIST_AL[n.nom]) : '—'], ['Position', posTexte], ['Coordonnées', `AD ${raHeures(ra)}, Déc ${decDegres(dec)}`],
        ['Aujourd’hui', leverCoucherTexte(() => vecteurObjet(o), -0.5)]];
      requeteNasa = n.nom ? `${n.nom} star` : null; cleSavoir = n.nom;
    } else if (o.type === 'messier') {
      const m = o.o;
      titre = `${m.id} – ${m.nom}`;
      lignes = [['Type', TYPES[m.type] || m.type], ['Catalogue', m.ngc], ['Éclat (magnitude)', nombre(m.mag, 1)], ['Taille apparente', `${m.dim.replace('x', ' × ')} minutes d’arc`],
        ['Distance', MESSIER_DIST[m.id] ? formatAL(MESSIER_DIST[m.id]) : 'non renseignée ici'], ['Pour le voir', m.mag < 4.5 ? 'à l’œil nu sous un ciel noir' : m.mag < 7 ? 'aux jumelles' : 'avec un petit télescope'],
        ['Position', posTexte], ['Aujourd’hui', leverCoucherTexte(() => m.v, 0)]];
      requeteNasa = `${m.id} ${m.alt || ''}`.trim(); cleSavoir = m.id;
    } else if (o.type === 'constellation') {
      const c = o.c;
      titre = c.fr; lignes = [['Nom latin', c.la], ['Abréviation', c.id], ['Position du centre', posTexte], ['Aujourd’hui', leverCoucherTexte(() => c.v, 0)]];
      requeteNasa = `${c.la} constellation`; cleSavoir = c.fr;
    } else {
      const a = mobiles.find(m => m.id === o.id);
      titre = a.nom;
      const fnVec = jd => Astro.astresMobiles(jd).find(m => m.id === a.id).eq;
      if (a.type === 'soleil') {
        lignes = [['Hauteur', posTexte], ['Distance', `${nombre(a.distUA * 149.6, 1)} millions de km (${nombre(a.distUA * 8.317, 1)} minutes-lumière)`], ['Aujourd’hui', leverCoucherTexte(fnVec, -0.833)]];
        texte = '<p><b>⚠️ Ne regarde jamais le Soleil directement, ni aux jumelles ni au télescope, sans filtre solaire certifié : c’est la cécité assurée.</b></p>';
        requeteNasa = 'solar dynamics observatory sun'; cleSavoir = 'Soleil';
      } else if (a.type === 'lune') {
        const L = Astro.infosLune(jdCourant);
        lignes = [['Phase', `${L.nom}, éclairée à ${Math.round(L.eclairement * 100)} %`], ['Âge', `${nombre(L.age, 1)} jours depuis la nouvelle Lune`], ['Distance', `${nombre(L.distKm)} km (${nombre(L.distKm / 299792, 2)} s-lumière)`], ['Position', posTexte], ['Aujourd’hui', leverCoucherTexte(fnVec, 0.125)]];
        requeteNasa = 'moon lunar reconnaissance orbiter'; cleSavoir = 'Lune';
      } else {
        lignes = [['Éclat (magnitude)', nombre(a.mag, 1)], ['Distance à la Terre', `${nombre(a.distUA, 2)} UA = ${nombre(a.distUA * 149.6)} millions de km`], ['La lumière met', dureeLumiere(a.distUA * 499.005)],
          ['Diamètre apparent', `${nombre(2 * a.rayon / (a.distUA * 1.496e8) * DEG * 3600, 1)} secondes d’arc`], ['Position', posTexte], ['Aujourd’hui', leverCoucherTexte(fnVec, 0)]];
        requeteNasa = { mercure: 'Mercury MESSENGER', venus: 'Venus', mars: 'Mars Perseverance', jupiter: 'Jupiter Juno', saturne: 'Saturn Cassini', uranus: 'Uranus', neptune: 'Neptune Voyager' }[a.id];
        cleSavoir = a.nom;
      }
    }
    fiche.innerHTML = `<button class="fermer" aria-label="Fermer">×</button><h3>${echap(titre)}</h3>
      <div class="pastille">${visible ? '✅ au-dessus de l’horizon' : '🌍 sous l’horizon en ce moment'}</div>
      <table>${lignes.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</table>${texte}
      <div class="ligne">
        <button class="btn petit" data-act="centrer">🎯 Centrer</button>
        <button class="btn petit" data-act="suivre" aria-pressed="${suivi && suivi.id === o.id}">📌 Suivre</button>
        ${requeteNasa ? '<button class="btn petit" data-act="nasa">📷 Photos NASA</button>' : ''}
        ${cleSavoir && Savoir.trouverFiche(cleSavoir) ? '<button class="btn petit" data-act="fiche">📚 Fiche</button>' : ''}
      </div>`;
    fiche.hidden = false;
    fiche.querySelector('.fermer').onclick = () => { fiche.hidden = true; selection = null; suivi = null; sale = true; };
    fiche.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
      const act = b.dataset.act;
      if (act === 'centrer') centrer(o);
      if (act === 'suivre') { suivi = suivi && suivi.id === o.id ? null : o; b.setAttribute('aria-pressed', !!suivi); sale = true; }
      if (act === 'nasa') Appli.ouvrirMedias(requeteNasa);
      if (act === 'fiche') Appli.ouvrirFiche(Savoir.trouverFiche(cleSavoir).id);
    });
    Bus.emettre('selection', { titre, type: o.type });
  }
  const descriptionCouleur = T => T > 20000 ? 'bleue' : T > 9000 ? 'blanc-bleu' : T > 7000 ? 'blanche' : T > 5800 ? 'blanc-jaune' : T > 4800 ? 'jaune-orangé' : T > 3600 ? 'orangée' : 'rouge-orangé';
  const formatAL = d => d >= 1e6 ? `${nombre(d / 1e6, d < 1e7 ? 2 : 1)} millions d’années-lumière` : `${nombre(d)} années-lumière`;
  function anneeDepart(al) {
    const an = new Date().getFullYear() - Math.round(al);
    return an > 0 ? `${an} (la lumière que tu vois est partie cette année-là)` : `${nombre(-an + 1)} av. J.-C.`;
  }
  const dureeLumiere = s => s < 60 ? `${nombre(s, 1)} secondes` : s < 3600 ? `${nombre(s / 60, 1)} minutes` : `${nombre(s / 3600, 1)} heures`;

  function selectionner(o, centrerAussi = false) {
    selection = o; afficherFiche(o); sale = true;
    if (centrerAussi) centrer(o);
  }
  function centrer(o) {
    const p = objetPosition(o); if (!p) return;
    const a0 = vue.az, h0 = vue.alt, f0 = vue.fov;
    let da = p.az - a0; if (da > 180) da -= 360; if (da < -180) da += 360;
    const f1 = o.type === 'constellation' ? 60 : o.type === 'messier' ? 30 : o.type === 'planete' ? 40 : Math.min(f0, 70);
    const t0 = performance.now();
    animation = () => {
      const t = Math.min(1, (performance.now() - t0) / 900), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      vue.az = Astro.norm360(a0 + da * e); vue.alt = h0 + (Math.max(-80, Math.min(89, p.alt)) - h0) * e; vue.fov = f0 + (f1 - f0) * e;
      if (t >= 1) animation = null;
    };
  }

  // --- Interface ---
  function majInfos() {
    const L = Astro.infosLune(jdCourant);
    const etat = soleilAlt > 0 ? '☀️ jour' : soleilAlt > -6 ? '🌇 crépuscule civil' : soleilAlt > -12 ? '🌆 crépuscule nautique' : soleilAlt > -18 ? '🌌 crépuscule astronomique' : '🌑 nuit noire';
    $('#ciel-infos').innerHTML = `<b>${echap(Lieu.courant.nom)}</b> · ${dateCourte(temps.date)} <b>${heure(temps.date)}</b> · ${etat} · Lune : ${L.nom.toLowerCase()} (${Math.round(L.eclairement * 100)} %)`;
    const champ = $('#t-date');
    if (document.activeElement !== champ) {
      const d = new Date(temps.date.getTime() - temps.date.getTimezoneOffset() * 60000);
      champ.value = d.toISOString().slice(0, 16);
    }
  }

  function construireOptions() {
    const p = $('#ciel-options');
    const cases = [['constellations', 'Lignes des constellations'], ['nomsConstel', 'Noms des constellations'], ['nomsEtoiles', 'Noms des étoiles'], ['planetes', 'Soleil, Lune et planètes'],
      ['messier', 'Nébuleuses, amas et galaxies (Messier)'], ['voieLactee', 'Voie lactée'], ['atmosphere', 'Atmosphère (jour, crépuscule)'], ['sol', 'Sol (décocher pour voir à travers la Terre)'],
      ['grille', 'Grille hauteur/azimut'], ['grilleEq', 'Grille équatoriale'], ['ecliptique', 'Écliptique (chemin des planètes)']];
    p.innerHTML = `<button class="fermer" aria-label="Fermer">×</button><h4>Afficher</h4>
      ${cases.map(([k, l]) => `<label><input type="checkbox" data-opt="${k}" ${opt[k] ? 'checked' : ''}> ${l}</label>`).join('')}
      <h4>Lieu d'observation</h4>
      <select id="ciel-lieu" style="width:100%">${LIEUX.map(([n]) => `<option ${n === Lieu.courant.nom ? 'selected' : ''}>${echap(n)}</option>`).join('')}<option value="__perso" ${LIEUX.some(l => l[0] === Lieu.courant.nom) ? '' : 'selected'}>Autre (coordonnées ci-dessous)</option></select>
      <div class="ligne" style="margin-top:8px">
        <input type="number" id="ciel-lat" step="0.01" min="-90" max="90" value="${Lieu.courant.lat}" style="width:46%" aria-label="Latitude">
        <input type="number" id="ciel-lon" step="0.01" min="-180" max="180" value="${Lieu.courant.lon}" style="width:46%" aria-label="Longitude (est positive)">
      </div>
      <div class="ligne" style="margin-top:8px"><button class="btn petit" id="ciel-appliquer">Valider</button><button class="btn petit" id="ciel-geo">📍 Ma position</button></div>
      <p class="petit texte-2" style="margin-top:8px">Glisse pour tourner, molette ou pincement pour zoomer, clique un astre pour sa fiche. Clavier : flèches, + et −, espace (pause).</p>`;
    p.querySelector('.fermer').onclick = () => { p.hidden = true; };
    p.querySelectorAll('[data-opt]').forEach(c => c.onchange = () => { opt[c.dataset.opt] = c.checked; Memoire.ecrire('options-ciel', opt); sale = true; });
    $('#ciel-lieu').onchange = e => { const l = LIEUX.find(x => x[0] === e.target.value); if (l) Lieu.definir({ nom: l[0], lat: l[1], lon: l[2] }); };
    $('#ciel-appliquer').onclick = () => { const lat = +$('#ciel-lat').value, lon = +$('#ciel-lon').value; if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) Lieu.definir({ nom: `${nombre(lat, 2)}°, ${nombre(lon, 2)}°`, lat, lon }); };
    $('#ciel-geo').onclick = () => {
      if (!navigator.geolocation) return alert('La géolocalisation n’est pas disponible dans ce navigateur.');
      navigator.geolocation.getCurrentPosition(pos => Lieu.definir({ nom: 'Ma position', lat: +pos.coords.latitude.toFixed(3), lon: +pos.coords.longitude.toFixed(3) }),
        () => alert('Position refusée ou indisponible. Choisis une ville dans la liste ou saisis tes coordonnées.'));
    };
  }

  function majVitesse() {
    const [v, l] = VITESSES[temps.iv];
    $('#t-vitesse').textContent = temps.pause ? 'en pause' : l;
    $('#t-pause').textContent = temps.pause ? '▶️' : '⏸';
  }

  function boucle(t) {
    const dt = t - temps.dernier; temps.dernier = t;
    if (!temps.pause) { temps.date = new Date(temps.date.getTime() + dt * VITESSES[temps.iv][0]); sale = sale || VITESSES[temps.iv][0] !== 1 || Math.random() < dt / 1000; }
    if (animation) { animation(); sale = true; }
    if (sale && $('#vue-ciel').classList.contains('active')) { sale = false; dessiner(); Memoire.ecrire('vue-ciel', vue); }
    requestAnimationFrame(boucle);
  }

  function init() {
    canvas = $('#ciel-canvas');
    const zone = $('#ciel-zone');
    gestesScene(zone, {
      glisser: (dx, dy) => { suivi = null; const k = 1 / S * DEG * 1.0; vue.az = Astro.norm360(vue.az - dx * k); vue.alt = Math.max(-89, Math.min(89.9, vue.alt + dy * k)); sale = true; },
      zoomer: f => { vue.fov = Math.max(2, Math.min(200, vue.fov * f)); sale = true; },
      cliquer: (x, y) => {
        let best = null, bd = 1e9;
        for (const t of touches) { const d = Math.hypot(t.x - x, t.y - y); if (d < Math.max(t.r, 10) && d + t.m * 0.5 < bd) { bd = d + t.m * 0.5; best = t; } }
        if (!best) { $('#fiche-astre').hidden = true; selection = null; sale = true; return; }
        const o = best.type === 'etoile' ? { type: 'etoile', i: best.i, id: 'e' + best.i } : best.type === 'messier' ? { type: 'messier', o: best.o, id: best.o.id }
          : best.type === 'constellation' ? { type: 'constellation', c: best.c, id: best.c.id } : { type: best.a.type, id: best.a.id };
        selectionner(o);
      }
    });
    zone.addEventListener('dblclick', e => { const r = zone.getBoundingClientRect(), h = ecranVersH(e.clientX - r.left, e.clientY - r.top); vue.az = Astro.norm360(Math.atan2(h[1], h[0]) * DEG); vue.alt = Math.asin(h[2]) * DEG; vue.fov = Math.max(2, vue.fov / 1.8); sale = true; });
    window.addEventListener('keydown', e => {
      if (!$('#vue-ciel').classList.contains('active') || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      const pas = vue.fov / 20;
      if (e.key === 'ArrowLeft') vue.az = Astro.norm360(vue.az - pas); else if (e.key === 'ArrowRight') vue.az = Astro.norm360(vue.az + pas);
      else if (e.key === 'ArrowUp') vue.alt = Math.min(89.9, vue.alt + pas); else if (e.key === 'ArrowDown') vue.alt = Math.max(-89, vue.alt - pas);
      else if (e.key === '+' || e.key === '=') vue.fov = Math.max(2, vue.fov / 1.2); else if (e.key === '-') vue.fov = Math.min(200, vue.fov * 1.2);
      else if (e.key === ' ') { temps.pause = !temps.pause; majVitesse(); } else return;
      e.preventDefault(); sale = true;
    });
    $('#t-pause').onclick = () => { temps.pause = !temps.pause; majVitesse(); };
    $('#t-avant').onclick = () => { temps.iv = Math.min(VITESSES.length - 1, temps.iv + 1); temps.pause = false; majVitesse(); };
    $('#t-arriere').onclick = () => { temps.iv = Math.max(0, temps.iv - 1); temps.pause = false; majVitesse(); };
    $('#t-maintenant').onclick = () => { temps.date = new Date(); temps.iv = 4; temps.pause = false; majVitesse(); sale = true; };
    $('#t-date').onchange = e => { const d = new Date(e.target.value); if (!isNaN(d)) { temps.date = d; sale = true; } };
    $('#ciel-zoom-plus').onclick = () => { vue.fov = Math.max(2, vue.fov / 1.4); sale = true; };
    $('#ciel-zoom-moins').onclick = () => { vue.fov = Math.min(200, vue.fov * 1.4); sale = true; };
    $('#ciel-direction').onchange = e => { const v = e.target.value; if (v === 'zenith') { vue.alt = 89.9; vue.fov = 180; } else if (v !== '') { vue.az = +v; vue.alt = 25; } e.target.value = ''; suivi = null; sale = true; };
    $('#ciel-btn-options').onclick = () => { const p = $('#ciel-options'); if (p.hidden) construireOptions(); p.hidden = !p.hidden; };
    // recherche
    const champ = $('#ciel-recherche'), sug = $('#ciel-suggestions');
    let liste = [], idx = 0;
    const montrer = () => {
      liste = chercher(champ.value); idx = 0;
      sug.hidden = !liste.length;
      sug.innerHTML = liste.map((c, k) => `<button data-k="${k}" class="${k === 0 ? 'sel' : ''}"><b>${echap(c.nom)}</b> <span class="texte-2 petit">${echap(c.detail)}</span></button>`).join('');
      sug.querySelectorAll('button').forEach(b => b.onclick = () => choisir(liste[+b.dataset.k]));
    };
    const choisir = c => { sug.hidden = true; champ.value = c.nom; selectionner(objetDepuisCatalogue(c), true); champ.blur(); };
    champ.addEventListener('input', montrer);
    champ.addEventListener('keydown', e => {
      if (e.key === 'Enter' && liste[idx]) { e.preventDefault(); choisir(liste[idx]); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); idx = (idx + (e.key === 'ArrowDown' ? 1 : liste.length - 1)) % Math.max(1, liste.length); sug.querySelectorAll('button').forEach((b, k) => b.classList.toggle('sel', k === idx)); }
      if (e.key === 'Escape') sug.hidden = true;
    });
    champ.addEventListener('blur', () => setTimeout(() => { sug.hidden = true; }, 200));
    Lieu.surChangement(() => { sale = true; });
    window.addEventListener('resize', () => { sale = true; });
    majVitesse();
    requestAnimationFrame(boucle);
  }

  // Pour les autres modules (la fée, « Ce soir », l'encyclopédie)
  function montrer(texte) {
    const c = chercher(texte, 1)[0];
    if (!c) return false;
    Appli.afficherVue('ciel');
    dessiner(); // positions à jour avant de centrer
    selectionner(objetDepuisCatalogue(c), true);
    return c;
  }
  const etat = () => ({ date: temps.date, soleilAlt, lieu: Lieu.courant, mobiles, jd: jdCourant });
  const reglerDate = d => { temps.date = d; sale = true; };
  const reglerVitesse = iv => { temps.iv = iv; temps.pause = false; majVitesse(); };
  const redessiner = () => { sale = true; };
  return { init, montrer, chercher, etat, reglerDate, reglerVitesse, redessiner, MESSIER_FR, MESSIER_DIST, DIST_AL, NOMS_FR, TYPES, messier, constels, lignesConst };
})();
