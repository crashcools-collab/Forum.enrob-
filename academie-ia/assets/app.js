/* Académie IA : moteur commun à toutes les pages.
   Chaque bloc ne s'active que si les éléments de sa page sont présents. */
(function(){
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hlVars = s => esc(s).replace(/\[[^\]\n]{1,90}\]/g, m => '<span class="v">' + m + '</span>');
const L = (v, frag) => PAGES[v] + (frag !== undefined && frag !== '' ? '#' + frag : '');
const nivName = n => NIVEAUX[n - 1].t;
const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const fmtDate = ev => { if (ev.s) return ev.s; const [y, m, d] = ev.d.split('-').map(Number); return (d === 1 ? '1er' : d) + ' ' + MOIS[m - 1] + ' ' + y; };

/* ---------- Sauvegarde locale (partagée par toutes les pages du site) ---------- */
const KEY = 'academie-ia.v1';
let S = {mods:{}, chap:{}, enc:{}, plan:{}, fav:{}, quizBest:null, sec:{}, niv:1};
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

function toast(msg){ const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1800); }
function copyText(txt){
  const ok = () => toast('Copié dans le presse-papiers');
  const fallback = () => {
    const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let done = false; try { done = document.execCommand('copy'); } catch (e) {}
    ta.remove(); done ? ok() : toast('Sélectionne le texte et copie-le manuellement');
  };
  try { navigator.clipboard.writeText(txt).then(ok, fallback); } catch (e) { fallback(); }
}

/* ---------- Progression globale ---------- */
const PASS = Math.ceil(COUNTS.quiz * 0.7);
const totalCoursChap = COURS_META.reduce((n, c) => n + c.ch.length, 0);
const planItems = PLAN.reduce((n, w) => n + w.d.length, 0);
const coursDone = c => c.ch.filter((x, j) => S.chap[c.id + ':' + j]).length;
const quizPassed = () => S.quizBest !== null && S.quizBest >= PASS;
function progress(){
  const n = o => Object.values(o).filter(Boolean).length;
  const done = n(S.mods) + n(S.chap) + n(S.enc) + n(S.plan) + (quizPassed() ? 1 : 0);
  const total = MOD_META.length + totalCoursChap + ENC_META.length + planItems + 1;
  const pct = Math.round(done / total * 100);
  $$('[data-pg-txt]').forEach(e => e.textContent = pct + ' %');
  $$('[data-pg-bar]').forEach(e => e.style.width = pct + '%');
  if ($('#dash')) renderDash();
  if ($('#path')) renderPath();
  if ($('#nivBody')) renderNiv();
}

/* ---------- Recherche globale (barre du haut) ---------- */
const gForm = $('#gSearch');
if (gForm) gForm.addEventListener('submit', e => {
  e.preventDefault();
  const q = $('#gQ').value.trim(); if (!q) return;
  try { sessionStorage.setItem(KEY + '.q', q); } catch (err) {}
  if ($('#sQ')) { $('#sQ').value = q; renderSearch(); } else location.href = PAGES.recherche + '?q=' + encodeURIComponent(q);
});

/* ---------- Accueil ---------- */
function renderDash(){
  const cards = [{h:L('bases'), t:'Les fondamentaux', n:MOD_META.filter((m, i) => S.mods[i]).length, of:MOD_META.length},
    {h:L('encyclo'), t:'Encyclopédie', n:ENC_META.filter((x, i) => S.enc[i]).length, of:ENC_META.length}];
  COURS_META.forEach(c => cards.push({h:L('cours', 'c-' + c.id), t:'Cours ' + c.n, n:coursDone(c), of:c.ch.length}));
  cards.push({h:L('accueil', 'plan'), t:'Programme 4 semaines', n:Object.values(S.plan).filter(Boolean).length, of:planItems});
  cards.push({h:L('quiz'), t:'Quiz final (meilleur score)', n:S.quizBest === null ? 0 : S.quizBest, of:COUNTS.quiz, quiz:true});
  $('#dash').innerHTML = cards.map(c => { const pct = Math.round(c.n / c.of * 100), full = c.quiz ? quizPassed() : c.n === c.of;
    return '<a class="card' + (full ? ' full' : '') + '" href="' + c.h + '"><b>' + esc(c.t) + '</b><span class="pc">' + pct + ' %</span><div class="bar"><i style="width:' + pct + '%"></i></div><span class="small muted">' + c.n + ' / ' + c.of + (c.quiz ? ' (' + PASS + ' pour valider)' : '') + '</span></a>'; }).join('');
}
function renderPath(){
  $('#path').innerHTML = PATH.map((p, i) => '<a class="step" href="' + L(p.v) + '"><span class="n">ÉTAPE ' + (i + 1) + '</span><b>' + esc(p.t) + '</b><span class="small muted">' + esc(p.d) + '</span></a>').join('');
}
if ($('#v-accueil')) {
  const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  set('#stChap', totalCoursChap + MOD_META.length + ENC_META.length); set('#stCours', COURS_META.length); set('#stHist', COUNTS.hist);
  set('#stRes', COUNTS.res); set('#stTools', COUNTS.tools); set('#stPrompts', COUNTS.prompts);
  $('#plan').innerHTML = PLAN.map((w, i) => '<div class="card stack" style="gap:8px"><h3>' + esc(w.w) + '</h3>' +
    w.d.map((d, j) => { const k = i + ':' + j; return '<label class="check"><input type="checkbox" data-plan="' + k + '"' + (S.plan[k] ? ' checked' : '') + '> <span class="small">' + esc(d) + '</span></label>'; }).join('') + '</div>').join('');
  $('#plan').addEventListener('change', e => { const k = e.target.dataset.plan; if (k) { S.plan[k] = e.target.checked; save(); progress(); } });
}

