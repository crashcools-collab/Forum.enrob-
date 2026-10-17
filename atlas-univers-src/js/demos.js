// Démonstrations animées et interactives : on manipule, on comprend.
const Demos = (() => {
  const TAU = 2 * Math.PI;
  let courant = null, canvas = null, actif = false, t0 = performance.now();
  const champ = (id, label, min, max, pas, valeur, unite = '') => `<label class="petit" for="${id}">${label} : <b id="${id}-v">${valeur}${unite}</b></label><input type="range" id="${id}" min="${min}" max="${max}" step="${pas}" value="${valeur}">`;
  const lire = id => +$('#' + id).value;
  const ecrire = (id, txt) => { const e = $('#' + id + '-v'); if (e) e.textContent = txt; };
  const disque = (ctx, x, y, r, coul) => { ctx.fillStyle = coul; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
  const texte = (ctx, s, x, y, coul = '#e8ecf8', taille = 13, ancre = 'center') => { ctx.fillStyle = coul; ctx.font = `600 ${taille}px system-ui, sans-serif`; ctx.textAlign = ancre; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textAlign = 'left'; };
  function luneVue(ctx, x, y, r, e) { // élongation e en degrés, vue de l'hémisphère nord
    const cr = Astro.norm360(e) <= 180, i = (cr ? 180 - Astro.norm360(e) : Astro.norm360(e) - 180) * Math.PI / 180, s = cr ? 1 : -1;
    disque(ctx, x, y, r, '#2b2f40');
    ctx.fillStyle = '#f1eee2'; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, !cr);
    for (let k = 20; k >= -20; k--) { const yy = r * k / 20; ctx.lineTo(x + s * -Math.cos(i) * Math.sqrt(Math.max(0, r * r - yy * yy)), y + yy); }
    ctx.closePath(); ctx.fill();
  }
  const fondEtoile = (ctx, W, H, n = 90) => { ctx.fillStyle = '#02040a'; ctx.fillRect(0, 0, W, H); let g = 7; for (let i = 0; i < n; i++) { g = (g * 16807) % 2147483647; const x = (g % 1000) / 1000 * W; g = (g * 16807) % 2147483647; const y = (g % 1000) / 1000 * H; ctx.fillStyle = `rgba(255,255,255,${0.2 + (g % 50) / 100})`; ctx.fillRect(x, y, 1.2, 1.2); } };

  const demos = [
    {
      id: 'phases', titre: '🌗 Les phases de la Lune', texte: 'Fais avancer les jours : la Lune tourne autour de la Terre en 29,5 jours. Elle est toujours éclairée à moitié par le Soleil (à gauche), mais depuis la Terre on voit une portion plus ou moins grande de cette moitié.',
      controles: () => champ('d-jour', 'Jour du cycle', 0, 29.5, 0.1, 0, ' j') + '<label class="petit"><input type="checkbox" id="d-anim" checked> Animation automatique</label>',
      etat: { jour: 0 },
      dessiner(ctx, W, H, dt) {
        if ($('#d-anim').checked) { this.etat.jour = (this.etat.jour + dt * 2) % 29.53; $('#d-jour').value = this.etat.jour; } else this.etat.jour = lire('d-jour');
        ecrire('d-jour', `${nombre(this.etat.jour, 1)} j`);
        fondEtoile(ctx, W, H);
        for (let k = 0; k < 6; k++) { ctx.strokeStyle = '#ffd27a88'; ctx.beginPath(); ctx.moveTo(10, H * 0.15 + k * H * 0.12); ctx.lineTo(W * 0.12, H * 0.15 + k * H * 0.12); ctx.stroke(); }
        texte(ctx, 'Soleil →', W * 0.07, H * 0.08, '#ffd27a');
        const cx = W * 0.4, cy = H * 0.5, R = Math.min(W, H) * 0.32, e = this.etat.jour / 29.53 * 360, a = (180 + e) * Math.PI / 180;
        ctx.strokeStyle = '#2c3a6b'; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        const g = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 24); g.addColorStop(0, '#7fb6ff'); g.addColorStop(1, '#1f4f9e'); disque(ctx, cx, cy, 22, g);
        const mx = cx + R * Math.cos(a), my = cy - R * Math.sin(a);
        disque(ctx, mx, my, 13, '#2b2f40'); ctx.fillStyle = '#f1eee2'; ctx.beginPath(); ctx.arc(mx, my, 13, Math.PI / 2, 3 * Math.PI / 2); ctx.fill();
        ctx.strokeStyle = '#ffffff33'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(mx, my); ctx.stroke();
        texte(ctx, 'Vue de dessus', cx, H * 0.06, '#a9b3d1', 12);
        const vx = W * 0.82, vy = H * 0.45, vr = Math.min(W, H) * 0.16;
        luneVue(ctx, vx, vy, vr, e);
        texte(ctx, 'Vue depuis la Terre', vx, vy - vr - 18, '#a9b3d1', 12);
        const L = Astro.infosLune(2451550.26 + this.etat.jour);
        texte(ctx, L.nom, vx, vy + vr + 22, '#ffd27a', 15);
        texte(ctx, `éclairée à ${Math.round((1 - Math.cos(e * Math.PI / 180)) / 2 * 100)} %`, vx, vy + vr + 42, '#a9b3d1', 12);
      }
    },
    {
      id: 'saisons', titre: '🌞 Les saisons et la hauteur du Soleil', texte: 'Choisis un jour de l’année et une latitude. Observe la hauteur du Soleil à midi et la durée du jour : c’est l’inclinaison de l’axe terrestre qui crée les saisons.',
      controles: () => champ('d-doy', 'Jour de l’année', 1, 365, 1, 172) + champ('d-lat', 'Latitude', -66, 66, 1, Math.round(Lieu.courant.lat), '°') + '<label class="petit"><input type="checkbox" id="d-anim2"> Faire défiler l’année</label>',
      dessiner(ctx, W, H, dt) {
        if ($('#d-anim2').checked) $('#d-doy').value = (lire('d-doy') + dt * 30) % 365 + 1;
        const j = lire('d-doy'), lat = lire('d-lat'), decl = 23.44 * Math.sin(TAU * (j - 80) / 365.25);
        const date = new Date(2026, 0, Math.round(j)); ecrire('d-doy', date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })); ecrire('d-lat', `${lat}°`);
        const hMidi = 90 - Math.abs(lat - decl);
        const x = -Math.tan(lat * Math.PI / 180) * Math.tan(decl * Math.PI / 180);
        const duree = x <= -1 ? 24 : x >= 1 ? 0 : 2 * Math.acos(x) * 180 / Math.PI / 15;
        fondEtoile(ctx, W, H, 0);
        const ciel = ctx.createLinearGradient(0, 0, 0, H * 0.75); ciel.addColorStop(0, '#0f2d66'); ciel.addColorStop(1, '#5d8fd6'); ctx.fillStyle = ciel; ctx.fillRect(0, 0, W, H * 0.75);
        ctx.fillStyle = '#1d3b22'; ctx.fillRect(0, H * 0.75, W, H * 0.25);
        const cx = W / 2, cy = H * 0.75, R = Math.min(W * 0.42, H * 0.62);
        for (const [d, coul, n] of [[23.44, '#ffd27a55', 'solstice d’été'], [0, '#ffffff33', 'équinoxes'], [-23.44, '#8ab4ff55', 'solstice d’hiver']]) {
          const h = 90 - Math.abs(lat - d), a = Math.max(0, h) * Math.PI / 180;
          ctx.strokeStyle = coul; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * Math.sin(a), 0, Math.PI, 0); ctx.stroke();
          texte(ctx, n, cx + R * 0.95, cy - R * Math.sin(a) * 0.3 - 8, coul.slice(0, 7), 11, 'end');
        }
        const a = Math.max(0, hMidi) * Math.PI / 180;
        ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * Math.sin(a), 0, Math.PI, 0); ctx.stroke();
        const sx = cx, sy = cy - R * Math.sin(a);
        const gs = ctx.createRadialGradient(sx, sy, 0, sx, sy, 34); gs.addColorStop(0, '#fff7d0'); gs.addColorStop(0.3, '#ffd27a'); gs.addColorStop(1, '#ffd27a00'); disque(ctx, sx, sy, 34, gs);
        texte(ctx, 'Est', cx - R, cy + 16, '#a9b3d1', 12); texte(ctx, 'Sud', cx, cy + 16, '#a9b3d1', 12); texte(ctx, 'Ouest', cx + R, cy + 16, '#a9b3d1', 12);
        texte(ctx, `Soleil à midi : ${nombre(Math.max(0, hMidi), 0)}° de hauteur`, 16, 24, '#fff', 15, 'left');
        texte(ctx, `Durée du jour : ${Math.floor(duree)} h ${String(Math.round((duree % 1) * 60)).padStart(2, '0')}`, 16, 46, '#fff', 15, 'left');
        texte(ctx, duree >= 24 ? 'Soleil de minuit !' : duree <= 0 ? 'Nuit polaire !' : '', 16, 68, '#ffd27a', 14, 'left');
      }
    },
    {
      id: 'eclipses', titre: '🌑 Pourquoi pas une éclipse chaque mois ?', texte: 'L’orbite de la Lune est inclinée d’environ 5° (exagérée ici). Une éclipse n’a lieu que si la nouvelle ou la pleine Lune tombe près de la « ligne des nœuds », là où l’orbite lunaire croise le plan de l’orbite terrestre. Cela arrive pendant deux « saisons d’éclipses » par an.',
      controles: () => champ('d-mois', 'Position de la Lune', 0, 360, 1, 0, '°') + champ('d-annee', 'Moment de l’année', 0, 360, 1, 0, '°') + '<label class="petit"><input type="checkbox" id="d-anim3" checked> Animation</label>',
      etat: { m: 0, y: 0 },
      dessiner(ctx, W, H, dt) {
        if ($('#d-anim3').checked) { this.etat.m = (this.etat.m + dt * 120) % 360; this.etat.y = (this.etat.y + dt * 9.3) % 360; $('#d-mois').value = this.etat.m; $('#d-annee').value = this.etat.y; }
        else { this.etat.m = lire('d-mois'); this.etat.y = lire('d-annee'); }
        ecrire('d-mois', `${Math.round(this.etat.m)}°`); ecrire('d-annee', `${Math.round(this.etat.y)}°`);
        fondEtoile(ctx, W, H);
        const cx = W * 0.5, cy = H * 0.55, R = Math.min(W, H) * 0.38;
        disque(ctx, cx, cy, 20, '#ffd36b'); texte(ctx, 'Soleil', cx, cy + 34, '#ffd27a', 12);
        ctx.strokeStyle = '#2c3a6b'; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.35, 0, 0, TAU); ctx.stroke();
        const ay = this.etat.y * Math.PI / 180, ex = cx + R * Math.cos(ay), ey = cy + R * 0.35 * Math.sin(ay);
        const am = this.etat.m * Math.PI / 180, r = 46, incl = 0.45; // la ligne des nœuds reste fixe (axe horizontal)
        const hauteur = b => -Math.sin(b) * Math.sin(incl) * 30; // décalage dû à l'inclinaison (exagérée)
        const mx = ex + r * Math.cos(am), my = ey + r * 0.35 * Math.sin(am) + hauteur(am);
        ctx.strokeStyle = '#8ab4ff55'; ctx.beginPath(); for (let k = 0; k <= 60; k++) { const b = k / 60 * TAU; const x = ex + r * Math.cos(b), y = ey + r * 0.35 * Math.sin(b) + hauteur(b); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
        ctx.strokeStyle = '#ff8fc8aa'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(ex - r - 14, ey); ctx.lineTo(ex + r + 14, ey); ctx.stroke(); ctx.setLineDash([]);
        disque(ctx, ex, ey, 10, '#4f8fe8'); disque(ctx, mx, my, 5, '#d8d4c8');
        // alignement Soleil-Terre-Lune (vu de dessus) et latitude de la Lune au-dessus du plan de l'orbite terrestre
        const dirSoleil = ay + Math.PI, elong = Math.abs(Math.atan2(Math.sin(am - dirSoleil), Math.cos(am - dirSoleil)));
        const lat = Math.sin(am) * 5.1;
        const alignee = elong < 0.18 || elong > Math.PI - 0.18;
        let msg = 'Pas d’alignement : pas d’éclipse.', coul = '#a9b3d1';
        if (alignee && Math.abs(lat) < 1.2) { msg = elong < 0.18 ? '🌑 ÉCLIPSE DE SOLEIL !' : '🌕 ÉCLIPSE DE LUNE !'; coul = '#ffd27a'; }
        else if (alignee) msg = elong < 0.18 ? 'Nouvelle Lune… mais elle passe au-dessus ou au-dessous du Soleil.' : 'Pleine Lune… mais elle évite l’ombre de la Terre.';
        texte(ctx, msg, W / 2, 24, coul, 15);
        texte(ctx, 'ligne des nœuds', ex, ey + 22, '#ff8fc8', 11);
      }
    },
    {
      id: 'retrograde', titre: '🔴 La boucle de Mars', texte: 'Pourquoi Mars semble-t-elle reculer certains mois dans le ciel ? Parce que la Terre, plus rapide, la double sur la piste intérieure. La ligne de visée depuis la Terre trace alors une boucle sur le fond d’étoiles (en haut).',
      controles: () => '<button class="btn petit" id="d-reset">Recommencer</button> ' + champ('d-vit', 'Vitesse', 0.2, 3, 0.1, 1, '×'),
      etat: { jd: 0, trace: [] },
      init() { this.etat.jd = Astro.jourJulien(new Date('2026-08-01')); this.etat.trace = []; },
      dessiner(ctx, W, H, dt) {
        const v = lire('d-vit'); ecrire('d-vit', `${nombre(v, 1)}×`);
        this.etat.jd += dt * 40 * v;
        fondEtoile(ctx, W, H);
        const cx = W * 0.5, cy = H * 0.62, k = Math.min(W, H) * 0.17;
        disque(ctx, cx, cy, 9, '#ffd36b');
        ctx.strokeStyle = '#2c3a6b'; for (const r of [1, 1.524]) { ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, TAU); ctx.stroke(); }
        const t = Astro.helio('terre', this.etat.jd), m = Astro.helio('mars', this.etat.jd);
        const tx = cx + t[0] * k, ty = cy - t[1] * k, mx = cx + m[0] * k, my = cy - m[1] * k;
        disque(ctx, tx, ty, 6, '#6aa6ff'); disque(ctx, mx, my, 5, '#e0795a');
        const lon = Math.atan2(m[1] - t[1], m[0] - t[0]);
        ctx.strokeStyle = '#e0795a66'; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + Math.cos(lon) * W, ty - Math.sin(lon) * W); ctx.stroke();
        this.etat.trace.push([lon, Math.atan2(m[2] - t[2], Math.hypot(m[0] - t[0], m[1] - t[1]))]);
        if (this.etat.trace.length > 700) this.etat.trace.shift();
        // bande du ciel en haut : longitude écliptique déroulée
        ctx.fillStyle = '#0b1230'; ctx.fillRect(0, 0, W, H * 0.22);
        const l0 = this.etat.trace[0][0];
        ctx.strokeStyle = '#e0795a'; ctx.lineWidth = 2; ctx.beginPath();
        this.etat.trace.forEach(([l, b], i) => { let d = l - l0; d = Math.atan2(Math.sin(d), Math.cos(d)); const x = W * 0.75 - d / (Math.PI / 2) * W * 0.5, y = H * 0.11 - b * 600; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.stroke(); ctx.lineWidth = 1;
        texte(ctx, 'Mars vue depuis la Terre, sur le fond d’étoiles', W / 2, H * 0.24 + 8, '#a9b3d1', 12);
        texte(ctx, Astro.jdVersDate(this.etat.jd).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }), W - 12, H - 16, '#ffd27a', 13, 'right');
      }
    },
    {
      id: 'canon', titre: '🚀 Le canon de Newton : comment on se met en orbite', texte: 'Newton imaginait un canon au sommet d’une montagne. Trop lent, le boulet retombe. Vers 7,9 km/s, il tombe… en même temps que la Terre s’arrondit sous lui : il est en orbite ! Au-delà de 11,2 km/s, il s’échappe pour toujours.',
      controles: () => champ('d-v', 'Vitesse de tir', 3, 12, 0.1, 7.9, ' km/s') + '<button class="btn primaire petit" id="d-feu">🔥 Feu !</button> <button class="btn petit" id="d-eff">Effacer</button>',
      etat: { tirs: [] },
      init() { this.etat.tirs = []; },
      tirer() { const v = lire('d-v'); this.etat.tirs.push({ v, x: 0, y: 6371 + 300, vx: v, vy: 0, pts: [], fini: false }); if (this.etat.tirs.length > 6) this.etat.tirs.shift(); },
      dessiner(ctx, W, H, dt) {
        ecrire('d-v', `${nombre(lire('d-v'), 1)} km/s`);
        fondEtoile(ctx, W, H);
        const cx = W / 2, cy = H / 2, k = Math.min(W, H) * 0.2 / 6371;
        const g = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, 6371 * k); g.addColorStop(0, '#7fb6ff'); g.addColorStop(1, '#1f4f9e'); disque(ctx, cx, cy, 6371 * k, g);
        ctx.fillStyle = '#5b4a3a'; ctx.beginPath(); ctx.moveTo(cx - 14, cy - 6371 * k + 2); ctx.lineTo(cx, cy - (6371 + 300) * k); ctx.lineTo(cx + 14, cy - 6371 * k + 2); ctx.fill();
        const GM = 398600;
        for (const s of this.etat.tirs) {
          for (let n = 0; n < 60 && !s.fini; n++) {
            const pas = 4 * dt * 60 / 60 * 10, r = Math.hypot(s.x, s.y), a = -GM / (r * r * r);
            s.vx += a * s.x * pas; s.vy += a * s.y * pas; s.x += s.vx * pas; s.y += s.vy * pas;
            if (n % 6 === 0) s.pts.push([s.x, s.y]);
            if (Math.hypot(s.x, s.y) < 6371) s.fini = 'sol'; if (Math.hypot(s.x, s.y) > 60000) s.fini = 'parti';
            if (s.pts.length > 900) s.pts.shift();
          }
          ctx.strokeStyle = s.v >= 11 ? '#ff8fc8' : s.v >= 7.7 ? '#7be0a6' : '#ffd27a'; ctx.lineWidth = 2; ctx.beginPath();
          s.pts.forEach(([x, y], i) => i ? ctx.lineTo(cx + x * k, cy - y * k) : ctx.moveTo(cx + x * k, cy - y * k)); ctx.stroke();
          if (!s.fini) disque(ctx, cx + s.x * k, cy - s.y * k, 3.5, '#fff');
        }
        const v = lire('d-v');
        texte(ctx, v < 7.7 ? 'Le boulet retombe sur Terre' : v < 11 ? 'Orbite ! (de plus en plus allongée)' : 'Vitesse de libération : il s’échappe !', W / 2, 22, v < 7.7 ? '#ffd27a' : v < 11 ? '#7be0a6' : '#ff8fc8', 15);
        ctx.lineWidth = 1;
      }
    },
    {
      id: 'expansion', titre: '🎈 L’expansion de l’univers', texte: 'Fais grandir l’univers. Chaque galaxie voit toutes les autres s’éloigner, d’autant plus vite qu’elles sont loin : c’est la loi de Hubble-Lemaître. Clique sur n’importe quelle galaxie pour te placer dessus : la vue est la même partout, il n’y a pas de centre.',
      controles: () => champ('d-a', 'Taille de l’univers', 1, 2.5, 0.01, 1, '×') + '<label class="petit"><input type="checkbox" id="d-anim4" checked> Animation</label>',
      etat: { gal: [], ref: 0, a: 1, sens: 1 },
      init() { let g = 3; const al = () => { g = (g * 16807) % 2147483647; return (g - 1) / 2147483646; }; this.etat.gal = Array.from({ length: 70 }, () => [al() * 2 - 1, al() * 2 - 1]); this.etat.ref = 0; this.etat.gal[0] = [0, 0]; },
      clic(x, y, W, H) { const e = this.etat, k = Math.min(W, H) * 0.32 * e.a; let best = 0, bd = 1e9; e.gal.forEach(([gx, gy], i) => { const [rx, ry] = e.gal[e.ref]; const d = Math.hypot(W / 2 + (gx - rx) * k - x, H / 2 + (gy - ry) * k - y); if (d < bd) { bd = d; best = i; } }); if (bd < 20) e.ref = best; },
      dessiner(ctx, W, H, dt) {
        const e = this.etat;
        if ($('#d-anim4').checked) { e.a += e.sens * dt * 0.25; if (e.a > 2.5) { e.a = 2.5; e.sens = -1; } if (e.a < 1) { e.a = 1; e.sens = 1; } $('#d-a').value = e.a; } else e.a = lire('d-a');
        ecrire('d-a', `${nombre(e.a, 2)}×`);
        fondEtoile(ctx, W, H, 30);
        const k = Math.min(W, H) * 0.32 * e.a, [rx, ry] = e.gal[e.ref];
        for (const [gx, gy] of e.gal) {
          const x = W / 2 + (gx - rx) * k, y = H / 2 + (gy - ry) * k, d = Math.hypot(gx - rx, gy - ry);
          if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
          const rouge = Math.min(1, d * (e.a - 1) * 1.2);
          if (d > 0) { ctx.strokeStyle = `rgba(255,${200 - rouge * 150},${200 - rouge * 170},.5)`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (gx - rx) * 30 * (e.sens > 0 ? 1 : 0.3), y + (gy - ry) * 30 * (e.sens > 0 ? 1 : 0.3)); ctx.stroke(); }
          ctx.fillStyle = d === 0 ? '#ffd27a' : `rgb(${200 + rouge * 55},${210 - rouge * 120},${255 - rouge * 200})`;
          ctx.beginPath(); ctx.ellipse(x, y, d === 0 ? 7 : 5, d === 0 ? 4 : 3, gx * 3, 0, TAU); ctx.fill();
        }
        texte(ctx, '★ ta galaxie', W / 2, H / 2 + 18, '#ffd27a', 12);
        texte(ctx, 'Plus une galaxie est loin, plus elle s’éloigne vite et plus sa lumière rougit.', W / 2, H - 16, '#a9b3d1', 12);
      }
    },
    {
      id: 'saut', titre: '🦘 Sauter sur d’autres mondes', texte: 'Avec le même élan qu’un bon saut sur Terre (environ 50 cm), jusqu’où monterais-tu ailleurs ? Tout dépend de la gravité à la surface.',
      controles: () => `<label class="petit" for="d-astre">Astre</label><select id="d-astre" style="width:100%">${[['Terre', 9.81], ['Lune', 1.62], ['Mars', 3.71], ['Mercure', 3.7], ['Vénus', 8.87], ['Jupiter (au sommet des nuages)', 24.79], ['Saturne', 10.44], ['Titan', 1.35], ['Pluton', 0.62], ['Cérès', 0.28]].map(([n, g]) => `<option value="${g}">${n}</option>`).join('')}</select>`,
      etat: { t: 0 },
      dessiner(ctx, W, H, dt) {
        const g = +$('#d-astre').value, v0 = Math.sqrt(2 * 9.81 * 0.5), hmax = v0 * v0 / (2 * g), duree = 2 * v0 / g;
        this.etat.t = (this.etat.t + dt) % (duree + 0.6);
        const t = Math.min(this.etat.t, duree), h = Math.max(0, v0 * t - g * t * t / 2);
        fondEtoile(ctx, W, H);
        const sol = H * 0.85, echelle = (H * 0.7) / Math.max(1, hmax * 1.1);
        ctx.fillStyle = '#3a3a48'; ctx.fillRect(0, sol, W, H - sol);
        ctx.strokeStyle = '#ffffff22'; for (let m = 0; m <= hmax * 1.1; m += Math.max(0.5, Math.ceil(hmax / 6))) { const y = sol - m * echelle; ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(W, y); ctx.stroke(); texte(ctx, `${nombre(m, m < 1 ? 1 : 0)} m`, 8, y, '#6f7aa0', 11, 'left'); }
        const x = W / 2, y = sol - h * echelle;
        ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 3; disque(ctx, x, y - 52, 9, '#ffd27a');
        ctx.beginPath(); ctx.moveTo(x, y - 43); ctx.lineTo(x, y - 18); ctx.moveTo(x, y - 18); ctx.lineTo(x - 9, y); ctx.moveTo(x, y - 18); ctx.lineTo(x + 9, y); ctx.moveTo(x - 12, y - 36); ctx.lineTo(x + 12, y - 36); ctx.stroke(); ctx.lineWidth = 1;
        texte(ctx, `Hauteur du saut : ${nombre(hmax, hmax < 10 ? 2 : 1)} m · temps en l’air : ${nombre(duree, 1)} s`, W / 2, 24, '#fff', 15);
        texte(ctx, `Ton poids y serait multiplié par ${nombre(g / 9.81, 2)}`, W / 2, 46, '#a9b3d1', 13);
      }
    },
    {
      id: 'lumiere', titre: '💡 La course de la lumière', texte: 'Un éclair part du Soleil. Ici, une seconde à l’écran représente une minute réelle. Regarde le temps qu’il faut à la lumière, la chose la plus rapide de l’univers, pour atteindre chaque planète.',
      controles: () => '<button class="btn primaire petit" id="d-flash">⚡ Lancer un éclair</button> ' + champ('d-acc', 'Accélération', 1, 60, 1, 1, '×'),
      etat: { t: -1 },
      dessiner(ctx, W, H, dt) {
        const acc = lire('d-acc'); ecrire('d-acc', `${acc}×`);
        if (this.etat.t >= 0) this.etat.t += dt * 60 * acc;
        fondEtoile(ctx, W, H);
        const pl = [['Mercure', 0.39], ['Vénus', 0.72], ['Terre', 1], ['Mars', 1.52], ['Jupiter', 5.2], ['Saturne', 9.54], ['Uranus', 19.2], ['Neptune', 30.1]];
        const X = ua => 30 + Math.sqrt(ua / 30.1) * (W - 70);
        disque(ctx, 30, H / 2, 14, '#ffd36b');
        for (const [k, [n, ua]] of pl.entries()) {
          const x = X(ua), tl = ua * 499, atteint = this.etat.t >= tl, dec = k < 4 ? (k % 2) * 30 : 0;
          disque(ctx, x, H / 2, 5, atteint ? '#ffd27a' : '#6f7aa0');
          texte(ctx, n, x, H / 2 - 22 - dec, atteint ? '#ffd27a' : '#a9b3d1', 12);
          const m = Math.floor(tl / 60), s = Math.round(tl % 60);
          texte(ctx, tl < 3600 ? `${m} min ${String(s).padStart(2, '0')}` : `${Math.floor(tl / 3600)} h ${String(Math.round(tl % 3600 / 60)).padStart(2, '0')}`, x, H / 2 + 24 + dec, '#6f7aa0', 11);
        }
        if (this.etat.t >= 0) {
          const ua = this.etat.t / 499, x = X(Math.min(ua, 31));
          const g = ctx.createRadialGradient(x, H / 2, 0, x, H / 2, 20); g.addColorStop(0, '#fffbe0'); g.addColorStop(1, '#fffbe000'); disque(ctx, x, H / 2, 20, g);
          const s = this.etat.t, h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
          texte(ctx, `Temps réel écoulé : ${h ? h + ' h ' : ''}${m} min ${String(Math.floor(s % 60)).padStart(2, '0')} s`, W / 2, 28, '#fff', 15);
          if (ua > 31) texte(ctx, 'Pour l’étoile la plus proche, il faudrait encore 4 ans et 3 mois…', W / 2, H - 24, '#ffd27a', 13);
        } else texte(ctx, 'Appuie sur « Lancer un éclair »', W / 2, 28, '#a9b3d1', 14);
      }
    }
  ];

  function afficher(id) {
    courant = demos.find(d => d.id === id) || demos[0];
    $('#demos').innerHTML = `<h2>🧪 Démonstrations</h2><p class="intro">Des expériences à manipuler pour comprendre le ciel par toi-même.</p>
      <div class="ligne" style="margin:14px 0">${demos.map(d => `<button class="btn petit" data-demo="${d.id}" aria-pressed="${d === courant}">${d.titre}</button>`).join('')}</div>
      <div class="demo"><canvas id="demo-canvas" aria-label="${echap(courant.titre)}"></canvas>
      <div class="carte"><h3>${courant.titre}</h3><p class="texte-2">${courant.texte}</p><div style="display:grid;gap:8px">${courant.controles()}</div></div></div>`;
    $$('#demos [data-demo]').forEach(b => b.onclick = () => afficher(b.dataset.demo));
    canvas = $('#demo-canvas');
    if (courant.init) courant.init();
    const feu = $('#d-feu'); if (feu) { feu.onclick = () => courant.tirer(); $('#d-eff').onclick = () => { courant.etat.tirs = []; }; courant.tirer(); }
    const reset = $('#d-reset'); if (reset) reset.onclick = () => courant.init();
    const flash = $('#d-flash'); if (flash) flash.onclick = () => { courant.etat.t = 0; };
    canvas.onclick = e => { if (courant.clic) { const r = canvas.getBoundingClientRect(); courant.clic(e.clientX - r.left, e.clientY - r.top, r.width, r.height); } };
    Bus.emettre('demo', courant.titre);
  }
  function boucle(t) {
    const dt = Math.min(0.05, (t - t0) / 1000); t0 = t;
    if (actif && canvas && canvas.isConnected) { const { ctx, w, h } = ajusterCanvas(canvas); courant.dessiner(ctx, w, h, dt); }
    requestAnimationFrame(boucle);
  }
  function init() { afficher('phases'); requestAnimationFrame(boucle); }
  return { init, afficher, activer: on => { actif = on; }, liste: demos.map(d => ({ id: d.id, titre: d.titre })) };
})();
