// Assemblage de l'appli : onglets, « Ce soir », photos et vidéos NASA, découvertes, encyclopédie, quiz, défis, outils.
const Appli = (() => {
  let vueActive = null;
  const jdMaintenant = () => Astro.jourJulien(new Date());
  const minuitLocal = (decalageJours = 0) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + decalageJours); return Astro.jourJulien(d); };
  const vecSoleil = jd => Astro.astresMobiles(jd)[0].eq;
  const vecMobile = id => jd => Astro.astresMobiles(jd).find(a => a.id === id).eq;
  const hJd = jd => jd === null || jd === undefined ? '—' : heure(Astro.jdVersDate(jd));

  // ---------- Navigation ----------
  function afficherVue(id) {
    if (vueActive === id) return;
    vueActive = id;
    $$('.onglet').forEach(b => { const a = b.dataset.vue === id; b.classList.toggle('actif', a); b.setAttribute('aria-selected', a); });
    $$('.vue').forEach(v => v.classList.toggle('active', v.id === 'vue-' + id));
    Systeme.activer(id === 'systeme'); Cosmos.activer(id === 'cosmos'); Demos.activer(id === 'demos');
    if (id === 'cesoir') construireCeSoir();
    if (id === 'medias') initMedias();
    if (id === 'ciel') Ciel.redessiner();
    const o = $(`.onglet[data-vue="${id}"]`); if (o) o.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    Memoire.ecrire('vue', id);
    Bus.emettre('vue', id);
  }

  // ---------- Calculs de la nuit ----------
  let cacheNuit = null;
  function calculerNuit() {
    const cle = `${new Date().toDateString()}|${Lieu.courant.lat}|${Lieu.courant.lon}`;
    if (cacheNuit && cacheNuit.cle === cle) return cacheNuit;
    const { lat, lon } = Lieu.courant, j0 = minuitLocal(0), j1 = minuitLocal(1);
    const sol0 = Astro.leverCoucher(vecSoleil, j0, lat, lon, -0.833), sol1 = Astro.leverCoucher(vecSoleil, j1, lat, lon, -0.833);
    const astro0 = Astro.leverCoucher(vecSoleil, j0, lat, lon, -18), astro1 = Astro.leverCoucher(vecSoleil, j1, lat, lon, -18);
    const debut = sol0.coucher || j0 + 0.75, fin = sol1.lever || j1 + 0.25;
    const milieu = astro0.coucher && astro1.lever ? (astro0.coucher + astro1.lever) / 2 : (debut + fin) / 2;
    // planètes et Lune pendant la nuit (Soleil sous -6°)
    const corps = ['lune', ...Astro.PLANETES.map(p => p.id)].map(id => ({ id, nom: id === 'lune' ? 'Lune' : Astro.PLANETES.find(p => p.id === id).nom, max: -90, jdMax: null, az: 0, mag: 0 }));
    for (let jd = debut; jd <= fin; jd += 1 / 96) {
      const M = Astro.matriceHorizon(jd, lat, lon), mob = Astro.astresMobiles(jd);
      if (Astro.versAltAz(Astro.mulVec(M, mob[0].eq)).alt > -6) continue;
      for (const c of corps) {
        const a = mob.find(m => m.id === c.id), h = Astro.versAltAz(Astro.mulVec(M, a.eq));
        if (h.alt > c.max) { c.max = h.alt; c.jdMax = jd; c.az = h.az; c.mag = a.mag; }
      }
    }
    for (const c of corps) { const r = Astro.leverCoucher(vecMobile(c.id), j0 + 0.5, lat, lon, c.id === 'lune' ? 0.125 : 0); c.lever = r.lever; c.coucher = r.coucher; }
    // plus beaux objets à 22 h (ou au milieu de la soirée)
    const jdVue = Math.max(debut + 1 / 24, Math.min(fin - 1 / 24, j0 + 22 / 24));
    const M = Astro.matriceHorizon(jdVue, lat, lon);
    const haut = v => Astro.versAltAz(Astro.mulVec(M, v));
    const objets = Ciel.messier.filter(o => o.mag < 7.5).map(o => ({ o, h: haut(o.v) })).filter(x => x.h.alt > 25).sort((a, b) => a.o.mag - b.o.mag).slice(0, 9);
    const etoiles = CIEL.nomsEtoiles.filter(n => n[1] && CIEL.etoiles[n[0] * 4 + 2] < 150).map(n => ({ nom: Ciel.NOMS_FR[n[1]] || n[1], cle: n[1], mag: CIEL.etoiles[n[0] * 4 + 2] / 100, h: haut(Astro.versVecteur(CIEL.etoiles[n[0] * 4] / 100, CIEL.etoiles[n[0] * 4 + 1] / 100)) })).filter(x => x.h.alt > 15).slice(0, 8);
    const constels = Ciel.constels.filter(c => c.rang <= 2).map(c => ({ c, h: haut(c.v) })).filter(x => x.h.alt > 30).sort((a, b) => a.c.rang - b.c.rang || b.h.alt - a.h.alt).slice(0, 10);
    const L = Astro.infosLune(milieu);
    cacheNuit = { cle, sol0, sol1, astro0, astro1, corps, objets, etoiles, constels, L, jdVue, debut, fin };
    return cacheNuit;
  }
  function soleilAujourdhui() { const n = calculerNuit(); return { lever: hJd(n.sol0.lever), coucher: hJd(n.sol0.coucher), nuit: n.astro0.coucher ? hJd(n.astro0.coucher) : 'pas de nuit noire en ce moment' }; }
  function prochainEssaim() {
    const mois = { janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5, juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11 };
    const auj = new Date(); auj.setHours(0, 0, 0, 0);
    const avecDate = Savoir.essaims.map(e => { const m = e[1].match(/(\d+)(?:-\d+)?\s+(\S+)/) || [null, '5', e[1].split(' ').pop()]; let d = new Date(auj.getFullYear(), mois[m[2]], +m[1]); if (d < auj) d = new Date(auj.getFullYear() + 1, mois[m[2]], +m[1]); return [...e, d]; });
    return avecDate.filter(e => e[2] >= 15).sort((a, b) => a[5] - b[5])[0];
  }
  function resumeCeSoir() {
    const n = calculerNuit();
    const visibles = n.corps.filter(c => c.id !== 'lune' && c.max > 8 && c.mag < 6.5).sort((a, b) => a.mag - b.mag);
    const lune = n.corps[0];
    const pl = visibles.length ? visibles.map(c => `<b>${c.nom}</b> (vers ${cardinal(c.az)}, au mieux vers ${hJd(c.jdMax)})`).join(', ') : 'aucune planète brillante bien placée';
    const html = `Ce soir à <b>${echap(Lieu.courant.nom)}</b> : coucher du Soleil à ${hJd(n.sol0.coucher)}. Lune : ${n.L.nom.toLowerCase()} (${Math.round(n.L.eclairement * 100)} %)${lune.max > 0 ? `, levée vers ${hJd(lune.lever)}` : ', absente de la nuit'}. Planètes visibles : ${pl}.`;
    const texte = `Ce soir à ${Lieu.courant.nom}, le Soleil se couche à ${hJd(n.sol0.coucher)}. La Lune est ${n.L.nom.toLowerCase()}. ${visibles.length ? 'Tu pourras voir ' + visibles.map(v => v.nom).join(', ') + '.' : 'Pas de planète brillante bien placée.'}`;
    return { html, texte };
  }

  // ---------- Onglet « Ce soir » ----------
  function construireCeSoir() {
    const el = $('#cesoir');
    el.innerHTML = '<p class="texte-2">Calcul du programme de la nuit…</p>';
    setTimeout(() => {
      const n = calculerNuit();
      const lune = n.corps[0], planetes = n.corps.slice(1).filter(c => c.mag < 6.5);
      const gene = lune.max > 10 && n.L.eclairement > 0.5;
      const auj = new Date().toISOString().slice(0, 10);
      const ess = prochainEssaim();
      const phases = Astro.phasesLune(jdMaintenant(), jdMaintenant() + 45);
      const evts = Astro.evenementsPlanetes(jdMaintenant(), 300).slice(0, 6);
      el.innerHTML = `<h2>🔭 Ce soir à ${echap(Lieu.courant.nom)}</h2>
        <p class="intro">${dateLongue(new Date())}. Programme calculé pour ta position. <button class="btn petit" id="cs-lieu">Changer de lieu</button></p>
        <div class="grille">
          <div class="carte"><h3>☀️ Soleil</h3><p>Coucher <b>${hJd(n.sol0.coucher)}</b> · lever demain <b>${hJd(n.sol1.lever)}</b></p>
            <p class="texte-2">${n.astro0.coucher ? `Nuit noire de <b>${hJd(n.astro0.coucher)}</b> à <b>${hJd(n.astro1.lever)}</b>.` : 'Pas de nuit complètement noire en ce moment à cette latitude (le Soleil ne descend pas à 18° sous l’horizon).'}</p></div>
          <div class="carte"><h3>🌙 Lune</h3><div class="ligne"><svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">${luneSvg(28, 28, 24, n.L.ecart)}</svg><div><b>${n.L.nom}</b><br>éclairée à ${Math.round(n.L.eclairement * 100)} %</div></div>
            <p class="texte-2" style="margin-top:8px">Lever ${hJd(lune.lever)} · coucher ${hJd(lune.coucher)}. ${gene ? 'Sa lumière gênera l’observation des galaxies et nébuleuses.' : 'Bonne nuit pour les objets faibles !'}</p>
            <button class="btn petit" data-ciel="Lune">Montrer</button></div>
          <div class="carte"><h3>🌠 Prochaine pluie d’étoiles filantes</h3><p><b>${ess[0]}</b> : maximum le ${ess[1]}, jusqu’à ${ess[2]} par heure.</p><p class="texte-2">Radiant : ${ess[3]}. Origine : ${ess[4]}.</p></div>
        </div>
        <h3 class="section">🪐 Les planètes cette nuit</h3>
        <div class="defile-x"><table class="tableau"><tr><th>Planète</th><th>Visible ?</th><th>Meilleur moment</th><th>Lever / coucher</th><th>Éclat</th><th></th></tr>
          ${planetes.map(c => `<tr><td><b>${c.nom}</b></td><td>${c.max > 8 ? '✅ oui' : c.max > 0 ? '⚠️ très basse' : '❌ non'}</td><td>${c.max > 0 ? `${hJd(c.jdMax)}, ${Math.round(c.max)}° de haut vers ${cardinal(c.az)}` : '—'}</td><td>${hJd(c.lever)} / ${hJd(c.coucher)}</td><td>${nombre(c.mag, 1)} ${c.mag < 0 ? '(très brillante)' : c.mag < 5.5 ? '' : '(jumelles)'}</td>
          <td>${c.max > 0 ? `<button class="btn petit" data-ciel="${c.nom}" data-jd="${c.jdMax}">Voir</button>` : ''}</td></tr>`).join('')}</table></div>
        <h3 class="section">✨ Les plus beaux objets vers ${hJd(n.jdVue)}</h3>
        <div class="grille">${n.objets.map(({ o, h }) => `<div class="carte cliquable" data-ciel="${o.id}" data-jd="${n.jdVue}"><div class="meta">${o.id} · ${Ciel.TYPES[o.type] || ''} · ${h.alt > 50 ? 'haut dans le ciel' : 'vers ' + cardinal(h.az)}</div><h3>${echap(o.nom)}</h3><p class="texte-2 petit">${o.mag < 4.5 ? '👁️ à l’œil nu sous un ciel noir' : o.mag < 7 ? '🔭 aux jumelles' : '🔭 au télescope'} · magnitude ${nombre(o.mag, 1)}</p></div>`).join('') || '<p class="texte-2">Pas d’objet brillant bien placé.</p>'}</div>
        <h3 class="section">⭐ Étoiles brillantes et constellations bien placées</h3>
        <div class="ligne">${n.etoiles.map(e => `<button class="btn petit" data-ciel="${echap(e.cle)}" data-jd="${n.jdVue}">${echap(e.nom)} · ${cardinal(e.h.az)}</button>`).join('')}</div>
        <div class="ligne" style="margin-top:8px">${n.constels.map(({ c, h }) => `<button class="btn petit" data-ciel="${echap(c.fr)}" data-jd="${n.jdVue}">${echap(c.fr)} · ${cardinal(h.az)}</button>`).join('')}</div>
        <h3 class="section">📅 À venir</h3>
        <div class="grille">
          <div class="carte"><h3>Phases de la Lune</h3>${phases.map(p => `<p>${['🌑', '🌓', '🌕', '🌗'][p.k]} ${p.nom} : <b>${dateCourte(Astro.jdVersDate(p.jd))}</b></p>`).join('')}</div>
          <div class="carte"><h3>Planètes</h3>${evts.map(e => `<p><b>${Systeme.NOMS[e.id]}</b> : ${e.type === 'opposition' ? 'opposition, au plus près et visible toute la nuit' : e.type} · ${dateCourte(Astro.jdVersDate(e.jd))}</p>`).join('')}</div>
          <div class="carte"><h3>Éclipses</h3>${Savoir.eclipses.filter(e => e[0] >= auj).slice(0, 4).map(e => `<p><b>${new Date(e[0]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</b> : ${e[1]}, ${e[2]}<br><span class="petit texte-2">${e[3]}</span></p>`).join('')}</div>
        </div>`;
      $('#cs-lieu').onclick = () => { afficherVue('ciel'); $('#ciel-btn-options').click(); };
      brancherBoutonsCiel(el);
    }, 30);
  }
  function brancherBoutonsCiel(racine) {
    racine.querySelectorAll('[data-ciel]').forEach(b => b.onclick = () => {
      if (b.dataset.jd) Ciel.reglerDate(Astro.jdVersDate(+b.dataset.jd));
      Ciel.montrer(b.dataset.ciel);
    });
  }
  function luneSvg(cx, cy, r, ecart) {
    const cr = ecart <= 180, i = (cr ? 180 - ecart : ecart - 180) * Math.PI / 180, s = cr ? 1 : -1;
    let d = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${cr ? 1 : 0} ${cx} ${cy + r}`;
    for (let k = 20; k >= -20; k--) { const y = r * k / 20; d += ` L ${cx + s * -Math.cos(i) * Math.sqrt(Math.max(0, r * r - y * y))} ${cy + y}`; }
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2b2f40"/><path d="${d} Z" fill="#f1eee2"/>`;
  }

  // ---------- Photos et vidéos NASA (seule source externe de l'appli) ----------
  const TRADUCTION = { lune: 'moon', soleil: 'sun', terre: 'earth', etoile: 'star', etoiles: 'stars', galaxie: 'galaxy', galaxies: 'galaxies', nebuleuse: 'nebula', nebuleuses: 'nebula', 'trou noir': 'black hole', comete: 'comet',
    fusee: 'rocket', lancement: 'launch', aurore: 'aurora', aurores: 'aurora', astronaute: 'astronaut', 'station spatiale': 'space station', eclipse: 'eclipse', planete: 'planet', saturne: 'saturn', venus: 'venus', mercure: 'mercury',
    pluton: 'pluto', amas: 'cluster', anneaux: 'rings', cratere: 'crater', volcan: 'volcano', tempete: 'storm', sonde: 'probe', telescope: 'telescope', 'voie lactee': 'milky way', andromede: 'andromeda', orion: 'orion', asteroide: 'asteroid',
    'sortie extravehiculaire': 'spacewalk', marche: 'walk', 'pleine lune': 'full moon', 'eruption solaire': 'solar flare', ouragan: 'hurricane', nuit: 'night' };
  const traduire = q => { let t = ' ' + Savoir.normaliser(q) + ' '; for (const [fr, en] of Object.entries(TRADUCTION).sort((a, b) => b[0].length - a[0].length)) t = t.replace(new RegExp(` ${fr} `, 'g'), ` ${en} `); return t.trim(); };
  const THEMES = [['🚀 Artemis', 'Artemis'], ['👨‍🚀 Apollo 11', 'Apollo 11'], ['🔭 James Webb', 'James Webb Space Telescope'], ['🌌 Hubble', 'Hubble galaxy'], ['🔴 Mars', 'Mars Perseverance'], ['🛰️ Station spatiale', 'International Space Station'],
    ['🌍 La Terre vue d’en haut', 'Earth from space'], ['☀️ Le Soleil', 'Sun Solar Dynamics Observatory'], ['🌑 Éclipses', 'solar eclipse'], ['🟠 Jupiter', 'Jupiter Juno'], ['🪐 Saturne', 'Saturn Cassini'], ['🌈 Aurores', 'aurora from space'],
    ['☁️ Nébuleuses', 'nebula'], ['🌀 Galaxies', 'galaxy'], ['🔥 Lancements', 'rocket launch'], ['🚶 Sorties dans l’espace', 'spacewalk']];
  let mediasInit = false, filtreType = 'image,video';
  const cleNasa = () => Memoire.lire('cle-nasa', '') || 'DEMO_KEY';
  function initMedias() {
    if (mediasInit) return; mediasInit = true;
    $('#medias').innerHTML = `<h2>📷 Photos et vidéos de la NASA</h2>
      <p class="intro">De vraies images et vidéos, chargées directement depuis la médiathèque officielle de la NASA. C’est le seul onglet qui a besoin d’internet. Les titres et descriptions sont fournis par la NASA, en anglais.</p>
      <div class="carte" id="apod"><p class="texte-2">Chargement de l’image astronomique du jour…</p></div>
      <h3 class="section">Chercher dans la médiathèque</h3>
      <form class="ligne" id="nasa-form"><input type="search" id="nasa-q" placeholder="Ex. : nébuleuse d’Orion, Jupiter, Apollo, aurore…" style="flex:1;min-width:200px" aria-label="Recherche">
        <select id="nasa-type" aria-label="Type"><option value="image,video">Photos et vidéos</option><option value="image">Photos</option><option value="video">Vidéos</option></select>
        <button class="btn primaire">Chercher</button></form>
      <div class="ligne" style="margin:10px 0">${THEMES.map(([l, q]) => `<button class="btn petit" data-q="${echap(q)}">${l}</button>`).join('')}</div>
      <div id="nasa-etat" class="texte-2 petit"></div><div class="medias" id="nasa-res"></div>
      <details style="margin-top:20px"><summary class="texte-2">Réglage : clé NASA personnelle (facultatif)</summary>
        <p class="petit texte-2">L’image du jour utilise la clé de démonstration de la NASA, limitée à quelques dizaines de demandes par heure. Si tu l’atteins, tu peux créer une clé gratuite sur api.nasa.gov et la coller ici. Elle reste dans ce navigateur.</p>
        <div class="ligne"><input type="text" id="nasa-cle" value="${echap(Memoire.lire('cle-nasa', ''))}" placeholder="Ta clé NASA" style="flex:1"><button class="btn petit" id="nasa-cle-ok">Enregistrer</button></div></details>`;
    $('#nasa-form').onsubmit = e => { e.preventDefault(); filtreType = $('#nasa-type').value; chercherNasa($('#nasa-q').value); };
    $$('#medias [data-q]').forEach(b => b.onclick = () => { $('#nasa-q').value = b.dataset.q; chercherNasa(b.dataset.q); });
    $('#nasa-cle-ok').onclick = () => { Memoire.ecrire('cle-nasa', $('#nasa-cle').value.trim()); chargerApod(true); };
    chargerApod();
    if (requeteEnAttente) { const q = requeteEnAttente; requeteEnAttente = null; $('#nasa-q').value = q; chercherNasa(q); }
    else chercherNasa('James Webb Space Telescope');
  }
  async function chargerApod(forcer = false) {
    const boite = $('#apod'), jour = new Date().toISOString().slice(0, 10);
    let d = forcer ? null : Memoire.lire('apod-' + jour, null);
    try {
      if (!d) {
        const r = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(cleNasa())}&thumbs=true`);
        if (!r.ok) throw new Error(r.status === 429 ? 'limite de la clé de démonstration atteinte' : 'erreur ' + r.status);
        d = await r.json(); Memoire.ecrire('apod-' + jour, d);
      }
      const img = d.media_type === 'image' ? d.url : d.thumbnail_url;
      boite.innerHTML = `<div class="apod"><div>${img ? `<img src="${echap(img)}" alt="${echap(d.title)}" loading="lazy">` : ''}</div>
        <div><div class="meta">🌟 Image astronomique du jour de la NASA · ${echap(d.date)}</div><h3>${echap(d.title)}</h3>
        <p class="texte-2 petit" style="max-height:260px;overflow:auto">${echap(d.explanation)}</p>
        <p class="petit texte-2">${d.copyright ? '© ' + echap(d.copyright.trim()) : 'Domaine public, NASA'}</p>
        <div class="ligne">${d.hdurl ? `<a class="btn petit" href="${echap(d.hdurl)}" target="_blank" rel="noopener">Haute définition</a>` : ''}${d.media_type === 'video' ? `<a class="btn petit" href="${echap(d.url)}" target="_blank" rel="noopener">Voir la vidéo (site externe)</a>` : ''}</div></div></div>`;
    } catch (e) {
      boite.innerHTML = `<p class="texte-2">L’image du jour n’a pas pu être chargée (${echap(e.message || 'pas de connexion')}). Le reste de l’atlas fonctionne sans internet.</p>`;
    }
  }
  let requeteEnAttente = null, dernierResultats = [];
  async function chercherNasa(q) {
    q = (q || '').trim(); if (!q) return;
    const en = traduire(q), etat = $('#nasa-etat'), res = $('#nasa-res');
    etat.textContent = `Recherche de « ${q} »${en !== Savoir.normaliser(q) ? ` (en anglais : ${en})` : ''}…`; res.innerHTML = '';
    try {
      const r = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(en)}&media_type=${filtreType}&page_size=48`);
      if (!r.ok) throw new Error('erreur ' + r.status);
      const items = ((await r.json()).collection || {}).items || [];
      dernierResultats = items.filter(it => it.data && it.data[0] && it.links && it.links[0]).slice(0, 48);
      etat.textContent = dernierResultats.length ? `${dernierResultats.length} résultats de la NASA pour « ${q} ». Clique pour agrandir.` : `Aucun résultat pour « ${q} ». Essaie un autre mot (en anglais, par exemple).`;
      res.innerHTML = dernierResultats.map((it, i) => { const d = it.data[0]; return `<button class="media" data-i="${i}"><img src="${echap(it.links[0].href.replace(/^http:/, 'https:'))}" alt="" loading="lazy"><div class="titre-media"><div class="type-media">${d.media_type === 'video' ? '🎬 vidéo' : '📷 photo'} · ${echap((d.date_created || '').slice(0, 4))}</div>${echap(d.title)}</div></button>`; }).join('');
      $$('#nasa-res .media').forEach(b => b.onclick = () => ouvrirMedia(dernierResultats[+b.dataset.i]));
    } catch (e) {
      etat.textContent = `La médiathèque de la NASA ne répond pas (${e.message || 'pas de connexion'}). Vérifie ta connexion internet.`;
    }
  }
  async function ouvrirMedia(it) {
    const d = it.data[0], v = $('#visionneuse');
    v.hidden = false;
    v.innerHTML = `<div class="boite"><button class="fermer" aria-label="Fermer">×</button><h3>${echap(d.title)}</h3><p class="texte-2">Chargement…</p></div>`;
    const fermer = () => { v.hidden = true; v.innerHTML = ''; };
    v.querySelector('.fermer').onclick = fermer; v.onclick = e => { if (e.target === v) fermer(); };
    let fichiers = [];
    try { fichiers = (await (await fetch(it.href.replace(/^http:/, 'https:'))).json()).map(u => u.replace(/^http:/, 'https:')); } catch { /* on garde la vignette */ }
    const choisir = suffixes => { for (const s of suffixes) { const f = fichiers.find(u => u.toLowerCase().includes(s)); if (f) return f; } return null; };
    let media;
    if (d.media_type === 'video') { const src = choisir(['~mobile.mp4', '~medium.mp4', '~small.mp4', '~preview.mp4', '~orig.mp4', '.mp4']); media = src ? `<video src="${echap(src)}" controls autoplay playsinline poster="${echap(it.links[0].href)}"></video>` : '<p>Vidéo indisponible.</p>'; }
    else { const src = choisir(['~large.jpg', '~medium.jpg', '~orig.jpg', '.jpg', '.png']) || it.links[0].href; media = `<img src="${echap(src)}" alt="${echap(d.title)}">`; }
    const orig = choisir(['~orig.']);
    if (v.hidden) return;
    v.innerHTML = `<div class="boite"><button class="fermer" aria-label="Fermer">×</button><h3>${echap(d.title)}</h3>${media}
      <p class="petit texte-2">${echap((d.date_created || '').slice(0, 10))} · ${echap(d.center || 'NASA')}${d.photographer ? ' · ' + echap(d.photographer) : ''} · Source : médiathèque NASA (${echap(d.nasa_id)})</p>
      <p class="petit" style="white-space:pre-line">${echap((d.description || '').replace(/<[^>]+>/g, ' ').slice(0, 1600))}</p>
      ${orig ? `<a class="btn petit" href="${echap(orig)}" target="_blank" rel="noopener">Fichier original</a>` : ''}</div>`;
    v.querySelector('.fermer').onclick = fermer;
  }
  function ouvrirMedias(q) {
    if (!mediasInit) requeteEnAttente = q;
    afficherVue('medias');
    if (mediasInit && q) { $('#nasa-q').value = q; chercherNasa(q); }
  }

  // ---------- Découvertes ----------
  function construireDecouvertes() {
    const el = $('#decouvertes');
    el.innerHTML = `<h2>✨ Des découvertes à couper le souffle</h2><p class="intro">Ce que l’humanité a appris du ciel, et qui donne le vertige.</p>
      <div class="carte" style="margin:16px 0;border-color:#5a3f8a"><div class="meta">🌟 Le saviez-vous ?</div><p id="fait" style="font-size:1.1rem"></p><button class="btn petit" id="fait-suivant">Encore un !</button></div>
      <div class="grille">${Savoir.decouvertes.map((d, i) => `<div class="carte"><div class="meta">${d.annee}</div><div class="chiffre">${d.chiffre}</div><h3 style="margin-top:6px">${d.titre}</h3><p class="texte-2">${d.texte}</p>
        <div class="ligne">${d.ciel ? `<button class="btn petit" data-ciel="${echap(d.ciel)}">🌌 Dans le ciel</button>` : ''}${d.nasa ? `<button class="btn petit" data-nasa="${i}">📷 Photos NASA</button>` : ''}${d.fiche ? `<button class="btn petit" data-fiche="${d.fiche}">📚 Fiche</button>` : ''}${d.cosmos ? `<button class="btn petit" data-cosmos="${d.cosmos}">🌀 En 3D</button>` : ''}${d.systeme ? `<button class="btn petit" data-systeme="${d.systeme}">🪐 En 3D</button>` : ''}${d.demo ? `<button class="btn petit" data-demo="${d.demo}">🧪 Démo</button>` : ''}</div></div>`).join('')}</div>`;
    const fait = () => { $('#fait').textContent = Savoir.faits[Math.floor(Math.random() * Savoir.faits.length)]; };
    fait(); $('#fait-suivant').onclick = fait;
    brancherActions(el);
  }
  function brancherActions(el) {
    brancherBoutonsCiel(el);
    el.querySelectorAll('[data-nasa]').forEach(b => b.onclick = () => ouvrirMedias(Savoir.decouvertes[+b.dataset.nasa].nasa));
    el.querySelectorAll('[data-fiche]').forEach(b => b.onclick = () => ouvrirFiche(b.dataset.fiche));
    el.querySelectorAll('[data-cosmos]').forEach(b => b.onclick = () => { afficherVue('cosmos'); Cosmos.choisirScene(b.dataset.cosmos); });
    el.querySelectorAll('[data-systeme]').forEach(b => b.onclick = () => { afficherVue('systeme'); Systeme.choisir(b.dataset.systeme); });
    el.querySelectorAll('[data-demo]').forEach(b => b.onclick = () => { afficherVue('demos'); Demos.afficher(b.dataset.demo); });
  }

  // ---------- Encyclopédie ----------
  const CATEGORIES = ['Système solaire', 'Étoiles', 'Galaxies et cosmos', 'Phénomènes', 'Observer', 'Exploration', 'Histoire'];
  let ficheCourante = 'systeme-solaire';
  function construireEncyclo(filtre = '') {
    const el = $('#encyclo'), f = Savoir.normaliser(filtre);
    const liste = f ? Savoir.rechercher(filtre, 40).map(r => r.f) : Savoir.fiches;
    el.innerHTML = `<h2>📚 Encyclopédie de l’univers</h2>
      <div class="encyclo"><nav aria-label="Fiches"><input type="search" id="enc-recherche" placeholder="Chercher…" value="${echap(filtre)}" style="width:100%" aria-label="Chercher une fiche">
        ${f ? `<h4>Résultats</h4>${liste.map(x => `<button data-f="${x.id}" class="${x.id === ficheCourante ? 'actif' : ''}">${echap(x.titre)}</button>`).join('') || '<p class="petit texte-2">Aucune fiche.</p>'}`
        : CATEGORIES.map(c => `<h4>${c}</h4>${liste.filter(x => x.cat === c).map(x => `<button data-f="${x.id}" class="${x.id === ficheCourante ? 'actif' : ''}">${echap(x.titre)}</button>`).join('')}`).join('')}
        <h4>Schémas</h4>${Object.entries(Schemas.liste).map(([id, t]) => `<button data-s="${id}">🖼️ ${t}</button>`).join('')}
      </nav><article class="article" id="enc-article"></article></div>`;
    const champ = $('#enc-recherche');
    champ.oninput = () => { const v = champ.value; construireEncyclo(v); const c = $('#enc-recherche'); c.focus(); c.setSelectionRange(v.length, v.length); };
    $$('#encyclo [data-f]').forEach(b => b.onclick = () => { ficheCourante = b.dataset.f; $$('#encyclo [data-f]').forEach(x => x.classList.toggle('actif', x === b)); afficherFiche(); $('#enc-article').scrollIntoView({ block: 'start', behavior: 'smooth' }); });
    $$('#encyclo [data-s]').forEach(b => b.onclick = () => { $('#enc-article').innerHTML = `<h2>${Schemas.liste[b.dataset.s]}</h2><div class="schema">${Schemas.dessiner(b.dataset.s)}</div>`; });
    afficherFiche();
  }
  function afficherFiche() {
    const f = Savoir.fiche(ficheCourante) || Savoir.fiches[0];
    const actions = [];
    if (f.ciel) actions.push(`<button class="btn petit" data-ciel="${echap(f.ciel)}">🌌 Voir dans le ciel</button>`);
    if (f.systeme) actions.push(`<button class="btn petit" data-systeme="${f.systeme}">🪐 Système solaire 3D</button>`);
    if (f.cosmos) actions.push(`<button class="btn petit" data-cosmos="${f.cosmos}">🌀 Univers 3D</button>`);
    if (f.demo) actions.push(`<button class="btn petit" data-demo="${f.demo}">🧪 Démonstration</button>`);
    if (f.nasa) actions.push(`<button class="btn petit" data-q="${echap(f.nasa)}">📷 Photos NASA</button>`);
    if (f.quiz) actions.push(`<button class="btn petit" data-quiz="${f.quiz}">🧠 Quiz</button>`);
    const art = $('#enc-article');
    art.innerHTML = `<div class="meta">${f.cat}</div><h2>${echap(f.titre)}</h2>${f.html}${f.schema ? `<div class="schema">${Schemas.dessiner(f.schema)}</div>` : ''}<div class="ligne" style="margin-top:12px">${actions.join('')}</div>`;
    brancherActions(art);
    art.querySelectorAll('[data-q]').forEach(b => b.onclick = () => ouvrirMedias(b.dataset.q));
    art.querySelectorAll('[data-quiz]').forEach(b => b.onclick = () => { afficherVue('quiz'); lancerQuiz(b.dataset.quiz); });
  }
  function ouvrirFiche(id) { ficheCourante = id; afficherVue('encyclo'); construireEncyclo(); }

  // ---------- Quiz ----------
  const melanger = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  let partie = null;
  function accueilQuiz() {
    const scores = Memoire.lire('scores', {});
    $('#quiz').innerHTML = `<h2>🧠 Petits quiz</h2><p class="intro">Huit questions par thème, avec l’explication après chaque réponse. Ton meilleur score est gardé dans ce navigateur.</p>
      <div class="grille">${[...Object.keys(Savoir.quiz).map(t => [t, `${Savoir.quiz[t].length} questions`]), ['constellations', 'Reconnais 8 constellations à leur vraie forme'], ['eclair', '10 questions au hasard, tous thèmes']].map(([t, d]) =>
        `<div class="carte cliquable" data-theme="${echap(t)}"><h3>${t === 'constellations' ? '⭐ Reconnais la constellation' : t === 'eclair' ? '⚡ Quiz éclair' : t}</h3><p class="texte-2">${d}</p><span class="pastille">Meilleur score : ${scores[t] !== undefined ? scores[t] : '—'}</span></div>`).join('')}</div>`;
    $$('#quiz [data-theme]').forEach(c => c.onclick = () => lancerQuiz(c.dataset.theme));
  }
  function lancerQuiz(theme) {
    let questions;
    if (theme === 'constellations') {
      const pool = Ciel.lignesConst.filter(c => { const k = Ciel.constels.find(x => x.id === c.id); return k && k.rang <= 2 && c.polys.flat().length >= 5; });
      questions = melanger(pool).slice(0, 8).map(c => {
        const nom = id => Ciel.constels.find(x => x.id === id).fr;
        const mauvaises = melanger(pool.filter(x => x.id !== c.id)).slice(0, 3).map(x => nom(x.id));
        const choix = melanger([nom(c.id), ...mauvaises]);
        const k = Ciel.constels.find(x => x.id === c.id);
        return { q: 'Quelle est cette constellation ?', choix, bonne: choix.indexOf(nom(c.id)), expl: `C’est ${nom(c.id)} (${k.la} en latin).`, dessin: c, cible: nom(c.id) };
      });
    } else {
      const base = theme === 'eclair' ? melanger(Object.values(Savoir.quiz).flat()).slice(0, 10) : Savoir.quiz[theme];
      questions = base.map(([q, rep, b, expl]) => { const ordre = melanger(rep.map((r, i) => i)); return { q, choix: ordre.map(i => rep[i]), bonne: ordre.indexOf(b), expl }; });
    }
    partie = { theme, questions, i: 0, score: 0 };
    afficherQuestion();
  }
  function dessinerConstellation(canvas, c) {
    const { ctx, w, h } = ajusterCanvas(canvas);
    ctx.fillStyle = '#02040a'; ctx.fillRect(0, 0, w, h);
    const pts = c.polys.flat(), m = [0, 0, 0]; pts.forEach(p => { m[0] += p[0]; m[1] += p[1]; m[2] += p[2]; });
    const n = Math.hypot(...m), z = m.map(x => x / n), x0 = Math.hypot(z[0], z[1]) > 1e-6 ? [-z[1], z[0], 0].map(v => v / Math.hypot(z[0], z[1])) : [1, 0, 0];
    const y0 = [z[1] * x0[2] - z[2] * x0[1], z[2] * x0[0] - z[0] * x0[2], z[0] * x0[1] - z[1] * x0[0]];
    const proj = p => { const d = p[0] * z[0] + p[1] * z[1] + p[2] * z[2]; return [-(p[0] * x0[0] + p[1] * x0[1] + p[2] * x0[2]) / d, (p[0] * y0[0] + p[1] * y0[1] + p[2] * y0[2]) / d]; };
    const xy = pts.map(proj), xs = xy.map(p => p[0]), ys = xy.map(p => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2, ech = Math.min(w, h) * 0.8 / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 0.05);
    const P = p => { const [a, b] = proj(p); return [w / 2 + (a - cx) * ech, h / 2 - (b - cy) * ech]; };
    let g = 5; for (let i = 0; i < 120; i++) { g = (g * 16807) % 2147483647; const x = g % w; g = (g * 16807) % 2147483647; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x, g % h, 1, 1); }
    ctx.strokeStyle = 'rgba(138,180,255,.75)'; ctx.lineWidth = 2;
    for (const poly of c.polys) { ctx.beginPath(); poly.forEach((p, k) => { const [x, y] = P(p); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); }
    ctx.fillStyle = '#fff'; for (const p of pts) { const [x, y] = P(p); ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 2 * Math.PI); ctx.fill(); }
  }
  function afficherQuestion() {
    const p = partie, q = p.questions[p.i];
    $('#quiz').innerHTML = `<div class="ligne" style="justify-content:space-between"><button class="btn petit" id="qz-retour">← Thèmes</button><span class="pastille">Question ${p.i + 1}/${p.questions.length} · score ${p.score}</span></div>
      <div class="progression"><div style="width:${p.i / p.questions.length * 100}%"></div></div>
      <div class="carte" style="max-width:720px;margin:16px auto">${q.dessin ? '<canvas class="constel-canvas" id="qz-canvas"></canvas>' : ''}
        <div class="quiz-question">${echap(q.q)}</div><div class="reponses">${q.choix.map((c, i) => `<button data-i="${i}">${echap(c)}</button>`).join('')}</div><div id="qz-suite"></div></div>`;
    if (q.dessin) dessinerConstellation($('#qz-canvas'), q.dessin);
    $('#qz-retour').onclick = accueilQuiz;
    $$('#quiz .reponses button').forEach(b => b.onclick = () => {
      const i = +b.dataset.i, juste = i === q.bonne;
      if (juste) p.score++;
      $$('#quiz .reponses button').forEach((x, k) => { x.disabled = true; if (k === q.bonne) x.classList.add('bonne'); else if (k === i) x.classList.add('fausse'); });
      $('#qz-suite').innerHTML = `<div class="explication">${juste ? '✅ Bravo ! ' : '❌ Raté. '}${echap(q.expl)}</div><div class="ligne" style="margin-top:12px;justify-content:flex-end">${q.cible ? '<button class="btn petit" id="qz-ciel">🌌 La voir dans le ciel</button>' : ''}<button class="btn primaire" id="qz-suivant">${p.i < p.questions.length - 1 ? 'Question suivante →' : 'Voir mon score'}</button></div>`;
      if (q.cible) $('#qz-ciel').onclick = () => Ciel.montrer(q.cible);
      $('#qz-suivant').onclick = () => { p.i++; if (p.i < p.questions.length) afficherQuestion(); else finQuiz(); };
      $('#qz-suivant').focus();
    });
  }
  function finQuiz() {
    const p = partie, total = p.questions.length, scores = Memoire.lire('scores', {});
    const record = scores[p.theme] === undefined || p.score > parseInt(scores[p.theme], 10);
    if (record) { scores[p.theme] = `${p.score}/${total}`; Memoire.ecrire('scores', scores); }
    const ratio = p.score / total, etoiles = ratio === 1 ? 3 : ratio >= 0.6 ? 2 : ratio > 0 ? 1 : 0;
    $('#quiz').innerHTML = `<div class="carte" style="max-width:560px;margin:30px auto;text-align:center"><div style="font-size:2.6rem">${'⭐'.repeat(etoiles) || '🌑'}</div>
      <h2>${p.score} / ${total}</h2><p class="texte-2">${ratio === 1 ? 'Sans faute ! Tu es prêt pour l’Agence spatiale.' : ratio >= 0.6 ? 'Très beau score ! Encore un petit effort pour les trois étoiles.' : 'Chaque erreur est une découverte. Retente ta chance !'}${record ? '<br><b>Nouveau record !</b>' : ''}</p>
      <div class="ligne" style="justify-content:center"><button class="btn primaire" id="qz-rejouer">Rejouer</button><button class="btn" id="qz-themes">Autres thèmes</button></div></div>`;
    $('#qz-rejouer').onclick = () => lancerQuiz(p.theme); $('#qz-themes').onclick = accueilQuiz;
    Bus.emettre('quiz-fin', { score: p.score, total });
  }

  // ---------- Défis ----------
  const BADGES = [[3, '🌱 Premiers pas'], [7, '🔭 Observateur'], [12, '🌌 Astronome'], [Savoir.defis.length, '👑 Maître des étoiles']];
  function construireDefis() {
    const faits = new Set(Memoire.lire('defis', []));
    const n = Savoir.defis.filter(d => faits.has(d.id)).length;
    $('#defis').innerHTML = `<h2>🏅 Défis d’observation</h2><p class="intro">Des missions à réussir dehors, sous le vrai ciel. Coche-les quand c’est fait !</p>
      <div class="carte" style="margin:14px 0"><b>${n} / ${Savoir.defis.length} défis réussis</b><div class="progression"><div style="width:${n / Savoir.defis.length * 100}%"></div></div>
        <div class="badges">${BADGES.map(([s, b]) => `<span class="badge ${n >= s ? 'gagne' : ''}" title="${s} défis">${b}</span>`).join('')}</div></div>
      ${['Débutant', 'Intermédiaire', 'Avancé'].map(niv => `<h3 class="section">${niv}</h3><div class="grille">${Savoir.defis.filter(d => d.niveau === niv).map(d => `
        <div class="carte defi ${faits.has(d.id) ? 'fait' : ''}"><input type="checkbox" data-defi="${d.id}" ${faits.has(d.id) ? 'checked' : ''} aria-label="Défi réussi : ${echap(d.titre)}">
        <div><h3>${d.titre}</h3><div class="meta">📅 ${d.quand}</div><p class="texte-2 petit">${d.texte}</p>${d.ciel ? `<button class="btn petit" data-ciel="${echap(d.ciel)}">🌌 Où regarder ?</button>` : ''}</div></div>`).join('')}</div>`).join('')}`;
    $$('#defis [data-defi]').forEach(c => c.onchange = () => {
      const s = new Set(Memoire.lire('defis', [])); c.checked ? s.add(c.dataset.defi) : s.delete(c.dataset.defi);
      const avant = n; Memoire.ecrire('defis', [...s]); construireDefis();
      const badge = BADGES.find(([seuil]) => avant < seuil && s.size >= seuil);
      if (badge) setTimeout(() => alert(`Nouveau badge gagné : ${badge[1]} !`), 50);
    });
    brancherBoutonsCiel($('#defis'));
  }

  // ---------- Outils et calendrier ----------
  const GRAVITES = [['Mercure', 0.38], ['Vénus', 0.904], ['Lune', 0.165], ['Mars', 0.378], ['Jupiter', 2.528], ['Saturne', 1.065], ['Uranus', 0.886], ['Neptune', 1.137], ['Pluton', 0.063], ['Soleil (surface)', 27.9]];
  const PERIODES = [['Mercure', 87.969], ['Vénus', 224.701], ['Mars', 686.98], ['Jupiter', 4332.59], ['Saturne', 10759.22], ['Uranus', 30688.5], ['Neptune', 60182], ['Pluton', 90560]];
  const CIEL_DU_MOIS = ['Orion, le Taureau et les Pléiades, les Gémeaux, le Cocher, le Grand Chien avec Sirius', 'Orion, les Gémeaux, le Petit Chien (Procyon), le Cancer, le Cocher', 'Le Lion se lève, les Gémeaux, le Cancer ; Orion se couche à l’ouest',
    'Le Lion, la Grande Ourse au zénith, la Vierge, le Bouvier qui se lève', 'Le Bouvier (Arcturus), la Vierge (Spica), la Couronne boréale, le Lion', 'Hercule (amas M13), la Couronne boréale, le Scorpion bas au sud (Antarès), la Lyre se lève',
    'Le Triangle d’été (Véga, Deneb, Altaïr), le Scorpion, le Sagittaire et le centre de la Voie lactée', 'Le Triangle d’été, la Voie lactée du Cygne au Sagittaire, Cassiopée ; les Perséides', 'Le Triangle d’été, Pégase et son grand carré, Andromède, Cassiopée',
    'Pégase, Andromède (galaxie M31), Cassiopée, Persée, les Poissons', 'Andromède, Persée, le Bélier, le Taureau et les Pléiades qui se lèvent', 'Le Taureau, les Pléiades, le Cocher (Capella), Persée, Orion qui se lève ; les Géminides'];
  function construireOutils() {
    const auj = new Date().toISOString().slice(0, 10), mois = new Date().getMonth();
    const phases = Astro.phasesLune(jdMaintenant(), jdMaintenant() + 62);
    const evts = Astro.evenementsPlanetes(jdMaintenant(), 400);
    $('#outils').innerHTML = `<h2>🧮 Outils et calendrier</h2>
      <div class="grille">
        <div class="carte"><h3>⚖️ Ton poids ailleurs</h3><div class="ligne"><input type="number" id="o-poids" value="60" min="1" max="500" style="width:100px" aria-label="Ton poids en kg"> kg sur Terre</div><div id="o-poids-r" class="petit" style="margin-top:8px"></div></div>
        <div class="carte"><h3>🎂 Ton âge sur les planètes</h3><div class="ligne"><label for="o-naiss" class="petit">Né(e) le</label><input type="date" id="o-naiss" value="2000-01-01"></div><div id="o-age-r" class="petit" style="margin-top:8px"></div></div>
        <div class="carte"><h3>🚀 Combien de temps pour y aller ?</h3>
          <select id="o-dest" aria-label="Destination">${[['La Lune', 384400], ['Mars (au plus près, 55 millions km)', 5.46e7], ['Le Soleil', 1.496e8], ['Jupiter', 6.29e8], ['Pluton', 5.9e9], ['Proxima du Centaure', 4.01e13], ['Le centre de la Voie lactée', 2.46e17], ['La galaxie d’Andromède', 2.37e19]].map(([n, d]) => `<option value="${d}">${n}</option>`).join('')}</select>
          <select id="o-vehicule" aria-label="Moyen de transport">${[['à pied (5 km/h)', 5], ['en voiture (130 km/h)', 130], ['en avion de ligne (900 km/h)', 900], ['comme Voyager 1 (61 000 km/h)', 61000], ['comme Parker Solar Probe (690 000 km/h)', 690000], ['à la vitesse de la lumière', 1.0792528e9]].map(([n, v]) => `<option value="${v}">${n}</option>`).join('')}</select>
          <p id="o-voyage-r" style="margin-top:8px"></p></div>
        <div class="carte"><h3>📏 Convertisseur de distances</h3><div class="ligne"><input type="number" id="o-dist" value="1" min="0" step="any" style="width:120px" aria-label="Distance"><select id="o-unite" aria-label="Unité"><option value="1">km</option><option value="149597870.7">UA</option><option value="9460730472580.8" selected>années-lumière</option><option value="30856775814913.7">parsecs</option></select></div><div id="o-dist-r" class="petit" style="margin-top:8px"></div></div>
        <div class="carte"><h3>⏳ Quand ta lumière est-elle partie ?</h3><select id="o-etoile" aria-label="Étoile">${Object.entries(Ciel.DIST_AL).sort((a, b) => a[1] - b[1]).map(([n, d]) => `<option value="${d}">${Ciel.NOMS_FR[n] || n}</option>`).join('')}<option value="2500000">Galaxie d’Andromède</option></select><p id="o-etoile-r" style="margin-top:8px"></p></div>
        <div class="carte"><h3>🗓️ Le ciel du soir ce mois-ci</h3><p>${CIEL_DU_MOIS[mois]}</p><p class="petit texte-2">Vers 22 h, depuis l’hémisphère nord (France). Le mois prochain : ${CIEL_DU_MOIS[(mois + 1) % 12]}.</p></div>
      </div>
      <h3 class="section">🌙 Phases de la Lune (calculées)</h3>
      <div class="ligne">${phases.map(p => `<span class="pastille">${['🌑', '🌓', '🌕', '🌗'][p.k]} ${p.nom} · ${dateCourte(Astro.jdVersDate(p.jd))} ${heure(Astro.jdVersDate(p.jd))}</span>`).join('')}</div>
      <h3 class="section">🪐 Rendez-vous des planètes (calculés pour les 13 prochains mois)</h3>
      <div class="defile-x"><table class="tableau"><tr><th>Date</th><th>Planète</th><th>Événement</th></tr>${evts.map(e => `<tr><td>${dateCourte(Astro.jdVersDate(e.jd))}</td><td><b>${Systeme.NOMS[e.id]}</b></td><td>${e.type === 'opposition' ? 'Opposition : au plus près de la Terre, visible toute la nuit, au meilleur de son éclat' : `Plus grande ${e.type} : écart de ${Math.round(e.valeur)}° avec le Soleil`}</td></tr>`).join('')}</table></div>
      <h3 class="section">🌠 Pluies d’étoiles filantes</h3>
      <div class="defile-x"><table class="tableau"><tr><th>Essaim</th><th>Maximum</th><th>Taux max. par heure</th><th>Radiant</th><th>Origine</th></tr>${Savoir.essaims.map(e => `<tr><td><b>${e[0]}</b></td><td>${e[1]}</td><td>${e[2]}</td><td>${e[3]}</td><td>${e[4]}</td></tr>`).join('')}</table></div>
      <h3 class="section">🌑 Éclipses à venir</h3>
      <div class="defile-x"><table class="tableau"><tr><th>Date</th><th>Type</th><th>Visible depuis</th></tr>${Savoir.eclipses.filter(e => e[0] >= auj).map(e => `<tr><td>${new Date(e[0]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td><td>${e[1] === 'Soleil' ? '☀️' : '🌙'} ${e[1]}, ${e[2]}</td><td>${e[3]}</td></tr>`).join('')}</table></div>
      <p class="petit texte-2">Pour les horaires précis d’une éclipse chez toi, consulte l’IMCCE (Observatoire de Paris). ⚠️ Éclipse de Soleil : toujours des lunettes certifiées ISO 12312-2.</p>
      <h3 class="section">Sources</h3>
      <p class="petit texte-2">Étoiles, constellations, Voie lactée et objets de Messier : catalogue d3-celestial, © 2015 Olaf Frohn, licence BSD-3 (données issues notamment du catalogue Hipparcos). Positions des planètes : éléments orbitaux approchés du JPL (NASA). Photos et vidéos : médiathèque et API de la NASA. Schémas, démonstrations et textes : réalisés pour cet atlas, chiffres à jour en octobre 2026.</p>`;
    const majPoids = () => { const p = +$('#o-poids').value || 0; $('#o-poids-r').innerHTML = GRAVITES.map(([n, g]) => `${n} : <b>${nombre(p * g, 1)} kg</b>`).join('<br>'); };
    const majAge = () => {
      const n = new Date($('#o-naiss').value); if (isNaN(n)) return;
      const jours = (Date.now() - n) / 86400000;
      $('#o-age-r').innerHTML = PERIODES.map(([p, per]) => { const age = jours / per, prochain = new Date(n.getTime() + Math.ceil(age) * per * 86400000); return `${p} : <b>${nombre(age, age < 2 ? 2 : 1)} ans</b>${per < 5000 ? ` · prochain anniversaire le ${prochain.toLocaleDateString('fr-FR')}` : ''}`; }).join('<br>');
    };
    const majVoyage = () => {
      const h = +$('#o-dest').value / +$('#o-vehicule').value, ans = h / 8766;
      $('#o-voyage-r').innerHTML = `Durée : <b>${h < 1 / 60 ? nombre(h * 3600, 1) + ' secondes' : h < 1 ? nombre(h * 60, 1) + ' minutes' : h < 48 ? nombre(h, 1) + ' heures' : ans < 2 ? nombre(h / 24, 0) + ' jours' : ans < 1e6 ? nombre(ans, 0) + ' ans' : nombre(ans / 1e6, 1) + ' millions d’années'}</b>${ans > 100 && ans < 1e9 ? ` (${nombre(ans / 80, 0)} vies humaines)` : ''}`;
    };
    const majDist = () => {
      const km = (+$('#o-dist').value || 0) * +$('#o-unite').value, f = v => v >= 1e6 || (v < 0.01 && v > 0) ? v.toExponential(3).replace('.', ',').replace('e+', ' × 10^').replace('e-', ' × 10^-') : nombre(v, v < 10 ? 3 : 0);
      $('#o-dist-r').innerHTML = `${f(km)} km<br>${f(km / 149597870.7)} UA<br>${f(km / 9460730472580.8)} années-lumière<br>${f(km / 30856775814913.7)} parsecs<br>La lumière met ${f(km / 299792.458)} secondes`;
    };
    const majEtoile = () => { const d = +$('#o-etoile').value, an = new Date().getFullYear() - Math.round(d); $('#o-etoile-r').innerHTML = `Distance : ${nombre(d, d < 10 ? 1 : 0)} années-lumière.<br>La lumière que tu vois ce soir est partie ${an > 0 ? `en <b>${an}</b>` : `vers <b>${nombre(-an + 1)} av. J.-C.</b>`}${d > 1e5 ? ', avant même l’apparition de notre espèce' : ''}.`; };
    $('#o-poids').oninput = majPoids; $('#o-naiss').oninput = majAge; $('#o-dest').onchange = majVoyage; $('#o-vehicule').onchange = majVoyage; $('#o-dist').oninput = majDist; $('#o-unite').onchange = majDist; $('#o-etoile').onchange = majEtoile;
    majPoids(); majAge(); majVoyage(); majDist(); majEtoile();
  }

  // ---------- Démarrage ----------
  function init() {
    const etapes = [['Ciel', () => Ciel.init()], ['Système solaire', () => Systeme.init()], ['Univers', () => Cosmos.init()], ['Démos', () => Demos.init()], ['Découvertes', construireDecouvertes],
      ['Encyclopédie', () => construireEncyclo()], ['Quiz', accueilQuiz], ['Défis', construireDefis], ['Outils', construireOutils], ['Stella', () => Fee.init()]];
    for (const [nom, f] of etapes) { try { f(); } catch (e) { console.error(`Erreur au démarrage (${nom})`, e); } }
    $$('.onglet').forEach(b => b.onclick = () => afficherVue(b.dataset.vue));
    $('#btn-rouge').onclick = e => { const on = document.body.classList.toggle('nuit-rouge'); e.currentTarget.setAttribute('aria-pressed', on); Memoire.ecrire('rouge', on); };
    if (Memoire.lire('rouge', false)) { document.body.classList.add('nuit-rouge'); $('#btn-rouge').setAttribute('aria-pressed', 'true'); }
    Lieu.surChangement(() => { cacheNuit = null; if (vueActive === 'cesoir') construireCeSoir(); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#visionneuse').hidden) { $('#visionneuse').hidden = true; $('#visionneuse').innerHTML = ''; } });
    // L'adresse peut viser un onglet (index.html#systeme) ou lancer la visite (#visite) : c'est ce qu'utilise le lanceur .bat
    const VUES = ['ciel', 'cesoir', 'systeme', 'cosmos', 'medias', 'decouvertes', 'demos', 'encyclo', 'quiz', 'defis', 'outils'];
    const suivreAdresse = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (VUES.includes(h)) { afficherVue(h); return true; }
      if (h === 'visite') { afficherVue('ciel'); setTimeout(() => Fee.demarrerVisite(), 700); return true; }
      return false;
    };
    if (!suivreAdresse()) { const depart = Memoire.lire('vue', 'ciel'); afficherVue(VUES.includes(depart) ? depart : 'ciel'); }
    window.addEventListener('hashchange', suivreAdresse);
  }
  return { init, afficherVue, ouvrirMedias, ouvrirFiche, lancerQuiz, resumeCeSoir, soleilAujourdhui, prochainEssaim };
})();
document.addEventListener('DOMContentLoaded', Appli.init);