/* ---------- Parcours par niveau ---------- */
function renderNiv(){
  const n = S.niv || 1;
  $('#nivTabs').innerHTML = NIVEAUX.map(v => '<button data-nv="' + v.n + '" class="' + (n === v.n ? 'on' : '') + '">' + v.n + '. ' + esc(v.t) + '</button>').join('');
  const items = [];
  MOD_META.forEach((m, i) => { if (MOD_NIV[i] === n) items.push({k:'Module', t:m.t, ok:!!S.mods[i], h:L('bases', 'm-' + i)}); });
  ENC_META.forEach((c, i) => { if (NIV_ENC[i] === n) items.push({k:'Encyclopédie', t:c.t, ok:!!S.enc[i], h:L('encyclo', 'e-' + i)}); });
  COURS_META.forEach(c => { if ((NIV_COURS[c.id] || 1) === n) items.push({k:'Cours', t:c.n, ok:coursDone(c) === c.ch.length, st:coursDone(c) + ' / ' + c.ch.length, h:L('cours', 'c-' + c.id)}); });
  (SEC_NIV[n] || []).forEach(([v, t]) => items.push({k:'Section', t:t, sec:true, h:L(v)}));
  const tracked = items.filter(x => !x.sec), done = tracked.filter(x => x.ok).length, pct = tracked.length ? Math.round(done / tracked.length * 100) : 0;
  $('#nivBody').innerHTML = '<div class="card hl stack" style="margin-top:6px"><div class="row" style="justify-content:space-between"><h3 style="font-size:24px">Niveau ' + n + ' : ' + esc(nivName(n)) + '</h3><span class="chip y">' + done + ' / ' + tracked.length + ' terminés</span></div><p>' + esc(NIVEAUX[n - 1].d) + '</p><div class="bar"><i style="width:' + pct + '%"></i></div>' +
    '<div class="niv-list">' + items.map(x => '<a class="niv-item' + (x.ok ? ' ok' : '') + '" href="' + x.h + '"><span class="k">' + esc(x.k) + '</span><span class="x">' + esc(x.t) + '</span><span class="st">' + (x.sec ? 'à parcourir' : x.ok ? '✓ terminé' : (x.st || 'à faire')) + '</span></a>').join('') +
    '<a class="niv-item" href="' + L('ressources', 'n-' + n) + '"><span class="k">Ressources</span><span class="x">' + (RES_PAR_NIV[n] || 0) + ' dépôts, modèles et cours de niveau ' + esc(nivName(n)) + '</span><span class="st">ouvrir</span></a></div>' +
    (n < 5 ? '<div><button class="btn" data-nv="' + (n + 1) + '">Passer au niveau ' + esc(nivName(n + 1)) + ' →</button></div>' : '') + '</div>';
}
if ($('#nivBody')) document.addEventListener('click', e => { const b = e.target.closest('[data-nv]'); if (b) { S.niv = +b.dataset.nv; save(); renderNiv(); if (b.closest('#nivBody')) window.scrollTo(0, 0); } });

/* ---------- Fondamentaux ---------- */
function renderMods(){
  $('#mods').innerHTML = MODULES.map((m, i) => '<details class="mod' + (S.mods[i] ? ' is-done' : '') + '" id="m-' + i + '"><summary><span class="num">' + String(i + 1).padStart(2, '0') + '</span><span class="t"><b>' + esc(m.t) + '</b><span>' + esc(m.s) + '</span></span><span class="arrow">▶</span></summary><div class="mod-body">' + m.h +
    '<div class="ex"><b class="t">Exercice pratique</b><p>' + esc(m.ex) + '</p></div><div><button class="btn' + (S.mods[i] ? ' done' : '') + '" data-mod="' + i + '">' + (S.mods[i] ? '✓ Module terminé' : 'Marquer comme terminé') + '</button></div></div></details>').join('');
}
if ($('#mods')) {
  renderMods();
  $('#mods').addEventListener('click', e => {
    const b = e.target.closest('[data-mod]'); if (!b) return;
    const i = +b.dataset.mod; S.mods[i] = !S.mods[i]; save(); renderMods(); progress();
    const nx = $('#m-' + (i + 1));
    if (S.mods[i] && nx) { nx.open = true; nx.scrollIntoView({block:'start'}); toast('Module terminé'); } else $('#m-' + i).open = true;
  });
}

/* ---------- Encyclopédie ---------- */
let encLv = 0;
function renderEnc(){
  $('#encLv').innerHTML = [[0, 'Tous les niveaux']].concat(NIVEAUX.map(v => [v.n, v.t])).map(([k, v]) => '<button data-el="' + k + '" class="' + (encLv === k ? 'on' : '') + '">' + esc(v) + '</button>').join('');
  const q = $('#encQ').value.trim().toLowerCase();
  let html = '', n = 0;
  Object.entries(ENCYCLO_PARTS).forEach(([pk, pt]) => {
    const items = ENCYCLO.map((c, i) => ({c, i})).filter(({c, i}) => c.p === pk && (!encLv || NIV_ENC[i] === encLv) && (!q || (c.t + ' ' + c.s + ' ' + c.h.replace(/<[^>]+>/g, ' ')).toLowerCase().includes(q)));
    if (!items.length) return;
    n += items.length;
    html += '<h2 class="sec">' + esc(pt) + '</h2><div class="stack">' + items.map(({c, i}) => '<details class="mod' + (S.enc[i] ? ' is-done' : '') + '" id="e-' + i + '"><summary><span class="num">' + String(i + 1).padStart(2, '0') + '</span><span class="t"><b>' + esc(c.t) + '</b><span>' + esc(c.s) + ' · niveau ' + esc(nivName(NIV_ENC[i])) + (S.enc[i] ? ' · compris ✓' : '') + '</span></span><span class="arrow">▶</span></summary><div class="mod-body">' + c.h +
      '<div><button class="btn' + (S.enc[i] ? ' done' : '') + '" data-encdone="' + i + '">' + (S.enc[i] ? '✓ Compris' : "J'ai compris") + '</button></div></div></details>').join('') + '</div>';
  });
  $('#encCount').textContent = n + ' chapitre' + (n > 1 ? 's' : '');
  $('#enc').innerHTML = html || '<p class="muted">Aucun chapitre ne correspond.</p>';
}
if ($('#enc')) {
  renderEnc();
  $('#encLv').addEventListener('click', e => { const b = e.target.closest('[data-el]'); if (b) { encLv = +b.dataset.el; renderEnc(); } });
  $('#encQ').addEventListener('input', renderEnc);
  $('#enc').addEventListener('click', e => {
    const b = e.target.closest('[data-encdone]'); if (!b) return;
    const i = +b.dataset.encdone; S.enc[i] = !S.enc[i]; save(); progress(); renderEnc();
    const d = $('#e-' + i); const all = $$('#enc details'); const nx = all[all.indexOf(d) + 1];
    if (S.enc[i]) { toast('Chapitre compris'); if (nx) { nx.open = true; nx.scrollIntoView({block:'start'}); } } else d.open = true;
  });
}

