// Construit le site multi-pages de l'Académie IA à partir des sources (données + moteur).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const PARTS = path.join(HERE, 'sources');
const OUT = process.argv[2] || path.join(HERE, '..', 'academie-ia');
const rd = f => fs.readFileSync(path.join(PARTS, f), 'utf8');

/* ---------- 1. Charger toutes les données ---------- */
const DATA_FILES = ['03a-cours.js','03b-cours.js','03c-histoire.js','03d1-encyclo.js','03d2-encyclo.js','03e-cours.js','03f-cours.js','03g-ressources.js','03h-cours.js','03i-encyclo.js','03j-cours.js','03k-programmes.js','03l-api.js','04-tools.js','05-prompts.js','06-misc.js','06b-extra.js','06c-extra.js','06d-extra.js'];
const NAMES = ['COURS','HIST','HIST_CATS','MAJ','ETAT','TENDANCES','ENCYCLO','ENCYCLO_PARTS','NIVEAUX','NIV_COURS','NIV_ENC','PILE','RES_CATS','RESSOURCES','TOOL_CATS','TOOLS','PR_CATS','PROMPTS','MODULES','BA','TECHS','MASTERS','QUIZ','GLOSS','PLAN','SECCHECK'];
const D = vm.runInNewContext(DATA_FILES.map(rd).join('\n') + '\n;({' + NAMES.join(',') + '})', {}, {filename:'donnees.js'});

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const fmtDate = ev => { if (ev.s) return ev.s; const [y, m, d] = ev.d.split('-').map(Number); return (d === 1 ? '1er' : d) + ' ' + MOIS[m - 1] + ' ' + y; };

D.HIST.sort((a, b) => a.d.localeCompare(b.d));
// Chapitre « Les dates clés » de chaque cours, tiré de la chronologie
D.COURS.forEach(c => {
  if (!c.hk) return;
  const evs = D.HIST.filter(e => c.hk.includes(e.a) || c.hk.some(k => e.t.includes(k)));
  if (!evs.length) return;
  c.ch.push({t:'Les dates clés, jusqu\'au ' + D.MAJ, h:'<p>Tout ce qui s\'est passé pour ' + esc(c.n) + ', dans l\'ordre. La chronologie complète est dans la page Histoire de l\'IA.</p><div class="tl">' +
    D.HIST.filter(e => evs.includes(e)).map(e => '<div class="ev c-' + e.c + '"><span class="dt">' + esc(fmtDate(e)) + '</span><div><b>' + esc(e.t) + '</b><p>' + esc(e.w) + '</p></div></div>').join('') + '</div>'});
  delete c.hk;
});

/* ---------- 2. Pages ---------- */
const PAGE_LIST = [
  {v:'accueil', f:'index.html', t:'Accueil & tableau de bord', ic:'00', data:[]},
  {v:'niveaux', f:'niveaux.html', t:'Parcours par niveau', ic:'01', data:[]},
  {v:'bases', f:'fondamentaux.html', t:'Les fondamentaux', ic:'02', data:['fond']},
  {v:'encyclo', f:'encyclopedie.html', t:'Encyclopédie de l\'IA', ic:'03', data:['encyclo']},
  {v:'pile', f:'pile.html', t:'La pile de l\'IA', ic:'04', data:['pile']},
  {v:'histoire', f:'histoire.html', t:'Histoire de l\'IA', ic:'05', data:['histoire']},
  {v:'cours', f:'cours.html', t:'Cours complets', ic:'06', data:['cours']},
  {v:'outils', f:'outils.html', t:'Panorama des IA', ic:'07', data:['outils']},
  {v:'methode', f:'methode.html', t:'Méthode de prompt', ic:'08', data:['methode']},
  {v:'maitre', f:'prompt-maitre.html', t:'Prompt maître', ic:'09', data:['methode']},
  {v:'atelier', f:'atelier.html', t:'Atelier interactif', ic:'10', data:['methode']},
  {v:'biblio', f:'bibliotheque.html', t:'Bibliothèque de prompts', ic:'11', data:['prompts']},
  {v:'ressources', f:'ressources.html', t:'GitHub, Hugging Face & cours', ic:'12', data:['ressources']},
  {v:'quiz', f:'quiz.html', t:'Quiz final', ic:'13', data:['quiz']},
  {sep:true},
  {v:'glossaire', f:'glossaire.html', t:'Glossaire', ic:'A–Z', data:['gloss']},
  {v:'securite', f:'securite.html', t:'Sécurité & règles', ic:'!', data:['fond']},
  {v:'recherche', f:'recherche.html', t:'Recherche', ic:'⌕', data:['recherche']}
];
const PAGES = Object.fromEntries(PAGE_LIST.filter(p => !p.sep).map(p => [p.v, p.f]));

