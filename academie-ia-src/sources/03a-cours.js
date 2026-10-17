/* ====== COURS PAR OUTIL (1/2) : assistants et outils de travail ====== */
const COURS = [
{
id:'chatgpt', n:'ChatGPT', by:'OpenAI', cat:'assistants', lvl:'Débutant → avancé', dur:'2 h',
pitch:"L'assistant le plus utilisé au monde : plus de 1,2 milliard d'utilisateurs par semaine. GPT-6, ChatGPT Work, Codex, recherche, images, voix, projets et GPTs.", hk:['OpenAI'],
ch:[
{t:"Présentation : ce qu'est ChatGPT", h:`
<p>ChatGPT est l'assistant conversationnel d'<b>OpenAI</b>, lancé en novembre 2022. Il fonctionne sur le site <a href="https://chatgpt.com" target="_blank" rel="noopener">chatgpt.com</a>, sur des applications iPhone, Android, Windows et macOS, et sur un navigateur dédié (ChatGPT Atlas) selon les plateformes.</p>
<p><b>Les modèles au 17 octobre 2026.</b> Depuis le 7 octobre 2026, ChatGPT fonctionne avec la famille <b>GPT-6</b> :</p>
<div class="tbl-wrap"><table><thead><tr><th>Modèle</th><th>Rôle</th><th>Qui l'a</th></tr></thead><tbody>
<tr><td><b>GPT-6 Astra</b> (3 sept. 2026)</td><td>Le plus puissant d'OpenAI ; premier à atteindre son seuil interne « critique » en cybersécurité</td><td>Offres payantes et API</td></tr>
<tr><td><b>GPT-6.1 Sol</b> (29 sept. 2026)</td><td>Presque au niveau d'Astra pour le code et le travail pro, moins cher</td><td>API, ChatGPT Work, Codex</td></tr>
<tr><td><b>GPT-6 Sol</b> (22 sept. 2026)</td><td>Le modèle de tous les jours, deux fois moins d'erreurs factuelles que le précédent selon OpenAI</td><td>Plus, Pro, Business, Enterprise</td></tr>
<tr><td><b>GPT-6 Luna</b></td><td>Version légère et rapide</td><td>Gratuit et Go</td></tr>
<tr><td><b>GPT-6 Pro</b></td><td>Réflexion maximale pour les problèmes difficiles</td><td>Pro</td></tr>
</tbody></table></div>
<p>Les réponses utilisent l'<b>Intelligent UI</b> : texte, visuels et outils interactifs mélangés. Les modèles précédents (GPT-5.5, GPT-5.6) ont été retirés de ChatGPT en octobre 2026.</p>
<div class="tbl-wrap"><table><thead><tr><th>Offre</th><th>Pour qui</th><th>Ce que ça change</th></tr></thead><tbody>
<tr><td>Gratuite</td><td>Découvrir</td><td>GPT-6 Luna, fonctions principales avec quotas limités</td></tr>
<tr><td>Go</td><td>Petit budget</td><td>Plus de quotas que la version gratuite, à prix réduit</td></tr>
<tr><td>Plus</td><td>Usage personnel régulier</td><td>Quotas plus élevés, modèles avancés, recherche approfondie, agent</td></tr>
<tr><td>Pro</td><td>Usage intensif</td><td>Quotas très élevés et modèles les plus puissants</td></tr>
<tr><td>Business, Enterprise</td><td>Entreprises</td><td>Administration, données exclues de l'entraînement, sécurité renforcée</td></tr>
</tbody></table></div>
<p class="small"><b>Publicité :</b> depuis le 9 février 2026, des annonces apparaissent dans les offres gratuite et Go aux États-Unis, puis au Canada, en Australie, en Nouvelle-Zélande et au Royaume-Uni. Les offres payantes n'en ont pas.</p>`},
{t:"Prise en main de l'interface", h:`
<ul class="clean">
<li><b>Barre latérale</b> : nouvelle conversation, historique, recherche dans tes conversations, Projets, GPTs.</li>
<li><b>Zone de saisie</b> : le bouton <kbd>+</kbd> ajoute des fichiers, des photos ou des documents depuis Google Drive ou OneDrive, et donne accès aux outils (recherche web, recherche approfondie, création d'image, agent, canvas).</li>
<li><b>Micro et mode vocal</b> : dicter un message, ou discuter à voix haute en temps réel. Sur mobile, tu peux montrer ta caméra.</li>
<li><b>Sélecteur de modèle</b> en haut, selon ton offre.</li>
<li><b>Menu de la conversation</b> : partager, archiver, supprimer.</li>
</ul>
<div class="callout info"><b>Bon réflexe :</b> une conversation = un sujet. Mélanger le compte rendu d'hier et une recette de cuisine dégrade la qualité des réponses.</div>`},
{t:"Les fonctions clés à connaître", h:`
<div class="tbl-wrap"><table><thead><tr><th>Fonction</th><th>À quoi elle sert</th><th>Exemple concret</th></tr></thead><tbody>
<tr><td>Recherche web</td><td>Réponses à jour avec sources cliquables</td><td>« Quels sont les horaires du musée d'Orsay ce dimanche ? »</td></tr>
<tr><td>Recherche approfondie</td><td>Rapport complet multi-sources en 5 à 30 minutes</td><td>Faire le point sur les liants bas carbone</td></tr>
<tr><td>Analyse de fichiers</td><td>Lit PDF, Word, Excel, CSV, images ; exécute du code pour calculer et tracer des graphiques</td><td>Analyser un relevé bancaire exporté en Excel</td></tr>
<tr><td>Images</td><td>Créer ou retoucher une image à partir d'un texte</td><td>Une invitation pour un anniversaire</td></tr>
<tr><td>Canvas</td><td>Écrire ou coder dans un panneau à côté, modifier un passage précis</td><td>Retravailler une note de service paragraphe par paragraphe</td></tr>
<tr><td>Projets</td><td>Dossier avec ses fichiers, ses instructions et ses conversations</td><td>Un projet par grand sujet : déménagement, études, travail</td></tr>
<tr><td>Mémoire</td><td>Retient tes préférences d'une conversation à l'autre</td><td>« Je préfère des réponses courtes et directes »</td></tr>
<tr><td>GPTs</td><td>Assistants spécialisés que tu crées ou trouves dans le catalogue</td><td>Un GPT « Correcteur de mes mails »</td></tr>
<tr><td>ChatGPT Work</td><td>Agent lancé en juillet 2026 : travaille des heures sur tes fichiers et applications connectées, produit documents, tableurs et présentations</td><td>« Prépare le bilan mensuel à partir des fichiers du dossier Budget »</td></tr>
<tr><td>Codex</td><td>Agent de code d'OpenAI dans ChatGPT, le terminal, l'éditeur et le cloud</td><td>Corriger un bug dans le code d'un site web</td></tr>
<tr><td>Agent</td><td>ChatGPT utilise un navigateur virtuel pour accomplir une tâche en plusieurs étapes</td><td>Comparer trois forfaits mobiles et remplir un tableau</td></tr>
<tr><td>Connecteurs et applications</td><td>Accéder à Gmail, Google Drive, SharePoint, etc. et à des applications tierces</td><td>Chercher un document dans ton Drive</td></tr>
<tr><td>Tâches planifiées</td><td>Faire exécuter une demande à heure fixe</td><td>Chaque lundi 7 h, rappel des points de la semaine</td></tr>
</tbody></table></div>`},
{t:"Pas à pas : créer un projet", h:`
<ol class="steps">
<li>Dans la barre latérale, clique sur <b>Nouveau projet</b> et nomme-le (ex. : « Déménagement 2026 »).</li>
<li>Ajoute les fichiers utiles : devis, liste des tâches, plans de l'appartement.</li>
<li>Ouvre les <b>instructions du projet</b> et écris : « Tu m'aides à organiser mon déménagement. Réponds en français, de façon brève et factuelle. Signale toute information manquante. »</li>
<li>Toutes les conversations ouvertes dans ce projet partagent ces fichiers et ces instructions.</li>
</ol>
<div class="callout warn">Avec un compte personnel, ne dépose aucun document confidentiel de l'entreprise (marché, prix, données clients). Utilise l'offre entreprise si ton employeur la fournit.</div>`},
{t:"Pas à pas : créer ton propre GPT", h:`
<ol class="steps">
<li>Menu <b>GPTs</b> → <b>Créer</b>.</li>
<li>Onglet <b>Configurer</b> : nom, description, instructions détaillées (tu peux coller le prompt système de la section « Prompt maître »).</li>
<li>Ajoute des fichiers de connaissance : modèles de comptes rendus, vocabulaire de l'équipe.</li>
<li>Coche les capacités utiles : recherche web, analyse de données, création d'images.</li>
<li>Teste dans l'aperçu à droite, corrige les instructions, puis enregistre en privé ou partagé par lien.</li>
</ol>`},
{t:"Confidentialité et réglages importants", h:`
<ul class="clean">
<li><b>Paramètres → Contrôles des données</b> : désactive « Améliorer le modèle pour tous » si tu ne veux pas que tes conversations servent à l'entraînement.</li>
<li><b>Conversation temporaire</b> : elle n'apparaît pas dans l'historique et n'utilise pas la mémoire.</li>
<li><b>Paramètres → Personnalisation</b> : mémoire (voir, modifier, effacer ce qu'il retient) et instructions personnalisées.</li>
<li><b>Sécurité du compte</b> : active l'authentification à deux facteurs.</li>
</ul>`},
{t:"Astuces de pro et limites", h:`
<div class="two"><ul class="clean ok">
<li>Pour un calcul, demande « utilise l'analyse de données pour calculer » : il exécute du code au lieu d'estimer.</li>
<li>Pour une question complexe, active la réflexion approfondie.</li>
<li>Demande « cite tes sources avec les liens » en mode recherche.</li>
<li>Utilise le mode vocal pour préparer une prise de parole.</li>
</ul><ul class="clean no">
<li>Il peut inventer une référence de norme avec beaucoup d'assurance.</li>
<li>La mémoire peut retenir des choses que tu ne veux pas : vérifie-la.</li>
<li>Les quotas gratuits s'épuisent vite sur les fonctions avancées.</li>
<li>L'agent peut se tromper sur un site : surveille chaque action sensible.</li>
</ul></div>
<div class="ex"><b class="t">Exercice</b><p>Crée un projet « Formation IA », dépose ce plan de formation en texte, puis demande : « Fais-moi un quiz de 5 questions sur ce document, une question à la fois, et corrige mes réponses. »</p></div>`}
]},
{
id:'claude', n:'Claude', by:'Anthropic', cat:'assistants', lvl:'Débutant → avancé', dur:'2 h 30',
pitch:"Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5. Excellent en rédaction, longs documents et code. Projets, artefacts, Cowork, Claude Code, connecteurs, création de fichiers.", hk:['Anthropic'],
ch:[
{t:"Présentation : Anthropic et la famille Claude", h:`
<p><b>Anthropic</b> est une entreprise américaine fondée en 2021 par d'anciens chercheurs d'OpenAI, dont Dario et Daniela Amodei. Elle met l'accent sur la sécurité et la fiabilité des modèles. Claude est disponible sur <a href="https://claude.ai" target="_blank" rel="noopener">claude.ai</a>, en applications de bureau (Windows, macOS) et mobiles, et via une API pour les développeurs.</p>
<p><b>Les modèles au 17 octobre 2026 :</b></p>
<div class="tbl-wrap"><table><thead><tr><th>Modèle</th><th>Profil</th><th>Quand l'utiliser</th></tr></thead><tbody>
<tr><td><b>Fable 5.1</b> (1er sept. 2026)</td><td>Le plus capable accessible au public, avec des garde-fous qui renvoient les demandes sensibles (cyber, biologie) vers un autre modèle</td><td>Raisonnement très difficile, travail autonome de plusieurs heures</td></tr>
<tr><td><b>Opus 5.5</b> (22 sept. 2026)</td><td>Au niveau de Fable 5.1 sur la plupart des tâches, 40 % moins cher qu'Opus 5</td><td>Code complexe, agents, travail exigeant</td></tr>
<tr><td><b>Sonnet 5.5</b> (28 sept. 2026)</td><td>Équilibre vitesse et qualité, 30 % plus rapide que Sonnet 5</td><td>La plupart des tâches du quotidien</td></tr>
<tr><td><b>Haiku 5.5</b> (7 oct. 2026)</td><td>Le plus rapide et économique, un million de tokens de contexte</td><td>Tâches simples, gros volumes</td></tr>
<tr><td><b>Mythos 5.1</b></td><td>Même famille que Fable, sans les garde-fous, réservé aux partenaires de cybersécurité (Project Glasswing)</td><td>Non accessible au grand public</td></tr>
</tbody></table></div>
<p>Offres : gratuite, Pro, Max (usage intensif), Team et Enterprise pour les entreprises.</p>`},
{t:"Prise en main de l'interface", h:`
<ul class="clean">
<li><b>Nouvelle conversation</b>, historique et <b>Projets</b> dans la barre latérale.</li>
<li><b>Trombone et +</b> : joindre PDF, Word, Excel, images, captures d'écran ; activer la recherche web, la recherche approfondie (Research), les connecteurs.</li>
<li><b>Sélecteur de modèle</b> sous la zone de saisie, avec l'option de <b>réflexion étendue</b> : Claude réfléchit plus longtemps avant de répondre.</li>
<li><b>Styles</b> : choisir la manière de répondre (normal, concis, explicatif, formel) ou créer ton propre style à partir d'un exemple de texte.</li>
<li><b>Panneau d'artefacts</b> à droite : documents, code, pages web et petites applications générées.</li>
</ul>`},
{t:"Les fonctions clés à connaître", h:`
<div class="tbl-wrap"><table><thead><tr><th>Fonction</th><th>À quoi elle sert</th><th>Exemple concret</th></tr></thead><tbody>
<tr><td>Longs documents</td><td>Très grande fenêtre de contexte : plusieurs centaines de pages en une fois</td><td>Résumer un contrat de 120 pages et lister tes obligations</td></tr>
<tr><td>Artefacts</td><td>Créer un document, un tableau, une page web ou une application interactive affichés à côté, modifiables et partageables</td><td>Une check-list de déménagement cliquable</td></tr>
<tr><td>Projets</td><td>Base de connaissances (fichiers) + instructions partagées par toutes les conversations du projet</td><td>Projet « Mes cours de droit »</td></tr>
<tr><td>Création de fichiers</td><td>Produire de vrais fichiers Excel, Word, PowerPoint ou PDF à télécharger</td><td>Un tableau Excel de suivi des livraisons avec formules</td></tr>
<tr><td>Recherche web et Research</td><td>Réponses sourcées ; Research mène une enquête multi-sources plus longue</td><td>État des connaissances sur les voitures électriques</td></tr>
<tr><td>Connecteurs</td><td>Lire tes e-mails, ton agenda, ton Drive, ou d'autres outils via le protocole MCP</td><td>« Résume les mails importants reçus cette semaine »</td></tr>
<tr><td>Mémoire</td><td>Se souvenir du contexte de tes conversations passées, selon l'offre ; désactivable</td><td>Reprendre un sujet sans tout réexpliquer</td></tr>
<tr><td>Claude Cowork</td><td>Agent qui travaille des heures dans tes dossiers et applications. Disponible sur Mac et Windows depuis avril 2026, sur le web et le mobile depuis juillet 2026</td><td>« Range ce dossier de photos de vacances par date et par lieu »</td></tr>
<tr><td>Compétences (Skills)</td><td>Dossiers d'instructions et de scripts que Claude charge quand la tâche le demande</td><td>Une compétence « charte graphique de l'entreprise »</td></tr>
</tbody></table></div>
<div class="callout">Claude ne génère pas de photos ou d'illustrations comme le fait un générateur d'images. Il peut en revanche dessiner des schémas, des graphiques et des visuels simples en code (SVG, HTML).</div>`},
{t:"Pas à pas : un projet de connaissances", h:`
<ol class="steps">
<li><b>Projets → Créer un projet</b>, nomme-le « Mes cours de droit ».</li>
<li>Dans <b>Connaissances du projet</b>, ajoute tes documents : polycopiés, notes de cours, annales.</li>
<li>Dans <b>Instructions</b>, colle : « Tu réponds uniquement à partir des documents du projet. Cite le document et la section utilisés. Si l'information n'y figure pas, dis-le. »</li>
<li>Pose tes questions : « Quelles sont les conditions de validité d'un contrat selon mes cours ? »</li>
</ol>
<div class="callout info"><b>Astuce Anthropic :</b> Claude comprend très bien les balises pour structurer un prompt : <code>&lt;document&gt;…&lt;/document&gt;</code>, <code>&lt;consignes&gt;…&lt;/consignes&gt;</code>, <code>&lt;exemple&gt;…&lt;/exemple&gt;</code>. Ça évite qu'il confonde tes données et tes instructions.</div>`},
{t:"Pas à pas : créer une mini-application en artefact", h:`
<ol class="steps">
<li>Écris : « Crée une application interactive qui calcule le coût d'un trajet en voiture à partir de la distance, de la consommation en litres aux 100 km et du prix du litre. Affiche le détail du calcul. Style sobre, sombre et orange. »</li>
<li>L'application apparaît dans le panneau de droite : teste-la avec des valeurs que tu connais.</li>
<li>Demande des corrections : « Ajoute le nombre de passagers et le coût par personne. »</li>
<li>Publie l'artefact et partage le lien, ou copie son code.</li>
</ol>
<div class="callout warn">Vérifie toujours la formule avec un calcul fait à la main : distance (km) × consommation (L/100 km) ÷ 100 × prix du litre = coût (€).</div>`},
{t:"Claude Code : l'agent de développement", h:`
<p><b>Claude Code</b> est un agent qui travaille directement sur un projet de code : il lit les fichiers, propose et applique des modifications, lance des commandes et des tests, crée des commits et des pull requests. Il s'utilise dans un terminal, dans VS Code ou JetBrains, dans l'application de bureau ou sur le web (claude.ai/code), où il travaille dans un environnement cloud relié à GitHub.</p>
<ul class="clean">
<li>Installe-le, ouvre le dossier du projet et décris ce que tu veux en français.</li>
<li>Un fichier <code>CLAUDE.md</code> à la racine du projet donne les règles permanentes (conventions, commandes de test).</li>
<li>Le mode plan lui fait d'abord proposer un plan que tu valides.</li>
<li>Il demande ta permission avant les actions sensibles, selon le mode choisi.</li>
</ul>
<div class="callout info">Cette page a été produite de cette façon : une demande en français, un agent qui écrit le fichier, le commit et la pull request sur GitHub.</div>`},
{t:"Astuces de pro et limites", h:`
<div class="two"><ul class="clean ok">
<li>Pour une analyse de document, demande des citations exactes des passages.</li>
<li>Active la réflexion étendue pour un raisonnement long ou un calcul.</li>
<li>Crée un style personnalisé à partir d'un de tes textes pour qu'il écrive comme toi.</li>
<li>Utilise les artefacts pour obtenir un livrable propre plutôt qu'un long message.</li>
</ul><ul class="clean no">
<li>Les limites d'usage se remettent à zéro par périodes : en gratuit, elles arrivent vite.</li>
<li>Pas de génération d'images photoréalistes.</li>
<li>Comme toute IA, il peut se tromper : vérifie les faits importants.</li>
</ul></div>
<div class="ex"><b class="t">Exercice</b><p>Joins un document PDF long que tu connais bien (non confidentiel). Demande : « Liste les 10 obligations les plus importantes de ce document, avec pour chacune la citation exacte et la page. » Vérifie trois citations dans le PDF.</p></div>`}
]},
{
id:'gemini', n:'Gemini', by:'Google', cat:'assistants', lvl:'Débutant → intermédiaire', dur:'1 h 30',
pitch:"Gemini 4 Argon depuis le 13 octobre 2026. Intégré à Gmail, Docs, Android, Chrome et à la nouvelle Siri d'Apple. Deep Research, Gems, Gemini Omni, Gemini Spark.", hk:['Google'],
ch:[
{t:"Présentation", h:`
<p>Gemini est développé par <b>Google DeepMind</b>. On l'utilise sur <a href="https://gemini.google.com" target="_blank" rel="noopener">gemini.google.com</a>, dans l'application Gemini (qui remplace l'Assistant Google sur Android), dans Chrome et dans les applications Google Workspace (Gmail, Docs, Sheets, Drive, Meet).</p>
<p>Offres : gratuite, <b>Google AI Plus</b>, <b>Google AI Pro</b> et <b>Google AI Ultra</b> pour les particuliers ; Gemini est inclus dans de nombreuses offres Google Workspace pour les entreprises. L'application dépassait 900 millions d'utilisateurs mensuels en mai 2026.</p>
<div class="tbl-wrap"><table><thead><tr><th>Modèle (au 17 octobre 2026)</th><th>Profil</th></tr></thead><tbody>
<tr><td><b>Gemini 4 Argon</b></td><td>Le plus avancé de Google. Lancé le 30 septembre 2026 pour des partenaires cybersécurité, disponible depuis le 13 octobre dans l'app (offres Pro et Ultra), l'API et AI Mode</td></tr>
<tr><td><b>Gemini 3.1 Pro</b> (19 févr. 2026)</td><td>Raisonnement poussé</td></tr>
<tr><td><b>Gemini 3 Flash</b> (17 déc. 2025)</td><td>Rapide et économique</td></tr>
<tr><td><b>Gemini Omni</b> (mai 2026)</td><td>Crée à partir de n'importe quelle entrée, d'abord des vidéos (app Gemini et Flow)</td></tr>
<tr><td><b>Nano Banana</b></td><td>Création et retouche d'images</td></tr>
</tbody></table></div>
<p>Depuis iOS 27 (septembre 2026), la nouvelle <b>Siri AI</b> d'Apple repose sur des modèles construits en collaboration avec Gemini.</p>`},
{t:"Les fonctions clés", h:`
<div class="tbl-wrap"><table><thead><tr><th>Fonction</th><th>À quoi elle sert</th></tr></thead><tbody>
<tr><td>Deep Research</td><td>Enquête automatique sur des dizaines de sources, rapport structuré exportable dans Google Docs</td></tr>
<tr><td>Gemini Spark</td><td>Agent personnel annoncé en mai 2026 qui agit pour toi en continu, sous ta direction</td></tr>
<tr><td>Notebooks</td><td>Espaces de projet dans Gemini, synchronisés avec NotebookLM</td></tr>
<tr><td>Gems</td><td>Assistants personnalisés avec leurs propres instructions et fichiers</td></tr>
<tr><td>Canvas</td><td>Rédiger ou coder dans un espace d'édition, transformer en page web, quiz ou présentation</td></tr>
<tr><td>Gemini Live</td><td>Conversation vocale fluide, avec partage de caméra ou d'écran sur mobile</td></tr>
<tr><td>Images (Nano Banana)</td><td>Créer et surtout retoucher des images en gardant la cohérence du sujet</td></tr>
<tr><td>Vidéo (Veo)</td><td>Générer de courtes vidéos avec son, selon l'offre</td></tr>
<tr><td>Applications Google</td><td>Chercher dans Gmail, Drive, Maps, YouTube, Agenda depuis la conversation</td></tr>
<tr><td>Dans Workspace</td><td>Résumer un fil Gmail, rédiger dans Docs, analyser dans Sheets, prendre des notes dans Meet</td></tr>
</tbody></table></div>`},
{t:"Pas à pas : créer un Gem", h:`
<ol class="steps">
<li>Dans la barre latérale, <b>Explorer les Gems</b> → <b>Nouveau Gem</b>.</li>
<li>Nom : « Assistant comptes rendus ». Instructions : rôle, format attendu, ton, règles d'honnêteté.</li>
<li>Ajoute des fichiers de référence (modèle de compte rendu).</li>
<li>Teste dans l'aperçu, ajuste, enregistre. Le Gem est disponible dans toutes tes sessions.</li>
</ol>`},
{t:"Google AI Studio et l'écosystème", h:`
<ul class="clean">
<li><b>NotebookLM</b> : l'outil de Google pour travailler sur tes propres documents (voir son cours dédié).</li>
<li><b>Google AI Studio</b> (aistudio.google.com) : tester gratuitement les modèles Gemini, régler les paramètres, obtenir une clé API.</li>
<li><b>Flow</b> : outil de création vidéo (Veo, Gemini Omni).</li>
<li><b>Antigravity</b> : environnement de développement à agents lancé en novembre 2025 avec Gemini 3.</li>
<li><b>Mode IA de Google Recherche</b> : réponses générées dans le moteur de recherche, à vérifier comme les autres.</li>
</ul>
<div class="ex"><b class="t">Exercice</b><p>Lance une Deep Research : « Quelles sont les vraies différences entre voitures électriques et hybrides en 2026 ? Sources fiables uniquement. » Exporte le rapport dans Docs et vérifie deux sources.</p></div>`}
]},
{
id:'mistral', n:'Vibe (ex-Le Chat)', by:'Mistral AI', cat:'assistants', lvl:'Débutant → intermédiaire', dur:'1 h',
pitch:"L'IA française, renommée Vibe en 2026 : modes Chat, Work et Code. Mistral Medium 3.5, Large 4.", hk:['Mistral AI'],
ch:[
{t:"Présentation", h:`
<p><b>Mistral AI</b> est une entreprise française fondée à Paris en 2023 par Arthur Mensch, Guillaume Lample et Timothée Lacroix. Son assistant, <b>Le Chat</b>, a été renommé <b>Vibe</b> à la mi-2026. Même adresse : <a href="https://chat.mistral.ai" target="_blank" rel="noopener">chat.mistral.ai</a>, et les conversations sont conservées.</p>
<div class="tbl-wrap"><table><thead><tr><th>Mode</th><th>Usage</th></tr></thead><tbody>
<tr><td><b>Vibe Chat</b></td><td>La discussion classique de l'ancien Le Chat</td></tr>
<tr><td><b>Vibe Work</b></td><td>Agent pour les tâches longues ; demande ton accord avant d'envoyer un message, écrire un document ou modifier des données</td></tr>
<tr><td><b>Vibe Code</b></td><td>Agent de code : ligne de commande, extension VS Code, interface web, agents à distance en parallèle</td></tr>
</tbody></table></div>
<p><b>Modèles au 17 octobre 2026 :</b> Mistral Medium 3.5 (modèle par défaut, 128 milliards de paramètres, poids ouverts), Mistral Large 4 (aperçu depuis le 6 octobre 2026, 1 000 milliards de paramètres, poids ouverts annoncés), Mistral Small 4, Mistral OCR 4.</p>
<p>Le 8 septembre 2026, Mistral a levé 3 milliards d'euros, menés par Samsung : la plus grosse levée de fonds de l'histoire de la tech européenne. Atout principal : un acteur soumis au droit européen. Offres : gratuite, Pro, Team et Enterprise.</p>`},
{t:"Les fonctions clés", h:`
<ul class="clean">
<li><b>Réponses très rapides</b> et recherche web avec sources (mode Chat).</li>
<li><b>Analyse de documents</b> : PDF, images, documents scannés grâce à une reconnaissance de texte (OCR) de bonne qualité.</li>
<li><b>Canvas</b> pour rédiger et modifier un document ou du code.</li>
<li><b>Bibliothèques</b> : déposer des documents et interroger ce fonds.</li>
<li><b>Agents</b> : assistants personnalisés avec instructions.</li>
<li><b>Mémoire</b>, <b>génération d'images</b>, <b>recherche approfondie</b> et <b>connecteurs</b> selon l'offre.</li>
</ul>`},
{t:"L'API Mistral", h:`
<p>L'<b>API</b> de Mistral est une adresse web à laquelle un programme envoie une question et reçoit la réponse du modèle. C'est ainsi qu'on ajoute Mistral à un site ou une application. Pour commencer :</p>
<ol class="steps">
<li>Crée un compte sur la console Mistral (console.mistral.ai, « La Plateforme »).</li>
<li>Génère une <b>clé API</b>.</li>
<li>Utilise-la dans ton programme ou dans un outil compatible, en la gardant dans une variable d'environnement.</li>
</ol>
<div class="callout warn">Une clé API est un secret, comme un mot de passe : ne la publie jamais sur GitHub, ne l'envoie pas par message. Si elle fuit, supprime-la dans la console et crée-en une autre.</div>
<div class="ex"><b class="t">Exercice</b><p>Pose la même question technique à Vibe, ChatGPT et Claude. Compare la précision, la clarté et la rapidité. Note laquelle tu préfères pour quel usage.</p></div>`}
]},
{
id:'copilot', n:'Microsoft Copilot', by:'Microsoft', cat:'travail', lvl:'Débutant → intermédiaire', dur:'1 h 30',
pitch:"L'IA dans Word, Excel, PowerPoint, Outlook et Teams, avec les modèles d'OpenAI et d'Anthropic. C'est souvent l'outil autorisé en entreprise : à maîtriser en priorité.", hk:['Microsoft'],
ch:[
{t:"Les différents Copilot", h:`
<div class="tbl-wrap"><table><thead><tr><th>Version</th><th>Où</th><th>Pour qui</th></tr></thead><tbody>
<tr><td>Copilot (grand public)</td><td>copilot.microsoft.com, Windows, Edge, mobile</td><td>Comptes Microsoft personnels</td></tr>
<tr><td>Microsoft 365 Copilot Chat</td><td>Application Microsoft 365, Teams, Edge</td><td>Comptes professionnels : discussion avec protection des données de l'entreprise</td></tr>
<tr><td>Microsoft 365 Copilot</td><td>Dans Word, Excel, PowerPoint, Outlook, Teams</td><td>Licence entreprise payante : accès à tes mails, fichiers et réunions</td></tr>
<tr><td>Copilot Studio</td><td>Plateforme de création d'agents</td><td>Services informatiques et utilisateurs avancés</td></tr>
</tbody></table></div>
<p>Avec la licence entreprise, Copilot travaille avec tes données Microsoft 365 et respecte les droits d'accès existants : il ne voit que ce que tu peux déjà ouvrir.</p>
<p><b>En 2026 :</b> Microsoft 365 Copilot laisse choisir entre les modèles d'OpenAI (GPT-5.6) et d'Anthropic (Claude Opus 4.8). <b>Copilot Cowork</b>, disponible depuis juin 2026 et propulsé par Claude, réalise des tâches longues en plusieurs étapes.</p>`},
{t:"Copilot application par application", h:`
<div class="tbl-wrap"><table><thead><tr><th>Application</th><th>Ce qu'il fait</th><th>Demande type</th></tr></thead><tbody>
<tr><td>Outlook</td><td>Résumer un long fil, rédiger une réponse, ajuster le ton</td><td>« Résume ce fil et propose une réponse qui accepte le report au lundi. »</td></tr>
<tr><td>Teams</td><td>Résumer une réunion (transcription activée), lister décisions et actions</td><td>« Quelles décisions ont été prises et qui fait quoi ? »</td></tr>
<tr><td>Word</td><td>Brouillon à partir d'un fichier, résumé, réécriture</td><td>« Rédige un rapport de fin de projet à partir de /Notes projet.docx »</td></tr>
<tr><td>Excel</td><td>Formules, analyse, graphiques, mise en forme conditionnelle</td><td>« Ajoute une colonne avec le total et surligne les écarts de plus de 5 %. »</td></tr>
<tr><td>PowerPoint</td><td>Créer une présentation depuis un document, résumer un diaporama</td><td>« Crée 8 diapositives à partir du bilan trimestriel. »</td></tr>
</tbody></table></div>
<div class="callout info">Dans Copilot, tape <kbd>/</kbd> pour référencer un fichier, une personne ou une réunion précise : la réponse sera bien plus pertinente.</div>`},
{t:"Agents et automatisation", h:`
<ul class="clean">
<li><b>Agents intégrés</b> : par exemple un agent de recherche qui fouille tes documents et le web, ou un agent d'analyse de données.</li>
<li><b>Copilot Studio</b> : créer un agent qui répond à partir des documents SharePoint de l'équipe.</li>
<li><b>Power Automate</b> : décrire une automatisation en français (« quand un fichier arrive dans ce dossier, préviens l'équipe dans Teams »).</li>
</ul>
<div class="ex"><b class="t">Exercice</b><p>Après ta prochaine réunion Teams avec transcription, demande à Copilot : « Liste les actions décidées sous forme de tableau : action, responsable, échéance. » Compare avec tes propres notes.</p></div>`}
]},
{
id:'perplexity', n:'Perplexity', by:'Perplexity AI', cat:'travail', lvl:'Débutant', dur:'45 min',
pitch:"Le moteur de réponse qui cite ses sources. Idéal pour chercher une information fiable et récente.", hk:['Perplexity'],
ch:[
{t:"Présentation et usage", h:`
<p><a href="https://www.perplexity.ai" target="_blank" rel="noopener">Perplexity</a> combine un moteur de recherche et une IA : il lit des pages web et rédige une réponse avec des numéros de sources cliquables. Offres gratuite et Pro. L'éditeur propose aussi un navigateur, Comet.</p>
<ul class="clean">
<li><b>Recherche</b> : réponse rapide sourcée.</li>
<li><b>Recherche approfondie</b> : rapport détaillé après des dizaines de recherches.</li>
<li><b>Sources ciblées</b> : web, publications académiques, réseaux sociaux, selon les options proposées.</li>
<li><b>Espaces</b> : regrouper des recherches avec des fichiers et des instructions communes.</li>
<li><b>Choix du modèle</b> en version Pro (modèles d'OpenAI, Anthropic, Google et d'autres).</li>
</ul>`},
{t:"Bien vérifier une réponse sourcée", h:`
<ol class="steps">
<li>Clique sur chaque source citée pour une affirmation importante.</li>
<li>Vérifie que la page dit vraiment ce qui est affirmé : l'IA peut mal résumer une bonne source.</li>
<li>Regarde la date et l'auteur de la source.</li>
<li>Privilégie les sources officielles : Légifrance, ministères, organismes professionnels, fabricants.</li>
</ol>
<div class="ex"><b class="t">Exercice</b><p>Demande : « Quelles sont les règles pour louer son logement en courte durée en France ? » Ouvre trois sources et note si elles confirment la réponse.</p></div>`}
]},
{
id:'notebooklm', n:'NotebookLM', by:'Google', cat:'travail', lvl:'Débutant', dur:'45 min',
pitch:"Une IA qui ne répond qu'à partir de TES documents, avec citations. Résumés audio et vidéo, cartes mentales, quiz.",
ch:[
{t:"Présentation et fonctions", h:`
<p><a href="https://notebooklm.google.com" target="_blank" rel="noopener">NotebookLM</a> crée des « carnets » dans lesquels tu ajoutes des sources : PDF, documents Google, pages web, vidéos YouTube, textes collés. L'IA répond uniquement à partir de ces sources et indique pour chaque phrase le passage d'origine. C'est l'outil qui invente le moins.</p>
<ul class="clean">
<li><b>Discussion</b> sur les sources, avec citations cliquables.</li>
<li><b>Résumé audio</b> : une émission de type podcast où deux voix discutent de tes documents, en français.</li>
<li><b>Résumé vidéo</b>, <b>carte mentale</b>, <b>guide d'étude</b>, <b>fiches</b> et <b>quiz</b>.</li>
<li><b>Depuis juin 2026</b> : raisonnement avancé, exécution de code dans un ordinateur cloud sécurisé, création de graphiques, tableurs et diaporamas à partir des sources.</li>
<li>Synchronisé avec les <b>Notebooks</b> de l'application Gemini.</li>
<li>Offre gratuite, et version étendue avec les abonnements Google.</li>
</ul>`},
{t:"Pas à pas : réviser un sujet", h:`
<ol class="steps">
<li>Crée un carnet « Histoire de la Révolution française ».</li>
<li>Ajoute tes cours, deux articles de référence et une vidéo YouTube de conférence.</li>
<li>Demande : « Quelles sont les causes principales selon ces sources, et sur quoi divergent-elles ? »</li>
<li>Génère un résumé audio à écouter en trajet, puis un quiz pour tester tes connaissances.</li>
</ol>
<div class="ex"><b class="t">Exercice</b><p>Ajoute trois sources sur un même sujet. Demande « Sur quels points ces sources se contredisent-elles ? » et vérifie la réponse.</p></div>`}
]}
];