/* ---------- Pile de l'IA ---------- */
if ($('#pileList')) {
  $('#pileList').innerHTML = PILE.map(l => '<details class="etage" data-e="' + l.e + '"><summary><span class="num">' + l.e + '</span><span class="t"><b>' + esc(l.t) + '</b><span>' + esc(l.d) + '</span></span><span class="arrow">▶</span></summary><div class="body"><p><b>Acteurs :</b> ' + esc(l.a) + '</p><p><b>Ce que tu peux y faire :</b> ' + esc(l.toi) + '</p><div class="row">' +
    l.go.map(([g, label]) => { const [v, c] = g.split(':'); return '<a class="btn ghost sm" href="' + (c ? L(v, 'c-' + c) : L(v)) + '">' + esc(label) + ' →</a>'; }).join('') + '</div></div></details>').join('');
}

/* ---------- Histoire ---------- */
if ($('#tl')) {
  $('#etat').innerHTML = ETAT.map(r => '<tr><td><b>' + esc(r.a) + '</b>' + (r.k ? '<br><a class="btn ghost sm" style="margin-top:6px" href="' + L('cours', 'c-' + r.k) + '">Cours</a>' : '') + '</td><td>' + esc(r.m) + '</td><td>' + esc(r.p) + '</td></tr>').join('');
  $('#tendances').innerHTML = TENDANCES.map(t => '<div class="card"><h3>' + esc(t.t) + '</h3><p class="small" style="margin-top:6px">' + esc(t.d) + '</p></div>').join('');
  const H_YEARS = [['', 'Toutes les années'], ['ancien', '1943–2016'], ['recent', '2017–2021']].concat(['2022','2023','2024','2025','2026'].map(y => [y, y]));
  let hYear = '', hCat = '';
  [...new Set(HIST.map(e => e.a))].sort((a, b) => a.localeCompare(b, 'fr')).forEach(a => { const o = document.createElement('option'); o.value = a; o.textContent = a; $('#hActor').appendChild(o); });
  const renderHist = () => {
    $('#hYears').innerHTML = H_YEARS.map(([k, v]) => '<button data-hy="' + k + '" class="' + (hYear === k ? 'on' : '') + '">' + v + '</button>').join('');
    $('#hCats').innerHTML = [['', 'Tous les types']].concat(Object.entries(HIST_CATS)).map(([k, v]) => '<button data-hc="' + k + '" class="' + (hCat === k ? 'on' : '') + '">' + esc(v) + '</button>').join('');
    const q = $('#hQ').value.trim().toLowerCase(), act = $('#hActor').value;
    const list = HIST.filter(e => { const y = e.d.slice(0, 4);
      return (!hYear || (hYear === 'ancien' ? y < '2017' : hYear === 'recent' ? (y >= '2017' && y < '2022') : y === hYear)) && (!hCat || e.c === hCat) && (!act || e.a === act) && (!q || (e.t + ' ' + e.w + ' ' + e.a).toLowerCase().includes(q)); });
    $('#hCount').textContent = list.length + ' événement' + (list.length > 1 ? 's' : '');
    let html = '', cur = '';
    list.slice().reverse().forEach(e => { const y = e.d.slice(0, 4);
      if (y !== cur) { cur = y; html += '<div class="tl-year">' + y + '<small>' + list.filter(x => x.d.slice(0, 4) === y).length + ' événements</small></div>'; }
      html += '<div class="ev c-' + e.c + '"><span class="dt">' + esc(fmtDate(e)) + '</span><div><b>' + esc(e.t) + '</b><p>' + esc(e.w) + '</p><div class="meta"><span class="chip o">' + esc(e.a) + '</span><span class="chip">' + esc(HIST_CATS[e.c]) + '</span></div></div></div>'; });
    $('#tl').innerHTML = html || '<p class="muted">Aucun événement ne correspond.</p>';
  };
  renderHist();
  $('#hYears').addEventListener('click', e => { const b = e.target.closest('[data-hy]'); if (b) { hYear = b.dataset.hy; renderHist(); } });
  $('#hCats').addEventListener('click', e => { const b = e.target.closest('[data-hc]'); if (b) { hCat = b.dataset.hc; renderHist(); } });
  $('#hQ').addEventListener('input', renderHist);
  $('#hActor').addEventListener('change', renderHist);
}

