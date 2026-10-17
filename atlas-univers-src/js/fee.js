// Stella, la fée des étoiles : guide de l'appli. Elle répond uniquement avec la base de connaissances interne
// et les calculs de l'atlas (aucune IA externe, aucun service en ligne). Sa voix utilise les voix installées sur l'appareil.
const Fee = (() => {
  let voixActive = Memoire.lire('fee-voix', true), voix = null, ouverte = false, etapeVisite = -1;
  const fil = () => $('#fee-fil');

  // --- Voix locale uniquement ---
  function choisirVoix() {
    if (!('speechSynthesis' in window)) return;
    const v = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('fr') && v.localService);
    voix = v.find(x => /female|femme|hortense|julie|amelie|marie|denise|audrey/i.test(x.name)) || v[0] || null;
  }
  function parler(texte) {
    if (!voixActive || !voix || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texte.replace(/<[^>]+>/g, ' ').replace(/[*_#]/g, '').slice(0, 600));
    u.voice = voix; u.lang = voix.lang; u.rate = 1.03; u.pitch = 1.25;
    speechSynthesis.speak(u);
  }

  // --- Messages ---
  function message(html, { moi = false, actions = [], dire = null } = {}) {
    const m = document.createElement('div');
    m.className = 'msg ' + (moi ? 'moi' : 'fee-msg');
    m.innerHTML = moi ? echap(html) : html;
    if (actions.length) {
      const a = document.createElement('div'); a.className = 'actions';
      for (const [libelle, fn] of actions) { const b = document.createElement('button'); b.className = 'btn petit'; b.textContent = libelle; b.onclick = fn; a.appendChild(b); }
      m.appendChild(a);
    }
    fil().appendChild(m); fil().scrollTop = fil().scrollHeight;
    if (!moi) { paillettes(); parler(dire || m.textContent); }
  }
  function paillettes() {
    const r = $('#fee').getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div'); p.className = 'paillette';
      p.style.left = (r.left + r.width / 2 + (Math.random() - 0.5) * r.width) + 'px'; p.style.top = (r.top + r.height * 0.6 + (Math.random() - 0.5) * 20) + 'px';
      p.style.animationDelay = (i * 60) + 'ms';
      document.body.appendChild(p); setTimeout(() => p.remove(), 1200);
    }
  }
  const premierParagraphe = html => { const d = document.createElement('div'); d.innerHTML = html; const p = d.querySelector('p, li'); return (p ? p.textContent : d.textContent).trim(); };

  // --- Compréhension (règles + recherche dans la base interne) ---
  const contient = (q, ...mots) => mots.some(m => q.includes(m));
  function repondre(question) {
    const q = Savoir.normaliser(question);
    if (!q) return;
    if (/^(bonjour|salut|coucou|hello|bonsoir|hey)\b/.test(q)) return message(`Bonsoir, explorateur ou exploratrice des étoiles ! ✨ Demande-moi ce qu’on voit ce soir, où est une planète, ou pose-moi une question sur l’univers.`, { actions: actionsAccueil() });
    if (contient(q, 'merci')) return message('Avec plaisir ! Les étoiles sont toujours là pour toi. 🌟');
    if (contient(q, 'qui es tu', 'tu es qui', 'ton nom', 'es tu une ia', 'es tu un robot')) return message('Je suis <b>Stella</b>, la petite fée de cet atlas. Je ne suis pas une IA connectée : je réponds avec la base de connaissances et les calculs astronomiques intégrés à l’appli, même sans internet.');
    if (contient(q, 'visite', 'guide moi', 'montre moi l appli', 'comment ca marche', 'aide')) return message('Je te fais visiter ? Suis-moi !', { actions: [['🧚 Commencer la visite', demarrerVisite]] });
    if (contient(q, 'quiz', 'question pour moi', 'teste moi', 'interroge')) return message('Prêt pour un petit quiz ? Choisis ton thème.', { actions: [['🧠 Ouvrir les quiz', () => Appli.afficherVue('quiz')], ['⭐ Reconnais la constellation', () => { Appli.afficherVue('quiz'); Appli.lancerQuiz('constellations'); }]] });
    if (contient(q, 'demonstration', 'demo', 'experience', 'experimenter', 'manipuler')) return message('Voici mes expériences préférées :', { actions: Demos.liste.map(d => [d.titre, () => { Appli.afficherVue('demos'); Demos.afficher(d.id); }]) });
    if (contient(q, 'decouverte', 'incroyable', 'epoustouflant', 'couper le souffle', 'wow', 'etonne moi', 'surprends moi')) {
      const d = Savoir.decouvertes[Math.floor(Math.random() * Savoir.decouvertes.length)];
      return message(`<b>${d.titre}</b> (${d.annee}) : ${d.texte}`, { actions: [['✨ Toutes les découvertes', () => Appli.afficherVue('decouvertes')], ...(d.nasa ? [['📷 Photos NASA', () => Appli.ouvrirMedias(d.nasa)]] : [])] });
    }
    if (contient(q, 'saviez', 'anecdote', 'un fait', 'fait amusant', 'truc interessant')) return message('🌟 ' + Savoir.faits[Math.floor(Math.random() * Savoir.faits.length)], { actions: [['Encore un !', () => repondre('le saviez-vous')]] });
    if (contient(q, 'defi', 'mission', 'badge')) return message('Relève des défis d’observation et gagne des badges !', { actions: [['🏅 Voir les défis', () => Appli.afficherVue('defis')]] });
    if (contient(q, 'nuit rouge', 'lumiere rouge', 'vision de nuit')) return message('Le bouton 🔴 Nuit, en haut à droite, passe tout l’écran en rouge : tes yeux restent adaptés à l’obscurité pendant l’observation.');

    if (contient(q, 'lumiere') && contient(q, 'combien de temps', 'met ', 'mettre', 'temps de trajet', 'voyage')) return message('Le temps de trajet de la lumière, qui file à 299 792 km/s :<br>• Lune : 1,3 seconde<br>• Soleil : 8 minutes 20 secondes<br>• Jupiter : 35 à 52 minutes<br>• Neptune : environ 4 heures<br>• Proxima du Centaure : 4,24 ans<br>• Andromède : 2,5 millions d’années<br>Regarder loin, c’est regarder dans le passé !', { actions: [['🧪 La course de la lumière', () => { Appli.afficherVue('demos'); Demos.afficher('lumiere'); }], ['📚 Fiche', () => Appli.ouvrirFiche('lumiere')]] });
    if (contient(q, 'eclipse') && !contient(q, 'pourquoi', 'comment', 'c est quoi', 'qu est ce')) {
      const auj = new Date().toISOString().slice(0, 10), p = Savoir.eclipses.filter(e => e[0] >= auj).slice(0, 3);
      return message(`Prochaines éclipses :<br>${p.map(e => `• <b>${new Date(e[0]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</b> : éclipse de ${e[1]} ${e[2]} (${e[3]})`).join('<br>')}<br><br>⚠️ Pour le Soleil, toujours des lunettes certifiées !`, { actions: [['📅 Calendrier', () => Appli.afficherVue('outils')], ['🧪 Démo des éclipses', () => { Appli.afficherVue('demos'); Demos.afficher('eclipses'); }]] });
    }
    if (contient(q, 'etoile filante', 'etoiles filantes', 'pluie d etoiles', 'meteor', 'perseide', 'geminide')) {
      const prochain = Appli.prochainEssaim();
      return message(`La prochaine grande pluie d’étoiles filantes : <b>${prochain[0]}</b>, maximum le ${prochain[1]}, jusqu’à ${prochain[2]} par heure sous un ciel parfait (radiant : ${prochain[3]}). Allonge-toi loin des lumières et sois patient !`, { actions: [['📅 Toutes les pluies', () => Appli.afficherVue('outils')]] });
    }
    if (contient(q, 'ce soir', 'cette nuit', 'maintenant', 'que voir', 'quoi voir', 'qu est ce qu on voit', 'visible', 'observer ce')) {
      const r = Appli.resumeCeSoir();
      return message(r.html, { actions: [['🔭 Le programme de ce soir', () => Appli.afficherVue('cesoir')], ['🌌 Voir le ciel', () => Appli.afficherVue('ciel')]], dire: r.texte });
    }
    if (contient(q, 'lune') && contient(q, 'phase', 'aujourd', 'ce soir', 'quelle lune', 'pleine', 'nouvelle lune')) {
      const L = Astro.infosLune(Astro.jourJulien(new Date())), ph = Astro.phasesLune(Astro.jourJulien(new Date()), Astro.jourJulien(new Date()) + 30).slice(0, 2);
      return message(`Aujourd’hui : <b>${L.nom}</b>, éclairée à ${Math.round(L.eclairement * 100)} %, âgée de ${nombre(L.age, 1)} jours.<br>${ph.map(p => `${p.nom} : ${dateCourte(Astro.jdVersDate(p.jd))}`).join('<br>')}`, { actions: [['🌙 Montrer la Lune', () => Ciel.montrer('Lune')], ['🧪 Comprendre les phases', () => { Appli.afficherVue('demos'); Demos.afficher('phases'); }]] });
    }
    if (contient(q, 'lever du soleil', 'coucher du soleil', 'quand le soleil', 'heure du soleil', 'nuit tombe')) {
      const r = Appli.soleilAujourdhui();
      return message(`À ${echap(Lieu.courant.nom)} aujourd’hui : lever du Soleil à <b>${r.lever}</b>, coucher à <b>${r.coucher}</b>. La nuit noire commence vers <b>${r.nuit}</b>.`);
    }
    // « Où est Mars ? », « montre-moi Véga »
    const m = q.match(/(?:ou est|ou se trouve|ou trouver|montre moi|montre|trouve|cherche|position de|voir) (?:la |le |les |l )?(.+)/);
    const cible = m ? m[1].replace(/\b(dans le ciel|ce soir|maintenant|aujourd hui)\b/g, '').trim() : null;
    if (cible) { const res = Ciel.chercher(cible, 1)[0]; if (res) return decrireAstre(res); }

    // Recherche dans la base
    const trouve = Savoir.rechercher(question, 3);
    const astre = Ciel.chercher(q, 1)[0];
    if (!trouve.length && astre && q.length > 2) return decrireAstre(astre);
    if (trouve.length) {
      const f = trouve[0].f;
      const actions = [['📚 Lire la fiche', () => Appli.ouvrirFiche(f.id)]];
      if (f.ciel) actions.push(['🌌 Voir dans le ciel', () => Ciel.montrer(f.ciel)]);
      if (f.demo) actions.push(['🧪 Démonstration', () => { Appli.afficherVue('demos'); Demos.afficher(f.demo); }]);
      if (f.cosmos) actions.push(['🌀 Voir en 3D', () => { Appli.afficherVue('cosmos'); Cosmos.choisirScene(f.cosmos); }]);
      if (f.systeme) actions.push(['🪐 En 3D', () => { Appli.afficherVue('systeme'); Systeme.choisir(f.systeme); }]);
      if (f.nasa) actions.push(['📷 Photos NASA', () => Appli.ouvrirMedias(f.nasa)]);
      const autres = trouve.slice(1).map(r => r.f);
      return message(`<b>${echap(f.titre)}</b><br>${echap(premierParagraphe(f.html))}${autres.length ? `<br><span class="petit texte-2">Voir aussi : ${autres.map(a => echap(a.titre)).join(' · ')}</span>` : ''}`, { actions });
    }
    if (astre) return decrireAstre(astre);
    message('Hmm, je ne trouve pas ça dans mon grimoire 📖. Essaie avec d’autres mots, ou explore l’encyclopédie. Tu peux aussi me demander « que voir ce soir », « où est Jupiter », « une découverte », « un quiz »…', { actions: actionsAccueil() });
  }

  function decrireAstre(res) {
    const e = Ciel.etat();
    const M = Astro.matriceHorizon(e.jd || Astro.jourJulien(new Date()), Lieu.courant.lat, Lieu.courant.lon);
    let v = null;
    if (res.type === 'planete' || res.type === 'soleil' || res.type === 'lune') v = Astro.astresMobiles(Astro.jourJulien(new Date())).find(a => a.id === res.id).eq;
    else if (res.type === 'messier') v = res.o.v; else if (res.type === 'constellation') v = res.c.v;
    else if (res.i !== undefined) v = Astro.versVecteur(CIEL.etoiles[res.i * 4] / 100, CIEL.etoiles[res.i * 4 + 1] / 100);
    let ou = '';
    if (v) { const h = Astro.versAltAz(Astro.mulVec(M, v)); ou = h.alt > 0 ? `En ce moment, depuis ${echap(Lieu.courant.nom)} : <b>${Math.round(h.alt)}°</b> au-dessus de l’horizon, direction <b>${cardinal(h.az)}</b>.` : `En ce moment : <b>sous l’horizon</b> à ${echap(Lieu.courant.nom)}.`; }
    const f = Savoir.trouverFiche(res.nom.replace(/^M\d+ – /, '')) || Savoir.trouverFiche(res.id);
    const actions = [['🌌 Montrer dans le ciel', () => Ciel.montrer(res.nom.split(' – ')[0])]];
    if (f) actions.push(['📚 Fiche', () => Appli.ouvrirFiche(f.id)]);
    message(`<b>${echap(res.nom)}</b> (${echap(res.detail)}). ${ou}`, { actions });
  }

  const actionsAccueil = () => [['🔭 Que voir ce soir ?', () => question('Que voir ce soir ?')], ['✨ Une découverte', () => question('Étonne-moi avec une découverte')], ['🧚 Visite guidée', demarrerVisite]];
  function question(texte) { message(texte, { moi: true }); setTimeout(() => repondre(texte), 250); }

  // --- Visite guidée : Stella vole d'un endroit à l'autre ---
  const VISITE = [
    { vue: null, cible: null, texte: 'Bienvenue dans l’Atlas de l’Univers ! Je suis Stella. En quelques étapes, je te montre tout ce que tu peux faire ici.' },
    { vue: 'ciel', cible: '#ciel-zone', texte: 'Voici le <b>vrai ciel</b> au-dessus de toi, calculé pour ton lieu et l’heure exacte : plus de 5 000 étoiles, les planètes, la Lune, la Voie lactée. Glisse pour regarder autour, zoome à la molette, clique sur un astre.' },
    { vue: 'ciel', cible: '#ciel-recherche', texte: 'Tape un nom ici (Mars, Véga, Orion, M31…) : je t’y emmène directement.' },
    { vue: 'ciel', cible: '#t-avant', texte: 'Ces boutons accélèrent le temps : regarde le ciel tourner, les planètes avancer, la Lune changer de phase. « Maintenant » te ramène au présent.' },
    { vue: 'ciel', cible: '#ciel-btn-options', texte: 'Ici tu choisis ta ville (ou ta position), et ce que tu veux afficher : constellations, grilles, sol transparent pour voir le ciel de l’autre côté de la Terre…' },
    { vue: 'cesoir', cible: '.onglet[data-vue="cesoir"]', texte: '« Ce soir » te prépare le programme de la nuit : planètes visibles, phase de la Lune, plus beaux objets, prochains événements.' },
    { vue: 'systeme', cible: '#systeme-zone', texte: 'Le <b>système solaire en 3D</b>, avec les vraies positions des planètes. Accélère le temps et clique sur une planète pour la suivre.' },
    { vue: 'cosmos', cible: '#cosmos-barre', texte: 'L’<b>univers en 3D</b> : nos étoiles voisines, la Voie lactée, nos galaxies voisines, la toile cosmique, et un voyage de la Terre jusqu’aux confins.' },
    { vue: 'medias', cible: '.onglet[data-vue="medias"]', texte: 'Les vraies <b>photos et vidéos de la NASA</b>, avec l’image astronomique du jour (il faut internet pour cet onglet seulement).' },
    { vue: 'decouvertes', cible: '.onglet[data-vue="decouvertes"]', texte: 'Des <b>découvertes à couper le souffle</b>, de l’image d’un trou noir à l’or forgé par les étoiles.' },
    { vue: 'demos', cible: '#demo-canvas', texte: 'Des <b>démonstrations</b> à manipuler : phases de la Lune, saisons, éclipses, boucle de Mars, mise en orbite, expansion de l’univers…' },
    { vue: 'encyclo', cible: '.onglet[data-vue="encyclo"]', texte: 'L’<b>encyclopédie</b>, avec des schémas explicatifs. Tout ce que je sais vient de là !' },
    { vue: 'quiz', cible: '.onglet[data-vue="quiz"]', texte: 'Des <b>petits quiz</b> pour tester tes connaissances, et un jeu pour reconnaître les constellations.' },
    { vue: 'defis', cible: '.onglet[data-vue="defis"]', texte: 'Des <b>défis d’observation</b> à relever dehors, avec des badges à gagner.' },
    { vue: 'outils', cible: '.onglet[data-vue="outils"]', texte: 'Le calendrier (éclipses, étoiles filantes, phases) et des calculateurs amusants : ton poids sur Mars, ton âge sur Jupiter…' },
    { vue: 'ciel', cible: '#btn-rouge', texte: 'Dehors, active le <b>mode nuit rouge</b> : tes yeux garderont leur vision nocturne.' },
    { vue: 'ciel', cible: null, texte: 'C’est tout ! Clique sur moi quand tu veux : je réponds à tes questions sur le ciel. Bonne exploration ! 🌟' }
  ];
  function voler(selecteur) {
    const fee = $('#fee');
    if (!selecteur || !$(selecteur)) { fee.style.left = ''; fee.style.top = ''; fee.style.right = ''; fee.style.bottom = ''; return; }
    const r = $(selecteur).getBoundingClientRect(), t = fee.offsetWidth;
    const x = Math.min(window.innerWidth - t - 8, Math.max(8, r.left + r.width / 2 - t / 2 + (r.width > 300 ? 0 : 30)));
    const y = Math.min(window.innerHeight - t - 8, Math.max(8, r.top + (r.height > 300 ? r.height / 2 - t / 2 : r.height + 6)));
    fee.style.right = 'auto'; fee.style.bottom = 'auto'; fee.style.left = x + 'px'; fee.style.top = y + 'px';
    let n = 0; const iv = setInterval(() => { paillettes(); if (++n > 4) clearInterval(iv); }, 220);
  }
  function montrerEtape() {
    const e = VISITE[etapeVisite], p = $('#visite');
    if (e.vue) Appli.afficherVue(e.vue);
    $('#bulle-fee').hidden = true; ouverte = false;
    setTimeout(() => voler(e.cible), 80);
    p.hidden = false;
    p.innerHTML = `<div class="ligne" style="justify-content:space-between"><b>🧚 Stella · ${etapeVisite + 1}/${VISITE.length}</b><button class="fermer" aria-label="Quitter la visite">×</button></div>
      <p style="margin:8px 0 12px">${e.texte}</p>
      <div class="ligne" style="justify-content:flex-end">${etapeVisite > 0 ? '<button class="btn petit" data-v="-1">← Précédent</button>' : ''}<button class="btn primaire petit" data-v="1">${etapeVisite < VISITE.length - 1 ? 'Suivant →' : 'Terminer'}</button></div>`;
    p.querySelector('.fermer').onclick = finirVisite;
    p.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { const n = etapeVisite + +b.dataset.v; if (n >= VISITE.length) finirVisite(); else { etapeVisite = n; montrerEtape(); } });
    const d = document.createElement('div'); d.innerHTML = e.texte; parler(d.textContent);
  }
  function demarrerVisite() { etapeVisite = 0; montrerEtape(); }
  function finirVisite() { etapeVisite = -1; $('#visite').hidden = true; voler(null); Memoire.ecrire('visite-faite', true); if ('speechSynthesis' in window) speechSynthesis.cancel(); }

  // Petites astuces la première fois que l'on ouvre un onglet
  const ASTUCES = {
    cesoir: 'Le programme de la nuit est calculé pour ta ville. Change-la dans « Ciel en direct » › ⚙️.',
    systeme: 'Astuce : clique sur Saturne, puis accélère le temps pour voir ses anneaux s’incliner au fil des années.',
    cosmos: 'Essaie « Échelle de l’univers » puis le bouton 🚀 Voyage : ça donne le vertige !',
    medias: 'Tape un sujet en français ou en anglais : les photos viennent directement de la médiathèque de la NASA.',
    decouvertes: 'Chaque découverte a des boutons pour la voir dans le ciel ou en photos.',
    demos: 'Toutes les démonstrations se manipulent : curseurs, boutons, et parfois clics dans l’image !',
    encyclo: 'Tu peux aussi me poser directement tes questions en cliquant sur moi.',
    quiz: 'Le jeu des constellations utilise les vraies formes du ciel.',
    defis: 'Coche un défi quand tu l’as réussi dehors : tes badges sont gardés dans ce navigateur.',
    outils: 'Les dates des phases de la Lune et des oppositions des planètes sont calculées par l’appli.'
  };
  function astuce(vue) {
    const vues = Memoire.lire('astuces-vues', []);
    if (!ASTUCES[vue] || vues.includes(vue) || etapeVisite >= 0 || ouverte) return;
    vues.push(vue); Memoire.ecrire('astuces-vues', vues);
    let a = $('#astuce-fee');
    if (!a) { a = document.createElement('div'); a.id = 'astuce-fee'; a.className = 'astuce-fee'; a.onclick = () => { a.hidden = true; }; document.body.appendChild(a); }
    a.textContent = '🧚 ' + ASTUCES[vue]; a.hidden = false; paillettes();
    clearTimeout(a._t); a._t = setTimeout(() => { a.hidden = true; }, 8000);
  }

  function ouvrir() {
    ouverte = true; $('#bulle-fee').hidden = false; const a = $('#astuce-fee'); if (a) a.hidden = true;
    if (!fil().children.length) {
      const r = Appli.resumeCeSoir();
      message(`Bonjour, je suis <b>Stella</b>, la fée des étoiles ✨<br>${r.html}`, { actions: actionsAccueil(), dire: 'Bonjour, je suis Stella, la fée des étoiles. ' + r.texte });
    }
    setTimeout(() => $('#fee-saisie').focus(), 50);
  }
  function init() {
    if ('speechSynthesis' in window) { choisirVoix(); speechSynthesis.onvoiceschanged = choisirVoix; }
    $('#fee-voix').setAttribute('aria-pressed', voixActive);
    $('#fee-voix').onclick = e => { voixActive = !voixActive; Memoire.ecrire('fee-voix', voixActive); e.currentTarget.setAttribute('aria-pressed', voixActive); if (!voixActive && 'speechSynthesis' in window) speechSynthesis.cancel(); };
    $('#fee').onclick = () => { if (etapeVisite >= 0) return; if (ouverte) { ouverte = false; $('#bulle-fee').hidden = true; } else ouvrir(); };
    $('#fee-fermer').onclick = () => { ouverte = false; $('#bulle-fee').hidden = true; if ('speechSynthesis' in window) speechSynthesis.cancel(); };
    $('#fee-visite').onclick = demarrerVisite;
    $('#fee-form').onsubmit = e => { e.preventDefault(); const v = $('#fee-saisie').value.trim(); if (!v) return; $('#fee-saisie').value = ''; question(v); };
    const sug = ['Que voir ce soir ?', 'Où est Jupiter ?', 'C’est quoi un trou noir ?', 'Pourquoi les saisons ?', 'Prochaine éclipse', 'Étonne-moi', 'Phase de la Lune', 'Un quiz !'];
    $('#fee-suggestions').innerHTML = sug.map(s => `<button class="btn petit">${s}</button>`).join('');
    $$('#fee-suggestions button').forEach(b => b.onclick = () => question(b.textContent));
    Bus.sur('vue', astuce);
    Bus.sur('quiz-fin', ({ score, total }) => {
      if (ouverte) message(score === total ? `Parfait, ${score}/${total} ! Tu es un vrai astronome. 🏆` : `${score}/${total}, bravo ! Chaque question ratée est une chose apprise. ✨`);
    });
    if (!Memoire.lire('visite-faite', false)) setTimeout(() => { if (etapeVisite < 0 && !ouverte) { const a = document.createElement('div'); a.id = 'astuce-fee'; a.className = 'astuce-fee'; a.innerHTML = '🧚 Bonjour ! Je suis Stella. Clique sur moi pour une visite guidée ou pour me poser une question.'; a.onclick = () => { a.hidden = true; ouvrir(); }; document.body.appendChild(a); setTimeout(() => { a.hidden = true; }, 12000); } }, 1500);
  }
  return { init, ouvrir, question, demarrerVisite };
})();
