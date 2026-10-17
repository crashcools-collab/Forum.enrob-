// Petit moteur 3D maison (perspective, caméra en orbite) utilisé par le système solaire et l'univers.
class Camera3D {
  constructor({ yaw = -0.6, pitch = 0.45, dist = 40, fov = 50, min = 0.5, max = 5000 } = {}) {
    Object.assign(this, { yaw, pitch, dist, fov, min, max });
    this.cible = [0, 0, 0];
    this.W = 1; this.H = 1;
  }
  preparer(W, H) {
    this.W = W; this.H = H;
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch), cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    this.pos = [this.cible[0] + this.dist * cp * cy, this.cible[1] + this.dist * cp * sy, this.cible[2] + this.dist * sp];
    const f = [this.cible[0] - this.pos[0], this.cible[1] - this.pos[1], this.cible[2] - this.pos[2]];
    const n = Math.hypot(...f); this.F = f.map(v => v / n);
    const r = [this.F[1], -this.F[0], 0], nr = Math.hypot(...r) || 1; this.R = r.map(v => v / nr);
    this.U = [this.R[1] * this.F[2] - this.R[2] * this.F[1], this.R[2] * this.F[0] - this.R[0] * this.F[2], this.R[0] * this.F[1] - this.R[1] * this.F[0]];
    this.focale = (Math.max(W, H) / 2) / Math.tan(this.fov * Math.PI / 360);
  }
  // Retourne {x, y, z, k} (k = pixels par unité à cette profondeur) ou null si derrière la caméra
  projeter(p) {
    const d0 = p[0] - this.pos[0], d1 = p[1] - this.pos[1], d2 = p[2] - this.pos[2];
    const z = d0 * this.F[0] + d1 * this.F[1] + d2 * this.F[2];
    if (z < this.dist * 0.01 + 0.01) return null;
    const k = this.focale / z;
    return { x: this.W / 2 + (d0 * this.R[0] + d1 * this.R[1] + d2 * this.R[2]) * k, y: this.H / 2 - (d0 * this.U[0] + d1 * this.U[1] + d2 * this.U[2]) * k, z, k };
  }
  // Direction (dans le repère écran) d'un vecteur du monde
  versEcran(v) { return [v[0] * this.R[0] + v[1] * this.R[1] + v[2] * this.R[2], v[0] * this.U[0] + v[1] * this.U[1] + v[2] * this.U[2], v[0] * this.F[0] + v[1] * this.F[1] + v[2] * this.F[2]]; }
  brancher(el, surChangement, surClic) {
    gestesScene(el, {
      glisser: (dx, dy) => { this.yaw -= dx * 0.006; this.pitch = Math.max(-1.55, Math.min(1.55, this.pitch + dy * 0.006)); surChangement(); },
      zoomer: f => { this.dist = Math.max(this.min, Math.min(this.max, this.dist * f)); surChangement(); },
      cliquer: surClic
    });
  }
}

// Disque éclairé façon sphère : texture (canvas carré) + ombre selon la direction de la lumière
function dessinerSphere(ctx, x, y, r, texture, lumiere, vers) {
  // lumiere : vecteur unitaire (repère écran) de l'astre vers la source ; vers : (0,0,-1) vers la caméra
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.clip();
  if (texture) ctx.drawImage(texture, x - r, y - r, 2 * r, 2 * r);
  if (lumiere) {
    const cosI = -lumiere[2]; // angle de phase : lumière vs direction de la caméra
    const ang = Math.atan2(-lumiere[1], lumiere[0]);
    ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = 'rgba(2,3,10,.8)';
    ctx.beginPath(); ctx.arc(0, 0, r + 1, Math.PI / 2, 3 * Math.PI / 2, false);
    for (let k = -20; k <= 20; k++) { const yy = r * k / 20; ctx.lineTo(-cosI * Math.sqrt(Math.max(0, r * r - yy * yy)), yy); }
    ctx.closePath(); ctx.fill();
    const g = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)');
    ctx.fillStyle = g; ctx.fillRect(-r, -r, 2 * r, 2 * r);
  }
  ctx.restore();
}

