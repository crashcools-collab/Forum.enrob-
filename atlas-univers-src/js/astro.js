// Moteur astronomique : temps sidéral, précession, planètes (éléments de Kepler JPL), Lune, Soleil,
// passage en coordonnées horizontales. Précision visée : quelques minutes d'arc (largement assez pour l'œil).
const Astro = (() => {
  const RAD = Math.PI / 180, DEG = 180 / Math.PI;
  const OBLIQUITE = 23.43928 * RAD;
  const norm360 = a => ((a % 360) + 360) % 360;

  const jourJulien = date => date.getTime() / 86400000 + 2440587.5;
  const siecles = jd => (jd - 2451545.0) / 36525;

  // Temps sidéral moyen de Greenwich (degrés)
  function tsmg(jd) {
    const d = jd - 2451545.0, T = d / 36525;
    return norm360(280.46061837 + 360.98564736629 * d + 0.000387933 * T * T);
  }

  // Matrice de précession J2000 -> équinoxe de la date (IAU 1976)
  function matricePrecession(jd) {
    const T = siecles(jd);
    const zeta = (2306.2181 * T + 0.30188 * T * T + 0.017998 * T * T * T) / 3600 * RAD;
    const z = (2306.2181 * T + 1.09468 * T * T + 0.018203 * T * T * T) / 3600 * RAD;
    const th = (2004.3109 * T - 0.42665 * T * T - 0.041833 * T * T * T) / 3600 * RAD;
    const cz = Math.cos(zeta), sz = Math.sin(zeta), cZ = Math.cos(z), sZ = Math.sin(z), ct = Math.cos(th), st = Math.sin(th);
    return [
      [cz * ct * cZ - sz * sZ, -sz * ct * cZ - cz * sZ, -st * cZ],
      [cz * ct * sZ + sz * cZ, -sz * ct * sZ + cz * cZ, -st * sZ],
      [cz * st, -sz * st, ct]
    ];
  }
  const mulMat = (A, B) => A.map(l => [0, 1, 2].map(j => l[0] * B[0][j] + l[1] * B[1][j] + l[2] * B[2][j]));
  const mulVec = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2], M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2], M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]];

  // Matrice J2000 équatorial -> horizontal (Nord, Est, Zénith) pour un lieu et un instant
  function matriceHorizon(jd, latDeg, lonDeg) {
    const lst = (tsmg(jd) + lonDeg) * RAD, phi = latDeg * RAD;
    const c = Math.cos(lst), s = Math.sin(lst), sp = Math.sin(phi), cp = Math.cos(phi);
    // rotation de -TSL autour de l'axe polaire, puis bascule vers l'horizon
    const rot = [[c, s, 0], [-s, c, 0], [0, 0, 1]]; // (x', y', z') avec y' vers l'est
    const hor = [[-sp, 0, cp], [0, 1, 0], [cp, 0, sp]];
    return mulMat(mulMat(hor, rot), matricePrecession(jd));
  }

  const versVecteur = (raDeg, decDeg) => {
    const a = raDeg * RAD, d = decDeg * RAD;
    return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
  };
  const versRaDec = v => {
    const r = Math.hypot(v[0], v[1], v[2]);
    return { ra: norm360(Math.atan2(v[1], v[0]) * DEG), dec: Math.asin(v[2] / r) * DEG };
  };
  const versAltAz = h => ({ alt: Math.asin(Math.max(-1, Math.min(1, h[2] / Math.hypot(h[0], h[1], h[2])))) * DEG, az: norm360(Math.atan2(h[1], h[0]) * DEG) });
  const eclVersEq = v => {
    const c = Math.cos(OBLIQUITE), s = Math.sin(OBLIQUITE);
    return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
  };

  // Éléments orbitaux JPL (Standish), valables 1800-2050 : a, e, I, L, ϖ, Ω et leurs dérivées par siècle
  const ELEMENTS = {
    mercure: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593, 0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
    venus: [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255, 0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
    terre: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0, 0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
    mars: [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
    jupiter: [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909, -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
    saturne: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448, -0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
    uranus: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503, -0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
    neptune: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574, 0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664],
    pluton: [39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684, -0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482]
  };

  function kepler(M, e) {
    let E = M + e * Math.sin(M);
    for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    return E;
  }

  // Position héliocentrique écliptique J2000 (UA) à partir d'éléments (a, e, i, Ω, ω, M en degrés)
  function positionOrbite(a, e, iDeg, OmDeg, omDeg, Mdeg) {
    const E = kepler(norm360(Mdeg) * RAD, e);
    const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const om = omDeg * RAD, Om = OmDeg * RAD, i = iDeg * RAD;
    const co = Math.cos(om), so = Math.sin(om), cO = Math.cos(Om), sO = Math.sin(Om), ci = Math.cos(i), si = Math.sin(i);
    return [
      (co * cO - so * sO * ci) * xp + (-so * cO - co * sO * ci) * yp,
      (co * sO + so * cO * ci) * xp + (-so * sO + co * cO * ci) * yp,
      (so * si) * xp + (co * si) * yp
    ];
  }

  function elementsPlanete(nom, jd) {
    const p = ELEMENTS[nom], T = siecles(jd);
    const a = p[0] + p[6] * T, e = p[1] + p[7] * T, I = p[2] + p[8] * T, L = p[3] + p[9] * T, w = p[4] + p[10] * T, O = p[5] + p[11] * T;
    return { a, e, i: I, Om: O, om: w - O, M: L - w };
  }
  function helio(nom, jd) {
    const el = elementsPlanete(nom, jd);
    return positionOrbite(el.a, el.e, el.i, el.Om, el.om, el.M);
  }

  // Comète de Halley (passage au périhélie le 9 février 1986)
  const HALLEY = { a: 17.834, e: 0.96714, i: 162.26, Om: 58.42, om: 111.33, tp: 2446470.5 };
  function helioHalley(jd) {
    const n = 0.9856076686 / Math.pow(HALLEY.a, 1.5);
    return positionOrbite(HALLEY.a, HALLEY.e, HALLEY.i, HALLEY.Om, HALLEY.om, n * (jd - HALLEY.tp));
  }

  // Lune géocentrique (écliptique de la date, km) – série courte, précision ~0,2°
  function lune(jd) {
    const d = jd - 2451545.0;
    const Lp = 218.316 + 13.176396 * d, Mp = (134.963 + 13.064993 * d) * RAD, F = (93.272 + 13.229350 * d) * RAD;
    const D = (297.850 + 12.190749 * d) * RAD, Ms = (357.529 + 0.98560028 * d) * RAD;
    const lon = Lp + 6.289 * Math.sin(Mp) - 1.274 * Math.sin(Mp - 2 * D) + 0.658 * Math.sin(2 * D) - 0.186 * Math.sin(Ms)
      - 0.059 * Math.sin(2 * Mp - 2 * D) - 0.057 * Math.sin(Mp - 2 * D + Ms) + 0.053 * Math.sin(Mp + 2 * D)
      + 0.046 * Math.sin(2 * D - Ms) + 0.041 * Math.sin(Mp - Ms) - 0.035 * Math.sin(D) - 0.031 * Math.sin(Mp + Ms)
      - 0.015 * Math.sin(2 * F - 2 * D) + 0.011 * Math.sin(Mp - 4 * D);
    const lat = 5.128 * Math.sin(F) + 0.2806 * Math.sin(Mp + F) + 0.2777 * Math.sin(Mp - F) + 0.1732 * Math.sin(2 * D - F);
    const dist = 385001 - 20905 * Math.cos(Mp) - 3699 * Math.cos(2 * D - Mp) - 2956 * Math.cos(2 * D);
    // La série donne des coordonnées de la date : on les ramène à J2000 (précession en longitude)
    const lonJ2000 = lon - 1.3970 * siecles(jd);
    const l = lonJ2000 * RAD, b = lat * RAD;
    return { ecl: [dist * Math.cos(b) * Math.cos(l), dist * Math.cos(b) * Math.sin(l), dist * Math.sin(b)], dist };
  }

  const PLANETES = [
    { id: 'mercure', nom: 'Mercure', rayon: 2440, couleur: '#b9b2a8' },
    { id: 'venus', nom: 'Vénus', rayon: 6052, couleur: '#f3e2b5' },
    { id: 'mars', nom: 'Mars', rayon: 3390, couleur: '#e0795a' },
    { id: 'jupiter', nom: 'Jupiter', rayon: 69911, couleur: '#e7caa0' },
    { id: 'saturne', nom: 'Saturne', rayon: 58232, couleur: '#ead9a6' },
    { id: 'uranus', nom: 'Uranus', rayon: 25362, couleur: '#a8dde6' },
    { id: 'neptune', nom: 'Neptune', rayon: 24622, couleur: '#6f8fe8' }
  ];

  // Magnitudes apparentes (formules de Mallama et Hilton 2018, simplifiées ; anneaux de Saturne ignorés)
  function magnitude(id, r, delta, i) {
    const base = 5 * Math.log10(r * delta);
    switch (id) {
      case 'mercure': return base - 0.613 + 6.328e-2 * i - 1.6336e-3 * i ** 2 + 3.3644e-5 * i ** 3 - 3.4265e-7 * i ** 4 + 1.6893e-9 * i ** 5 - 3.0334e-12 * i ** 6;
      case 'venus': return i < 163.7 ? base - 4.384 - 1.044e-3 * i + 3.687e-4 * i ** 2 - 2.814e-6 * i ** 3 + 8.938e-9 * i ** 4 : base + 236.05828 - 2.81914 * i + 8.39034e-3 * i ** 2;
      case 'mars': return base - 1.601 + 0.02267 * i - 0.0001302 * i ** 2;
      case 'jupiter': return base - 9.395 - 3.7e-4 * i + 6.16e-4 * i ** 2;
      case 'saturne': return base - 8.914 + 0.026 * i;
      case 'uranus': return base - 7.110 + 6.587e-3 * i;
      default: return base - 7.00;
    }
  }

  // Tous les astres mobiles pour un instant : vecteurs équatoriaux J2000 + infos
  function astresMobiles(jd) {
    const terre = helio('terre', jd);
    const res = [];
    const soleilGeo = terre.map(x => -x);
    res.push({ id: 'soleil', nom: 'Soleil', type: 'soleil', eq: eclVersEq(soleilGeo), distUA: Math.hypot(...terre), mag: -26.7 });
    for (const p of PLANETES) {
      const h = helio(p.id, jd), g = h.map((x, i) => x - terre[i]);
      const r = Math.hypot(...h), delta = Math.hypot(...g);
      const cosPhase = (r * r + delta * delta - Math.hypot(...terre) ** 2) / (2 * r * delta);
      const phase = Math.acos(Math.max(-1, Math.min(1, cosPhase))) * DEG;
      res.push({ ...p, type: 'planete', eq: eclVersEq(g), distUA: delta, rSoleil: r, phase, mag: magnitude(p.id, r, delta, phase) });
    }
    const L = lune(jd), eqL = eclVersEq(L.ecl);
    const elong = angle(eqL, eclVersEq(soleilGeo));
    res.push({ id: 'lune', nom: 'Lune', type: 'lune', eq: eqL, distKm: L.dist, elongation: elong, eclairement: (1 - Math.cos(elong * RAD)) / 2, mag: -12.7 + 0.026 * (180 - elong) });
    return res;
  }

  function angle(a, b) {
    const ca = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.hypot(...a) * Math.hypot(...b));
    return Math.acos(Math.max(-1, Math.min(1, ca))) * DEG;
  }

  // Âge de la Lune (jours depuis la nouvelle Lune) à partir de l'élongation et de son sens
  function infosLune(jd) {
    const L = lune(jd), terre = helio('terre', jd);
    const lonL = Math.atan2(L.ecl[1], L.ecl[0]) * DEG, lonS = Math.atan2(-terre[1], -terre[0]) * DEG;
    const ecart = norm360(lonL - lonS); // 0 = nouvelle, 180 = pleine
    const age = ecart / 360 * 29.530589;
    const eclairement = (1 - Math.cos(ecart * RAD)) / 2;
    let nom;
    if (ecart < 10 || ecart > 350) nom = 'Nouvelle Lune';
    else if (ecart < 80) nom = 'Premier croissant';
    else if (ecart < 100) nom = 'Premier quartier';
    else if (ecart < 170) nom = 'Lune gibbeuse croissante';
    else if (ecart < 190) nom = 'Pleine Lune';
    else if (ecart < 260) nom = 'Lune gibbeuse décroissante';
    else if (ecart < 280) nom = 'Dernier quartier';
    else nom = 'Dernier croissant';
    return { ecart, age, eclairement, nom, distKm: L.dist };
  }

  // Cherche les instants où l'écart Lune-Soleil passe par 0, 90, 180, 270° entre deux dates
  function phasesLune(jdDebut, jdFin) {
    const res = [], noms = ['Nouvelle Lune', 'Premier quartier', 'Pleine Lune', 'Dernier quartier'];
    const ecart = jd => infosLune(jd).ecart;
    let jd = jdDebut, prec = ecart(jd);
    while (jd < jdFin) {
      const jd2 = jd + 0.25, e2 = ecart(jd2);
      for (let k = 0; k < 4; k++) {
        const cible = k * 90;
        const a = norm360(prec - cible + 180) - 180, b = norm360(e2 - cible + 180) - 180;
        if (a < 0 && b >= 0) {
          let lo = jd, hi = jd2;
          for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (norm360(ecart(m) - cible + 180) - 180 < 0) lo = m; else hi = m; }
          res.push({ jd: (lo + hi) / 2, nom: noms[k], k });
        }
      }
      jd = jd2; prec = e2;
    }
    return res;
  }

  // Prochaines oppositions (planètes extérieures) et plus grandes élongations (Mercure, Vénus)
  function evenementsPlanetes(jdDebut, jours) {
    const evts = [];
    const elongation = (id, jd) => {
      const t = helio('terre', jd), h = helio(id, jd), g = h.map((x, i) => x - t[i]);
      return angle(g, t.map(x => -x));
    };
    for (const id of ['mercure', 'venus', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune']) {
      const interieure = id === 'mercure' || id === 'venus';
      let e0 = elongation(id, jdDebut - 1), e1 = elongation(id, jdDebut);
      for (let j = 1; j <= jours; j++) {
        const e2 = elongation(id, jdDebut + j);
        if (e1 > e0 && e1 >= e2) {
          if (!interieure && e1 > 170) evts.push({ jd: jdDebut + j - 1, id, type: 'opposition', valeur: e1 });
          if (interieure && e1 > 15) {
            const t = helio('terre', jdDebut + j - 1), h = helio(id, jdDebut + j - 1);
            const lonP = Math.atan2(h[1] - t[1], h[0] - t[0]), lonS = Math.atan2(-t[1], -t[0]);
            const est = norm360((lonP - lonS) * DEG) < 180;
            evts.push({ jd: jdDebut + j - 1, id, type: est ? 'élongation est (visible le soir)' : 'élongation ouest (visible le matin)', valeur: e1 });
          }
        }
        e0 = e1; e1 = e2;
      }
    }
    return evts.sort((a, b) => a.jd - b.jd);
  }

  // Lever, coucher et hauteur maximale d'un astre sur 24 h (balayage toutes les 10 min)
  function leverCoucher(fnVecteurEq, jdDebut, lat, lon, hauteurSeuil = -0.833) {
    let lever = null, coucher = null, max = -90, jdMax = null, prec = null;
    for (let i = 0; i <= 144; i++) {
      const jd = jdDebut + i / 144;
      const h = versAltAz(mulVec(matriceHorizon(jd, lat, lon), fnVecteurEq(jd))).alt;
      if (h > max) { max = h; jdMax = jd; }
      if (prec !== null) {
        if (prec < hauteurSeuil && h >= hauteurSeuil && lever === null) lever = jd - (h - hauteurSeuil) / (h - prec) / 144;
        if (prec >= hauteurSeuil && h < hauteurSeuil && coucher === null) coucher = jd - (h - hauteurSeuil) / (h - prec) / 144;
      }
      prec = h;
    }
    return { lever, coucher, max, jdMax };
  }

  const jdVersDate = jd => new Date((jd - 2440587.5) * 86400000);

  return { RAD, DEG, norm360, jourJulien, jdVersDate, tsmg, matriceHorizon, matricePrecession, mulVec, mulMat, versVecteur, versRaDec, versAltAz, eclVersEq,
    helio, helioHalley, elementsPlanete, positionOrbite, ELEMENTS, PLANETES, astresMobiles, lune, infosLune, phasesLune, evenementsPlanetes, leverCoucher, angle, HALLEY };
})();
if (typeof module !== 'undefined') module.exports = Astro;
