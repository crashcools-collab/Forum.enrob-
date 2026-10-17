/* ====== COURS PAR OUTIL (2/2) : développement, open source et création ====== */
COURS.push(
{
id:'github', n:'GitHub', by:'Microsoft', cat:'dev', lvl:'Débutant → avancé', dur:'3 h',
pitch:"Tout comprendre : Git, dépôts, commits, branches, pull requests, GitHub Pages pour héberger ton site, Actions, Copilot et ses agents, sécurité.", hk:['GitHub'],
ch:[
{t:"Git et GitHub : la différence", h:`
<div class="two">
<div class="card"><h3>Git</h3><p class="small">Un <b>logiciel</b> gratuit, créé en 2005 par Linus Torvalds, qui enregistre l'historique complet des modifications d'un dossier. Chaque version est sauvegardée : on peut revenir en arrière, comparer, travailler à plusieurs sans s'écraser.</p></div>
<div class="card"><h3>GitHub</h3><p class="small">Un <b>site web</b> (racheté par Microsoft en 2018) qui héberge des projets Git en ligne et ajoute la collaboration : revue de code, tickets, hébergement de sites, automatisations, IA. C'est la plus grande plateforme de code au monde.</p></div>
</div>
<p>Image simple : Git est le carnet de bord qui note chaque modification, GitHub est le bureau partagé où toute l'équipe consulte et valide ce carnet. Alternatives à GitHub : GitLab, Bitbucket.</p>`},
{t:"Le vocabulaire indispensable", h:`
<div class="tbl-wrap"><table><thead><tr><th>Terme</th><th>Signification</th></tr></thead><tbody>
<tr><td><b>Dépôt</b> (repository, « repo »)</td><td>Le dossier du projet et tout son historique. Exemple : le dépôt d'un site contient <code>index.html</code> et <code>README.md</code>.</td></tr>
<tr><td><b>Commit</b></td><td>Un enregistrement de modifications, avec un message qui explique ce qui a changé. C'est un point de sauvegarde.</td></tr>
<tr><td><b>Branche</b></td><td>Une version parallèle du projet pour travailler sans toucher à la version principale (<code>main</code>).</td></tr>
<tr><td><b>Merge</b> (fusion)</td><td>Intégrer les modifications d'une branche dans une autre.</td></tr>
<tr><td><b>Pull request</b> (PR)</td><td>Une demande de fusion : on montre ses modifications, l'équipe les relit, commente, puis valide.</td></tr>
<tr><td><b>Clone</b></td><td>Copier un dépôt sur son ordinateur.</td></tr>
<tr><td><b>Push / Pull</b></td><td>Envoyer ses commits vers GitHub / récupérer ceux des autres.</td></tr>
<tr><td><b>Fork</b></td><td>Copier le dépôt de quelqu'un d'autre dans son propre compte pour le modifier.</td></tr>
<tr><td><b>Issue</b></td><td>Un ticket : bug, idée, tâche à faire.</td></tr>
<tr><td><b>README</b></td><td>Le fichier de présentation affiché sur la page du dépôt.</td></tr>
<tr><td><b>.gitignore</b></td><td>La liste des fichiers que Git doit ignorer (fichiers temporaires, secrets).</td></tr>
<tr><td><b>Release / tag</b></td><td>Une version officielle numérotée (v1.0, v1.1).</td></tr>
<tr><td><b>Conflit</b></td><td>Deux personnes ont modifié la même ligne : il faut choisir manuellement.</td></tr>
</tbody></table></div>`},
{t:"Créer son compte et son premier dépôt", h:`
<ol class="steps">
<li>Va sur <a href="https://github.com" target="_blank" rel="noopener">github.com</a> → <b>Sign up</b>. Choisis un nom d'utilisateur professionnel.</li>
<li>Active l'<b>authentification à deux facteurs</b> (Settings → Password and authentication). GitHub l'exige pour contribuer.</li>
<li>Bouton <b>+</b> en haut à droite → <b>New repository</b>.</li>
<li>Nom du dépôt, description, <b>Public</b> (visible par tous) ou <b>Private</b> (toi et tes invités).</li>
<li>Coche <b>Add a README file</b>, choisis un <b>.gitignore</b> et une licence si le projet est public.</li>
<li><b>Create repository</b>. Ton dépôt existe.</li>
</ol>
<div class="callout warn">Un dépôt public est visible par le monde entier, y compris son historique : un mot de passe supprimé dans un commit récent reste lisible dans les anciens commits.</div>`},
{t:"Travailler sans ligne de commande", h:`
<p>Tout peut se faire depuis le navigateur :</p>
<ul class="clean">
<li><b>Add file → Upload files</b> : glisser des fichiers, écrire un message de commit, valider. Ces commits apparaissent sous le nom « Add files via upload ».</li>
<li><b>Modifier un fichier</b> : ouvre-le, clique sur le crayon, modifie, puis <b>Commit changes</b>.</li>
<li><b>History</b> sur un fichier : voir toutes ses versions et qui a changé quoi.</li>
<li>Touche <kbd>.</kbd> sur la page d'un dépôt : ouvre un éditeur de code complet dans le navigateur (github.dev).</li>
<li><b>GitHub Desktop</b> : application gratuite (Windows, macOS) pour cloner, committer et pousser avec des boutons.</li>
<li><b>Application mobile GitHub</b> : suivre les issues et les pull requests.</li>
</ul>`},
{t:"Git en ligne de commande : les commandes essentielles", h:`
<pre class="code">git clone https://github.com/compte/depot.git   # copier le dépôt sur l'ordinateur
cd depot
git status                    # voir ce qui a changé
git switch -c ma-branche      # créer une branche et s'y placer
git add index.html            # préparer un fichier pour le commit
git commit -m "Ajoute la formation IA au menu"   # enregistrer
git push -u origin ma-branche # envoyer la branche sur GitHub
git pull                      # récupérer les dernières modifications
git log --oneline             # historique résumé
git diff                      # voir les modifications ligne par ligne
git switch main               # revenir sur la branche principale
git merge ma-branche          # fusionner une branche</pre>
<div class="callout">Avant toute chose, configure ton identité : <code>git config --global user.name "Prénom Nom"</code> et <code>git config --global user.email "adresse"</code>.</div>`},
{t:"Le flux professionnel : branche, pull request, revue", h:`
<ol class="steps">
<li>Crée une <b>branche</b> pour chaque modification (une fonctionnalité, un correctif).</li>
<li>Fais des <b>commits</b> petits et clairs : un message qui dit ce qui change et pourquoi.</li>
<li><b>Pousse</b> la branche et ouvre une <b>pull request</b> vers <code>main</code>. Une PR en <b>brouillon</b> (draft) signale que le travail n'est pas fini.</li>
<li>Les relecteurs commentent ligne par ligne, demandent des changements ou approuvent.</li>
<li>Les vérifications automatiques (Actions) doivent passer au vert.</li>
<li>On <b>fusionne</b> (Merge), puis on supprime la branche.</li>
</ol>
<p>Ce cycle protège la version en production : rien n'arrive sur <code>main</code> sans avoir été relu.</p>`},
{t:"Issues, Projects et collaboration", h:`
<ul class="clean">
<li><b>Issues</b> : signaler un bug ou proposer une idée, avec étiquettes (bug, amélioration), responsable et jalon.</li>
<li>Écrire <code>Fixes #12</code> dans une pull request ferme automatiquement l'issue n° 12 à la fusion.</li>
<li><b>Projects</b> : tableau type Kanban (À faire, En cours, Terminé) relié aux issues.</li>
<li><b>Discussions</b> et <b>Wiki</b> : questions de la communauté et documentation.</li>
<li><b>Settings → Collaborators</b> : inviter des collègues sur un dépôt.</li>
<li>Mentionner quelqu'un avec <code>@nom</code> le notifie.</li>
</ul>`},
{t:"GitHub Pages : mettre un site en ligne gratuitement", h:`
<ol class="steps">
<li>Dans le dépôt : <b>Settings → Pages</b>.</li>
<li><b>Source</b> : « Deploy from a branch », branche <code>main</code>, dossier <code>/ (root)</code> → <b>Save</b>.</li>
<li>Après une à deux minutes, le site est disponible à l'adresse <code>https://compte.github.io/depot/</code>.</li>
<li>La page d'accueil est le fichier <code>index.html</code>. Une autre page, par exemple <code>contact.html</code>, s'ouvre en ajoutant son nom à l'adresse.</li>
<li>Chaque nouveau commit sur <code>main</code> met le site à jour automatiquement.</li>
</ol>
<div class="callout">GitHub Pages est gratuit pour les dépôts publics. Pour un dépôt privé, il faut une offre payante. Pages n'héberge que des sites statiques (HTML, CSS, JavaScript) : pas de base de données. Pour en avoir une, on branche un service externe comme Supabase ou Firebase.</div>`},
{t:"GitHub Actions : automatiser", h:`
<p>Les Actions exécutent des tâches automatiquement à chaque événement (push, pull request, horaire) : tests, vérifications, déploiement. Elles se décrivent dans un fichier YAML placé dans <code>.github/workflows/</code>.</p>
<pre class="code">name: Vérification
on: [push, pull_request]
jobs:
  verifier:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Vérifier que la page d'accueil existe
        run: test -f index.html</pre>
<p>Le résultat apparaît dans l'onglet <b>Actions</b> et sur chaque pull request (coche verte ou croix rouge). Une offre gratuite de minutes est incluse.</p>`},
{t:"GitHub Copilot et Codespaces", h:`
<ul class="clean">
<li><b>GitHub Copilot</b> : suggestions de code pendant que tu tapes, chat pour expliquer ou corriger, revue automatique des pull requests, et <b>agent de code</b> à qui tu peux assigner une issue : il crée une branche, code et ouvre une PR. Offres gratuite (limitée), Pro, Pro+, Business et Enterprise. Plusieurs modèles au choix (OpenAI, Anthropic, Google).</li>
<li><b>Ce qui est arrivé en 2026</b> : les agents <b>Claude</b> (Anthropic) et <b>Codex</b> (OpenAI) travaillent directement dans GitHub aux côtés de l'agent Copilot (février 2026) ; <b>Copilot CLI</b>, l'agent dans le terminal, est disponible pour tous (février 2026) ; le <b>bac à sable local</b>, qui limite l'accès des agents aux fichiers, au réseau et aux identifiants, est disponible pour tous (octobre 2026) ; <b>Gemini 4 Argon</b> est proposé dans Copilot depuis le 13 octobre 2026.</li>
<li><b>Codespaces</b> : un ordinateur de développement complet dans le navigateur, prêt en quelques secondes, avec un quota gratuit mensuel.</li>
<li><b>Copilot dans github.com</b> : poser des questions sur un dépôt (« Comment fonctionne la messagerie dans ce projet ? »).</li>
</ul>`},
{t:"Sécurité : les règles à ne jamais oublier", h:`
<ul class="clean no">
<li>Ne jamais committer de mots de passe, clés API ou jetons. Utilise les <b>Secrets</b> du dépôt (Settings → Secrets and variables) pour les Actions.</li>
<li>Une clé publiée doit être considérée comme compromise : révoque-la immédiatement, même après suppression.</li>
</ul>
<ul class="clean ok">
<li>Certaines clés sont faites pour être publiques (clé « anon » de Supabase, clés « publishable ») : la sécurité repose alors sur des règles d'accès côté serveur. Une clé secrète (API d'IA, base de données), jamais.</li>
<li><b>Secret scanning</b> et <b>push protection</b> détectent les secrets et bloquent leur envoi.</li>
<li><b>Dependabot</b> signale les dépendances vulnérables et propose les mises à jour.</li>
<li><b>Branches protégées</b> : interdire les modifications directes sur <code>main</code> sans revue.</li>
</ul>
<div class="ex"><b class="t">Exercice</b><p>Crée un dépôt privé « test-formation », ajoute un fichier <code>notes.md</code> depuis le navigateur, modifie-le dans une branche, ouvre une pull request, puis fusionne-la. Regarde l'historique du fichier.</p></div>`}
]},
{
id:'huggingface', n:'Hugging Face', by:'Hugging Face', cat:'dev', lvl:'Intermédiaire → avancé', dur:'2 h 30',
pitch:"La plateforme de l'IA open source, en cours de rachat par Nvidia : plus d'un million de modèles, des jeux de données, des démos, les bibliothèques Transformers et Diffusers.", hk:['Hugging Face'],
ch:[
{t:"Présentation : le « GitHub de l'IA »", h:`
<p><b>Hugging Face</b> est une entreprise fondée en 2016 par trois Français, Clément Delangue, Julien Chaumond et Thomas Wolf. Sa plateforme <a href="https://huggingface.co" target="_blank" rel="noopener">huggingface.co</a> est le lieu central de l'IA ouverte : chercheurs, entreprises (Meta, Google, Mistral, Alibaba, OpenAI…) et particuliers y publient leurs modèles.</p>
<div class="tbl-wrap"><table><thead><tr><th>Rubrique</th><th>Contenu</th></tr></thead><tbody>
<tr><td><b>Models</b></td><td>Plus d'un million de modèles : texte, image, son, traduction, vision, etc.</td></tr>
<tr><td><b>Datasets</b></td><td>Jeux de données pour entraîner ou évaluer des modèles</td></tr>
<tr><td><b>Spaces</b></td><td>Applications de démonstration à essayer dans le navigateur, sans rien installer</td></tr>
<tr><td><b>Docs et Learn</b></td><td>Documentation et cours gratuits (LLM, agents, vision, audio…)</td></tr>
</tbody></table></div>
<div class="callout"><b>Actualité 2026.</b> Le 3 septembre 2026, Nvidia a confirmé le rachat de Hugging Face pour environ 12,9 milliards de dollars, en promettant que la plateforme restera ouverte à tout l'écosystème. En juillet 2026, Hugging Face a subi une intrusion touchant des données et identifiants internes : si tu as un compte, renouvelle tes jetons d'accès. L'entreprise fait aussi de la robotique open source (Pollen Robotics, rachetée en 2025).</div>`},
{t:"Lire une fiche de modèle (model card)", h:`
<p>Chaque modèle a une page avec sa fiche. Avant de l'utiliser, regarde :</p>
<ul class="clean">
<li><b>L'auteur</b> : un organisme connu ou un compte vérifié inspire plus confiance.</li>
<li><b>La tâche</b> : text-generation, translation, automatic-speech-recognition, text-to-image…</li>
<li><b>La taille</b> en milliards de paramètres (7B, 70B) : plus c'est gros, plus c'est capable et gourmand en mémoire.</li>
<li><b>La licence</b> : elle dit si l'usage commercial est autorisé.</li>
<li><b>Les langues</b> prises en charge et les <b>limites</b> annoncées.</li>
<li><b>Les téléchargements et les « likes »</b> : un indicateur de popularité, pas de qualité garantie.</li>
<li><b>Files and versions</b> : les fichiers. Préfère le format <code>.safetensors</code>, plus sûr que les anciens fichiers <code>.bin</code> ou pickle qui peuvent contenir du code.</li>
</ul>`},
{t:"Les licences, à vérifier avant tout usage pro", h:`
<div class="tbl-wrap"><table><thead><tr><th>Licence</th><th>En pratique</th></tr></thead><tbody>
<tr><td>Apache 2.0, MIT</td><td>Très permissives : usage commercial autorisé, en citant l'origine</td></tr>
<tr><td>Licences « communautaires » (ex. : Llama, Gemma)</td><td>Usage commercial possible avec des conditions spécifiques à lire</td></tr>
<tr><td>OpenRAIL et dérivées</td><td>Usage libre avec une liste d'usages interdits</td></tr>
<tr><td>CC BY-NC, « non commercial », « research only »</td><td>Interdit pour un usage professionnel ou commercial</td></tr>
</tbody></table></div>`},
{t:"Essayer sans coder : les Spaces", h:`
<ol class="steps">
<li>Onglet <b>Spaces</b> → cherche « background removal », « speech to text », « translation ».</li>
<li>Ouvre un Space populaire : une interface s'affiche (souvent créée avec Gradio).</li>
<li>Dépose ton fichier ou écris ton texte et lance.</li>
<li>Sur certaines pages de modèles, un encadré permet aussi de tester directement.</li>
</ol>
<div class="callout warn">Un Space est géré par son auteur, pas par Hugging Face. N'y dépose aucun document confidentiel.</div>`},
{t:"Utiliser un modèle en Python", h:`
<p>La bibliothèque <b>Transformers</b> télécharge et fait tourner un modèle en quelques lignes :</p>
<pre class="code">pip install transformers torch sentencepiece

from transformers import pipeline

traducteur = pipeline("translation", model="Helsinki-NLP/opus-mt-fr-en")
print(traducteur("La réunion est reportée à jeudi."))</pre>
<p>Autres bibliothèques utiles :</p>
<ul class="clean">
<li><b>diffusers</b> : génération d'images (Stable Diffusion, FLUX…).</li>
<li><b>datasets</b> : charger et préparer des données.</li>
<li><b>huggingface_hub</b> : télécharger, publier, appeler des modèles hébergés.</li>
<li><b>sentence-transformers</b> : transformer des textes en vecteurs pour la recherche sémantique.</li>
<li><b>Gradio</b> : créer une interface web pour un modèle en quelques lignes.</li>
<li><b>smolagents</b> : construire des agents simples.</li>
</ul>`},
{t:"Appeler un modèle hébergé (Inference Providers)", h:`
<ol class="steps">
<li>Crée un compte, puis <b>Settings → Access Tokens</b> → nouveau jeton en lecture.</li>
<li>Stocke-le dans une variable d'environnement <code>HF_TOKEN</code>, jamais dans le code publié.</li>
<li>Utilise <code>huggingface_hub.InferenceClient</code> ou une API compatible OpenAI pour appeler un modèle hébergé chez un fournisseur partenaire. Un quota gratuit permet de tester, au-delà c'est facturé à l'usage.</li>
<li>Les entreprises peuvent aussi déployer un modèle sur un serveur dédié (Inference Endpoints).</li>
</ol>`},
{t:"Faire tourner un modèle sur son ordinateur", h:`
<p>Beaucoup de modèles existent en version <b>GGUF quantifiée</b> (compressée), faite pour les ordinateurs ordinaires. Ils se chargent dans Ollama ou LM Studio (voir le cours IA locale). Ordres de grandeur :</p>
<div class="tbl-wrap"><table><thead><tr><th>Mémoire disponible</th><th>Taille de modèle raisonnable (quantifié 4 bits)</th></tr></thead><tbody>
<tr><td>8 Go</td><td>1 à 8 milliards de paramètres</td></tr>
<tr><td>16 Go</td><td>jusqu'à environ 14 milliards</td></tr>
<tr><td>32 Go et plus, ou carte graphique puissante</td><td>20 à 32 milliards et au-delà</td></tr>
</tbody></table></div>
<p class="small muted">Ces chiffres sont indicatifs : la vitesse dépend surtout de la carte graphique.</p>`},
{t:"Publier et apprendre", h:`
<ul class="clean">
<li>Chaque modèle, jeu de données ou Space est un <b>dépôt Git</b> : même logique que GitHub (commits, historique).</li>
<li><b>Créer un Space</b> : New → Space → Gradio → écrire un fichier <code>app.py</code>. L'application est en ligne.</li>
<li><b>Organisations</b> : partager des modèles privés au sein d'une équipe.</li>
<li><b>Cours gratuits</b> (huggingface.co/learn) : grands modèles de langage, agents, vision, audio, apprentissage par renforcement.</li>
</ul>
<div class="ex"><b class="t">Exercice</b><p>Trouve un Space de transcription audio, enregistre une note vocale de 30 secondes (sans information sensible) et compare la transcription avec ce que tu as dit. Puis ouvre la fiche du modèle utilisé et note sa licence.</p></div>`}
]},
{
id:'cursor', n:'Cursor', by:'Anysphere', cat:'dev', lvl:'Intermédiaire → avancé', dur:'2 h',
pitch:"L'éditeur de code avec IA le plus populaire, propriété de SpaceX depuis août 2026 : autocomplétion, édition en langage naturel, agents qui modifient plusieurs fichiers.", hk:['Cursor'],
ch:[
{t:"Présentation", h:`
<p><a href="https://cursor.com" target="_blank" rel="noopener">Cursor</a> est un éditeur de code construit à partir de VS Code, édité par la société Anysphere. Il garde l'apparence, les raccourcis et les extensions de VS Code, et y intègre l'IA partout. Il fonctionne sous Windows, macOS et Linux.</p>
<p>Offres : gratuite (limitée), Pro et offres supérieures pour un usage intensif, Teams et Enterprise. Tu choisis le modèle utilisé parmi ceux proposés, dont <b>Composer</b>, le modèle maison de Cursor (octobre 2025).</p>
<div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Ce qui s'est passé</th></tr></thead><tbody>
<tr><td>Novembre 2025</td><td>Levée de 2,3 milliards de dollars, valorisation 29,3 milliards</td></tr>
<tr><td>Février 2026</td><td>2 milliards de dollars de revenus annuels</td></tr>
<tr><td>16 juin 2026</td><td>SpaceX annonce le rachat de Cursor pour 60 milliards de dollars en actions</td></tr>
<tr><td>14 août 2026</td><td>Rachat finalisé : Cursor appartient à SpaceX, qui possède aussi xAI et Grok</td></tr>
<tr><td>29 août 2026</td><td>OpenAI annonce couper l'accès de Cursor à ses modèles, coupure prévue le 12 novembre 2026</td></tr>
</tbody></table></div>
<div class="callout warn">Conséquence pratique : après le 12 novembre 2026, les modèles GPT ne seront plus utilisables dans Cursor. Si tu en dépends, prévois les autres modèles proposés dans Cursor, ou un autre outil (VS Code + Copilot, Codex, Claude Code).</div>`},
{t:"Installation et premiers réglages", h:`
<ol class="steps">
<li>Télécharge Cursor sur le site officiel et installe-le.</li>
<li>Au premier lancement, importe tes extensions et réglages VS Code si tu en as.</li>
<li><b>File → Open Folder</b> : ouvre le dossier d'un projet (par exemple un site web cloné depuis GitHub).</li>
<li>Dans les réglages, choisis la langue de réponse et active le <b>mode confidentialité</b> (Privacy Mode) pour que ton code ne soit pas conservé par le service.</li>
</ol>`},
{t:"Les quatre façons d'utiliser l'IA dans Cursor", h:`
<div class="tbl-wrap"><table><thead><tr><th>Fonction</th><th>Raccourci habituel</th><th>Usage</th></tr></thead><tbody>
<tr><td><b>Tab</b></td><td><kbd>Tab</kbd></td><td>Autocomplétion prédictive : propose les lignes suivantes, voire le prochain endroit à modifier</td></tr>
<tr><td><b>Édition en ligne</b></td><td><kbd>Ctrl/Cmd</kbd> + <kbd>K</kbd></td><td>Sélectionne du code et décris la modification (« ajoute une validation des champs vides »)</td></tr>
<tr><td><b>Chat / Agent</b></td><td><kbd>Ctrl/Cmd</kbd> + <kbd>L</kbd> ou <kbd>I</kbd></td><td>Panneau latéral : questions sur le projet, ou agent qui modifie plusieurs fichiers et lance des commandes</td></tr>
<tr><td><b>Agents en arrière-plan</b></td><td>Depuis le panneau Agent</td><td>Des agents travaillent dans le cloud sur une branche pendant que tu fais autre chose</td></tr>
</tbody></table></div>
<p class="small muted">Les raccourcis et noms de modes évoluent avec les versions : vérifie dans le menu de l'application.</p>`},
{t:"Le contexte : @ et règles du projet", h:`
<ul class="clean">
<li>Tape <kbd>@</kbd> dans le chat pour ajouter un fichier, un dossier, la documentation d'une bibliothèque, une recherche web ou l'historique Git.</li>
<li>Glisse une capture d'écran : l'IA voit le problème d'affichage.</li>
<li><b>Règles du projet</b> : des fichiers dans <code>.cursor/rules/</code> (ou un <code>AGENTS.md</code>) donnent des consignes permanentes : « Code en français dans les commentaires, une seule page HTML, pas de dépendance externe. »</li>
<li>L'indexation du projet permet à l'agent de retrouver le bon fichier tout seul.</li>
</ul>`},
{t:"Pas à pas : modifier un site web avec l'agent", h:`
<ol class="steps">
<li>Ouvre le dossier du dépôt et l'agent.</li>
<li>Demande d'abord une explication : « Explique la structure de index.html et comment fonctionne la navigation entre les onglets. »</li>
<li>Demande un plan avant le code : « Je veux ajouter une page Contact avec un formulaire. Propose un plan, ne code pas encore. »</li>
<li>Valide le plan, puis : « Applique le plan. »</li>
<li>Relis chaque modification dans la vue de différences (vert = ajouté, rouge = supprimé). Accepte ou rejette fichier par fichier.</li>
<li>Ouvre la page dans le navigateur et teste.</li>
<li>Fais un commit depuis l'onglet Git de Cursor avec un message clair.</li>
</ol>`},
{t:"Bonnes pratiques et pièges", h:`
<div class="two"><ul class="clean ok">
<li>Des demandes petites et précises, une à la fois.</li>
<li>Commit avant chaque grosse demande : tu peux toujours revenir en arrière.</li>
<li>Demande à l'agent d'écrire et de lancer des tests.</li>
<li>Relis tout le code avant de l'accepter : tu en restes responsable.</li>
</ul><ul class="clean no">
<li>Laisser l'agent lancer des commandes sans les lire (suppression de fichiers, publication).</li>
<li>Accepter des centaines de lignes sans comprendre.</li>
<li>Ouvrir un projet confidentiel sans mode confidentialité ni accord de l'entreprise.</li>
</ul></div>
<div class="tbl-wrap" style="margin-top:12px"><table><thead><tr><th>Alternative</th><th>Particularité</th></tr></thead><tbody>
<tr><td>VS Code + GitHub Copilot</td><td>L'éditeur standard avec l'IA de GitHub</td></tr>
<tr><td>Claude Code</td><td>Agent d'Anthropic en terminal, IDE, application et web</td></tr>
<tr><td>OpenAI Codex</td><td>Agent de code d'OpenAI en ligne de commande, IDE et cloud</td></tr>
<tr><td>Gemini CLI</td><td>Agent open source de Google en ligne de commande</td></tr>
<tr><td>Google Antigravity</td><td>Environnement de développement à agents de Google</td></tr>
<tr><td>Vibe Code (Mistral)</td><td>Agent de code européen en ligne de commande, VS Code et web</td></tr>
<tr><td>Windsurf (Cognition), Zed, JetBrains AI</td><td>Autres éditeurs avec IA intégrée</td></tr>
</tbody></table></div>
<div class="ex"><b class="t">Exercice</b><p>Ouvre un petit projet HTML et demande à l'agent : « Trouve trois problèmes d'accessibilité dans cette page et corrige-les. » Relis les différences avant d'accepter.</p></div>`}
]},
{
id:'api', n:'Les API d\'IA', by:'OpenAI, Anthropic, Google, Mistral', cat:'dev', lvl:'Intermédiaire', dur:'1 h 30',
pitch:"Brancher une IA dans tes propres outils, comme un assistant intégré à ton site : clés, tokens, coûts, paramètres, outils, RAG et MCP.",
ch:[
{t:"Qu'est-ce qu'une API d'IA", h:`
<p>Une <b>API</b> permet à un programme d'envoyer une demande à un modèle et de recevoir la réponse, sans passer par l'interface de discussion. C'est ainsi que l'on intègre l'IA dans un site, un tableur ou une application métier.</p>
<div class="tbl-wrap"><table><thead><tr><th>Fournisseur</th><th>Console développeur</th></tr></thead><tbody>
<tr><td>OpenAI</td><td>platform.openai.com</td></tr>
<tr><td>Anthropic</td><td>Claude Console (console développeur d'Anthropic)</td></tr>
<tr><td>Google</td><td>aistudio.google.com, ou Vertex AI pour les entreprises</td></tr>
<tr><td>Mistral</td><td>console.mistral.ai</td></tr>
</tbody></table></div>
<p>L'abonnement à l'interface (ChatGPT Plus, Claude Pro…) et l'API sont facturés séparément.</p>`},
{t:"Tokens et coûts", h:`
<ul class="clean">
<li>Les modèles lisent des <b>tokens</b> : des morceaux de mots. En français, comptez environ 1 token pour 3 à 4 caractères.</li>
<li>La facturation se fait au million de tokens, avec un prix pour l'<b>entrée</b> (ta question et le contexte) et un prix plus élevé pour la <b>sortie</b> (la réponse).</li>
<li>Les petits modèles coûtent beaucoup moins cher que les grands : choisis le plus petit qui fait bien le travail.</li>
<li><b>Exemples de prix publics (octobre 2026)</b> : Claude Opus 5.5 coûte 4 $ par million de tokens en entrée et 20 $ en sortie ; Gemini 4 Argon 2 $ et 10 $ en tarif de lancement jusqu'au 30 novembre 2026, puis 4 $ et 20 $.</li>
<li>Fixe une <b>limite de dépenses</b> dans la console pour éviter les surprises.</li>
</ul>`},
{t:"Un premier appel", h:`
<p>Exemple avec l'API Mistral, en ligne de commande (la clé est lue dans une variable d'environnement) :</p>
<pre class="code">curl https://api.mistral.ai/v1/chat/completions \\
  -H "Authorization: Bearer $MISTRAL_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "mistral-small-latest",
    "messages": [
      {"role": "system", "content": "Tu réponds en français, de façon claire et concise."},
      {"role": "user", "content": "Explique la différence entre un taux fixe et un taux variable."}
    ]
  }'</pre>
<p>Les rôles : <b>system</b> (les règles permanentes), <b>user</b> (la demande), <b>assistant</b> (les réponses précédentes, pour garder le fil).</p>`},
{t:"Les paramètres et concepts avancés", h:`
<div class="tbl-wrap"><table><thead><tr><th>Notion</th><th>Explication</th></tr></thead><tbody>
<tr><td>Température</td><td>De 0 (réponses stables et prévisibles) à plus de 1 (plus créatives et variables)</td></tr>
<tr><td>Longueur maximale</td><td>Le nombre maximal de tokens de la réponse</td></tr>
<tr><td>Streaming</td><td>Afficher la réponse au fur et à mesure</td></tr>
<tr><td>Sortie structurée</td><td>Forcer une réponse en JSON qui respecte un schéma</td></tr>
<tr><td>Outils (function calling)</td><td>Le modèle demande à ton programme d'exécuter une fonction (calcul, recherche en base) puis utilise le résultat</td></tr>
<tr><td>RAG</td><td>Chercher les passages pertinents dans tes documents et les fournir au modèle avant qu'il réponde</td></tr>
<tr><td>Embeddings</td><td>Représentation d'un texte en nombres, pour la recherche par le sens</td></tr>
<tr><td>MCP</td><td>Model Context Protocol : standard ouvert pour connecter une IA à des outils et des données</td></tr>
<tr><td>Mise en cache du prompt</td><td>Réutiliser un long contexte identique à prix réduit</td></tr>
</tbody></table></div>
<div class="callout warn">Une clé API placée dans une page web publique peut être lue par n'importe qui. Pour un outil partagé, la clé doit rester côté serveur. Pour un outil personnel, une solution simple consiste à demander à chaque utilisateur sa propre clé, stockée dans son navigateur.</div>
<div class="ex"><b class="t">Exercice</b><p>Crée un compte sur une console, fixe une limite de dépense basse, génère une clé, et teste un appel dans l'espace d'essai (playground) en changeant la température de 0 à 1. Compare les réponses.</p></div>`}
]},
{
id:'creation', n:'Images et vidéo', by:'Midjourney, OpenAI, Google, Adobe…', cat:'creation', lvl:'Débutant → intermédiaire', dur:'1 h 30',
pitch:"Créer des visuels, affiches, illustrations et vidéos : Midjourney, GPT Image, Gemini, Firefly, Ideogram, Veo, Sora, Runway, avatars.",
ch:[
{t:"Choisir le bon générateur d'images", h:`
<div class="tbl-wrap"><table><thead><tr><th>Outil</th><th>Point fort</th><th>Usage idéal</th></tr></thead><tbody>
<tr><td>GPT Image (ChatGPT)</td><td>Suit très bien les consignes, gère le texte dans l'image</td><td>Affiches, schémas illustrés, retouches par la conversation</td></tr>
<tr><td>Gemini (Nano Banana)</td><td>Retouche cohérente : garde le même sujet d'une image à l'autre</td><td>Modifier une photo existante, déclinaisons</td></tr>
<tr><td>Midjourney</td><td>Rendu esthétique et artistique</td><td>Illustrations, ambiances, visuels de présentation</td></tr>
<tr><td>Adobe Firefly</td><td>Entraîné sur des contenus sous licence, intégré à Photoshop</td><td>Usage commercial, retouche professionnelle</td></tr>
<tr><td>Ideogram</td><td>Typographie et texte lisibles</td><td>Logos, affiches, bannières</td></tr>
<tr><td>Stable Diffusion, FLUX</td><td>Modèles ouverts, contrôle fin, local possible</td><td>Utilisateurs avancés</td></tr>
</tbody></table></div>`},
{t:"Midjourney en détail", h:`
<ul class="clean">
<li>S'utilise sur le site midjourney.com (et historiquement sur Discord). Abonnement payant.</li>
<li><b>Version actuelle : V8.2</b>, par défaut depuis le 24 juillet 2026, avec un nouveau modèle d'édition qui remplace les anciennes références de personnage, de style et la retexture. La V8 était sortie en alpha en mars 2026.</li>
<li>Le prompt décrit l'image, puis des <b>paramètres</b> s'ajoutent à la fin :</li>
</ul>
<div class="tbl-wrap"><table><thead><tr><th>Paramètre</th><th>Effet</th></tr></thead><tbody>
<tr><td><code>--ar 16:9</code></td><td>Format de l'image (16:9 paysage, 9:16 vertical, 1:1 carré)</td></tr>
<tr><td><code>--stylize 100</code> (ou <code>--s</code>)</td><td>Intensité du style artistique de Midjourney</td></tr>
<tr><td><code>--chaos 20</code></td><td>Variété entre les propositions</td></tr>
<tr><td><code>--no texte</code></td><td>Éléments à exclure</td></tr>
<tr><td>Image de référence</td><td>Glisser une image pour guider le style ou le sujet</td></tr>
</tbody></table></div>
<p>Après génération : <b>Vary</b> (variations), <b>Upscale</b> (agrandir), <b>Edit</b> (modifier une zone).</p>`},
{t:"La vidéo générative", h:`
<ul class="clean">
<li><b>Gemini Omni</b> (Google, mai 2026) et <b>Veo 3.1</b> : vidéos réalistes avec son, dans l'app Gemini et Flow.</li>
<li><b>Sora 2</b> (OpenAI, septembre 2025) : vidéos avec son et application dédiée.</li>
<li><b>Runway</b> : suite créative complète (génération, retouche, effets).</li>
<li><b>Kling</b>, <b>Luma Dream Machine</b> : génération de clips courts.</li>
<li><b>HeyGen</b>, <b>Synthesia</b> : avatars qui parlent, très utilisés pour les vidéos de formation, et traduction de vidéos avec synchronisation des lèvres.</li>
<li><b>Descript</b>, <b>CapCut</b> : montage assisté, sous-titres automatiques, nettoyage du son.</li>
</ul>
<p>Méthode : plans courts (5 à 10 s), une action par plan, mouvement de caméra précisé, puis montage.</p>`},
{t:"Règles légales et éthiques", h:`
<ul class="clean no">
<li>Ne jamais créer l'image ou la voix d'une personne réelle sans son accord écrit.</li>
<li>Ne pas imiter le style d'un artiste vivant ni utiliser un logo ou une marque déposée.</li>
<li>Ne pas présenter une image générée comme une vraie photo (état des lieux, preuve, information).</li>
</ul>
<ul class="clean ok">
<li>Indiquer « image générée par IA » sur les contenus diffusés : le règlement européen sur l'IA impose la transparence pour les contenus de synthèse.</li>
<li>Pour la communication officielle de l'entreprise, passer par le service communication.</li>
</ul>
<div class="ex"><b class="t">Exercice</b><p>Crée une affiche « Vide-grenier dimanche 12 mai, place du marché » avec deux outils différents, en utilisant le même prompt. Compare la lisibilité du texte.</p></div>`}
]},
{
id:'local', n:'IA locale', by:'Ollama, LM Studio, modèles ouverts', cat:'dev', lvl:'Intermédiaire', dur:'1 h',
pitch:"Faire tourner une IA directement sur ton ordinateur, sans internet et sans envoyer tes données : Ollama, LM Studio, Llama, Mistral, Qwen, Gemma, gpt-oss.",
ch:[
{t:"Pourquoi une IA locale", h:`
<div class="two"><ul class="clean ok">
<li>Les données ne quittent pas l'ordinateur.</li>
<li>Fonctionne sans connexion.</li>
<li>Gratuit après l'achat du matériel.</li>
<li>Aucune limite d'usage.</li>
</ul><ul class="clean no">
<li>Moins puissant que les meilleurs modèles en ligne.</li>
<li>Demande beaucoup de mémoire vive, idéalement une bonne carte graphique.</li>
<li>Pas de recherche web par défaut.</li>
<li>Installation sur un PC professionnel : accord du service informatique requis.</li>
</ul></div>`},
{t:"Ollama, pas à pas", h:`
<ol class="steps">
<li>Télécharge Ollama sur ollama.com (Windows, macOS, Linux) et installe-le.</li>
<li>Ouvre un terminal et lance un modèle : il se télécharge au premier lancement.</li>
</ol>
<pre class="code">ollama run mistral        # discuter avec un modèle Mistral
ollama pull qwen3         # télécharger un modèle sans le lancer
ollama list               # voir les modèles installés
ollama rm mistral         # supprimer un modèle
ollama run hf.co/compte/modele-GGUF   # lancer un modèle GGUF de Hugging Face</pre>
<p>Ollama propose aussi une application avec fenêtre de discussion, et une API locale (localhost:11434) que d'autres logiciels peuvent utiliser.</p>`},
{t:"LM Studio et les familles de modèles", h:`
<p><b>LM Studio</b> (lmstudio.ai) : application graphique pour chercher, télécharger et discuter avec des modèles, sans terminal. Il indique si un modèle tient dans ta mémoire. <b>Jan</b> est une alternative open source.</p>
<div class="tbl-wrap"><table><thead><tr><th>Famille</th><th>Éditeur</th><th>Remarque</th></tr></thead><tbody>
<tr><td>Muse Spark Open</td><td>Meta</td><td>Sorti le 15 octobre 2026, 816 milliards de paramètres : réservé aux machines très puissantes</td></tr>
<tr><td>Llama</td><td>Meta</td><td>La famille précédente, très répandue, licence communautaire</td></tr>
<tr><td>Mistral, Ministral</td><td>Mistral AI</td><td>Bon en français ; Ministral et Small tournent sur un PC, Medium 3.5 et Large 4 demandent des serveurs</td></tr>
<tr><td>Qwen</td><td>Alibaba</td><td>Très performant, nombreuses tailles</td></tr>
<tr><td>Gemma</td><td>Google</td><td>Petits modèles efficaces</td></tr>
<tr><td>gpt-oss</td><td>OpenAI</td><td>Modèles à poids ouverts sous Apache 2.0</td></tr>
<tr><td>DeepSeek V4</td><td>DeepSeek</td><td>V4-Pro (août 2026) et V4-Flash : très gros, surtout pour serveurs ; en local, aucune donnée n'est envoyée</td></tr>
</tbody></table></div>
<div class="ex"><b class="t">Exercice</b><p>Sur un ordinateur personnel, installe LM Studio, télécharge un petit modèle (3 à 8 milliards de paramètres), coupe le wifi et demande-lui de reformuler un paragraphe. Compare avec un assistant en ligne.</p></div>`}
]}
);