/* ---------- 3. Contenu HTML de chaque section ---------- */
const head = rd('01-head.html'), body = rd('02-body.html');
let css = head.slice(head.indexOf('<style>') + 7, head.indexOf('</style>'));
css += `
/* ===== Site multi-pages ===== */
a.card,a.step,a.niv-item,a.sr{color:inherit;text-decoration:none}
.nav a.active{background:var(--orange);color:var(--on-accent)}
.topbar{flex-wrap:wrap}
.topbar form{flex:1;max-width:380px;min-width:180px;display:flex;gap:6px}
.topbar form input{padding:8px 12px;font-size:13.5px}
.sr{display:flex;flex-direction:column;gap:6px}
.sr .chip{align-self:flex-start}
mark{background:rgba(255,196,0,.32);color:var(--txt);border-radius:3px;padding:0 2px}
@media (max-width:900px){.topbar form{max-width:none;flex-basis:100%}}
`;
const sections = {};
body.replace(/<section class="view[^"]*" id="v-(\w+)">([\s\S]*?)<\/section>/g, (m, id, inner) => { sections[id] = inner; return m; });
sections.recherche = `
    <p class="lead">Cherche dans toute la formation : modules, encyclopédie, chapitres de cours, histoire, outils, prompts, ressources et glossaire.</p>
    <div class="toolbar" style="margin-top:16px"><input type="search" id="sQ" placeholder="Ex. : agent, GPU, Cursor, 2012, LoRA…" aria-label="Chercher dans toute la formation"><span class="count" id="sCount"></span></div>
    <div class="stack" id="sRes" style="margin-top:14px"></div>`;
for (const k in sections) {
  sections[k] = sections[k]
    .replace(/<button class="([^"]+)" data-go="(\w+)">([^<]+)<\/button>/g, (m, cls, v, label) => '<a class="' + cls + '" href="' + PAGES[v] + '">' + label + '</a>')
    .replace(/<b class="small" id="pgTxt2"/, '<b class="small" data-pg-txt').replace('<i id="pgBar2">', '<i data-pg-bar>');
}
const missing = PAGE_LIST.filter(p => !p.sep && !sections[p.v]).map(p => p.v);
if (missing.length) throw new Error('Sections introuvables : ' + missing);

/* ---------- 4. Fichiers de données ---------- */
const J = v => JSON.stringify(v);
const decl = obj => Object.entries(obj).map(([k, v]) => 'const ' + k + ' = ' + J(v) + ';').join('\n') + '\n';
const strip = h => String(h).replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

