// Interface du tableau de bord d'Envol (une seule page, sans bibliothèque).
const app = document.getElementById('app');
const nav = document.getElementById('nav');
let minuterie = null; // rafraîchissement automatique pendant une construction

// ---------- Outils ----------

// Échappe le texte avant de l'insérer dans la page (sécurité).
function e(valeur) {
  return String(valeur ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

async function api(chemin, { methode = 'GET', corps } = {}) {
  const options = { method: methode, headers: {} };
  if (methode !== 'GET') {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(corps ?? {});
  }
  const reponse = await fetch('/api' + chemin, options);
  const donnees = await reponse.json().catch(() => ({}));
  if (reponse.status === 401 && chemin !== '/connexion') {
    location.hash = '#/connexion';
    throw new Error('Connexion requise.');
  }
  if (!reponse.ok) throw new Error(donnees.erreur ?? `Erreur ${reponse.status}`);
  return donnees;
}

const temps = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
function ilYA(date) {
  if (!date) return '';
  const secondes = Math.round((new Date(date) - Date.now()) / 1000);
  const unites = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unite, duree] of unites) {
    if (Math.abs(secondes) >= duree) return temps.format(Math.round(secondes / duree), unite);
  }
  return "à l'instant";
}

const LIBELLES = { reussi: 'En ligne', echec: 'Échec', en_cours: 'Construction…', en_attente: 'En attente' };
function statut(dep) {
  if (!dep) return '<span class="statut">Jamais déployé</span>';
  return `<span class="statut ${e(dep.statut)}">${LIBELLES[dep.statut] ?? e(dep.statut)}</span>`;
}

function toast(message) {
  const element = document.getElementById('toast');
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toast.minuterie);
  toast.minuterie = setTimeout(() => (element.hidden = true), 2500);
}

function nomDuDepot(url) {
  try {
    return new URL(url).pathname.replace(/^\/|\.git$/g, '');
  } catch {
    return url;
  }
}

// Copier en un clic tout bloc <code class="copie">.
document.addEventListener('click', async (evenement) => {
  const bloc = evenement.target.closest('code.copie');
  if (!bloc) return;
  await navigator.clipboard?.writeText(bloc.textContent);
  toast('Copié !');
});

document.getElementById('deconnexion').addEventListener('click', async () => {
  await api('/deconnexion', { methode: 'POST' }).catch(() => {});
  location.hash = '#/connexion';
});

// ---------- Navigation ----------