// Textures dessinées à la main (sans aucun fichier externe)
const Textures = (() => {
  const cache = {};
  let graine = 7;
  const alea = () => { graine = (graine * 16807) % 2147483647; return (graine - 1) / 2147483646; };
  function creer(id) {
    const T = 256, c = document.createElement('canvas'); c.width = c.height = T;
    const g = c.getContext('2d'); graine = id.length * 7919 + id.charCodeAt(0);
    const fond = (couleur) => { g.fillStyle = couleur; g.fillRect(0, 0, T, T); };
    const taches = (n, couleur, rmin, rmax, aplati = 1) => { g.fillStyle = couleur; for (let i = 0; i < n; i++) { g.beginPath(); g.ellipse(alea() * T, alea() * T, rmin + alea() * (rmax - rmin), (rmin + alea() * (rmax - rmin)) * aplati, alea() * Math.PI, 0, 2 * Math.PI); g.fill(); } };
    const bandes = (couleurs) => { const h = T / couleurs.length; couleurs.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * h + Math.sin(i) * 2, T, h + 3); }); };
    switch (id) {
      case 'soleil': { const gr = g.createRadialGradient(T / 2, T / 2, 0, T / 2, T / 2, T / 2); gr.addColorStop(0, '#fffbe8'); gr.addColorStop(.7, '#ffd36b'); gr.addColorStop(1, '#ff9a2e'); g.fillStyle = gr; g.fillRect(0, 0, T, T); taches(260, 'rgba(255,150,40,.18)', 2, 6); break; }
      case 'mercure': fond('#9d978f'); taches(90, 'rgba(70,66,62,.35)', 2, 10); taches(40, 'rgba(210,205,195,.3)', 1, 5); break;
      case 'venus': fond('#e9d39a'); for (let i = 0; i < 14; i++) { g.strokeStyle = `rgba(${200 + alea() * 40},${170 + alea() * 30},110,.35)`; g.lineWidth = 6 + alea() * 14; g.beginPath(); g.moveTo(0, alea() * T); g.bezierCurveTo(T / 3, alea() * T, 2 * T / 3, alea() * T, T, alea() * T); g.stroke(); } break;
      case 'terre': fond('#1f5fae'); taches(16, '#3f7f3a', 14, 40); taches(10, '#8a7a4a', 8, 22); g.fillStyle = '#eef4ff'; g.fillRect(0, 0, T, 16); g.fillRect(0, T - 18, T, 18); taches(40, 'rgba(255,255,255,.55)', 6, 22, .35); break;
      case 'mars': fond('#c1623d'); taches(30, 'rgba(110,45,25,.45)', 8, 30, .5); taches(20, 'rgba(230,150,100,.35)', 5, 18); g.fillStyle = '#f4efe8'; g.beginPath(); g.ellipse(T / 2, 6, T / 4, 14, 0, 0, 2 * Math.PI); g.fill(); break;
      case 'jupiter': bandes(['#e9dcc4', '#c99b6d', '#efe3cf', '#b9825a', '#f2e8d6', '#d2a77c', '#efe3cf', '#a8754f', '#e9dcc4', '#c9a27a', '#eadfcb']); g.fillStyle = '#c4553a'; g.beginPath(); g.ellipse(T * .64, T * .64, 22, 12, 0, 0, 2 * Math.PI); g.fill(); taches(30, 'rgba(255,255,255,.15)', 3, 10, .4); break;
      case 'saturne': bandes(['#efe1b6', '#dcc58f', '#f3e7c4', '#d6bd86', '#ede0b8', '#cdb27c', '#efe1b6']); break;
      case 'uranus': { const gr = g.createLinearGradient(0, 0, 0, T); gr.addColorStop(0, '#bfeff3'); gr.addColorStop(1, '#8fd3de'); g.fillStyle = gr; g.fillRect(0, 0, T, T); break; }
      case 'neptune': bandes(['#4f74e0', '#3d63d1', '#5b80ea', '#3558c4', '#4a6fdc']); g.fillStyle = '#1d2f7a'; g.beginPath(); g.ellipse(T * .4, T * .58, 20, 11, 0, 0, 2 * Math.PI); g.fill(); break;
      case 'pluton': fond('#c9b49a'); taches(25, 'rgba(110,80,60,.4)', 6, 20); g.fillStyle = '#f3e9dc'; g.beginPath(); g.moveTo(T * .55, T * .78); g.bezierCurveTo(T * .2, T * .55, T * .38, T * .3, T * .55, T * .45); g.bezierCurveTo(T * .72, T * .3, T * .9, T * .55, T * .55, T * .78); g.fill(); break;
      case 'lune': fond('#b9b6ae'); taches(18, 'rgba(90,90,95,.45)', 10, 30); taches(70, 'rgba(230,228,220,.3)', 1, 5); break;
      default: fond('#888');
    }
    return c;
  }
  return { de: id => cache[id] || (cache[id] = creer(id)) };
})();