/* ---------- Cours ---------- */
const COURS_CATS = {'':'Tous', assistants:'Assistants IA', travail:'Travail & recherche', construire:'Construire avec l\'IA', programmes:'Créer des programmes', dev:'Développeurs & open source', creation:'Création', securite:'Cybersécurité'};
let coursCat = '', curCourse = null;
function renderCoursList(){
  $('#coursCats').innerHTML = Object.entries(COURS_CATS).map(([k, v]) => '<button data-cc="' + k + '" class="' + (coursCat === k ? 'on' : '') + '">' + esc(v) + '</button>').join('');
  $('#coursGrid').innerHTML = COURS.filter(c => !coursCat || c.cat === coursCat).map(c => {
    const d = coursDone(c), pct = Math.round(d / c.ch.length * 100);
    return '<div class="card tool"><div class="head"><div><h3>' + esc(c.n) + '</h3><div class="ed">' + esc(c.by) + '</div></div><span class="chip ' + (pct === 100 ? 'g' : 'o') + '">' + (pct === 100 ? '✓ terminé' : c.ch.length + ' chapitres') + '</span></div>' +
      '<p class="uses">' + esc(c.pitch) + '</p><div class="row"><span class="chip y">Niveau ' + esc(nivName(NIV_COURS[c.id] || 1)) + '</span><span class="chip">' + esc(c.lvl) + '</span><span class="chip">≈ ' + esc(c.dur) + '</span></div>' +
      '<div><div class="bar"><i style="width:' + pct + '%"></i></div><span class="small muted">' + d + ' / ' + c.ch.length + ' chapitres compris</span></div>' +
      '<div class="links"><a class="btn sm" href="#c-' + c.id + '">' + (d ? 'Continuer le cours' : 'Commencer le cours') + '</a></div></div>';
  }).join('');
}
function openCourse(id, keepScroll){
  const c = COURS.find(x => x.id === id); if (!c) return closeCourse();
  curCourse = c;
  const d = coursDone(c), next = COURS[COURS.indexOf(c) + 1], first = c.ch.findIndex((x, n) => !S.chap[c.id + ':' + n]);
  $('#coursDetail').innerHTML =
    '<div class="row" style="justify-content:space-between;margin-bottom:14px"><a class="btn ghost sm" href="#liste">← Tous les cours</a><span class="count">' + d + ' / ' + c.ch.length + ' chapitres compris</span></div>' +
    '<div class="card hl stack" style="margin-bottom:16px"><span class="chip o" style="white-space:normal;align-self:flex-start">' + esc(COURS_CATS[c.cat]) + ' · niveau ' + esc(nivName(NIV_COURS[c.id] || 1)) + ' · ' + esc(c.lvl) + ' · ≈ ' + esc(c.dur) + '</span><h2 style="font-family:var(--f-display);font-size:30px;text-transform:uppercase;letter-spacing:.5px">Cours ' + esc(c.n) + '</h2><p class="muted">' + esc(c.by) + '</p><p class="lead">' + esc(c.pitch) + '</p><div class="bar"><i style="width:' + Math.round(d / c.ch.length * 100) + '%"></i></div></div>' +
    '<div class="stack">' + c.ch.map((ch, j) => { const ok = S.chap[c.id + ':' + j];
      return '<details class="mod' + (ok ? ' is-done' : '') + '" id="ch' + j + '"' + (j === first ? ' open' : '') + '><summary><span class="num">' + String(j + 1).padStart(2, '0') + '</span><span class="t"><b>' + esc(ch.t) + '</b><span>' + (ok ? 'Compris ✓' : 'Chapitre ' + (j + 1) + ' sur ' + c.ch.length) + '</span></span><span class="arrow">▶</span></summary><div class="mod-body">' + ch.h +
        '<div><button class="btn' + (ok ? ' done' : '') + '" data-chap="' + j + '">' + (ok ? '✓ Compris' : "J'ai compris, chapitre suivant") + '</button></div></div></details>'; }).join('') + '</div>' +
    (next ? '<div class="card row" style="justify-content:space-between;margin-top:18px"><span class="muted">Cours suivant : <b style="color:var(--txt)">' + esc(next.n) + '</b></span><a class="btn sm" href="#c-' + next.id + '">Ouvrir le cours ' + esc(next.n) + '</a></div>' : '');
  $('#coursList').hidden = true; $('#coursDetail').hidden = false;
  if (!keepScroll) window.scrollTo(0, 0);
}
function closeCourse(){ curCourse = null; $('#coursDetail').hidden = true; $('#coursList').hidden = false; renderCoursList(); }
if ($('#coursGrid')) {
  renderCoursList();
  $('#coursCats').addEventListener('click', e => { const b = e.target.closest('[data-cc]'); if (b) { coursCat = b.dataset.cc; renderCoursList(); } });
  $('#coursDetail').addEventListener('click', e => {
    const b = e.target.closest('[data-chap]'); if (!b || !curCourse) return;
    const j = +b.dataset.chap, k = curCourse.id + ':' + j;
    S.chap[k] = !S.chap[k]; save(); progress();
    const nowDone = S.chap[k];
    openCourse(curCourse.id, true);
    const el = $('#ch' + (nowDone ? j + 1 : j));
    if (el) { $$('#coursDetail details').forEach(x => x.open = false); el.open = true; el.scrollIntoView({block:'start'}); }
    if (nowDone) toast(coursDone(curCourse) === curCourse.ch.length ? 'Cours terminé, bravo !' : 'Chapitre validé');
  });
}

/* ---------- Panorama des outils ---------- */
if ($('#tools')) {
  let toolCat = '';
  const pc = {'Gratuit':'g', 'Freemium':'y', 'Payant':'o', 'Open source':'b'};
  const renderTools = () => {
    $('#toolCats').innerHTML = [['', 'Toutes les catégories']].concat(Object.entries(TOOL_CATS)).map(([k, v]) => '<button data-tc="' + k + '" class="' + (toolCat === k ? 'on' : '') + '">' + esc(v) + '</button>').join('');
    const q = $('#toolQ').value.trim().toLowerCase(), pr = $('#toolPrice').value;
    const list = TOOLS.filter(t => (!toolCat || t.c === toolCat) && (!pr || t['$'] === pr) && (!q || (t.n + ' ' + t.e + ' ' + t.u + ' ' + t.p + ' ' + TOOL_CATS[t.c]).toLowerCase().includes(q)));
    $('#toolCount').textContent = list.length + ' outil' + (list.length > 1 ? 's' : '');
    $('#tools').innerHTML = list.map(t => '<div class="card tool"><div class="head"><div><h3>' + esc(t.n) + '</h3><div class="ed">' + esc(t.e) + '</div></div><span class="chip ' + pc[t['$']] + '">' + esc(t['$']) + '</span></div>' +
      '<span class="chip" style="align-self:flex-start">' + esc(TOOL_CATS[t.c]) + '</span><p class="uses">' + esc(t.u) + '</p>' +
      '<dl><dt>Atouts</dt><dd>' + esc(t.p) + '</dd><dt>Limites</dt><dd>' + esc(t.m) + '</dd></dl><div class="tip"><b>Astuce :</b> ' + esc(t.t) + '</div>' +
      '<div class="links"><a class="btn ghost sm" href="' + esc(t.url) + '" target="_blank" rel="noopener">Site officiel ↗</a>' + (t.k ? '<a class="btn sm" href="' + L('cours', 'c-' + t.k) + '">Suivre le cours</a>' : '') + '</div></div>').join('') || '<p class="muted">Aucun outil ne correspond. Essaie un autre mot.</p>';
  };
  renderTools();
  $('#toolCats').addEventListener('click', e => { const b = e.target.closest('[data-tc]'); if (b) { toolCat = b.dataset.tc; renderTools(); } });
  $('#toolQ').addEventListener('input', renderTools);
  $('#toolPrice').addEventListener('change', renderTools);
}