async function router() {
  clearInterval(minuterie);
  const [, page, id] = location.hash.replace(/^#/, '').split('/');
  const etat = await api('/etat');

  if (!etat.configure) return vueConfiguration();
  if (!etat.connecte) return vueConnexion();
  nav.hidden = false;

  try {
    if (page === 'nouveau') return vueNouveau();
    if (page === 'projet' && id) return await vueProjet(id);
    return await vueListe();
  } catch (erreur) {
    app.innerHTML = `<p class="erreur">${e(erreur.message)}</p>`;
  }
}
window.addEventListener('hashchange', router);
router();

// ---------- Première configuration & connexion ----------

function vueConfiguration() {
  nav.hidden = true;
  app.innerHTML = `
    <form class="connexion" id="formulaire">
      <h1>Bienvenue sur Envol</h1>
      <p class="doux">Choisis le mot de passe qui protégera ton tableau de bord.</p>
      <div class="champ">
        <label for="mdp">Mot de passe (10 caractères minimum)</label>
        <input type="password" id="mdp" autocomplete="new-password" required minlength="10" autofocus>
      </div>
      <div class="champ">
        <label for="mdp2">Confirmation</label>
        <input type="password" id="mdp2" autocomplete="new-password" required>
      </div>
      <button class="bouton">Commencer</button>
      <p class="erreur" id="erreur"></p>
    </form>`;
  document.getElementById('formulaire').addEventListener('submit', async (evenement) => {
    evenement.preventDefault();
    const motDePasse = document.getElementById('mdp').value;
    const erreur = document.getElementById('erreur');
    if (motDePasse !== document.getElementById('mdp2').value) {
      erreur.textContent = 'Les deux mots de passe ne sont pas identiques.';
      return;
    }
    try {
      await api('/configuration', { methode: 'POST', corps: { motDePasse } });
      location.hash = '#/';
      router();
    } catch (err) {
      erreur.textContent = err.message;
    }
  });
}

function vueConnexion() {
  nav.hidden = true;
  app.innerHTML = `
    <form class="connexion" id="formulaire">
      <h1>Connexion</h1>
      <p class="doux">Ton hébergeur perso t'attend.</p>
      <div class="champ">
        <label for="mdp">Mot de passe</label>
        <input type="password" id="mdp" autocomplete="current-password" required autofocus>
      </div>
      <button class="bouton">Se connecter</button>
      <p class="erreur" id="erreur"></p>
    </form>`;
  document.getElementById('formulaire').addEventListener('submit', async (evenement) => {
    evenement.preventDefault();
    try {
      await api('/connexion', { methode: 'POST', corps: { motDePasse: document.getElementById('mdp').value } });
      location.hash = '#/';
      router();
    } catch (err) {
      document.getElementById('erreur').textContent = err.message;
    }
  });
}

// ---------- Liste des projets ----------

async function vueListe() {
  const projets = await api('/projets');
  app.innerHTML = `
    <div class="entete">
      <h1>Projets</h1>
      <a href="#/nouveau" class="bouton">+ Nouveau projet</a>
    </div>
    ${projets.length === 0 ? `
      <div class="vide">
        <h2>Aucun projet pour l'instant</h2>
        <p class="doux">Relie un dépôt GitHub : Envol le mettra en ligne à chaque modification.</p>
        <a href="#/nouveau" class="bouton">Créer mon premier projet</a>
      </div>` : `
      <div class="grille">
        ${projets.map((p) => `
          <a class="carte" href="#/projet/${e(p.id)}">
            <div class="carte-titre"><strong>${e(p.slug)}</strong>${statut(p.dernierDeploiement)}</div>
            <div class="doux mono">${e(p.url.replace(/^https?:\/\//, ''))}</div>
            <div class="ligne">⎇ ${e(p.branche || 'par défaut')} · ${e(nomDuDepot(p.depot))}</div>
            <div class="ligne">${p.dernierDeploiement
              ? `${e(p.dernierDeploiement.message ?? 'Déploiement')} · ${ilYA(p.dernierDeploiement.creeLe)}`
              : 'Pas encore déployé'}</div>
          </a>`).join('')}
      </div>`}`;

  clearInterval(minuterie);
  if (projets.some((p) => ['en_cours', 'en_attente'].includes(p.dernierDeploiement?.statut))) {
    minuterie = setInterval(() => vueListe().catch(() => {}), 3000);
  }
}

// ---------- Formulaire projet (création & modification) ----------

function formulaireProjet(projet) {
  return `
    <div class="champ">
      <label for="slug">Nom du projet</label>
      <input type="text" id="slug" required value="${e(projet?.slug)}" placeholder="forum" pattern="[a-z0-9-]+">
      <div class="aide">Sert d'adresse : <span class="mono">nom.ton-domaine</span>. Minuscules, chiffres, tirets.</div>
    </div>
    <div class="champ">
      <label for="depot">Dépôt Git (https)</label>
      <input type="url" id="depot" required value="${e(projet?.depot)}" placeholder="https://github.com/moi/mon-site">
    </div>
    <div class="deux">
      <div class="champ">
        <label for="branche">Branche déployée</label>
        <input type="text" id="branche" value="${e(projet?.branche)}" placeholder="vide = branche par défaut">
      </div>
      <div class="champ">
        <label for="jeton">Jeton d'accès (dépôt privé)</label>
        <input type="password" id="jeton" autocomplete="off" placeholder="${projet?.aUnJeton ? '•••••• (enregistré)' : 'Facultatif'}">
        ${projet?.aUnJeton ? '<label class="case aide"><input type="checkbox" id="effacerJeton"> Effacer le jeton enregistré</label>' : ''}
      </div>
    </div>
    <h2 style="margin-top:12px">Construction <span class="doux" style="font-weight:400">— facultatif</span></h2>
    <p class="aide" style="margin-top:-6px;margin-bottom:16px">Laisse vide pour un site déjà prêt (un simple index.html, par exemple).</p>
    <div class="deux">
      <div class="champ">
        <label for="commandeInstallation">Commande d'installation</label>
        <input type="text" id="commandeInstallation" class="mono" value="${e(projet?.commandeInstallation)}" placeholder="npm ci">
      </div>
      <div class="champ">
        <label for="commandeConstruction">Commande de construction</label>
        <input type="text" id="commandeConstruction" class="mono" value="${e(projet?.commandeConstruction)}" placeholder="npm run build">
      </div>
    </div>
    <div class="champ">
      <label for="dossierSortie">Dossier à publier</label>
      <input type="text" id="dossierSortie" class="mono" value="${e(projet?.dossierSortie)}" placeholder="dist  (vide = racine du dépôt)">
    </div>`;
}

function lireFormulaire() {
  const valeur = (id) => document.getElementById(id)?.value ?? '';
  return {
    slug: valeur('slug'),
    depot: valeur('depot'),
    branche: valeur('branche'),
    jeton: valeur('jeton'),
    effacerJeton: document.getElementById('effacerJeton')?.checked ?? false,
    commandeInstallation: valeur('commandeInstallation'),
    commandeConstruction: valeur('commandeConstruction'),
    dossierSortie: valeur('dossierSortie'),
  };
}

function vueNouveau() {
  app.innerHTML = `
    <div class="entete"><h1>Nouveau projet</h1></div>
    <form class="carte" id="formulaire" style="max-width:720px">
      ${formulaireProjet(null)}
      <button class="bouton" id="envoyer">Déployer</button>
      <p class="erreur" id="erreur"></p>
    </form>`;
  document.getElementById('formulaire').addEventListener('submit', async (evenement) => {
    evenement.preventDefault();
    const bouton = document.getElementById('envoyer');
    bouton.disabled = true;
    try {
      const projet = await api('/projets', { methode: 'POST', corps: lireFormulaire() });
      location.hash = `#/projet/${projet.id}`;
    } catch (err) {
      document.getElementById('erreur').textContent = err.message;
      bouton.disabled = false;
    }
  });
}

// ---------- Page d'un projet ----------

async function vueProjet(id) {
  const p = await api(`/projets/${id}`);
  const actif = p.deploiements.find((d) => d.id === p.deploiementActif);
  const urlWebhook = new URL(p.url).origin + p.webhook.chemin;

  app.innerHTML = `
    <div class="entete">
      <div>
        <h1>${e(p.slug)}</h1>
        <div class="doux mono">${e(nomDuDepot(p.depot))} · ⎇ ${e(p.branche || 'par défaut')}</div>
      </div>
      <div class="actions">
        ${p.enLigne ? `<a class="bouton secondaire" href="${e(p.url)}" target="_blank" rel="noopener">Visiter ↗</a>` : ''}
        <button class="bouton" id="deployer">Redéployer</button>
      </div>
    </div>

    <div class="sections">
      <section class="carte">
        <dl class="infos">
          <div><dt>Adresse</dt><dd>${p.enLigne ? `<a href="${e(p.url)}" target="_blank" rel="noopener">${e(p.url)}</a>` : '<span class="doux">Pas encore en ligne</span>'}</dd></div>
          <div><dt>Version en ligne</dt><dd>${actif ? `<span class="mono">${e(actif.commit)}</span> ${e(actif.message)}` : '—'}</dd></div>
          <div><dt>Mise en ligne</dt><dd>${actif ? ilYA(actif.termineLe) : '—'}</dd></div>
          <div><dt>État</dt><dd>${statut(p.dernierDeploiement)}</dd></div>
        </dl>
      </section>

      <section class="carte">
        <h2>Déploiements</h2>
        ${p.deploiements.length === 0 ? '<p class="doux">Aucun déploiement.</p>' : `
        <table class="tableau">
          <thead><tr><th>État</th><th>Version</th><th class="masque-mobile">Origine</th><th class="masque-mobile">Date</th><th></th></tr></thead>
          <tbody>
            ${p.deploiements.map((d) => `
              <tr class="${d.id === p.deploiementActif ? 'actif' : ''}">
                <td>${statut(d)} ${d.id === p.deploiementActif ? '<span class="badge">Actuel</span>' : ''}</td>
                <td><span class="mono">${e(d.commit ?? (d.statut === 'echec' ? '—' : '…'))}</span> <span class="doux">${e(d.message ?? d.erreur ?? '')}</span></td>
                <td class="masque-mobile doux">${d.declencheur === 'github' ? 'GitHub' : 'Manuel'}</td>
                <td class="masque-mobile doux">${ilYA(d.creeLe)}</td>
                <td><span class="actions">
                  <button class="bouton secondaire petit" data-journal="${e(d.id)}">Journal</button>
                  ${d.statut === 'reussi' && d.id !== p.deploiementActif
                    ? `<button class="bouton secondaire petit" data-activer="${e(d.id)}">Remettre en ligne</button>` : ''}
                </span></td>
              </tr>`).join('')}
          </tbody>
        </table>`}
      </section>

      <section class="carte">
        <h2>Déploiement automatique (GitHub)</h2>
        <p class="doux">Dans ton dépôt GitHub : <b>Settings → Webhooks → Add webhook</b>, puis colle ces valeurs (clic pour copier) :</p>
        <label>Payload URL</label><code class="copie">${e(urlWebhook)}</code>
        <label>Content type</label><code class="copie">application/json</code>
        <label>Secret</label><code class="copie">${e(p.webhook.secret)}</code>
        <p class="aide">Ne fonctionne que lorsque ton tunnel Cloudflare est en place (GitHub doit pouvoir joindre ton PC).</p>
      </section>

      <section class="carte">
        <h2>Paramètres</h2>
        <form id="formulaire" style="max-width:720px">
          ${formulaireProjet(p)}
          <button class="bouton" id="enregistrer">Enregistrer</button>
          <p class="erreur" id="erreur"></p>
        </form>
      </section>

      <section class="carte">
        <h2>Zone dangereuse</h2>
        <p class="doux">Supprime le projet, tous ses déploiements et met le site hors ligne.</p>
        <button class="bouton danger" id="supprimer">Supprimer le projet</button>
      </section>
    </div>

    <dialog id="fenetre">
      <div class="entete" style="margin-bottom:16px"><h2 style="margin:0">Journal de construction</h2>
        <button class="bouton secondaire petit" id="fermer">Fermer</button></div>
      <pre class="journal" id="journal"></pre>
    </dialog>`;

  document.getElementById('deployer').addEventListener('click', async () => {
    const dep = await api(`/projets/${id}/deployer`, { methode: 'POST' });
    await vueProjet(id);
    ouvrirJournal(dep.id);
  });

  document.getElementById('supprimer').addEventListener('click', async () => {
    if (prompt(`Pour confirmer, tape le nom du projet : ${p.slug}`) !== p.slug) return;
    await api(`/projets/${id}`, { methode: 'DELETE' });
    toast('Projet supprimé.');
    location.hash = '#/';
  });

  document.getElementById('formulaire').addEventListener('submit', async (evenement) => {
    evenement.preventDefault();
    try {
      await api(`/projets/${id}`, { methode: 'PUT', corps: lireFormulaire() });
      toast('Paramètres enregistrés. Redéploie pour les appliquer.');
      await vueProjet(id);
    } catch (err) {
      document.getElementById('erreur').textContent = err.message;
    }
  });

  app.querySelectorAll('[data-journal]').forEach((bouton) =>
    bouton.addEventListener('click', () => ouvrirJournal(bouton.dataset.journal)));

  app.querySelectorAll('[data-activer]').forEach((bouton) =>
    bouton.addEventListener('click', async () => {
      await api(`/deploiements/${bouton.dataset.activer}/activer`, { methode: 'POST' });
      toast('Cette version est de nouveau en ligne.');
      await vueProjet(id);
    }));

  document.getElementById('fermer').addEventListener('click', () => document.getElementById('fenetre').close());

  clearInterval(minuterie);
  if (p.deploiements.some((d) => ['en_cours', 'en_attente'].includes(d.statut))) {
    minuterie = setInterval(() => {
      // Ne pas redessiner la page pendant que le journal est ouvert ou qu'on remplit le formulaire.
      if (document.getElementById('fenetre')?.open || document.activeElement?.closest('form')) return;
      vueProjet(id).catch(() => {});
    }, 3000);
  }
}

// Journal en direct : le serveur envoie chaque ligne dès qu'elle est écrite.
function ouvrirJournal(depId) {
  const fenetre = document.getElementById('fenetre');
  const zone = document.getElementById('journal');
  zone.innerHTML = '';
  fenetre.showModal();

  const flux = new EventSource(`/api/deploiements/${depId}/journal`);
  flux.onmessage = (message) => {
    const ligne = JSON.parse(message.data);
    const classe = ligne.includes('✓') ? 'ok' : ligne.includes('✗') ? 'ko' : ligne.includes('▶') ? 'etape' : '';
    zone.insertAdjacentHTML('beforeend', `<span class="${classe}">${e(ligne)}</span>\n`);
    zone.scrollTop = zone.scrollHeight;
  };
  flux.addEventListener('fin', () => flux.close());
  flux.onerror = () => flux.close();
  fenetre.addEventListener('close', () => {
    flux.close();
    router();
  }, { once: true });
}
