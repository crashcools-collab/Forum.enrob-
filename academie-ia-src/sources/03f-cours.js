/* ====== COURS : cybersécurité et jeux vidéo ====== */
COURS.push(
{
id:'cyber', n:'Cybersécurité et IA', by:'Défense, attaque, protection', cat:'securite', lvl:'Novice → expert', dur:'4 h', niv:3,
pitch:"Comment les attaquants utilisent l'IA, comment les défenseurs s'en servent, comment apprendre la sécurité offensive légalement, et des check-lists pour protéger ton PC et une entreprise.", hk:['Mythos','cyber','Cyber'],
ch:[
{t:"Les bases : ce qu'on protège et contre quoi", h:`
<p>La sécurité informatique protège trois choses, résumées par le sigle <b>DIC</b> : la <b>Disponibilité</b> (le système fonctionne), l'<b>Intégrité</b> (les données ne sont pas modifiées) et la <b>Confidentialité</b> (seules les bonnes personnes y accèdent).</p>
<div class="tbl-wrap"><table><thead><tr><th>Menace</th><th>Principe</th></tr></thead><tbody>
<tr><td><b>Hameçonnage</b> (phishing)</td><td>Un faux message pousse à cliquer, donner un mot de passe ou payer. Première porte d'entrée des attaques.</td></tr>
<tr><td><b>Rançongiciel</b> (ransomware)</td><td>Les fichiers sont chiffrés, une rançon est demandée ; souvent avec vol de données et menace de publication.</td></tr>
<tr><td><b>Vol d'identifiants</b></td><td>Mots de passe réutilisés, fuites de bases de données, logiciels espions.</td></tr>
<tr><td><b>Exploitation de vulnérabilités</b></td><td>Un logiciel non mis à jour contient une faille connue.</td></tr>
<tr><td><b>Arnaque au président</b></td><td>Un faux dirigeant demande un virement urgent, désormais avec une voix ou une vidéo clonée.</td></tr>
<tr><td><b>Attaque de la chaîne d'approvisionnement</b></td><td>On attaque un fournisseur ou un logiciel utilisé par la cible.</td></tr>
</tbody></table></div>
<p>Les grilles de lecture de référence : le <b>guide d'hygiène informatique de l'ANSSI</b> (l'agence française de cybersécurité), le cadre <b>MITRE ATT&amp;CK</b> qui recense les techniques des attaquants, et l'<b>OWASP Top 10</b> pour les failles web.</p>`},
{t:"Comment les attaquants utilisent l'IA", h:`
<ul class="clean no">
<li><b>Hameçonnage parfait</b> : plus de fautes d'orthographe, des messages personnalisés à grande échelle, dans toutes les langues.</li>
<li><b>Voix et vidéos clonées</b> : quelques secondes d'enregistrement suffisent pour imiter une voix au téléphone.</li>
<li><b>Agents d'attaque</b> : Anthropic a rapporté en 2025 avoir bloqué une opération d'extorsion menée avec Claude Code, puis une campagne d'espionnage attribuée à un groupe étatique chinois qui utilisait Claude Code de façon largement autonome.</li>
<li><b>Recherche de failles accélérée</b> : c'est la raison pour laquelle les modèles les plus forts en cybersécurité (Claude Mythos, GPT-6 Astra, Gemini 4 Argon) ont d'abord été réservés aux défenseurs en 2026.</li>
<li><b>Attaques contre les IA elles-mêmes</b> : injection de prompt, empoisonnement des données, vol de modèles. L'OWASP publie un Top 10 dédié aux applications d'IA et MITRE le référentiel ATLAS.</li>
</ul>`},
{t:"Comment les défenseurs utilisent l'IA", h:`
<div class="tbl-wrap"><table><thead><tr><th>Usage</th><th>Exemples</th></tr></thead><tbody>
<tr><td>Trouver des failles avant les attaquants</td><td>Google Big Sleep a découvert une vulnérabilité réelle dans SQLite (2024) ; Project Glasswing donne Claude Mythos à des défenseurs (2026)</td></tr>
<tr><td>Analyser les alertes</td><td>Assistants de sécurité (Microsoft Security Copilot et équivalents) qui résument et priorisent les incidents</td></tr>
<tr><td>Détecter les comportements anormaux</td><td>Les EDR (antivirus nouvelle génération) repèrent un poste qui chiffre des fichiers en masse</td></tr>
<tr><td>Relire le code</td><td>Revue de sécurité automatique des pull requests par des agents</td></tr>
<tr><td>Former</td><td>Simulations d'hameçonnage réalistes, explications de logs, entraînement</td></tr>
</tbody></table></div>`},
{t:"Sécurité offensive : apprendre légalement", h:`
<p>La sécurité <b>offensive</b> consiste à attaquer un système <b>avec l'autorisation écrite</b> de son propriétaire, pour trouver les failles avant les criminels. Sans autorisation, c'est un délit : en France, l'accès frauduleux à un système informatique est puni par l'article 323-1 du Code pénal.</p>
<div class="tbl-wrap"><table><thead><tr><th>Métier ou pratique</th><th>Principe</th></tr></thead><tbody>
<tr><td>Test d'intrusion (pentest)</td><td>Mission encadrée par un contrat : reconnaissance, recherche de failles, exploitation contrôlée, rapport</td></tr>
<tr><td>Red team / blue team</td><td>Une équipe simule un attaquant réel, l'autre défend ; la « purple team » les fait collaborer</td></tr>
<tr><td>Bug bounty</td><td>Les entreprises récompensent les failles signalées : YesWeHack (plateforme française), HackerOne, Bugcrowd</td></tr>
<tr><td>CTF (Capture The Flag)</td><td>Compétitions d'entraînement légales sur des systèmes faits pour être attaqués</td></tr>
</tbody></table></div>
<h3>Où s'entraîner, du débutant à l'expert</h3>
<ul class="clean">
<li><b>Root-Me</b> (plateforme française), <b>TryHackMe</b> (très guidé, idéal pour commencer), <b>Hack The Box</b>, <b>PortSwigger Web Security Academy</b> (gratuit, sécurité web), <b>OverTheWire</b> (bases Linux).</li>
<li>Certifications reconnues : CompTIA Security+ (bases), eJPT (pentest débutant), OSCP (pentest avancé), certifications défensives (SOC, analyse forensique).</li>
<li>L'IA est un excellent professeur pour expliquer une notion, un log ou un résultat d'exercice de CTF.</li>
</ul>`},
{t:"Protéger son PC : la check-list", h:`
<ol class="steps">
<li><b>Mises à jour automatiques</b> pour le système, le navigateur et les applications. C'est la mesure la plus efficace.</li>
<li><b>Un gestionnaire de mots de passe</b> (Bitwarden, KeePassXC, celui du navigateur ou du système) et un mot de passe différent par site.</li>
<li><b>Double authentification</b> partout, et les <b>clés d'accès</b> (passkeys) quand c'est proposé : elles résistent à l'hameçonnage.</li>
<li><b>Sauvegardes 3-2-1</b> : 3 copies, sur 2 supports différents, dont 1 hors ligne ou hors site. Teste la restauration.</li>
<li><b>Antivirus intégré activé</b> (Microsoft Defender sous Windows suffit pour la plupart des gens) et pare-feu activé.</li>
<li><b>Chiffrement du disque</b> (BitLocker, FileVault) pour un portable.</li>
<li><b>Compte utilisateur standard</b> au quotidien, pas administrateur.</li>
<li><b>Logiciels uniquement depuis les sites officiels</b> ou les magasins d'applications.</li>
<li><b>Réflexe anti-arnaque</b> : toute demande urgente d'argent, de code ou de mot de passe se vérifie par un autre canal.</li>
<li><b>En cas de problème</b> : en France, cybermalveillance.gouv.fr et le dispositif 17Cyber aident les particuliers et les entreprises.</li>
</ol>`},
{t:"Protéger une entreprise : les priorités", h:`
<div class="tbl-wrap"><table><thead><tr><th>Priorité</th><th>Mesures</th></tr></thead><tbody>
<tr><td>1. Identités</td><td>Double authentification pour tous, surtout pour la messagerie, les accès à distance et les administrateurs ; droits minimaux</td></tr>
<tr><td>2. Mises à jour</td><td>Inventaire des postes, serveurs et logiciels ; correctifs appliqués rapidement</td></tr>
<tr><td>3. Sauvegardes</td><td>Sauvegardes hors ligne, chiffrées, testées ; plan de reprise d'activité</td></tr>
<tr><td>4. Détection</td><td>EDR sur tous les postes, journaux centralisés, surveillance (interne ou prestataire SOC)</td></tr>
<tr><td>5. Humains</td><td>Formation régulière, exercices d'hameçonnage, procédure claire pour signaler un doute</td></tr>
<tr><td>6. Réseau</td><td>Segmentation, accès à distance sécurisé, approche « zéro confiance »</td></tr>
<tr><td>7. Usage de l'IA</td><td>Charte d'usage, outils validés, interdiction de coller des données sensibles dans des IA grand public, surveillance des agents et de leurs accès</td></tr>
<tr><td>8. Réglementation</td><td>RGPD ; directive européenne NIS2 pour de nombreuses entreprises de secteurs essentiels et importants</td></tr>
</tbody></table></div>
<div class="callout">L'ANSSI publie gratuitement son guide d'hygiène informatique (42 mesures) : c'est la meilleure base pour une entreprise française.</div>`},
{t:"Sécuriser ses usages de l'IA", h:`
<ul class="clean">
<li>Les données saisies dans une IA en ligne quittent ton ordinateur : jamais de mots de passe, de secrets ou de données personnelles de tiers.</li>
<li>Les agents qui ont accès à tes fichiers ou ta messagerie doivent avoir les droits minimaux et demander confirmation avant toute action sensible.</li>
<li>Méfie-toi des extensions, plugins et serveurs MCP non officiels : ils peuvent lire tout ce que voit l'agent.</li>
<li>Le code généré par une IA peut contenir des failles : relecture et tests de sécurité obligatoires.</li>
</ul>
<div class="ex"><b class="t">Exercice</b><p>Fais l'audit de ton propre PC avec la check-list ci-dessus, note ce qui manque, et corrige trois points cette semaine. Puis crée un compte sur Root-Me ou TryHackMe et termine le premier parcours débutant.</p></div>`}
]},
{
id:'jeux', n:'Créer un jeu vidéo avec l\'IA', by:'Du mini-jeu au jeu en ligne massif', cat:'construire', lvl:'Novice → expert', dur:'4 h', niv:3,
pitch:"Du petit jeu fait en une soirée au jeu en ligne massif comme World of Warcraft : moteurs, graphismes, sons et code avec l'IA, multijoueur, publication, et ce que l'IA change vraiment.", hk:['Genie'],
ch:[
{t:"Les tailles de projet, honnêtement", h:`
<div class="tbl-wrap"><table><thead><tr><th>Projet</th><th>Exemple</th><th>Équipe et durée</th><th>Ce que l'IA permet</th></tr></thead><tbody>
<tr><td>Mini-jeu web</td><td>Snake, casse-briques, quiz</td><td>Seul, une soirée</td><td>Le créer entièrement en décrivant le jeu</td></tr>
<tr><td>Jeu 2D complet</td><td>Plateforme, puzzle, petit RPG</td><td>Seul ou à deux, quelques semaines à quelques mois</td><td>Code, graphismes, sons, dialogues : un solo devient très productif</td></tr>
<tr><td>Jeu indépendant 3D</td><td>Aventure, survie</td><td>Petite équipe, un à trois ans</td><td>Accélère le code, les prototypes, les modèles 3D, les voix</td></tr>
<tr><td>Jeu multijoueur en ligne</td><td>Jeu de combat ou coopératif en ligne</td><td>Petite à moyenne équipe, serveurs</td><td>Aide au code réseau et aux outils, mais l'architecture reste un gros travail</td></tr>
<tr><td>Jeu en ligne massif (MMO)</td><td>World of Warcraft (Blizzard, 2004)</td><td>Des centaines de personnes pendant des années, budget de dizaines de millions et plus, serveurs pour des millions de joueurs, puis des années d'exploitation</td><td>Rend chaque personne plus productive, mais ne remplace pas une organisation de studio</td></tr>
</tbody></table></div>
<div class="callout warn">Commencer par un MMO est l'erreur classique des débutants. Le chemin qui marche : terminer un petit jeu, puis un jeu un peu plus grand, et ainsi de suite.</div>`},
{t:"Niveau 1 : un jeu complet en une soirée", h:`
<ol class="steps">
<li>Demande à Claude, ChatGPT ou Gemini : « Crée un jeu de casse-briques complet dans une seule page HTML avec JavaScript et Canvas : 3 niveaux, score, vies, son, contrôle clavier et tactile, écran de fin. »</li>
<li>Joue dans l'aperçu, puis demande des améliorations une par une : bonus, difficulté progressive, effets.</li>
<li>Enregistre le fichier et publie-le gratuitement sur itch.io ou GitHub Pages.</li>
</ol>
<p>Moteurs web pour aller plus loin : <b>Phaser</b> (2D en JavaScript), <b>Three.js</b> (3D dans le navigateur).</p>`},
{t:"Choisir un moteur de jeu", h:`
<div class="tbl-wrap"><table><thead><tr><th>Moteur</th><th>Idéal pour</th><th>Modèle économique</th></tr></thead><tbody>
<tr><td><b>Godot</b></td><td>2D et 3D, débutants et indépendants, langage GDScript proche de Python</td><td>Gratuit et open source</td></tr>
<tr><td><b>Unity</b></td><td>2D, 3D, mobile, très grande communauté, langage C#</td><td>Gratuit jusqu'à un certain chiffre d'affaires, puis payant</td></tr>
<tr><td><b>Unreal Engine</b></td><td>3D haut de gamme, rendu réaliste, langage C++ et Blueprints visuels</td><td>Gratuit, redevance au-delà d'un seuil de revenus</td></tr>
<tr><td>GameMaker, RPG Maker</td><td>2D rapide, RPG classiques</td><td>Payant ou freemium</td></tr>
<tr><td>Roblox Studio</td><td>Jeux multijoueurs publiés directement sur Roblox</td><td>Gratuit, partage des revenus</td></tr>
</tbody></table></div>
<p>Les agents de code (Claude Code, Codex, Cursor, Copilot) écrivent très bien du GDScript, du C# Unity et du C++ Unreal. Donne-leur toujours la version exacte du moteur.</p>`},
{t:"Les ressources du jeu avec l'IA", h:`
<div class="tbl-wrap"><table><thead><tr><th>Ressource</th><th>Outils</th><th>Conseil</th></tr></thead><tbody>
<tr><td>Concept art, sprites, textures</td><td>Midjourney, GPT Image, Gemini, Firefly, Stable Diffusion avec ComfyUI</td><td>Garde un style constant avec des images de référence</td></tr>
<tr><td>Modèles 3D</td><td>Générateurs d'objets 3D à partir d'images ou de texte (Meshy, Tripo, Hunyuan3D en open source)</td><td>Nettoie et allège les modèles dans Blender avant de les importer</td></tr>
<tr><td>Musique</td><td>Suno</td><td>Vérifie les droits commerciaux de ton offre</td></tr>
<tr><td>Voix et bruitages</td><td>ElevenLabs</td><td>Jamais de clonage de voix sans accord</td></tr>
<tr><td>Dialogues, quêtes, histoire</td><td>Claude, ChatGPT</td><td>Écris la bible du monde toi-même, fais générer les variations</td></tr>
</tbody></table></div>
<div class="callout">Sur Steam, les jeux doivent déclarer l'usage de contenus générés par IA depuis janvier 2024. Les joueurs y sont attentifs : la qualité et la cohérence comptent plus que la quantité.</div>`},
{t:"L'IA dans le jeu lui-même", h:`
<ul class="clean">
<li><b>Personnages qui dialoguent</b> : des PNJ animés par un modèle de langage, qui répondent librement au joueur (outils comme NVIDIA ACE ou des intégrations d'API). Attention au coût par joueur et aux dérapages.</li>
<li><b>Génération procédurale</b> : niveaux, cartes et objets générés par algorithme, depuis bien avant l'IA générative (Minecraft).</li>
<li><b>Modèles de monde</b> : Genie 3 de Google DeepMind (août 2025) génère en temps réel un monde interactif à partir d'un texte. Une piste de recherche, pas encore un moteur de jeu.</li>
<li><b>IA de jeu classique</b> : les ennemis utilisent encore surtout des machines à états, des arbres de comportement et la recherche de chemin (A*), plus prévisibles et moins coûteux.</li>
</ul>`},
{t:"Le multijoueur et les jeux en ligne", h:`
<ul class="clean">
<li><b>Serveur faisant autorité</b> : c'est le serveur qui décide de ce qui se passe, pas le joueur, pour limiter la triche.</li>
<li><b>Solutions prêtes</b> : réseau intégré de Godot, Netcode et services de Unity, Photon, Nakama (open source), services des plateformes de cloud.</li>
<li><b>Ce qui fait la taille d'un MMO</b> : serveurs répartis dans le monde, bases de données géantes, économie du jeu, lutte contre la triche, mises à jour continues, support client, modération, équipe d'exploitation 24 h sur 24.</li>
</ul>`},
{t:"Le parcours de progression", h:`
<ol class="steps">
<li><b>Novice</b> : trois mini-jeux web créés avec l'IA et publiés sur itch.io.</li>
<li><b>Débutant</b> : un jeu 2D complet dans Godot, avec menu, sauvegarde et cinq niveaux.</li>
<li><b>Apprenant</b> : un jeu 3D court, ressources faites ou adaptées avec l'IA, publié gratuitement.</li>
<li><b>Affirmé</b> : un jeu multijoueur coopératif simple, testé avec des amis.</li>
<li><b>Expert</b> : un projet commercial en petite équipe, publié sur Steam, avec gestion de projet et communauté.</li>
</ol>
<div class="ex"><b class="t">Exercice</b><p>Crée ce soir un mini-jeu web avec une IA, fais-le tester par trois personnes, et applique leurs trois retours principaux.</p></div>`}
]}
);