const PATH = [
  {v:'niveaux', t:'Choisir son niveau', d:'Du novice à l\'expert : la liste de ce qu\'il faut apprendre, dans l\'ordre.'},
  {v:'bases', t:'Les fondamentaux', d:'Comprendre comment fonctionne une IA, ses forces et ses pièges.'},
  {v:'encyclo', t:'Encyclopédie de l\'IA', d:D.ENCYCLO.length + ' chapitres, du neurone aux grands débats.'},
  {v:'pile', t:'La pile de l\'IA', d:'Des puces jusqu\'aux applications : tout ce qu\'il y a en dessous et au-dessus.'},
  {v:'histoire', t:'Histoire de l\'IA', d:D.HIST.length + ' événements datés, de 1943 au ' + D.MAJ + '.'},
  {v:'cours', t:'Cours complets', d:D.COURS.length + ' cours, des assistants à la construction d\'agents.'},
  {v:'outils', t:'Panorama des IA', d:D.TOOLS.length + ' outils majeurs, classés par usage.'},
  {v:'methode', t:'Méthode de prompt', d:'Les 7 blocs et 12 techniques pour des résultats fiables.'},
  {v:'maitre', t:'Prompt maître', d:'Les prompts professionnels qui fabriquent tous les autres.'},
  {v:'atelier', t:'Atelier interactif', d:'Générer et noter tes propres prompts.'},
  {v:'biblio', t:'Bibliothèque', d:D.PROMPTS.length + ' prompts prêts à copier.'},
  {v:'ressources', t:'GitHub, Hugging Face & cours', d:D.RESSOURCES.length + ' ressources triées par thème et par niveau.'},
  {v:'quiz', t:'Quiz final', d:D.QUIZ.length + ' questions pour valider la formation.'}
];
const RES_PAR_NIV = {}; D.RESSOURCES.forEach(r => RES_PAR_NIV[r.v] = (RES_PAR_NIV[r.v] || 0) + 1);
const META = {
  MAJ:D.MAJ, PAGES, PATH, NIVEAUX:D.NIVEAUX, NIV_COURS:D.NIV_COURS, NIV_ENC:D.NIV_ENC,
  MOD_NIV:[1, 1, 1, 1, 2, 2, 1, 1],
  SEC_NIV:{1:[['methode','Méthode de prompt'],['securite','Sécurité & règles']], 2:[['maitre','Prompt maître'],['atelier','Atelier interactif'],['biblio','Bibliothèque de prompts']], 3:[['pile','La pile de l\'IA'],['histoire','Histoire de l\'IA']], 4:[['outils','Panorama des IA']], 5:[['quiz','Quiz final']]},
  COURS_META:D.COURS.map(c => ({id:c.id, n:c.n, ch:c.ch.map(x => x.t)})),
  ENC_META:D.ENCYCLO.map(c => ({t:c.t})), MOD_META:D.MODULES.map(m => ({t:m.t})),
  PLAN:D.PLAN, RES_PAR_NIV,
  PAGE_TITLES:Object.fromEntries(PAGE_LIST.filter(p => !p.sep).map(p => [p.v, p.t])),
  COUNTS:{quiz:D.QUIZ.length, hist:D.HIST.length, res:D.RESSOURCES.length, tools:D.TOOLS.length, prompts:D.PROMPTS.length + D.MASTERS.length, gloss:D.GLOSS.length}
};
if (META.MOD_NIV.length !== D.MODULES.length || D.NIV_ENC.length !== D.ENCYCLO.length) throw new Error('Niveaux incomplets');
const missingNiv = D.COURS.filter(c => !D.NIV_COURS[c.id]).map(c => c.id);
if (missingNiv.length) throw new Error('Cours sans niveau : ' + missingNiv);

const SEARCH = [];
D.MODULES.forEach((m, i) => SEARCH.push({k:'Fondamentaux', t:m.t, x:strip(m.s + ' ' + m.h + ' ' + m.ex), v:'bases', f:'m-' + i}));
D.ENCYCLO.forEach((c, i) => SEARCH.push({k:'Encyclopédie', t:c.t, x:strip(c.s + ' ' + c.h), v:'encyclo', f:'e-' + i}));
D.COURS.forEach(c => { SEARCH.push({k:'Cours', t:c.n, x:strip(c.pitch), v:'cours', f:'c-' + c.id});
  c.ch.forEach(ch => SEARCH.push({k:'Cours ' + c.n, t:ch.t, x:strip(ch.h), v:'cours', f:'c-' + c.id})); });
D.PILE.forEach(l => SEARCH.push({k:'Pile de l\'IA', t:'Étage ' + l.e + ' : ' + l.t, x:strip(l.d + ' ' + l.a + ' ' + l.toi), v:'pile', f:''}));
D.HIST.forEach(e => SEARCH.push({k:'Histoire · ' + fmtDate(e), t:e.t, x:strip(e.w + ' ' + e.a), v:'histoire', f:''}));
D.TOOLS.forEach(t => SEARCH.push({k:'Outil', t:t.n, x:strip([t.e, t.u, t.p, t.m, t.t].join(' ')), v:'outils', f:''}));
D.MASTERS.forEach(m => SEARCH.push({k:'Prompt maître', t:m.t, x:strip(m.use + ' ' + m.p), v:'maitre', f:''}));
D.PROMPTS.forEach(p => SEARCH.push({k:'Prompt · ' + D.PR_CATS[p.c], t:p.t, x:strip(p.p), v:'biblio', f:''}));
D.RESSOURCES.forEach(r => SEARCH.push({k:'Ressource · ' + r.s, t:r.n, x:strip(r.d), v:'ressources', f:''}));
D.GLOSS.forEach(g => SEARCH.push({k:'Glossaire', t:g[0], x:strip(g[1]), v:'glossaire', f:''}));

