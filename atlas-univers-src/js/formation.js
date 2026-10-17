// Formation « L'Odyssée cosmique » : sommaire, lecture scène par scène, rebondissements à révéler,
// questions notées (points d'étoile), missions vers le reste de l'atlas, fin de chapitre et diplôme.
const Formation = (() => {
  const total = FORMATION.reduce((n, c) => n + c.scenes.filter(s => s.question).length, 0);
  const GRADES = [[0, '🌱 Apprenti navigateur'], [0.2, '🚀 Pilote d’étoiles'], [0.4, '🔭 Explorateur du ciel'], [0.6, '🌌 Astronome'], [0.8, '👑 Maître du cosmos']];
  const etat = Object.assign({ ch: 0, sc: 0, faits: [], reponses: {}, libre: false, nom: '' }, Memoire.lire('formation', {}));
  const sauver = () => Memoire.ecrire('formation', etat);
  const points = () => Object.values(etat.reponses).filter(Boolean).length * 10;
  const grade = () => { const r = points() / (total * 10); return GRADES.filter(([s]) => r >= s).pop()[1]; };
  const ouvert = i => etat.libre || i === 0 || etat.faits.includes(FORMATION[i - 1].id);
  const scenesLues = () => FORMATION.reduce((n, c, i) => n + (etat.faits.includes(c.id) ? c.scenes.length : i === etat.ch ? etat.sc : 0), 0);
  const nbScenes = FORMATION.reduce((n, c) => n + c.scenes.length, 0);
  const el = () => $('#formation');
  const enHaut = () => { const d = el().closest('.defile'); if (d) d.scrollTop = 0; };

  // --- Sommaire ---
  function sommaire() {
    const fini = etat.faits.length === FORMATION.length;
    el().innerHTML = `
      <div class="odyssee-hero"><div class="meta">Formation interactive · ${FORMATION.length} chapitres · ${nbScenes} scènes · ${total} questions</div>
        <h2>🎓 L’Odyssée cosmique</h2>
        <p>Une nuit, dans ton jardin, Stella capte sur sa vieille radio un signal mystérieux : un bip parfaitement régulier, venu des étoiles. Pour découvrir ce que c’est, il va falloir comprendre l’univers tout entier, de la Lune jusqu’au Big Bang. Chaque chapitre cache des rebondissements qui renversent les idées reçues.</p>
        <div class="progression"><div style="width:${scenesLues() / nbScenes * 100}%"></div></div>
        <div class="ligne"><span class="pastille">${scenesLues()} / ${nbScenes} scènes</span><span class="pastille">⭐ ${points()} points d’étoile</span><span class="pastille">${grade()}</span></div>
        <div class="ligne" style="margin-top:14px">
          <button class="btn primaire" id="fo-continuer">${scenesLues() ? '▶ Reprendre le voyage' : '▶ Commencer l’aventure'}</button>
          ${fini ? '<button class="btn" id="fo-diplome">🏆 Mon diplôme</button>' : ''}
          <label class="petit texte-2"><input type="checkbox" id="fo-libre" ${etat.libre ? 'checked' : ''}> Tout débloquer (lecture libre)</label>
        </div></div>
      <div class="odyssee-chemin">${FORMATION.map((c, i) => {
        const fait = etat.faits.includes(c.id), ok = ouvert(i), courant = i === etat.ch && !fait;
        return `<button class="etape-odyssee ${fait ? 'faite' : ''} ${courant ? 'courante' : ''}" data-ch="${i}" ${ok ? '' : 'disabled'}>
          <span class="icone-etape">${ok ? c.icone : '🔒'}</span><span><b>${c.titre}</b><br><span class="petit texte-2">${c.sousTitre} · ${c.scenes.length} scènes</span></span>
          <span class="statut-etape">${fait ? '✅' : courant ? '▶' : ''}</span></button>`;
      }).join('')}</div>
      <p class="petit texte-2" style="margin-top:14px">Ta progression est gardée dans ce navigateur. <button class="btn petit" id="fo-raz">Recommencer à zéro</button></p>`;
    $('#fo-continuer').onclick = () => { const i = FORMATION.findIndex(c => !etat.faits.includes(c.id)); if (i === -1) diplome(); else lire(i, i === etat.ch ? etat.sc : 0); };
    const d = $('#fo-diplome'); if (d) d.onclick = diplome;
    $('#fo-libre').onchange = e => { etat.libre = e.target.checked; sauver(); sommaire(); };
    $('#fo-raz').onclick = () => { if (confirm('Effacer ta progression et tes points dans la formation ?')) { Object.assign(etat, { ch: 0, sc: 0, faits: [], reponses: {} }); sauver(); sommaire(); } };
    $$('#formation [data-ch]').forEach(b => b.onclick = () => { const i = +b.dataset.ch; lire(i, i === etat.ch ? etat.sc : 0); });
    enHaut();
  }

  // --- Lecture d'une scène ---
  function lire(ci, si) {
    const c = FORMATION[ci], s = c.scenes[si], cle = `${c.id}.${si}`;
    etat.ch = ci; etat.sc = si; sauver();
    const repondu = cle in etat.reponses;
    el().innerHTML = `
      <div class="ligne" style="justify-content:space-between"><button class="btn petit" id="fo-sommaire">← Sommaire</button><span class="pastille">⭐ ${points()} · ${grade()}</span></div>
      <div class="scene-odyssee">
        <div class="meta">${c.icone} ${c.titre} · scène ${si + 1}/${c.scenes.length}</div>
        <div class="progression"><div style="width:${(si + 1) / c.scenes.length * 100}%"></div></div>
        <h2>${s.titre}</h2>
        <div class="recit">${s.html}</div>
        ${s.schema ? `<div class="schema">${Schemas.dessiner(s.schema)}</div>` : ''}
        ${s.twist ? `<div class="rebondissement" id="fo-twist"><button class="btn" id="fo-reveler">🌀 Rebondissement ! Révéler</button><div class="contenu-twist" hidden><h3>🌀 ${s.twist.titre}</h3>${s.twist.html}</div></div>` : ''}
        ${s.question ? `<div class="carte question-odyssee"><div class="meta">❓ À toi de jouer</div><div class="quiz-question">${echap(s.question.q)}</div>
          <div class="reponses">${s.question.choix.map((x, k) => `<button data-k="${k}">${echap(x)}</button>`).join('')}</div><div id="fo-expl"></div></div>` : ''}
        ${s.action ? `<div class="ligne" style="margin:14px 0"><button class="btn" id="fo-action">${s.action[0]}</button><span class="petit texte-2">Mission : essaie, puis reviens ici avec le bouton « Reprendre l’Odyssée ».</span></div>` : ''}
        <div class="ligne nav-odyssee">
          ${si > 0 || ci > 0 ? '<button class="btn" id="fo-prec">← Précédent</button>' : '<span></span>'}
          <button class="btn petit" id="fo-ecouter" title="Stella lit la scène à voix haute">🔊 Écouter</button>
          <button class="btn primaire" id="fo-suiv" ${s.question && !repondu ? 'disabled title="Réponds d’abord à la question"' : ''}>${si < c.scenes.length - 1 ? 'Suivant →' : 'Fin du chapitre →'}</button>
        </div>
      </div>`;
    $('#fo-sommaire').onclick = sommaire;
    const rev = $('#fo-reveler');
    if (rev) rev.onclick = () => { rev.hidden = true; const t = $('#fo-twist .contenu-twist'); t.hidden = false; $('#fo-twist').classList.add('revele'); Bus.emettre('rebondissement', s.twist.titre); };
    if (s.question) {
      const q = s.question, montrer = choix => {
        $$('#formation .reponses button').forEach((b, k) => { b.disabled = true; if (k === q.bonne) b.classList.add('bonne'); else if (k === choix) b.classList.add('fausse'); });
        $('#fo-expl').innerHTML = `<div class="explication">${choix === q.bonne ? '✅ Bien vu ! +10 points d’étoile. ' : '❌ Pas tout à fait. '}${echap(q.explication)}</div>`;
        const suiv = $('#fo-suiv'); suiv.disabled = false; suiv.removeAttribute('title');
      };
      if (cle in etat.reponses) montrer(etat.reponses[cle] ? q.bonne : -1);
      $$('#formation .reponses button').forEach(b => b.onclick = () => {
        const k = +b.dataset.k;
        if (!(cle in etat.reponses)) { etat.reponses[cle] = k === q.bonne; sauver(); }
        montrer(k);
      });
    }
    const act = $('#fo-action'); if (act) act.onclick = () => mission(s.action);
    $('#fo-ecouter').onclick = () => { const d = document.createElement('div'); d.innerHTML = s.html + (s.twist && !$('#fo-twist .contenu-twist').hidden ? s.twist.html : ''); Fee.lireAVoixHaute(`${s.titre}. ${d.textContent}`); };
    const prec = $('#fo-prec'); if (prec) prec.onclick = () => si > 0 ? lire(ci, si - 1) : lire(ci - 1, FORMATION[ci - 1].scenes.length - 1);
    $('#fo-suiv').onclick = () => si < c.scenes.length - 1 ? lire(ci, si + 1) : finChapitre(ci);
    enHaut();
  }

  function mission([, type, cible]) {
    if (type === 'ciel') Ciel.montrer(cible);
    else if (type === 'demo') { Appli.afficherVue('demos'); Demos.afficher(cible); }
    else if (type === 'systeme') { Appli.afficherVue('systeme'); Systeme.choisir(cible); }
    else if (type === 'cosmos') { Appli.afficherVue('cosmos'); Cosmos.choisirScene(cible); }
    else if (type === 'fiche') Appli.ouvrirFiche(cible);
    else Appli.afficherVue(type);
    $('#retour-formation').hidden = false;
  }

  // --- Fin de chapitre ---
  function finChapitre(ci) {
    const c = FORMATION[ci];
    if (!etat.faits.includes(c.id)) etat.faits.push(c.id);
    const suivant = ci + 1 < FORMATION.length ? ci + 1 : null;
    etat.ch = suivant === null ? ci : suivant; etat.sc = 0; sauver();
    const qs = c.scenes.map((s, k) => s.question ? etat.reponses[`${c.id}.${k}`] : null).filter(v => v !== null);
    const bonnes = qs.filter(Boolean).length;
    el().innerHTML = `<div class="scene-odyssee" style="text-align:center">
      <div style="font-size:3rem">${c.icone}</div><div class="meta">Chapitre terminé</div><h2>${c.titre}</h2>
      ${qs.length ? `<p class="chiffre">${'⭐'.repeat(bonnes)}${'☆'.repeat(qs.length - bonnes)}</p><p class="texte-2">${bonnes} bonne(s) réponse(s) sur ${qs.length} · total ${points()} points · ${grade()}</p>` : ''}
      <div class="carte" style="text-align:left;margin:16px 0"><h3>📌 À retenir</h3><ul>${c.retenir.map(r => `<li>${r}</li>`).join('')}</ul></div>
      ${c.suspense ? `<div class="rebondissement revele" style="text-align:left"><h3>🔮 Et maintenant…</h3><p>${c.suspense}</p></div>` : ''}
      <div class="ligne" style="justify-content:center;margin-top:16px">
        <button class="btn" id="fo-retour">Sommaire</button>
        ${suivant !== null ? `<button class="btn primaire" id="fo-suivant">${FORMATION[suivant].icone} Chapitre suivant →</button>` : '<button class="btn primaire" id="fo-dipl">🏆 Recevoir mon diplôme</button>'}
      </div></div>`;
    $('#fo-retour').onclick = sommaire;
    if (suivant !== null) $('#fo-suivant').onclick = () => lire(suivant, 0); else $('#fo-dipl').onclick = diplome;
    Bus.emettre('chapitre-fini', { titre: c.titre, dernier: suivant === null });
    enHaut();
  }

  // --- Diplôme (dessiné localement, téléchargeable en PNG) ---
  function dessinerDiplome(canvas) {
    const W = 1400, H = 990; canvas.width = W; canvas.height = H;
    const g = canvas.getContext('2d');
    const fond = g.createRadialGradient(W / 2, H * 0.4, 50, W / 2, H / 2, W * 0.75);
    fond.addColorStop(0, '#1c2550'); fond.addColorStop(1, '#03050c'); g.fillStyle = fond; g.fillRect(0, 0, W, H);
    let graine = 9; const al = () => { graine = (graine * 16807) % 2147483647; return (graine - 1) / 2147483646; };
    for (let i = 0; i < 420; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + al() * 0.7})`; const r = al() < 0.05 ? 2 : 1; g.beginPath(); g.arc(al() * W, al() * H, r, 0, 2 * Math.PI); g.fill(); }
    g.strokeStyle = '#ffd27a'; g.lineWidth = 6; g.strokeRect(40, 40, W - 80, H - 80); g.lineWidth = 1.5; g.strokeRect(58, 58, W - 116, H - 116);
    const texte = (t, y, taille, couleur = '#e8ecf8', poids = 400, style = '') => { g.font = `${style} ${poids} ${taille}px Georgia, 'Times New Roman', serif`; g.fillStyle = couleur; g.textAlign = 'center'; g.fillText(t, W / 2, y); };
    texte('✦  DIPLÔME  ✦', 190, 64, '#ffd27a', 700);
    texte('d’explorateur du cosmos', 250, 36, '#c9d4ff', 400, 'italic');
    texte('décerné à', 350, 28, '#a9b3d1', 400, 'italic');
    texte(etat.nom || 'Explorateur anonyme', 450, 76, '#ffffff', 700);
    g.strokeStyle = '#ffd27a88'; g.beginPath(); g.moveTo(W / 2 - 330, 480); g.lineTo(W / 2 + 330, 480); g.stroke();
    texte('pour avoir accompli l’Odyssée cosmique :', 560, 30);
    texte(`${FORMATION.length} chapitres, du jardin aux confins de l’univers`, 605, 30);
    texte(`${points()} points d’étoile · ${grade().replace(/^\S+\s/, '')}`, 690, 34, '#ffd27a', 700);
    texte(`Le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, 790, 26, '#a9b3d1');
    texte('Stella, fée des étoiles', 880, 34, '#ff9ad5', 400, 'italic');
    // petite étoile de Stella
    g.save(); g.translate(W / 2 + 220, 868); g.fillStyle = '#fff3b0'; g.beginPath();
    for (let k = 0; k < 8; k++) { const r = k % 2 ? 7 : 20, a = k * Math.PI / 4; g.lineTo(Math.sin(a) * r, -Math.cos(a) * r); }
    g.closePath(); g.fill(); g.restore();
  }
  function diplome() {
    el().innerHTML = `<div class="ligne" style="justify-content:space-between"><button class="btn petit" id="fo-sommaire">← Sommaire</button><span class="pastille">⭐ ${points()} · ${grade()}</span></div>
      <div class="scene-odyssee"><h2>🏆 Ton diplôme d’explorateur du cosmos</h2>
      ${etat.faits.length < FORMATION.length ? `<p class="texte-2">Il te reste ${FORMATION.length - etat.faits.length} chapitre(s) à terminer pour le mériter… mais voici à quoi il ressemblera !</p>` : '<p class="texte-2">Bravo, tu as terminé toute l’Odyssée !</p>'}
      <div class="ligne"><label for="fo-nom">Ton nom :</label><input type="text" id="fo-nom" maxlength="40" value="${echap(etat.nom)}" placeholder="Ton prénom et ton nom" style="flex:1;min-width:180px"></div>
      <canvas id="fo-canvas" class="diplome"></canvas>
      <div class="ligne"><button class="btn primaire" id="fo-telecharger" ${etat.faits.length < FORMATION.length ? 'disabled' : ''}>⬇ Télécharger (image PNG)</button><button class="btn" id="fo-imprimer" ${etat.faits.length < FORMATION.length ? 'disabled' : ''}>🖨 Imprimer</button></div></div>`;
    const canvas = $('#fo-canvas'); dessinerDiplome(canvas);
    $('#fo-sommaire').onclick = sommaire;
    $('#fo-nom').oninput = e => { etat.nom = e.target.value.slice(0, 40); sauver(); dessinerDiplome(canvas); };
    $('#fo-telecharger').onclick = () => canvas.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'diplome-odyssee-cosmique.png'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); });
    $('#fo-imprimer').onclick = () => {
      let z = $('#zone-impression'); if (!z) { z = document.createElement('div'); z.id = 'zone-impression'; document.body.appendChild(z); }
      z.innerHTML = `<img src="${canvas.toDataURL('image/png')}" alt="Diplôme">`;
      setTimeout(() => window.print(), 100);
    };
    enHaut();
  }

  function init() {
    const b = document.createElement('button');
    b.id = 'retour-formation'; b.className = 'btn primaire'; b.hidden = true; b.textContent = '↩ Reprendre l’Odyssée';
    b.onclick = () => { b.hidden = true; Appli.afficherVue('formation'); };
    document.body.appendChild(b);
    Bus.sur('vue', v => { if (v === 'formation') b.hidden = true; });
    sommaire();
  }
  return { init, afficher: () => { if (!el().children.length) sommaire(); }, sommaire, reprendre: () => { const i = FORMATION.findIndex(c => !etat.faits.includes(c.id)); if (i === -1) diplome(); else lire(i, i === etat.ch ? etat.sc : 0); } };
})();
