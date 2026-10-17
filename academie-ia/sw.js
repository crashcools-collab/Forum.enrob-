/* Service worker : la formation reste consultable hors connexion une fois installée (généré). */
const CACHE = 'academie-ia-e474abbf0876';
const FICHIERS = ["./","assets/app.js","assets/data/cours.js","assets/data/encyclo.js","assets/data/fond.js","assets/data/gloss.js","assets/data/histoire.js","assets/data/meta.js","assets/data/methode.js","assets/data/outils.js","assets/data/pile.js","assets/data/prompts.js","assets/data/quiz.js","assets/data/recherche.js","assets/data/ressources.js","assets/icone-192.png","assets/icone-512.png","assets/style.css","atelier.html","bibliotheque.html","cours.html","encyclopedie.html","fondamentaux.html","glossaire.html","histoire.html","index.html","manifest.webmanifest","methode.html","niveaux.html","outils.html","pile.html","prompt-maitre.html","quiz.html","recherche.html","ressources.html","securite.html"];
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