const GROUPS = {
  fond:{MODULES:D.MODULES, SECCHECK:D.SECCHECK},
  encyclo:{ENCYCLO:D.ENCYCLO, ENCYCLO_PARTS:D.ENCYCLO_PARTS},
  pile:{PILE:D.PILE},
  histoire:{HIST:D.HIST, HIST_CATS:D.HIST_CATS, ETAT:D.ETAT, TENDANCES:D.TENDANCES},
  cours:{COURS:D.COURS},
  outils:{TOOLS:D.TOOLS, TOOL_CATS:D.TOOL_CATS},
  methode:{BA:D.BA, TECHS:D.TECHS, MASTERS:D.MASTERS},
  prompts:{PROMPTS:D.PROMPTS, PR_CATS:D.PR_CATS},
  ressources:{RESSOURCES:D.RESSOURCES, RES_CATS:D.RES_CATS},
  quiz:{QUIZ:D.QUIZ},
  gloss:{GLOSS:D.GLOSS},
  recherche:{SEARCH}
};

/* ---------- 5. Écriture ---------- */
fs.rmSync(OUT, {recursive:true, force:true});
fs.mkdirSync(path.join(OUT, 'assets', 'data'), {recursive:true});
const files = {};
const put = (rel, content) => { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, content); files[rel] = content; };
put('assets/style.css', css.trim() + '\n');
put('assets/app.js', fs.readFileSync(path.join(HERE, 'app.js'), 'utf8'));
put('assets/data/meta.js', '/* Données communes à toutes les pages (généré) */\n' + decl(META));
for (const g in GROUPS) put('assets/data/' + g + '.js', '/* Données : ' + g + ' (généré) */\n' + decl(GROUPS[g]));

const navHtml = cur => PAGE_LIST.map(p => p.sep ? '    <div class="sep"></div>' :
  '    <a href="' + p.f + '"' + (p.v === cur ? ' class="active" aria-current="page"' : '') + '><span class="ic">' + p.ic + '</span> ' + esc(p.t) + '</a>').join('\n');
const page = p => `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${p.v === 'accueil' ? 'Académie IA' : esc(p.t) + ' · Académie IA'}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Académie IA : formation complète sur l'intelligence artificielle, du novice à l'expert, à jour au ${D.MAJ}.">
<meta name="theme-color" content="#0D0D0D">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="assets/icone-192.png" type="image/png">
<link rel="apple-touch-icon" href="assets/icone-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
<aside class="side">
  <div class="hazard"></div>
  <a class="brand" href="index.html" style="text-decoration:none">
    <span class="logo">ACADÉMIE IA</span>
    <small>Tout savoir sur l'intelligence artificielle</small>
  </a>
  <nav class="nav" aria-label="Pages de la formation">
${navHtml(p.v)}
  </nav>
  <div class="progress-box">
    Ta progression : <b data-pg-txt>0 %</b>
    <div class="bar"><i data-pg-bar></i></div>
  </div>
</aside>
<div class="main">
  <header class="topbar">
    <h1>${esc(p.t)}</h1>
    <form id="gSearch" role="search"><input type="search" id="gQ" placeholder="Chercher dans toute la formation…" aria-label="Chercher dans toute la formation"></form>
  </header>
  <main class="content">
  <section class="view active" id="v-${p.v}">${sections[p.v]}</section>
  </main>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script src="assets/data/meta.js"></script>
${p.data.map(g => '<script src="assets/data/' + g + '.js"></script>').join('\n')}
<script src="assets/app.js"></script>
</body>
</html>
`;
PAGE_LIST.filter(p => !p.sep).forEach(p => put(p.f, page(p)));

put('manifest.webmanifest', J({
  name:'Académie IA', short_name:'Académie IA', description:'Tout savoir sur l\'intelligence artificielle, du novice à l\'expert.',
  lang:'fr', start_url:'./index.html', scope:'./', display:'standalone', background_color:'#0D0D0D', theme_color:'#0D0D0D',
  icons:[{src:'assets/icone-192.png', sizes:'192x192', type:'image/png'}, {src:'assets/icone-512.png', sizes:'512x512', type:'image/png'},
         {src:'assets/icone-512.png', sizes:'512x512', type:'image/png', purpose:'maskable'}]
}, null, 2));

