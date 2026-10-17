// Images explicatives dessinées en SVG (aucun fichier externe). Chaque schéma renvoie une chaîne SVG.
const Schemas = (() => {
  const svg = (w, h, contenu, titre) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${titre}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
    <defs>
      <radialGradient id="sg-soleil"><stop offset="0" stop-color="#fffbe8"/><stop offset=".6" stop-color="#ffd36b"/><stop offset="1" stop-color="#ff9a2e"/></radialGradient>
      <radialGradient id="sg-halo"><stop offset="0" stop-color="#ffd27a" stop-opacity=".6"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
      <radialGradient id="sg-terre" cx=".35" cy=".35"><stop offset="0" stop-color="#7fb6ff"/><stop offset="1" stop-color="#1f4f9e"/></radialGradient>
      <marker id="sg-fleche" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#a9b3d1"/></marker>
    </defs>${contenu}</svg>`;
  const t = (x, y, texte, { taille = 14, couleur = '#e8ecf8', ancre = 'middle', poids = 400 } = {}) => `<text x="${x}" y="${y}" fill="${couleur}" font-size="${taille}" text-anchor="${ancre}" font-weight="${poids}">${texte}</text>`;
  const fleche = (x1, y1, x2, y2, couleur = '#a9b3d1') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${couleur}" stroke-width="1.6" marker-end="url(#sg-fleche)"/>`;
  function tempRgb(T) {
    const s = T / 100; let r, g, b;
    if (s <= 66) { r = 255; g = 99.47 * Math.log(s) - 161.12; b = s <= 19 ? 0 : 138.52 * Math.log(s - 10) - 305.04; }
    else { r = 329.7 * Math.pow(s - 60, -0.1332); g = 288.12 * Math.pow(s - 60, -0.0755); b = 255; }
    const c = v => Math.round(Math.max(0, Math.min(255, v)));
    return `rgb(${c(r)},${c(g)},${c(b)})`;
  }
  // Lune vue depuis la Terre (hémisphère nord) pour une élongation e (0 = nouvelle, 180 = pleine)
  function lune(cx, cy, r, e) {
    const croissante = e <= 180, i = (croissante ? 180 - e : e - 180) * Math.PI / 180, sens = croissante ? 1 : -1;
    let d = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${croissante ? 1 : 0} ${cx} ${cy + r}`;
    for (let k = 20; k >= -20; k--) { const y = r * k / 20; d += ` L ${cx + sens * -Math.cos(i) * Math.sqrt(Math.max(0, r * r - y * y))} ${cy + y}`; }
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2b2f40"/><path d="${d} Z" fill="#f1eee2"/>`;
  }

  const S = {};
  S.phases = () => {
    const L = Astro.infosLune(Astro.jourJulien(new Date()));
    const auj = Math.round(L.ecart / 45) % 8;
    const noms = ['Nouvelle Lune', 'Premier croissant', 'Premier quartier', 'Gibbeuse croissante', 'Pleine Lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant'];
    const cx = 330, cy = 175, R = 118;
    let c = `<rect width="800" height="470" fill="#050814"/>`;
    for (let k = 0; k < 5; k++) c += fleche(20, 70 + k * 55, 120, 70 + k * 55, '#ffd27a');
    c += t(70, 50, 'Lumière du Soleil', { couleur: '#ffd27a', taille: 13 });
    c += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#2c3a6b" stroke-dasharray="4 5"/><circle cx="${cx}" cy="${cy}" r="26" fill="url(#sg-terre)"/>`;
    c += t(cx, cy + 46, 'Terre', { taille: 12, couleur: '#a9b3d1' });
    for (let k = 0; k < 8; k++) {
      const e = k * 45, a = (180 + e) * Math.PI / 180, x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
      c += `<circle cx="${x}" cy="${y}" r="14" fill="#2b2f40" ${k === auj ? 'stroke="#ffd27a" stroke-width="2.5"' : ''}/><path d="M ${x} ${y - 14} A 14 14 0 0 0 ${x} ${y + 14} Z" fill="#f1eee2"/>`;
      c += t(x + (Math.cos(a) * 30), y - Math.sin(a) * 30 + 4, k + 1, { taille: 12, couleur: '#a9b3d1' });
    }
    c += t(620, 60, 'La Lune est toujours', { taille: 15, poids: 600 }) + t(620, 80, 'à moitié éclairée.', { taille: 15, poids: 600 });
    c += t(620, 112, 'Selon sa place autour de la Terre,', { taille: 13, couleur: '#a9b3d1' }) + t(620, 130, 'nous voyons plus ou moins', { taille: 13, couleur: '#a9b3d1' }) + t(620, 148, 'de sa face éclairée.', { taille: 13, couleur: '#a9b3d1' });
    c += t(620, 190, `Aujourd’hui : ${L.nom}`, { taille: 14, couleur: '#ffd27a', poids: 600 }) + t(620, 210, `éclairée à ${Math.round(L.eclairement * 100)} %`, { taille: 13, couleur: '#ffd27a' });
    c += t(400, 352, 'Ce que l’on voit depuis la Terre (hémisphère nord)', { taille: 13, couleur: '#a9b3d1' });
    for (let k = 0; k < 8; k++) {
      const x = 55 + k * 98;
      c += lune(x, 395, 26, k * 45 === 0 ? 4 : k * 45);
      if (k === auj) c += `<circle cx="${x}" cy="395" r="32" fill="none" stroke="#ffd27a" stroke-width="2"/>`;
      const mots = noms[k].split(' ');
      c += t(x, 444, `${k + 1}. ${mots.slice(0, Math.ceil(mots.length / 2)).join(' ')}`, { taille: 11 }) + t(x, 459, mots.slice(Math.ceil(mots.length / 2)).join(' '), { taille: 11 });
    }
    return svg(800, 470, c, 'Les phases de la Lune');
  };

  S.saisons = () => {
    let c = `<rect width="800" height="420" fill="#050814"/><ellipse cx="400" cy="200" rx="300" ry="110" fill="none" stroke="#2c3a6b" stroke-dasharray="4 5"/>
      <circle cx="400" cy="200" r="70" fill="url(#sg-halo)"/><circle cx="400" cy="200" r="38" fill="url(#sg-soleil)"/>`;
    const terres = [[100, 200, '21 juin', 'Été au nord', 'Hiver au sud'], [400, 310, '20 mars', 'Printemps au nord', ''], [700, 200, '21 décembre', 'Hiver au nord', 'Été au sud'], [400, 90, '22 septembre', 'Automne au nord', '']];
    const inc = 23.4 * Math.PI / 180;
    for (const [x, y, date, l1, l2] of terres) {
      const versSoleil = Math.atan2(200 - y, 400 - x);
      const r = 26;
      c += `<circle cx="${x}" cy="${y}" r="${r}" fill="#1a2546"/>`;
      // moitié éclairée tournée vers le Soleil
      const a0 = versSoleil - Math.PI / 2, a1 = versSoleil + Math.PI / 2;
      c += `<path d="M ${x + r * Math.cos(a0)} ${y + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${x + r * Math.cos(a1)} ${y + r * Math.sin(a1)} Z" fill="url(#sg-terre)"/>`;
      const dx = Math.sin(inc) * 44, dy = Math.cos(inc) * 44;
      c += `<line x1="${x - dx}" y1="${y + dy}" x2="${x + dx}" y2="${y - dy}" stroke="#ff8fc8" stroke-width="2"/>`;
      c += `<line x1="${x - r}" y1="${y}" x2="${x + r}" y2="${y}" stroke="#ffffff55" stroke-dasharray="2 3" transform="rotate(${23.4} ${x} ${y})"/>`;
      const cote = y > 250 || y < 150;
      c += t(cote ? x + 52 : x, cote ? y - 4 : y + 64, date, { poids: 600, couleur: '#ffd27a', ancre: cote ? 'start' : 'middle' });
      c += t(cote ? x + 52 : x, cote ? y + 14 : y + 82, l1, { taille: 12, couleur: '#a9b3d1', ancre: cote ? 'start' : 'middle' });
      if (l2) c += t(x, y + 100, l2, { taille: 12, couleur: '#a9b3d1' });
    }
    c += t(400, 24, 'L’axe de la Terre (en rose) garde toujours la même inclinaison de 23,4°', { taille: 14, poids: 600 });
    c += t(400, 408, 'Ce n’est pas la distance au Soleil qui fait les saisons : c’est l’inclinaison.', { taille: 13, couleur: '#a9b3d1' });
    return svg(800, 420, c, 'Les saisons');
  };

  S.eclipses = () => {
    let c = `<rect width="800" height="430" fill="#050814"/>`;
    // éclipse de Soleil
    c += t(400, 28, 'Éclipse de Soleil : la Lune passe devant le Soleil (nouvelle Lune)', { poids: 600 });
    c += `<circle cx="70" cy="110" r="60" fill="url(#sg-soleil)"/><polygon points="70,50 560,108 560,112 70,170" fill="#ffd27a14"/>
      <polygon points="70,50 470,105 470,115 70,170" fill="none"/>
      <polygon points="400,100 590,112 400,120" fill="#000" opacity=".85"/><circle cx="400" cy="110" r="10" fill="#b9b6ae"/>
      <circle cx="640" cy="110" r="50" fill="url(#sg-terre)"/><ellipse cx="591" cy="112" rx="5" ry="7" fill="#000"/>`;
    c += fleche(560, 150, 594, 118) + t(560, 168, 'Ombre : éclipse totale', { taille: 12, couleur: '#a9b3d1' });
    c += t(70, 192, 'Soleil', { taille: 12, couleur: '#a9b3d1' }) + t(400, 140, 'Lune', { taille: 12, couleur: '#a9b3d1' }) + t(640, 182, 'Terre', { taille: 12, couleur: '#a9b3d1' });
    // éclipse de Lune
    c += t(400, 238, 'Éclipse de Lune : la Lune passe dans l’ombre de la Terre (pleine Lune)', { poids: 600 });
    c += `<circle cx="70" cy="320" r="60" fill="url(#sg-soleil)"/><circle cx="380" cy="320" r="45" fill="url(#sg-terre)"/>
      <polygon points="380,275 700,312 700,328 380,365" fill="#000" opacity=".8"/><polygon points="380,275 760,300 760,340 380,365" fill="#000" opacity=".35"/>
      <circle cx="660" cy="320" r="14" fill="#a8432a"/>`;
    c += t(380, 388, 'Terre', { taille: 12, couleur: '#a9b3d1' }) + t(660, 358, 'Lune rouge', { taille: 12, couleur: '#ff9a7a' });
    c += t(400, 416, 'La Lune devient rouge : l’atmosphère terrestre lui envoie la lumière de tous les couchers de Soleil.', { taille: 12, couleur: '#a9b3d1' });
    return svg(800, 430, c, 'Les éclipses');
  };

  S.vie = () => {
    const etape = (x, y, r, coul, l1, l2) => `<circle cx="${x}" cy="${y}" r="${r * 2.2}" fill="${coul}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r}" fill="${coul}"/>${t(x, y + Math.max(r, 12) + 22, l1, { taille: 12, poids: 600 })}${l2 ? t(x, y + Math.max(r, 12) + 38, l2, { taille: 11, couleur: '#a9b3d1' }) : ''}`;
    let c = `<rect width="800" height="430" fill="#050814"/>`;
    c += `<ellipse cx="80" cy="210" rx="60" ry="42" fill="#ff8fc8" opacity=".25"/><ellipse cx="70" cy="200" rx="34" ry="26" fill="#9a6bff" opacity=".35"/>` + t(80, 280, 'Nébuleuse', { taille: 12, poids: 600 }) + t(80, 296, 'nuage de gaz', { taille: 11, couleur: '#a9b3d1' });
    c += fleche(145, 190, 200, 120) + fleche(145, 230, 200, 300);
    c += t(470, 40, 'Étoile comme le Soleil (vie : environ 10 milliards d’années)', { taille: 13, couleur: '#ffd27a', poids: 600 });
    c += etape(240, 110, 14, '#ffe9a8', 'Étoile', 'type Soleil') + fleche(268, 110, 330, 110) + etape(400, 110, 34, '#ff8a4c', 'Géante rouge', '') + fleche(445, 110, 505, 110)
      + `<circle cx="570" cy="110" r="36" fill="none" stroke="#7be0c8" stroke-width="6" opacity=".7"/><circle cx="570" cy="110" r="4" fill="#fff"/>` + t(570, 168, 'Nébuleuse', { taille: 12, poids: 600 }) + t(570, 184, 'planétaire', { taille: 11, couleur: '#a9b3d1' })
      + fleche(612, 110, 680, 110) + etape(720, 110, 6, '#dfe8ff', 'Naine blanche', 'taille de la Terre');
    c += t(470, 250, 'Étoile massive, plus de 8 Soleils (vie : quelques millions d’années)', { taille: 13, couleur: '#8ab4ff', poids: 600 });
    c += etape(240, 310, 20, '#bcd4ff', 'Étoile', 'massive') + fleche(272, 310, 320, 310) + etape(390, 310, 44, '#ff6a3c', 'Supergéante', 'rouge') + fleche(440, 310, 495, 310);
    c += `<g transform="translate(560 310)">${Array.from({ length: 12 }, (_, k) => `<line x1="0" y1="0" x2="${Math.cos(k * Math.PI / 6) * 40}" y2="${Math.sin(k * Math.PI / 6) * 40}" stroke="#ffd27a" stroke-width="3"/>`).join('')}<circle r="16" fill="#fff6d8"/></g>` + t(560, 376, 'Supernova', { taille: 12, poids: 600 });
    c += fleche(605, 295, 680, 270) + fleche(605, 325, 680, 352);
    c += etape(718, 262, 5, '#c8e0ff', 'Étoile à neutrons', '') + `<circle cx="718" cy="360" r="12" fill="#000" stroke="#ff9a2e" stroke-width="3"/>` + t(718, 395, 'Trou noir', { taille: 12, poids: 600 });
    return svg(800, 430, c, 'La vie des étoiles');
  };

  S.hr = () => {
    const x0 = 80, x1 = 740, y0 = 40, y1 = 380, lT = v => Math.log10(v), Tmin = 2400, Tmax = 40000, Lmin = 1e-4, Lmax = 1e6;
    const X = T => x0 + (lT(Tmax) - lT(T)) / (lT(Tmax) - lT(Tmin)) * (x1 - x0), Y = L => y1 - (lT(L) - lT(Lmin)) / (lT(Lmax) - lT(Lmin)) * (y1 - y0);
    let c = `<rect width="800" height="440" fill="#050814"/>`;
    c += `<path d="M ${X(38000)} ${Y(3e5)} Q ${X(9000)} ${Y(60)} ${X(5800)} ${Y(1)} T ${X(2600)} ${Y(3e-4)}" stroke="#8ab4ff33" stroke-width="40" fill="none" stroke-linecap="round"/>`;
    c += t(X(15000), Y(2000) + 50, 'Séquence principale', { taille: 13, couleur: '#8ab4ff' });
    c += `<ellipse cx="${X(4300)}" cy="${Y(200)}" rx="70" ry="38" fill="#ff9a5c22"/>` + t(X(4300), Y(200) - 44, 'Géantes', { taille: 13, couleur: '#ffb070' });
    c += t(X(6000), Y(4e5) - 10, 'Supergéantes', { taille: 13, couleur: '#ffd27a' });
    c += `<ellipse cx="${X(15000)}" cy="${Y(0.01)}" rx="80" ry="26" fill="#dfe8ff18"/>` + t(X(15000), Y(0.01) + 44, 'Naines blanches', { taille: 13, couleur: '#dfe8ff' });
    const etoiles = [['Soleil', 5772, 1], ['Sirius A', 9940, 25, 10], ['Véga', 9600, 40, -6], ['Bételgeuse', 3600, 1e5, -8], ['Rigel', 12100, 1.2e5], ['Antarès', 3500, 7.5e4, 12], ['Aldébaran', 3900, 440, -4], ['Arcturus', 4300, 170, 8],
      ['Proxima', 3040, 0.0017], ['Sirius B', 25000, 0.056], ['Deneb', 8500, 1.9e5], ['Polaire', 6000, 1260], ['Spica', 25000, 2e4], ['Altaïr', 7700, 10.6], ['Barnard', 3130, 0.0035]];
    for (const [n, T, L, dy = 0] of etoiles) {
      const R = Math.sqrt(L) / Math.pow(T / 5772, 2), r = Math.max(2.5, Math.min(16, 5 + Math.log10(R) * 3.2));
      c += `<circle cx="${X(T)}" cy="${Y(L)}" r="${r}" fill="${tempRgb(T)}"/>` + t(X(T) + r + 4, Y(L) + 4 + dy, n, { taille: 11, ancre: 'start', couleur: n === 'Soleil' ? '#ffd27a' : '#e8ecf8' });
    }
    c += `<line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" stroke="#6f7aa0"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}" stroke="#6f7aa0"/>`;
    for (const T of [30000, 10000, 6000, 3000]) c += t(X(T), y1 + 18, `${nombre(T)} K`, { taille: 11, couleur: '#a9b3d1' });
    for (const L of [1e-4, 1e-2, 1, 1e2, 1e4, 1e6]) c += t(x0 - 8, Y(L) + 4, L >= 1 ? nombre(L) : String(L).replace('.', ','), { taille: 11, couleur: '#a9b3d1', ancre: 'end' });
    c += t(410, 425, 'Température de surface (les étoiles chaudes à gauche)', { taille: 12, couleur: '#a9b3d1' });
    c += `<text x="18" y="210" fill="#a9b3d1" font-size="12" text-anchor="middle" transform="rotate(-90 18 210)">Luminosité (Soleil = 1)</text>`;
    return svg(800, 440, c, 'Diagramme de Hertzsprung-Russell');
  };

  S.trounoir = () => {
    let c = `<rect width="800" height="400" fill="#050814"/>`;
    c += `<ellipse cx="400" cy="200" rx="250" ry="48" fill="none" stroke="#ff9a2e" stroke-width="16" opacity=".55"/><ellipse cx="400" cy="200" rx="200" ry="36" fill="none" stroke="#ffd27a" stroke-width="10" opacity=".6"/>`;
    c += `<circle cx="400" cy="200" r="92" fill="none" stroke="#ffd27a" stroke-width="3" opacity=".7"/><circle cx="400" cy="200" r="62" fill="#000" stroke="#ff9a2e33" stroke-width="2"/>`;
    c += `<path d="M 160 200 A 240 48 0 0 0 640 200" fill="none" stroke="#ffb35c" stroke-width="12" opacity=".7"/>`;
    c += `<path d="M 400 138 L 388 20 L 412 20 Z" fill="#8ab4ff" opacity=".45"/><path d="M 400 262 L 388 380 L 412 380 Z" fill="#8ab4ff" opacity=".45"/>`;
    c += fleche(560, 70, 452, 134) + t(600, 62, 'Sphère de photons', { taille: 13 }) + t(600, 78, 'la lumière y tourne en rond', { taille: 11, couleur: '#a9b3d1' });
    c += fleche(210, 80, 360, 170) + t(170, 64, 'Horizon des événements', { taille: 13 }) + t(170, 80, 'point de non-retour', { taille: 11, couleur: '#a9b3d1' });
    c += fleche(690, 270, 630, 222) + t(700, 290, 'Disque d’accrétion', { taille: 13 }) + t(700, 306, 'matière à des millions de degrés', { taille: 11, couleur: '#a9b3d1' });
    c += t(470, 30, 'Jets de particules', { taille: 13, ancre: 'start', couleur: '#8ab4ff' });
    c += t(400, 392, 'Ce que l’Event Horizon Telescope a photographié : l’ombre (au centre) entourée de l’anneau lumineux.', { taille: 12, couleur: '#a9b3d1' });
    return svg(800, 400, c, 'Anatomie d’un trou noir');
  };

  S.polaire = () => {
    const cx = 400, cy = 205, k = 6.8, LST = 100;
    const P = (ra, dec) => { const r = (90 - dec) * k, a = (ra - LST) * Math.PI / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
    const ourse = [[165.93, 61.75], [165.46, 56.38], [178.46, 53.69], [183.86, 57.03], [193.51, 55.96], [200.98, 54.93], [206.89, 49.31]];
    const petite = [[37.95, 89.26], [263.05, 86.59], [251.49, 82.04], [236.01, 77.79], [244.38, 75.76], [230.18, 71.83], [222.68, 74.16]];
    const cassio = [[2.29, 59.15], [10.13, 56.54], [14.18, 60.72], [21.45, 60.24], [28.6, 63.67]];
    const ligne = (pts, coul) => `<polyline points="${pts.map(p => P(...p).join(',')).join(' ')}" fill="none" stroke="${coul}" stroke-width="1.6"/>`;
    const points = (pts, r = 4) => pts.map(p => { const [x, y] = P(...p); return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`; }).join('');
    let c = `<rect width="800" height="420" fill="#050814"/>`;
    c += ligne([...ourse.slice(0, 4), ourse[0]], '#8ab4ff88') + ligne(ourse.slice(3), '#8ab4ff88') + points(ourse);
    c += ligne([...petite.slice(0, 5), petite[5], petite[6], petite[3]], '#8ab4ff55') + points(petite.slice(1), 2.5);
    c += ligne(cassio, '#ff8fc888') + points(cassio, 3.5);
    const [mx, my] = P(...ourse[1]), [dx, dy] = P(...ourse[0]), [px, py] = P(37.95, 89.26);
    c += `<line x1="${mx}" y1="${my}" x2="${px + (dx - px) * 0.08}" y2="${py + (dy - py) * 0.08}" stroke="#ffd27a" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#sg-fleche)"/>`;
    c += `<circle cx="${px}" cy="${py}" r="7" fill="#fff"/><circle cx="${px}" cy="${py}" r="14" fill="none" stroke="#ffd27a" stroke-width="2"/>`;
    c += t(px, py - 22, 'Étoile Polaire', { poids: 700, couleur: '#ffd27a' }) + t(px, py + 32, 'NORD', { taille: 12, couleur: '#ffd27a' });
    const [ox, oy] = P(190, 47); c += t(ox, oy + 30, 'Grande Ourse (la casserole)', { taille: 13, couleur: '#8ab4ff' });
    const [kx, ky] = P(14, 52); c += t(kx, ky + 26, 'Cassiopée (le W)', { taille: 13, couleur: '#ff8fc8' });
    c += t(400, 405, 'Prolonge environ 5 fois l’écart entre Merak et Dubhe : tu arrives sur la Polaire.', { taille: 13, couleur: '#a9b3d1' });
    return svg(800, 420, c, 'Trouver l’étoile Polaire');
  };

  S.hubble = () => {
    const spirale = (x, y, s, barre, ouvert) => {
      let d = '';
      for (const sg of [1, -1]) { d += `M ${x + (barre ? sg * 12 * s : 0)} ${y}`; for (let k = 0; k <= 30; k++) { const th = k / 30 * Math.PI * (1.6 - ouvert * 0.3), r = (barre ? 12 : 4) * s + k * (0.9 + ouvert * 0.5) * s; d += ` L ${x + sg * r * Math.cos(th)} ${y + sg * r * Math.sin(th) * 0.55}`; } }
      return `<ellipse cx="${x}" cy="${y}" rx="${(barre ? 13 : 9) * s}" ry="${6 * s}" fill="#ffe2a8"/><path d="${d}" stroke="#bcd4ff" stroke-width="${3 * s}" fill="none" opacity=".85" stroke-linecap="round"/>${barre ? `<rect x="${x - 14 * s}" y="${y - 2.5 * s}" width="${28 * s}" height="${5 * s}" fill="#ffe2a8"/>` : ''}`;
    };
    let c = `<rect width="800" height="380" fill="#050814"/>`;
    for (const [x, e, n] of [[70, 1, 'E0'], [160, 0.7, 'E3'], [245, 0.4, 'E7']]) c += `<ellipse cx="${x}" cy="190" rx="34" ry="${34 * e}" fill="#ffd9a0" opacity=".85"/>` + t(x, 250, n, { taille: 12, couleur: '#a9b3d1' });
    c += `<ellipse cx="340" cy="190" rx="38" ry="12" fill="#ffd9a0"/>` + t(340, 250, 'S0', { taille: 12, couleur: '#a9b3d1' });
    c += fleche(385, 180, 440, 110) + fleche(385, 200, 440, 270);
    [[480, 'Sa', 0], [600, 'Sb', 1], [720, 'Sc', 2]].forEach(([x, n, o]) => { c += spirale(x, 95, 1, false, o) + t(x, 150, n, { taille: 12, couleur: '#a9b3d1' }); });
    [[480, 'SBa', 0], [600, 'SBb', 1], [720, 'SBc', 2]].forEach(([x, n, o]) => { c += spirale(x, 285, 1, true, o) + t(x, 345, n, { taille: 12, couleur: '#a9b3d1' }); });
    c += t(160, 60, 'Elliptiques', { poids: 600, couleur: '#ffd9a0' }) + t(160, 78, 'vieilles étoiles, peu de gaz', { taille: 11, couleur: '#a9b3d1' });
    c += t(600, 30, 'Spirales', { poids: 600, couleur: '#bcd4ff' }) + t(600, 372, 'Spirales barrées (comme la Voie lactée)', { poids: 600, couleur: '#bcd4ff', taille: 13 });
    c += t(160, 300, 'Lenticulaires (S0) : entre les deux', { taille: 11, couleur: '#a9b3d1' }) + t(160, 318, 'Irrégulières : sans forme (Nuages de Magellan)', { taille: 11, couleur: '#a9b3d1' });
    return svg(800, 380, c, 'La classification des galaxies');
  };

  S.chrono = () => {
    let c = `<rect width="800" height="400" fill="#050814"/>`;
    c += `<path d="M 40 200 C 120 170 200 120 760 60 L 760 340 C 200 280 120 230 40 200 Z" fill="#9a6bff18" stroke="#9a6bff55"/>`;
    const evts = [[40, 'Big Bang', '0', -1], [70, 'Univers transparent', '380 000 ans', 1], [200, 'Premières étoiles', '≈ 150 millions d’années', -1], [300, 'Galaxies vues par Webb', '≈ 300 millions d’années', 1],
      [520, 'Naissance du Soleil', '9,2 milliards d’années', -1], [580, 'Premières traces de vie', '≈ 10 milliards d’années', 1], [745, 'Aujourd’hui', '13,8 milliards d’années', -1]];
    for (const [x, n, d, s] of evts) {
      const y = s < 0 ? 95 : 320;
      c += `<line x1="${x}" y1="200" x2="${x}" y2="${s < 0 ? 120 : 290}" stroke="#a9b3d1" stroke-dasharray="3 3"/><circle cx="${x}" cy="200" r="5" fill="#ffd27a"/>`;
      const an = x < 100 ? 'start' : x > 700 ? 'end' : 'middle', xt = x < 100 ? x - 4 : x;
      c += t(xt, y - (s < 0 ? 0 : -6), n, { taille: 12, poids: 600, ancre: an }) + t(xt, y + (s < 0 ? 16 : 22), d, { taille: 11, couleur: '#a9b3d1', ancre: an });
    }
    for (let i = 0; i < 40; i++) { const x = 180 + Math.random() * 560, y = 200 + (Math.random() - 0.5) * (40 + (x - 40) * 0.32); c += `<circle cx="${x}" cy="${y}" r="${1 + Math.random() * 1.5}" fill="#e8ecf8" opacity=".6"/>`; }
    c += t(400, 30, 'L’univers grandit et se refroidit depuis 13,8 milliards d’années', { poids: 600 });
    c += t(400, 388, 'Les premiers millions d’années sont agrandis à gauche ; toute l’histoire humaine tient dans le dernier pixel à droite.', { taille: 12, couleur: '#a9b3d1' });
    return svg(800, 400, c, 'Chronologie de l’univers');
  };

  S.spectre = () => {
    const bandes = [['Radio', '#6f7aa0', 'radiotélescopes', true], ['Micro-ondes', '#7a6fb0', 'Planck', false], ['Infrarouge', '#b0506a', 'James Webb', false], ['Visible', null, 'tes yeux, Hubble', true], ['Ultraviolet', '#8a5cff', 'Hubble', false], ['Rayons X', '#5c8aff', 'Chandra', false], ['Gamma', '#5cd0ff', 'Fermi', false]];
    let c = `<rect width="800" height="330" fill="#050814"/><defs><linearGradient id="sg-arc"><stop offset="0" stop-color="#ff0000"/><stop offset=".2" stop-color="#ff8800"/><stop offset=".4" stop-color="#ffee00"/><stop offset=".6" stop-color="#00cc44"/><stop offset=".8" stop-color="#0066ff"/><stop offset="1" stop-color="#8800ff"/></linearGradient></defs>`;
    let d = 'M 20 110'; for (let x = 20; x <= 780; x += 2) { const f = 0.02 + Math.pow((x - 20) / 760, 2.2) * 0.9; d += ` L ${x} ${110 + Math.sin((x - 20) * f) * 22}`; }
    c += `<path d="${d}" stroke="#a9b3d1" fill="none" stroke-width="1.6"/>`;
    bandes.forEach(([n, coul, tel, passe], i) => {
      const x = 20 + i * 108.6;
      c += `<rect x="${x}" y="150" width="106" height="40" rx="6" fill="${coul || 'url(#sg-arc)'}"/>` + t(x + 53, 175, n, { taille: 13, poids: 600, couleur: '#fff' });
      c += t(x + 53, 214, tel, { taille: 11, couleur: '#a9b3d1' });
      c += t(x + 53, 245, passe ? '✔ traverse l’air' : '✘ bloqué par l’air', { taille: 11, couleur: passe ? '#7be0a6' : '#ff7a7a' });
    });
    c += t(20, 60, 'Grandes longueurs d’onde, faible énergie', { taille: 12, couleur: '#a9b3d1', ancre: 'start' }) + t(780, 60, 'Petites longueurs d’onde, forte énergie', { taille: 12, couleur: '#a9b3d1', ancre: 'end' });
    c += t(400, 30, 'Nos yeux ne voient qu’une toute petite partie de la lumière', { poids: 600 });
    c += t(400, 290, 'Pour voir les rayonnements bloqués par l’atmosphère, il faut envoyer les télescopes dans l’espace.', { taille: 12, couleur: '#a9b3d1' });
    return svg(800, 330, c, 'Le spectre de la lumière');
  };

  S.telescopes = () => {
    let c = `<rect width="800" height="380" fill="#050814"/>`;
    c += t(200, 30, 'Lunette (réfracteur)', { poids: 600 }) + t(600, 30, 'Télescope de Newton (réflecteur)', { poids: 600 });
    c += `<rect x="60" y="120" width="260" height="60" rx="6" fill="#131c36" stroke="#24305a"/><ellipse cx="70" cy="150" rx="8" ry="34" fill="#8ab4ff66" stroke="#8ab4ff"/><rect x="320" y="140" width="40" height="20" fill="#24305a"/>`;
    for (const y of [124, 150, 176]) c += `<line x1="10" y1="${y}" x2="70" y2="${y}" stroke="#ffd27a" stroke-width="1.4"/><line x1="70" y1="${y}" x2="330" y2="150" stroke="#ffd27a" stroke-width="1.4"/>`;
    c += t(70, 210, 'Lentille', { taille: 12, couleur: '#a9b3d1' }) + t(345, 185, 'Oculaire', { taille: 12, couleur: '#a9b3d1' });
    c += t(200, 250, 'Image nette et contrastée,', { taille: 12, couleur: '#a9b3d1' }) + t(200, 266, 'idéale pour la Lune et les planètes.', { taille: 12, couleur: '#a9b3d1' });
    c += `<rect x="440" y="110" width="300" height="80" rx="6" fill="#131c36" stroke="#24305a"/><path d="M 740 110 Q 728 150 740 190" stroke="#8ab4ff" stroke-width="4" fill="none"/>
      <line x1="490" y1="138" x2="510" y2="158" stroke="#8ab4ff" stroke-width="4"/><rect x="490" y="80" width="20" height="30" fill="#24305a"/>`;
    for (const y of [118, 150, 182]) c += `<line x1="400" y1="${y}" x2="735" y2="${y}" stroke="#ffd27a" stroke-width="1.2"/><line x1="735" y1="${y}" x2="502" y2="148" stroke="#ffd27a" stroke-width="1.2"/>`;
    c += `<line x1="500" y1="148" x2="500" y2="84" stroke="#ffd27a" stroke-width="1.6"/>`;
    c += t(745, 212, 'Miroir principal', { taille: 12, couleur: '#a9b3d1', ancre: 'end' }) + t(520, 72, 'Oculaire', { taille: 12, couleur: '#a9b3d1', ancre: 'start' }) + t(505, 212, 'Petit miroir', { taille: 12, couleur: '#a9b3d1' });
    c += t(600, 250, 'Plus de diamètre pour le même prix :', { taille: 12, couleur: '#a9b3d1' }) + t(600, 266, 'parfait pour les galaxies et nébuleuses.', { taille: 12, couleur: '#a9b3d1' });
    c += t(400, 330, 'Ce qui compte, c’est le diamètre : il fixe la lumière captée et la finesse des détails.', { taille: 13, poids: 600, couleur: '#ffd27a' });
    c += t(400, 352, 'Grossissement utile maximal ≈ 2 × le diamètre en mm (par exemple 300 fois pour 150 mm).', { taille: 12, couleur: '#a9b3d1' });
    return svg(800, 380, c, 'Lunettes et télescopes');
  };

  S.tailles = () => {
    const pl = [['Mercure', 2440, '#b9b2a8'], ['Vénus', 6052, '#f3e2b5'], ['Terre', 6371, '#6aa6ff'], ['Mars', 3390, '#e0795a'], ['Jupiter', 69911, '#e7caa0'], ['Saturne', 58232, '#ead9a6'], ['Uranus', 25362, '#a8dde6'], ['Neptune', 24622, '#6f8fe8'], ['Pluton', 1188, '#d8c4a8']];
    const k = 1 / 1050; let x = 70, petit = 0;
    let c = `<rect width="800" height="300" fill="#050814"/><circle cx="${70 - 696000 * k}" cy="150" r="${696000 * k}" fill="url(#sg-soleil)"/>` + t(8, 292, 'Soleil (bord)', { taille: 12, poids: 600, ancre: 'start', couleur: '#fff' });
    for (const [n, r, coul] of pl) {
      const R = r * k; x += Math.max(R, 3) + 14;
      if (n === 'Saturne') c += `<ellipse cx="${x}" cy="150" rx="${R * 2.2}" ry="${R * 0.5}" fill="none" stroke="#e8d7a0" stroke-width="5" opacity=".7"/>`;
      c += `<circle cx="${x}" cy="150" r="${Math.max(R, 1.2)}" fill="${coul}"/>` + t(x, R > 20 ? 240 : R > 10 ? 190 : 176 + (petit++ % 2) * 18, n, { taille: 11 });
      x += Math.max(R, 3) + (n === 'Saturne' ? 40 : 4);
    }
    c += t(420, 30, 'Les tailles sont à l’échelle (pas les distances)', { poids: 600 });
    return svg(800, 300, c, 'Tailles comparées des planètes');
  };

  S.soleil = () => {
    let c = `<rect width="800" height="420" fill="#050814"/>`;
    c += `<circle cx="300" cy="210" r="200" fill="url(#sg-halo)"/><circle cx="300" cy="210" r="170" fill="#ffb347"/>
      <path d="M 300 210 L 300 40 A 170 170 0 0 1 470 210 Z" fill="#050814"/>
      <path d="M 300 210 L 300 40 A 170 170 0 0 1 470 210 Z" fill="#ff8a2e" opacity=".9"/>
      <path d="M 300 210 L 300 75 A 135 135 0 0 1 435 210 Z" fill="#ffb347"/>
      <path d="M 300 210 L 300 155 A 55 55 0 0 1 355 210 Z" fill="#fff4c8"/>
      <path d="M 120 120 q -40 -50 10 -70 q 30 30 0 60" fill="none" stroke="#ff6a3c" stroke-width="6" opacity=".8"/>
      <circle cx="220" cy="280" r="9" fill="#7a3a10"/><circle cx="236" cy="290" r="5" fill="#7a3a10"/>`;
    const lib = (x, y, x2, y2, l1, l2) => fleche(x, y, x2, y2) + t(x + 6, y - 6, l1, { taille: 13, ancre: 'start', poids: 600 }) + t(x + 6, y + 10, l2, { taille: 11, ancre: 'start', couleur: '#a9b3d1' });
    c += lib(540, 120, 340, 195, 'Cœur', '15 millions °C : fusion nucléaire');
    c += lib(560, 180, 400, 175, 'Zone radiative', 'la lumière met des milliers d’années à la traverser');
    c += lib(560, 250, 455, 150, 'Zone convective', 'le gaz bout comme une soupe');
    c += lib(560, 320, 455, 280, 'Photosphère', 'la « surface », 5 500 °C');
    c += lib(560, 380, 242, 288, 'Taches solaires', 'zones plus froides, magnétiques');
    c += t(110, 40, 'Protubérance', { taille: 12, couleur: '#ff9a7a' }) + t(300, 410, 'Autour : la couronne, à plus d’un million de degrés, visible pendant les éclipses totales.', { taille: 12, couleur: '#a9b3d1' });
    return svg(800, 420, c, 'L’intérieur du Soleil');
  };

  const liste = { phases: 'Les phases de la Lune', saisons: 'Les saisons', eclipses: 'Les éclipses', vie: 'La vie des étoiles', hr: 'Couleurs et luminosités des étoiles', trounoir: 'Anatomie d’un trou noir',
    polaire: 'Trouver le nord', hubble: 'Les formes des galaxies', chrono: 'Histoire de l’univers', spectre: 'Le spectre de la lumière', telescopes: 'Lunettes et télescopes', tailles: 'Les planètes à l’échelle', soleil: 'L’intérieur du Soleil' };
  return { dessiner: id => S[id] ? S[id]() : '', liste };
})();
