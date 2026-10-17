// L'univers en 3D : étoiles voisines (données réelles), Voie lactée, Groupe local (données réelles), toile cosmique et échelle de l'univers.
const Cosmos = (() => {
  const { RAD } = Astro;
  let canvas, ctx, W, H, actif = false, sceneId = 'voisinage', touches = [], selection = null, tourne = false, angle = 0, dernier = 0;
  const cam = new Camera3D({ yaw: 0.6, pitch: 0.5, dist: 34, min: 0.05, max: 3000 });
  let graine = 3; const alea = () => { graine = (graine * 16807) % 2147483647; return (graine - 1) / 2147483646; };
  const gauss = () => { let u = 0, v = 0; while (!u) u = alea(); while (!v) v = alea(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const pos = (raH, dec, d) => { const v = Astro.versVecteur(raH * 15, dec); return v.map(x => x * d); };

  // Étoiles les plus proches : AD (heures), Déc (degrés), distance (années-lumière), couleur, remarque
  const VOISINES = [
    ['Soleil', 0, 0, 0, '#fff2c4', 'Notre étoile, une naine jaune ordinaire.'],
    ['Proxima du Centaure', 14.495, -62.68, 4.24, '#ff8a5c', 'L’étoile la plus proche. Une naine rouge avec au moins une planète dans sa zone habitable (Proxima b).'],
    ['Alpha du Centaure A et B', 14.66, -60.83, 4.37, '#ffe9a8', 'Un couple d’étoiles semblables au Soleil, visible à l’œil nu depuis l’hémisphère sud.'],
    ['Étoile de Barnard', 17.963, 4.69, 5.96, '#ff8a5c', 'L’étoile qui se déplace le plus vite dans notre ciel.'],
    ['Luhman 16', 10.82, -53.32, 6.5, '#b0583a', 'Deux naines brunes, des « étoiles ratées », découvertes seulement en 2013.'],
    ['WISE 0855−0714', 8.92, -7.24, 7.4, '#7a3a2a', 'La naine brune la plus froide connue, plus froide que le pôle Nord.'],
    ['Wolf 359', 10.94, 7.01, 7.86, '#ff7a50', 'Une petite naine rouge sujette à de violentes éruptions.'],
    ['Lalande 21185', 11.06, 35.97, 8.31, '#ff8a5c', 'Naine rouge entourée d’au moins deux planètes.'],
    ['Sirius A et B', 6.752, -16.72, 8.6, '#cfe0ff', 'L’étoile la plus brillante du ciel nocturne, accompagnée d’une naine blanche.'],
    ['Luyten 726-8', 1.65, -17.95, 8.73, '#ff7a50', 'Couple de naines rouges ; l’une d’elles, UV Ceti, a donné son nom aux étoiles à éruptions.'],
    ['Ross 154', 18.83, -23.84, 9.7, '#ff8a5c', 'Naine rouge du Sagittaire.'],
    ['Ross 248', 23.70, 44.17, 10.3, '#ff8a5c', 'Dans environ 36 000 ans, elle deviendra pour un temps l’étoile la plus proche du Soleil.'],
    ['Epsilon Eridani', 3.549, -9.46, 10.5, '#ffd08a', 'Une jeune étoile orangée entourée d’un disque de poussières et d’une planète géante.'],
    ['Lacaille 9352', 23.098, -35.85, 10.7, '#ff8a5c', 'Naine rouge brillante de l’hémisphère sud.'],
    ['Ross 128', 11.79, 0.80, 11.0, '#ff8a5c', 'Naine rouge très calme, avec une planète tempérée.'],
    ['61 du Cygne', 21.115, 38.75, 11.4, '#ffb070', 'La première étoile dont on a mesuré la distance (Bessel, 1838).'],
    ['Procyon A et B', 7.655, 5.22, 11.46, '#fff4dc', 'Brillante étoile du Petit Chien, avec une naine blanche.'],
    ['Epsilon Indi', 22.056, -56.79, 11.9, '#ffc070', 'Étoile orangée accompagnée de deux naines brunes et d’une planète géante photographiée par le télescope James Webb.'],
    ['Tau Ceti', 1.734, -15.94, 11.9, '#fff0c8', 'Une étoile proche, un peu plus petite que le Soleil, très étudiée dans la recherche de vie.'],
    ['Étoile de Teegarden', 2.89, 16.88, 12.5, '#ff7a50', 'Naine rouge avec deux planètes de la taille de la Terre.'],
    ['Altaïr', 19.846, 8.87, 16.7, '#e8f0ff', 'Elle tourne si vite sur elle-même qu’elle est aplatie.'],
    ['Véga', 18.616, 38.78, 25, '#d8e6ff', 'Étoile de référence pour la luminosité, entourée d’un disque de poussières.'],
    ['Fomalhaut', 22.961, -29.62, 25, '#e8f0ff', 'Entourée d’un grand anneau de débris photographié par Hubble et Webb.'],
    ['Pollux', 7.755, 28.03, 34, '#ffcf8a', 'Géante orangée des Gémeaux, avec une planète.'],
    ['Arcturus', 14.261, 19.18, 36.7, '#ffb070', 'Géante orange, l’étoile la plus brillante de l’hémisphère nord céleste.'],
    ['Capella', 5.278, 46.0, 42.9, '#fff0c0', 'En réalité deux géantes jaunes en couple.'],
    ['Aldébaran', 4.599, 16.51, 65, '#ff9a5c', 'L’œil rouge du Taureau, une géante orangée.']
  ];
  // Groupe local : AD (h), Déc (°), distance (millions d'années-lumière), diamètre (milliers d'al)
  const GALAXIES = [
    ['Voie lactée (nous)', 0, 0, 0, 100, 'Notre galaxie : 100 à 400 milliards d’étoiles.'],
    ['Grand Nuage de Magellan', 5.39, -69.75, 0.163, 14, 'Galaxie satellite visible à l’œil nu depuis l’hémisphère sud.'],
    ['Petit Nuage de Magellan', 0.877, -72.83, 0.2, 7, 'L’autre satellite visible à l’œil nu depuis le sud.'],
    ['Naine du Sagittaire', 18.92, -30.48, 0.07, 10, 'Une petite galaxie en train d’être avalée par la Voie lactée.'],
    ['Galaxie d’Andromède (M31)', 0.712, 41.27, 2.5, 152, 'La grande voisine, plus grande que nous. Elle se rapproche à 110 km/s.'],
    ['Galaxie du Triangle (M33)', 1.564, 30.66, 2.73, 60, 'Troisième grande galaxie du Groupe local.'],
    ['M32', 0.712, 40.87, 2.49, 6.5, 'Petite elliptique collée à Andromède.'],
    ['M110', 0.673, 41.69, 2.69, 17, 'Satellite elliptique d’Andromède.'],
    ['NGC 6822', 19.749, -14.8, 1.6, 7, 'Galaxie irrégulière « de Barnard ».'],
    ['IC 1613', 1.08, 2.12, 2.4, 10, 'Petite irrégulière très pauvre en métaux.'],
    ['Leo I', 10.141, 12.31, 0.82, 2, 'Naine sphéroïdale lointaine.'],
    ['Naine du Fourneau', 2.666, -34.45, 0.46, 3, 'Possède ses propres amas globulaires.'],
    ['Naine du Sculpteur', 1.0, -33.71, 0.29, 3, 'Première naine sphéroïdale découverte (1937).'],
    ['Naine du Dragon', 17.334, 57.92, 0.26, 2, 'Riche en matière noire.'],
    ['WLM', 0.033, -15.46, 3.0, 8, 'Galaxie isolée en bordure du Groupe local.']
  ];
  // Échelle de l'univers : distance en km, nom, description
  const ECHELLE = [
    [6371, 'Rayon de la Terre', '6 371 km. Un avion de ligne ferait le tour de la Terre en 2 jours.'],
    [384400, 'Orbite de la Lune', '384 400 km, soit 1,3 seconde-lumière. Toutes les planètes du système solaire tiendraient dans cet espace.'],
    [1.496e8, 'Orbite de la Terre', '150 millions de km (1 UA), soit 8 minutes-lumière.'],
    [4.5e9, 'Orbite de Neptune', '4,5 milliards de km : 4 heures-lumière.'],
    [2.6e10, 'Voyager 1', 'Vers fin 2026, l’objet humain le plus lointain atteint 1 jour-lumière.'],
    [1.5e13, 'Nuage de Oort', 'Réservoir de comètes jusqu’à 1 ou 2 années-lumière : la vraie frontière du système solaire.'],
    [4.0e13, 'Proxima du Centaure', '4,24 années-lumière : l’étoile la plus proche. Voyager mettrait 73 000 ans pour y arriver.'],
    [4.7e17, 'Voie lactée', '100 000 années-lumière de diamètre, 100 à 400 milliards d’étoiles.'],
    [2.4e19, 'Galaxie d’Andromède', '2,5 millions d’années-lumière : l’objet le plus lointain visible à l’œil nu.'],
    [5.0e20, 'Amas de la Vierge', '54 millions d’années-lumière, plus d’un millier de galaxies.'],
    [2.4e21, 'Superamas Laniakea', 'Notre superamas : environ 500 millions d’années-lumière, 100 000 galaxies.'],
    [4.4e23, 'Univers observable', 'Rayon de 46,5 milliards d’années-lumière (l’univers a grandi pendant que la lumière voyageait). Environ 2 000 milliards de galaxies.']
  ];

  // --- Construction des scènes ---
  const scenes = {};
  scenes.voisinage = {
    titre: '⭐ Nos étoiles voisines', cam: { dist: 42, pitch: 0.45 },
    texte: 'Voici les vraies positions en 3D des étoiles les plus proches du Soleil (jusqu’à 65 années-lumière). Chaque étoile est reliée au plan de l’équateur céleste par un trait, comme sur les cartes de navigation spatiale. Les cercles sont espacés de 5 années-lumière. Clique une étoile.',
    objets: VOISINES.map(([nom, ra, dec, d, coul, note]) => ({ nom, p: pos(ra, dec, d), coul, r: nom === 'Soleil' ? 0.5 : 0.35, note, d })),
    dessiner() {
      for (let r = 5; r <= 65; r += 5) { const pts = []; for (let k = 0; k <= 90; k++) pts.push([r * Math.cos(k * Math.PI / 45), r * Math.sin(k * Math.PI / 45), 0]); tracer(pts, r % 20 === 0 ? 'rgba(120,150,230,.35)' : 'rgba(120,150,230,.14)'); }
      for (const o of this.objets) tracer([o.p, [o.p[0], o.p[1], 0]], 'rgba(140,170,255,.35)');
      objetsLumineux(this.objets, o => `${o.nom}${o.d ? ` · ${nombre(o.d, o.d < 20 ? 1 : 0)} al` : ''}`);
    }
  };
  scenes.galaxie = {
    titre: '🌀 La Voie lactée', cam: { dist: 95, pitch: 0.75 },
    texte: 'Notre galaxie vue de l’extérieur (représentation construite d’après ce que l’on sait : une barre centrale, des bras spiraux, 100 000 années-lumière de large). Le Soleil est à 26 000 années-lumière du centre, où se cache le trou noir Sagittarius A*. Les Nuages de Magellan sont placés à leur vraie position. Unité : 1 000 années-lumière.',
    objets: [],
    init() {
      graine = 11;
      const pts = [];
      for (let i = 0; i < 2600; i++) { const r = Math.abs(gauss()) * 4; const a = alea() * 2 * Math.PI; pts.push({ p: [r * Math.cos(a) * 1.4, r * Math.sin(a) * 0.8, gauss() * 1.6], c: 'rgba(255,214,150,' }); }
      for (let i = 0; i < 1400; i++) { const t = gauss() * 4.5, e = gauss() * 1.1; const ab = 27 * RAD; pts.push({ p: [t * Math.cos(ab) - e * Math.sin(ab), t * Math.sin(ab) + e * Math.cos(ab), gauss() * 0.8], c: 'rgba(255,200,140,' }); }
      const b = Math.tan(12.5 * RAD);
      for (let bras = 0; bras < 4; bras++) for (let i = 0; i < 2600; i++) {
        const th = alea() * 3.6 * Math.PI, r = 4.5 * Math.exp(b * th);
        if (r > 52) continue;
        const a = th + bras * Math.PI / 2, s = 0.45 + r * 0.022;
        pts.push({ p: [r * Math.cos(a) + gauss() * s, r * Math.sin(a) + gauss() * s, gauss() * 0.35], c: alea() < 0.06 ? 'rgba(255,120,170,' : alea() < 0.5 ? 'rgba(170,200,255,' : 'rgba(230,235,255,' });
      }
      for (let i = 0; i < 1500; i++) { const r = Math.sqrt(alea()) * 50, a = alea() * 2 * Math.PI; pts.push({ p: [r * Math.cos(a), r * Math.sin(a), gauss() * 0.5], c: 'rgba(200,210,240,' }); }
      this.points = pts;
      const soleil = [-26, 0, 0.02];
      const gal = (l, b, d) => [soleil[0] + d * Math.cos(b * RAD) * Math.cos(l * RAD), d * Math.cos(b * RAD) * Math.sin(l * RAD), d * Math.sin(b * RAD)];
      this.objets = [
        { nom: 'Soleil (nous sommes ici)', p: soleil, coul: '#ffe28a', r: 0.6, note: 'Le Soleil fait le tour de la galaxie en 230 millions d’années environ, à 230 km/s. Depuis sa naissance, il a fait une vingtaine de tours.' },
        { nom: 'Sagittarius A*', p: [0, 0, 0], coul: '#ffffff', r: 0.7, note: 'Le trou noir central : 4 millions de fois la masse du Soleil. Photographié par l’Event Horizon Telescope en 2022.' },
        { nom: 'Grand Nuage de Magellan', p: gal(280.5, -32.9, 163), coul: '#cfe0ff', r: 2.5, note: 'Galaxie satellite à 163 000 années-lumière.' },
        { nom: 'Petit Nuage de Magellan', p: gal(302.8, -44.3, 200), coul: '#cfe0ff', r: 1.6, note: 'Galaxie satellite à 200 000 années-lumière.' },
        { nom: 'Naine du Sagittaire', p: gal(5.6, -14.2, 70), coul: '#cfe0ff', r: 1.2, note: 'Galaxie en cours d’absorption, de l’autre côté du centre galactique.' }
      ];
    },
    dessiner() {
      const ca = Math.cos(angle), sa = Math.sin(angle);
      ctx.globalCompositeOperation = 'lighter';
      for (const pt of this.points) {
        const p = [pt.p[0] * ca - pt.p[1] * sa, pt.p[0] * sa + pt.p[1] * ca, pt.p[2]];
        const q = cam.projeter(p); if (!q) continue;
        ctx.fillStyle = pt.c + Math.min(0.75, 0.22 + q.k * 0.02) + ')';
        const t = Math.max(1.3, Math.min(2.6, q.k * 0.1)); ctx.fillRect(q.x, q.y, t, t);
      }
      ctx.globalCompositeOperation = 'source-over';
      tracer(Array.from({ length: 91 }, (_, k) => [26 * Math.cos(k * Math.PI / 45), 26 * Math.sin(k * Math.PI / 45), 0]), 'rgba(255,226,138,.25)');
      objetsLumineux(this.objets, o => o.nom);
    }
  };
  scenes.groupe = {
    titre: '🌌 Le Groupe local', cam: { dist: 7, pitch: 0.4 },
    texte: 'Notre famille de galaxies, à ses vraies positions en 3D (unité : million d’années-lumière). La Voie lactée et Andromède dominent ; plus de 80 petites galaxies tournent autour. Andromède fonce vers nous : une rencontre est possible dans 4 à 5 milliards d’années.',
    objets: GALAXIES.map(([nom, ra, dec, d, diam, note]) => ({ nom, p: d ? pos(ra, dec, d) : [0, 0, 0], coul: d > 1 ? '#d8c8ff' : '#cfe0ff', r: Math.max(0.025, diam / 1000 * 0.9), note, d })),
    dessiner() {
      for (const r of [0.5, 1, 2, 3]) tracer(Array.from({ length: 91 }, (_, k) => [r * Math.cos(k * Math.PI / 45), r * Math.sin(k * Math.PI / 45), 0]), 'rgba(120,150,230,.16)');
      for (const o of this.objets) tracer([o.p, [o.p[0], o.p[1], 0]], 'rgba(140,170,255,.25)');
      objetsLumineux(this.objets, o => `${o.nom}${o.d ? ` · ${nombre(o.d, o.d < 1 ? 2 : 1)} M al` : ''}`, true);
    }
  };
  scenes.toile = {
    titre: '🕸️ La toile cosmique', cam: { dist: 3.2, pitch: 0.3 },
    texte: 'À très grande échelle, les galaxies dessinent une immense toile : des filaments et des amas autour de grands vides. Chaque point serait une galaxie. Cette vue est une représentation (générée) d’un cube d’environ un milliard d’années-lumière ; les relevés réels comme SDSS, DESI ou Euclid montrent exactement ce motif.',
    objets: [],
    init() {
      graine = 5;
      const noeuds = Array.from({ length: 70 }, () => [alea() * 2 - 1, alea() * 2 - 1, alea() * 2 - 1]);
      const pts = [];
      for (const n of noeuds) {
        const voisins = noeuds.map(m => [Math.hypot(m[0] - n[0], m[1] - n[1], m[2] - n[2]), m]).sort((a, b) => a[0] - b[0]).slice(1, 4);
        for (const [d, m] of voisins) for (let i = 0; i < 60 * d; i++) { const t = alea(); pts.push([n[0] + (m[0] - n[0]) * t + gauss() * 0.025, n[1] + (m[1] - n[1]) * t + gauss() * 0.025, n[2] + (m[2] - n[2]) * t + gauss() * 0.025]); }
        for (let i = 0; i < 70; i++) pts.push([n[0] + gauss() * 0.04, n[1] + gauss() * 0.04, n[2] + gauss() * 0.04]);
      }
      this.points = pts;
      this.objets = [{ nom: 'Nous (Voie lactée, superamas Laniakea)', p: noeuds[0], coul: '#ffe28a', r: 0.03, note: 'À cette échelle, la Voie lactée entière est un point invisible.' }];
    },
    dessiner() {
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.points) { const q = cam.projeter(p); if (!q) continue; ctx.fillStyle = `rgba(170,150,255,${Math.min(0.85, 0.15 + q.k * 0.0015)})`; ctx.fillRect(q.x, q.y, 1.5, 1.5); }
      ctx.globalCompositeOperation = 'source-over';
      objetsLumineux(this.objets, o => o.nom);
    }
  };
  scenes.echelle = {
    titre: '📏 Des kilomètres aux confins', cam: { dist: 48, pitch: 0.9 },
    texte: 'L’échelle est logarithmique : chaque unité vers l’extérieur multiplie la distance par 10. C’est la seule façon de faire tenir sur un écran à la fois la Terre et l’univers observable, environ 70 milliards de milliards de fois plus grand. Clique sur « Voyage » pour partir de la Terre et zoomer jusqu’aux confins.',
    objets: [],
    init() { this.objets = ECHELLE.map(([km, nom, note]) => ({ nom, km, note, rayon: Math.log10(km) - 3, p: [Math.log10(km) - 3, 0, 0], coul: '#ffd27a', r: 0.15 })); },
    dessiner() {
      this.objets.forEach((o, i) => {
        const pts = Array.from({ length: 121 }, (_, k) => [o.rayon * Math.cos(k * Math.PI / 60), o.rayon * Math.sin(k * Math.PI / 60), 0]);
        tracer(pts, `hsla(${200 + i * 12},80%,70%,.55)`, i === selectionIndex ? 2.5 : 1.2);
        const a = -0.6 + i * 0.32, q = cam.projeter([o.rayon * Math.cos(a), o.rayon * Math.sin(a), 0]);
        if (q) { ctx.fillStyle = `hsl(${200 + i * 12},80%,75%)`; ctx.beginPath(); ctx.arc(q.x, q.y, 4, 0, 2 * Math.PI); ctx.fill(); ctx.font = '600 12px system-ui'; ctx.fillText(o.nom, q.x + 7, q.y); touches.push({ x: q.x, y: q.y, r: 12, o }); }
      });
      const q = cam.projeter([0, 0, 0]); if (q) { ctx.fillStyle = '#6aa6ff'; ctx.beginPath(); ctx.arc(q.x, q.y, 3, 0, 2 * Math.PI); ctx.fill(); }
    }
  };
  let selectionIndex = -1, voyage = null;

  // --- Dessin commun ---
  function tracer(pts, couleur, largeur = 1) {
    ctx.strokeStyle = couleur; ctx.lineWidth = largeur; ctx.beginPath(); let ok = false;
    for (const p of pts) { const q = cam.projeter(p); if (!q) { ok = false; continue; } if (ok) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); ok = true; }
    ctx.stroke();
  }
  function objetsLumineux(objets, etiquette, galaxies = false) {
    const liste = objets.map(o => ({ o, q: cam.projeter(o.p) })).filter(x => x.q).sort((a, b) => b.q.z - a.q.z);
    for (const { o, q } of liste) {
      const r = Math.max(2.5, o.r * q.k * (galaxies ? 1 : 0.45));
      const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r * (galaxies ? 1 : 3));
      g.addColorStop(0, o.coul); g.addColorStop(galaxies ? 0.35 : 0.25, o.coul + (galaxies ? '99' : 'cc')); g.addColorStop(1, o.coul + '00');
      ctx.fillStyle = g;
      ctx.beginPath();
      if (galaxies) ctx.ellipse(q.x, q.y, r, r * 0.45, -0.3, 0, 2 * Math.PI); else ctx.arc(q.x, q.y, r * 3, 0, 2 * Math.PI);
      ctx.fill();
      if (!galaxies) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(1.5, r * 0.5), 0, 2 * Math.PI); ctx.fill(); }
      ctx.font = '600 12px system-ui, sans-serif'; ctx.textBaseline = 'middle';
      ctx.fillStyle = selection === o ? '#ffd27a' : 'rgba(225,232,255,.9)';
      ctx.fillText(etiquette(o), q.x + Math.max(8, r) + 4, q.y);
      touches.push({ x: q.x, y: q.y, r: Math.max(12, r), o });
    }
  }

  function dessiner() {
    ({ ctx, w: W, h: H } = ajusterCanvas(canvas));
    cam.preparer(W, H); touches = [];
    ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, W, H);
    graine = 77; ctx.fillStyle = '#fff';
    for (let i = 0; i < 200; i++) { ctx.globalAlpha = 0.1 + alea() * 0.4; ctx.fillRect(alea() * W, alea() * H, 1, 1); }
    ctx.globalAlpha = 1;
    scenes[sceneId].dessiner();
  }

  function legende() {
    const s = scenes[sceneId];
    $('#cosmos-legende').innerHTML = `<h3>${s.titre}</h3><div class="corps"><p>${s.texte}</p><div id="cosmos-fiche"></div></div>`;
  }
  function choisirScene(id) {
    sceneId = id; selection = null; selectionIndex = -1; voyage = null;
    const s = scenes[id];
    if (s.init && !s.points && !s.objets.length) s.init();
    cam.cible = [0, 0, 0]; cam.dist = s.cam.dist; cam.pitch = s.cam.pitch;
    $$('#cosmos-barre [data-scene]').forEach(b => b.setAttribute('aria-pressed', b.dataset.scene === id));
    $('#cosmos-voyage').classList.toggle('cache', id !== 'echelle');
    $('#cosmos-tourner').classList.toggle('cache', id !== 'galaxie');
    legende();
  }
  function montrerObjet(o) {
    selection = o;
    $('#cosmos-fiche').innerHTML = `<div class="carte" style="margin-top:8px"><h3>${echap(o.nom)}</h3><p>${o.note}</p></div>`;
    Bus.emettre('selection', { titre: o.nom, type: 'cosmos' });
  }
  function lancerVoyage() {
    const s = scenes.echelle; let i = 0;
    const etape = () => {
      if (sceneId !== 'echelle' || i >= s.objets.length) { voyage = null; return; }
      const o = s.objets[i]; selectionIndex = i; montrerObjet(o);
      const d0 = cam.dist, d1 = Math.max(2.5, o.rayon * 2.6), t0 = performance.now();
      voyage = () => { const t = Math.min(1, (performance.now() - t0) / 1600); cam.dist = d0 + (d1 - d0) * (1 - Math.pow(1 - t, 3)); cam.yaw += 0.002; if (t >= 1) { voyage = null; i++; setTimeout(etape, 2600); } };
    };
    cam.dist = 1.5; etape();
  }

  function init() {
    canvas = $('#cosmos-canvas');
    $('#cosmos-barre').innerHTML = `
      <button class="btn petit" data-scene="voisinage">⭐ Étoiles voisines</button>
      <button class="btn petit" data-scene="galaxie">🌀 Voie lactée</button>
      <button class="btn petit" data-scene="groupe">🌌 Groupe local</button>
      <button class="btn petit" data-scene="toile">🕸️ Toile cosmique</button>
      <button class="btn petit" data-scene="echelle">📏 Échelle de l’univers</button>
      <span class="sep"></span>
      <button class="btn petit primaire cache" id="cosmos-voyage">🚀 Voyage de la Terre aux confins</button>
      <button class="btn petit cache" id="cosmos-tourner" aria-pressed="false">🔄 Faire tourner la galaxie</button>`;
    $$('#cosmos-barre [data-scene]').forEach(b => b.onclick = () => choisirScene(b.dataset.scene));
    $('#cosmos-voyage').onclick = lancerVoyage;
    $('#cosmos-tourner').onclick = e => { tourne = !tourne; e.currentTarget.setAttribute('aria-pressed', tourne); };
    cam.brancher($('#cosmos-zone'), () => { voyage = null; }, (x, y) => { const t = touches.slice().reverse().find(t => Math.hypot(t.x - x, t.y - y) < t.r); if (t) montrerObjet(t.o); });
    choisirScene('voisinage');
    const boucle = t => {
      const dt = Math.min(0.1, (t - dernier) / 1000); dernier = t;
      if (actif) { if (tourne && sceneId === 'galaxie') angle -= dt * 0.15; if (voyage) voyage(); dessiner(); }
      requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
  }
  return { init, activer: on => { actif = on; }, choisirScene, lancerVoyage };
})();