execFileSync('python3', [path.join(HERE, 'icones.py'), path.join(OUT, 'assets')]);
['assets/icone-192.png', 'assets/icone-512.png'].forEach(f => files[f] = fs.readFileSync(path.join(OUT, f)));

const version = crypto.createHash('sha256').update(Object.keys(files).sort().map(k => k + ':' + crypto.createHash('sha256').update(files[k]).digest('hex')).join('|')).digest('hex').slice(0, 12);
put('sw.js', `/* Service worker : la formation reste consultable hors connexion une fois installée (généré). */
const CACHE = 'academie-ia-${version}';
const FICHIERS = ${J(['./'].concat(Object.keys(files).sort()))};
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const police = url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !police) return;
  e.respondWith(caches.match(e.request, {ignoreSearch: url.origin === location.origin}).then(r => r || fetch(e.request).then(res => {
    if (res.ok && (police || url.origin === location.origin)) { const copie = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); }
    return res;
  })));
});
`);

/* ---------- 6. Version en un seul fichier HTML ---------- */
const noScriptEnd = t => t.replace(/<\/script/gi, '<\\/script');
const icone = 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, 'assets', 'icone-192.png')).toString('base64');
const navUnique = PAGE_LIST.map(p => p.sep ? '    <div class="sep"></div>' :
  '    <a href="#' + p.v + '" data-v="' + p.v + '"' + (p.v === 'accueil' ? ' class="active" aria-current="page"' : '') + '><span class="ic">' + p.ic + '</span> ' + esc(p.t) + '</a>').join('\n');
const toutesDonnees = decl(META) + Object.values(GROUPS).map(decl).join('');
const unique = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Académie IA</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Académie IA : formation complète sur l'intelligence artificielle, du novice à l'expert, à jour au ${D.MAJ}. Version en un seul fichier.">
<meta name="theme-color" content="#0D0D0D">
<link rel="icon" href="${icone}" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
${css.trim()}
</style>
</head>
<body>
<aside class="side">
  <div class="hazard"></div>
  <a class="brand" href="#accueil" style="text-decoration:none">
    <span class="logo">ACADÉMIE IA</span>
    <small>Tout savoir sur l'intelligence artificielle</small>
  </a>
  <nav class="nav" aria-label="Parties de la formation">
${navUnique}
  </nav>
  <div class="progress-box">
    Ta progression : <b data-pg-txt>0 %</b>
    <div class="bar"><i data-pg-bar></i></div>
  </div>
</aside>
<div class="main">
  <header class="topbar">
    <h1 id="vtitle">${esc(PAGE_LIST[0].t)}</h1>
    <form id="gSearch" role="search"><input type="search" id="gQ" placeholder="Chercher dans toute la formation…" aria-label="Chercher dans toute la formation"></form>
  </header>
  <main class="content">
${PAGE_LIST.filter(p => !p.sep).map(p => '  <section class="view' + (p.v === 'accueil' ? ' active' : '') + '" id="v-' + p.v + '">' + sections[p.v] + '</section>').join('\n')}
  </main>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script>
const MODE_UNIQUE = true;
${noScriptEnd(toutesDonnees)}
${noScriptEnd(fs.readFileSync(path.join(HERE, 'app.js'), 'utf8'))}
</script>
</body>
</html>
`;
const UNIQUE_OUT = path.join(OUT, '..', 'academie-ia-fichier-unique.html');
fs.writeFileSync(UNIQUE_OUT, unique);
console.log('Fichier unique :', path.basename(UNIQUE_OUT), '·', Math.round(Buffer.byteLength(unique) / 1024) + ' Ko');

const total = Object.values(files).reduce((n, c) => n + Buffer.byteLength(c), 0);
console.log('Pages :', PAGE_LIST.filter(p => !p.sep).length, '· fichiers :', Object.keys(files).length + 1, '· taille :', Math.round(total / 1024) + ' Ko · version', version);
console.log('Cours', D.COURS.length, '· chapitres de cours', D.COURS.reduce((n, c) => n + c.ch.length, 0), '· encyclopédie', D.ENCYCLO.length, '· histoire', D.HIST.length, '· recherche', SEARCH.length, 'entrées');