/* ---------- Méthode et prompts maîtres ---------- */
if ($('#baList')) {
  $('#baList').innerHTML = BA.map(b => '<div class="card stack"><h3>' + esc(b.t) + '</h3><div class="ba"><div class="card bad"><h4>✗ Prompt faible</h4><pre class="prompt">' + esc(b.bad) + '</pre></div><div class="card good"><h4>✓ Prompt professionnel</h4><pre class="prompt">' + hlVars(b.good) + '</pre></div></div><p class="small"><b>Pourquoi ça marche :</b> ' + esc(b.why) + '</p></div>').join('');
  $('#techs').innerHTML = TECHS.map(t => '<div class="card"><h3>' + esc(t.t) + '</h3><p class="small" style="margin-top:6px">' + esc(t.d) + '</p></div>').join('');
}
if ($('#masters')) {
  $('#masters').innerHTML = MASTERS.map((m, i) => '<div class="card stack' + (i === 0 ? ' hl' : '') + '"><div class="row" style="justify-content:space-between"><h3 style="font-size:21px">' + esc(m.t) + '</h3><span class="chip ' + (i === 0 ? 'o' : 'y') + '">' + esc(m.tag) + '</span></div><p class="small muted"><b style="color:var(--txt)">Mode d\'emploi :</b> ' + esc(m.use) + '</p><pre class="prompt">' + hlVars(m.p) + '</pre><div class="row"><button class="btn" data-mcopy="' + i + '">Copier ce prompt</button></div></div>').join('');
  $('#masters').addEventListener('click', e => { const b = e.target.closest('[data-mcopy]'); if (b) copyText(MASTERS[+b.dataset.mcopy].p); });
}

/* ---------- Atelier ---------- */
if ($('#bOut')) {
  const TYPES = {rediger:{role:'rédacteur professionnel', verb:'Rédige'}, resumer:{role:'analyste chargé de synthèse', verb:'Résume'},
    analyser:{role:'consultant expert', verb:'Analyse'}, expliquer:{role:'formateur pédagogue', verb:'Explique'},
    calculer:{role:'expert en calcul rigoureux', verb:'Calcule et vérifie'}, idees:{role:'animateur de créativité', verb:'Propose des idées pour'},
    traduire:{role:'traducteur professionnel', verb:'Traduis'}, image:{role:'directeur artistique', verb:'Génère une image de'}, code:{role:'développeur senior', verb:'Écris le code pour'}};
  const B_IDS = ['bType','bRole','bCtx','bTask','bData','bAud','bTone','bLen','bFmt','bCons','bEx','oAsk','oVerif','oSteps','oVar','oCrit'];
  const v = id => { const el = $('#' + id); return el.type === 'checkbox' ? el.checked : el.value.trim(); };
  const buildPrompt = () => {
    const T = TYPES[v('bType')], P = [];
    P.push('# RÔLE\nTu es ' + (v('bRole') || T.role) + '.');
    if (v('bCtx')) P.push('# CONTEXTE\n' + v('bCtx'));
    P.push('# TÂCHE\n' + (v('bTask') || T.verb + ' [PRÉCISE CE QUE TU VEUX]'));
    if (v('bData')) P.push('# DONNÉES\n"""\n' + v('bData') + '\n"""');
    const c = []; if (v('bAud')) c.push('Destinataire : ' + v('bAud')); c.push('Ton : ' + v('bTone')); if (v('bLen')) c.push('Longueur : ' + v('bLen')); if (v('bCons')) c.push(v('bCons'));
    P.push('# CONTRAINTES\n- ' + c.join('\n- '));
    P.push('# FORMAT\n' + v('bFmt').charAt(0).toUpperCase() + v('bFmt').slice(1) + '.' + (v('bEx') ? '\nExemple du résultat attendu :\n"""\n' + v('bEx') + '\n"""' : ''));
    const q = [];
    if (v('oAsk')) q.push('Avant de répondre, pose-moi les questions indispensables si une information manque.');
    if (v('oSteps')) q.push('Raisonne étape par étape et montre tes calculs.');
    if (v('oVerif')) q.push("Signale clairement tes incertitudes. N'invente aucun fait, chiffre, norme ou source.");
    if (v('oVar')) q.push('Propose 3 versions différentes.');
    if (v('oCrit')) q.push('Relis ta réponse avant de la livrer et corrige ses faiblesses.');
    if (q.length) P.push('# CONTRÔLE QUALITÉ\n- ' + q.join('\n- '));
    return P.join('\n\n');
  };
  const update = () => {
    const p = buildPrompt(); $('#bOut').innerHTML = hlVars(p); $('#bWords').textContent = p.split(/\s+/).filter(Boolean).length + ' mots';
    try { sessionStorage.setItem(KEY + '.b', JSON.stringify(B_IDS.map(id => { const el = $('#' + id); return el.type === 'checkbox' ? el.checked : el.value; }))); } catch (e) {}
  };
  const SAMPLE = {bType:'idees', bRole:'organisateur de voyages expérimenté', bCtx:"Je pars 5 jours à Lisbonne en mai avec deux amis. Budget de 600 euros par personne hors avion. Nous aimons la cuisine locale, les balades à pied et les concerts.",
    bTask:'Propose un programme jour par jour avec les visites, les quartiers et une estimation des dépenses.', bData:'', bAud:'Trois amis de 30 ans', bTone:'chaleureux', bLen:'une page maximum', bFmt:'tableau', bCons:'3 activités maximum par jour, déplacements à pied ou en transports en commun', bEx:''};
  const fill = o => { B_IDS.forEach(id => { const el = $('#' + id); if (el.type === 'checkbox') return; el.value = o[id] !== undefined ? o[id] : (el.tagName === 'SELECT' ? el.options[0].value : ''); }); update(); };
  B_IDS.forEach(id => $('#' + id).addEventListener('input', update));
  $('#bSample').addEventListener('click', () => fill(SAMPLE));
  $('#bClear').addEventListener('click', () => fill({}));
  $('#bCopy').addEventListener('click', () => copyText(buildPrompt()));
  $('#bToAna').addEventListener('click', () => { $('#aIn').value = buildPrompt(); analyze(); $('#aIn').scrollIntoView({block:'center'}); });
  let saved = null; try { saved = JSON.parse(sessionStorage.getItem(KEY + '.b')); } catch (e) {}
  if (Array.isArray(saved) && saved.length === B_IDS.length) { B_IDS.forEach((id, i) => { const el = $('#' + id); el.type === 'checkbox' ? el.checked = saved[i] : el.value = saved[i]; }); update(); } else fill(SAMPLE);

  const CRITS = [
    {k:'Rôle', w:12, re:/\b(tu es|agis comme|en tant que|joue le rôle|rôle)\b/i, tip:"Indique qui l'IA doit être : « Tu es un coach sportif… »"},
    {k:'Contexte', w:18, re:/\b(contexte|situation|je suis|je travaille|nous sommes|notre|mon équipe|car|parce que|suite à)\b/i, tip:'Explique la situation et les enjeux.'},
    {k:'Tâche claire', w:15, re:/\b(rédige|écris|analyse|résume|crée|liste|propose|compare|explique|traduis|calcule|génère|corrige|vérifie|transforme|prépare|fais)\b/i, tip:"Commence la demande par un verbe d'action précis."},
    {k:'Destinataire', w:10, re:/\b(destinataire|public|lecteurs?|pour (un|une|le|la|les|mon|ma|des)|client|équipe|direction|débutant)\b/i, tip:'Précise pour qui est le résultat.'},
    {k:'Format', w:15, re:/\b(tableau|liste|puces|format|json|titres?|paragraphes?|plan|étapes|objet|structure|sections?)\b/i, tip:'Décris la forme exacte du résultat.'},
    {k:'Contraintes', w:12, re:/(\bmaximum\b|\bminimum\b|\bau plus\b|\bmots\b|\blignes\b|\bton\b|\bévite|\bsans\b|\bne pas\b|\bn'utilise|\bobligatoire|\binterdit)/i, tip:'Ajoute longueur, ton, interdits.'},
    {k:'Données délimitées', w:6, re:/("""|```|<[a-zé_]+>|---)/i, tip:'Encadre le texte à traiter avec """ ou des balises.'},
    {k:'Contrôle et honnêteté', w:12, re:/(incertain|ne (rien )?invente|n'invente|si tu ne sais pas|sources?|vérifi|relis|niveau de confiance|signale)/i, tip:'Demande de signaler les doutes et de ne rien inventer.'}];
  const analyze = () => {
    const t = $('#aIn').value, words = t.split(/\s+/).filter(Boolean).length;
    let score = 0; const rows = [];
    CRITS.forEach(c => { const ok = c.re.test(t); if (ok) score += c.w; rows.push('<div><span class="s ' + (ok ? 'y' : 'n') + '">' + (ok ? '✓' : '✗') + '</span><span><b>' + esc(c.k) + '</b>' + (ok ? '' : ' : ' + esc(c.tip)) + '</span></div>'); });
    if (words < 15) score = Math.min(score, 30); if (!t.trim()) score = 0;
    $('#aScore').textContent = score; $('#aRing').style.strokeDashoffset = 251.3 * (1 - score / 100);
    $('#aRing').style.stroke = score >= 70 ? 'var(--ok)' : score >= 40 ? 'var(--jaune)' : 'var(--warn)';
    $('#aVerdict').textContent = !t.trim() ? '—' : score >= 85 ? 'Prompt professionnel' : score >= 70 ? 'Solide' : score >= 40 ? 'Moyen : à compléter' : 'Trop vague';
    $('#aHint').textContent = words + ' mots. ' + (words < 15 && t.trim() ? 'Un prompt de moins de 15 mots manque presque toujours de contexte.' : 'Note sur 100, calculée selon les 7 blocs.');
    $('#aCrit').innerHTML = rows.join('');
  };
  const WEAK = 'écris un mail à mon propriétaire pour la fuite';
  $('#aIn').addEventListener('input', analyze);
  $('#aWeak').addEventListener('click', () => { $('#aIn').value = WEAK; analyze(); });
  $('#aStrong').addEventListener('click', () => { $('#aIn').value = BA[0].good; analyze(); });
  let pre = null; try { pre = sessionStorage.getItem(KEY + '.ana'); sessionStorage.removeItem(KEY + '.ana'); } catch (e) {}
  $('#aIn').value = pre || WEAK; analyze();
  if (pre) setTimeout(() => $('#aIn').scrollIntoView({block:'center'}), 50);
}

/* ---------- Bibliothèque de prompts ---------- */
if ($('#prompts')) {
  let prCat = '', favOnly = false;
  const renderPrompts = () => {
    $('#prCats').innerHTML = [['', 'Toutes']].concat(Object.entries(PR_CATS)).map(([k, v]) => '<button data-pc="' + k + '" class="' + (prCat === k ? 'on' : '') + '">' + esc(v) + '</button>').join('');
    const q = $('#prQ').value.trim().toLowerCase();
    const list = PROMPTS.map((p, i) => Object.assign({i}, p)).filter(p => (!prCat || p.c === prCat) && (!favOnly || S.fav[p.i]) && (!q || (p.t + ' ' + p.p + ' ' + PR_CATS[p.c]).toLowerCase().includes(q)));
    $('#prCount').textContent = list.length + ' prompt' + (list.length > 1 ? 's' : '');
    $('#prompts').innerHTML = list.map(p => '<div class="card pr"><div class="top"><h3>' + esc(p.t) + '</h3><button class="fav' + (S.fav[p.i] ? ' on' : '') + '" data-fav="' + p.i + '" aria-label="Ajouter aux favoris">★</button></div>' +
      '<div class="meta"><span class="chip o">' + esc(PR_CATS[p.c]) + '</span><span class="chip">' + esc(p.ia) + '</span></div><pre class="prompt">' + hlVars(p.p) + '</pre>' +
      '<div class="acts"><button class="btn sm" data-pcopy="' + p.i + '">Copier</button><button class="btn ghost sm" data-pexp="1">Tout afficher</button><button class="btn ghost sm" data-pana="' + p.i + '">Analyser</button></div></div>').join('') || '<p class="muted">' + (favOnly ? "Aucun favori pour l'instant : clique sur ★ pour en ajouter." : 'Aucun prompt ne correspond.') + '</p>';
  };
  renderPrompts();
  $('#prCats').addEventListener('click', e => { const b = e.target.closest('[data-pc]'); if (b) { prCat = b.dataset.pc; renderPrompts(); } });
  $('#prQ').addEventListener('input', renderPrompts);
  $('#prFavOnly').addEventListener('click', e => { favOnly = !favOnly; e.currentTarget.classList.toggle('done', favOnly); e.currentTarget.setAttribute('aria-pressed', favOnly); renderPrompts(); });
  $('#prompts').addEventListener('click', e => {
    let b;
    if ((b = e.target.closest('[data-pcopy]'))) copyText(PROMPTS[+b.dataset.pcopy].p);
    else if ((b = e.target.closest('[data-fav]'))) { const i = +b.dataset.fav; S.fav[i] = !S.fav[i]; save(); b.classList.toggle('on', S.fav[i]); toast(S.fav[i] ? 'Ajouté aux favoris' : 'Retiré des favoris'); if (favOnly) renderPrompts(); }
    else if ((b = e.target.closest('[data-pexp]'))) { const c = b.closest('.pr'); c.classList.toggle('open'); b.textContent = c.classList.contains('open') ? 'Réduire' : 'Tout afficher'; }
    else if ((b = e.target.closest('[data-pana]'))) { try { sessionStorage.setItem(KEY + '.ana', PROMPTS[+b.dataset.pana].p); } catch (err) {} location.href = L('atelier'); }
  });
}

/* ---------- Ressources ---------- */
let renderRes = null;
if ($('#res')) {
  let resCat = '';
  NIVEAUX.forEach(v => { const o = document.createElement('option'); o.value = v.n; o.textContent = v.t; $('#resLv').appendChild(o); });
  renderRes = () => {
    $('#resCats').innerHTML = [['', 'Tous les thèmes']].concat(Object.entries(RES_CATS)).map(([k, v]) => '<button data-rc="' + k + '" class="' + (resCat === k ? 'on' : '') + '">' + esc(v) + '</button>').join('');
    const q = $('#resQ').value.trim().toLowerCase(), src = $('#resSrc').value, lv = +$('#resLv').value;
    const list = RESSOURCES.filter(r => (!resCat || r.c === resCat) && (!lv || r.v === lv) && (!src || (src === 'autre' ? (r.s !== 'GitHub' && r.s !== 'Hugging Face') : r.s === src)) && (!q || (r.n + ' ' + r.d + ' ' + RES_CATS[r.c]).toLowerCase().includes(q)));
    $('#resCount').textContent = list.length + ' ressource' + (list.length > 1 ? 's' : '');
    $('#res').innerHTML = list.map(r => '<div class="card tool"><div class="head"><h3 style="font-size:16px;' + (r.s === 'GitHub' ? 'font-family:var(--f-mono);font-weight:600' : '') + ';word-break:break-word">' + esc(r.n) + '</h3><span class="chip ' + (r.s === 'GitHub' ? 'o' : r.s === 'Hugging Face' ? 'y' : 'b') + '">' + esc(r.s) + '</span></div><div class="row"><span class="chip">' + esc(RES_CATS[r.c]) + '</span><span class="chip y">' + esc(nivName(r.v)) + '</span></div><p class="uses">' + esc(r.d) + '</p><div class="links"><a class="btn ghost sm" href="' + esc(r.u) + '" target="_blank" rel="noopener">Ouvrir ↗</a></div></div>').join('') || '<p class="muted">Aucune ressource ne correspond.</p>';
  };
  renderRes();
  $('#resCats').addEventListener('click', e => { const b = e.target.closest('[data-rc]'); if (b) { resCat = b.dataset.rc; renderRes(); } });
  ['#resQ', '#resSrc', '#resLv'].forEach(s => $(s).addEventListener(s === '#resQ' ? 'input' : 'change', renderRes));
}

/* ---------- Quiz ---------- */
if ($('#qz')) {
  let qAns = {};
  $('#qzLead').textContent = 'Vérifie ce que tu as retenu. ' + PASS + ' bonnes réponses sur ' + QUIZ.length + ' valident la formation.';
  const renderQuiz = () => {
    $('#qz').innerHTML = QUIZ.map((q, i) => { const a = qAns[i];
      return '<div class="card q"><span class="small muted">Question ' + (i + 1) + ' / ' + QUIZ.length + '</span><b>' + esc(q.q) + '</b><div class="opts">' +
        q.o.map((o, j) => '<button data-q="' + i + '" data-o="' + j + '"' + (a !== undefined ? ' disabled' : '') + ' class="' + (a !== undefined ? (j === q.a ? 'right' : (j === a ? 'wrong' : '')) : '') + '">' + esc(o) + '</button>').join('') +
        '</div>' + (a !== undefined ? '<p class="exp">' + (a === q.a ? '✓ Bonne réponse. ' : '✗ Pas tout à fait. ') + esc(q.e) + '</p>' : '') + '</div>'; }).join('');
    const n = Object.keys(qAns).length, good = Object.entries(qAns).filter(([i, a]) => QUIZ[i].a === a).length;
    $('#qzScore').textContent = 'Score : ' + good + ' / ' + n;
    $('#qzBest').textContent = 'Meilleur : ' + (S.quizBest === null ? '—' : S.quizBest + ' / ' + QUIZ.length);
    const end = $('#qzEnd');
    if (n === QUIZ.length) { end.hidden = false; end.className = 'callout ' + (good >= PASS ? 'ok' : 'warn');
      end.innerHTML = '<b>' + good + ' / ' + QUIZ.length + ' : ' + (good >= PASS ? 'formation validée.' : 'presque !') + '</b> ' + (good >= PASS ? 'Bravo. Continue avec les niveaux supérieurs et les ressources.' : 'Relis les explications des questions ratées, puis recommence le quiz.');
    } else end.hidden = true;
  };
  renderQuiz();
  $('#qz').addEventListener('click', e => {
    const b = e.target.closest('[data-q]'); if (!b) return;
    qAns[+b.dataset.q] = +b.dataset.o;
    if (Object.keys(qAns).length === QUIZ.length) { const good = Object.entries(qAns).filter(([i, a]) => QUIZ[i].a === a).length; if (S.quizBest === null || good > S.quizBest) { S.quizBest = good; save(); progress(); } }
    const y = window.scrollY; renderQuiz(); window.scrollTo(0, y);
  });
  $('#qzReset').addEventListener('click', () => { qAns = {}; renderQuiz(); window.scrollTo(0, 0); });
}

/* ---------- Glossaire ---------- */
if ($('#gl')) {
  const renderGloss = () => {
    const q = $('#glQ').value.trim().toLowerCase();
    const list = GLOSS.slice().sort((a, b) => a[0].localeCompare(b[0], 'fr')).filter(g => !q || (g[0] + ' ' + g[1]).toLowerCase().includes(q));
    $('#glCount').textContent = list.length + ' terme' + (list.length > 1 ? 's' : '');
    $('#gl').innerHTML = list.map(g => '<div class="card"><b>' + esc(g[0]) + '</b><p>' + esc(g[1]) + '</p></div>').join('') || '<p class="muted">Aucun terme trouvé.</p>';
  };
  renderGloss(); $('#glQ').addEventListener('input', renderGloss);
}

/* ---------- Sécurité ---------- */
if ($('#secCheck')) {
  $('#secCheck').innerHTML = SECCHECK.map((s, i) => '<label class="check"><input type="checkbox" data-sec="' + i + '"' + (S.sec[i] ? ' checked' : '') + '> <span>' + esc(s) + '</span></label>').join('');
  $('#secCheck').addEventListener('change', e => { const i = e.target.dataset.sec; if (i !== undefined) { S.sec[i] = e.target.checked; save(); } });
}

/* ---------- Recherche dans toute la formation ---------- */
function renderSearch(){
  const raw = $('#sQ').value.trim(), q = raw.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 1);
  if (!words.length) { $('#sCount').textContent = ''; $('#sRes').innerHTML = '<p class="muted">Tape au moins un mot : par exemple « agent », « GPU », « Cursor », « 2012 ».</p>'; return; }
  const scored = [];
  SEARCH.forEach(r => {
    const t = r.t.toLowerCase(), x = r.x.toLowerCase();
    if (!words.every(w => t.includes(w) || x.includes(w))) return;
    let sc = 0; words.forEach(w => { if (t.includes(w)) sc += 10; sc += Math.min(5, x.split(w).length - 1); });
    scored.push({r, sc});
  });
  scored.sort((a, b) => b.sc - a.sc);
  $('#sCount').textContent = scored.length + ' résultat' + (scored.length > 1 ? 's' : '');
  const snip = x => { const i = x.toLowerCase().indexOf(words[0]); const s = Math.max(0, i - 80); return (s ? '…' : '') + x.slice(s, s + 220) + '…'; };
  const mark = s => { let h = esc(s); words.forEach(w => { h = h.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>'); }); return h; };
  $('#sRes').innerHTML = scored.slice(0, 120).map(({r}) => '<a class="card sr" href="' + L(r.v, r.f) + '"><span class="chip o">' + esc(r.k) + '</span><b>' + mark(r.t) + '</b><p class="small muted">' + mark(snip(r.x)) + '</p></a>').join('') || '<p class="muted">Aucun résultat. Essaie un autre mot ou une orthographe différente.</p>';
}
if ($('#sRes')) {
  let q = ''; try { q = new URLSearchParams(location.search).get('q') || sessionStorage.getItem(KEY + '.q') || ''; } catch (e) {}
  $('#sQ').value = q; if ($('#gQ')) $('#gQ').value = q;
  renderSearch(); $('#sQ').addEventListener('input', renderSearch);
}

/* ---------- Ancres : ouvrir un module, un chapitre, un cours, un niveau ---------- */
function route(){
  const h = decodeURIComponent((location.hash || '').slice(1));
  if ($('#coursGrid')) { if (h.indexOf('c-') === 0) openCourse(h.slice(2)); else if (h === 'liste' || !h) { closeCourse(); if (h) window.scrollTo(0, 0); } }
  const open = (sel, re) => { const m = h.match(re); if (!m) return; const d = $(sel + m[1]); if (d) { d.open = true; setTimeout(() => d.scrollIntoView({block:'start'}), 30); } };
  if ($('#mods')) open('#m-', /^m-(\d+)$/);
  if ($('#enc')) open('#e-', /^e-(\d+)$/);
  if ($('#res') && /^n-\d$/.test(h)) { $('#resLv').value = h.slice(2); renderRes(); }
}
route();
window.addEventListener('hashchange', route);
progress();

/* ---------- Application installable (uniquement quand le site est servi en https) ---------- */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
})();
