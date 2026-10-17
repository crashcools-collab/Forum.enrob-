/* ====== MODULES FONDAMENTAUX ====== */
const MODULES = [
{t:"Comment fonctionne une IA générative", s:"Ce qui se passe vraiment quand tu poses une question", h:`
<p>Les assistants comme ChatGPT, Claude, Gemini ou Le Chat reposent sur des <b>grands modèles de langage</b> (LLM). Un tel modèle a été entraîné sur d'énormes quantités de textes pour apprendre une seule chose : prédire la suite la plus probable d'un texte, morceau par morceau (ces morceaux s'appellent des <b>tokens</b>).</p>
<p>À force de prédire, le modèle a appris la grammaire, des faits, des raisonnements, des styles. Mais il ne consulte pas une base de données de vérités : il produit ce qui lui semble le plus plausible. C'est ce qui le rend à la fois très fort et parfois faux.</p>
<div class="tbl-wrap"><table><thead><tr><th>Étape</th><th>Ce qui se passe</th></tr></thead><tbody>
<tr><td>1. Pré-entraînement</td><td>Le modèle lit une grande partie du web, des livres, du code. Il apprend à prédire le mot suivant.</td></tr>
<tr><td>2. Ajustement</td><td>Des humains et des méthodes automatiques lui apprennent à suivre des instructions et à être utile et prudent.</td></tr>
<tr><td>3. Utilisation</td><td>Ta question et la conversation (le <b>contexte</b>) sont lues ; il génère la réponse token par token.</td></tr>
<tr><td>4. Outils</td><td>Les assistants modernes peuvent aussi chercher sur le web, exécuter du code, lire des fichiers.</td></tr>
</tbody></table></div>
<div class="callout"><b>Date de coupure :</b> un modèle ne connaît que ce qui existait au moment de son entraînement. Pour l'actualité, il doit utiliser la recherche web.</div>`,
ex:"Demande à une IA : « Quelle est ta date de connaissance et peux-tu chercher sur internet dans cette conversation ? » Compare la réponse de deux IA différentes."},
{t:"Ce que l'IA fait bien, et mal", s:"Savoir quand l'utiliser et quand s'en méfier", h:`
<div class="two"><div><h3 style="color:var(--ok);margin-bottom:8px">Très bon</h3><ul class="clean ok">
<li>Rédiger, reformuler, changer de ton</li><li>Résumer et structurer</li><li>Expliquer une notion à ton niveau</li><li>Trouver des idées, faire des listes</li><li>Traduire</li><li>Écrire et expliquer du code ou des formules</li><li>Analyser un tableau avec exécution de code</li></ul></div>
<div><h3 style="color:var(--warn);margin-bottom:8px">À surveiller</h3><ul class="clean no">
<li>Faits précis, références de normes, articles de loi</li><li>Calculs faits « de tête » sans outil</li><li>Sources et citations (parfois inventées)</li><li>Actualité sans recherche web</li><li>Conseils médicaux, juridiques ou financiers engageants</li><li>Comptage précis (mots, lettres, lignes)</li></ul></div></div>
<p>Règle simple : l'IA est un excellent <b>assistant</b> qui prépare un premier jet. Toi, tu restes l'<b>expert</b> qui vérifie et qui décide.</p>`,
ex:"Demande à une IA de compter les lettres d'un mot long, puis de le faire en exécutant du code. Observe la différence de fiabilité."},
{t:"Les hallucinations et comment les éviter", s:"Quand l'IA invente avec aplomb", h:`
<p>Une <b>hallucination</b> est une réponse fausse présentée comme vraie : une norme qui n'existe pas, un chiffre inventé, une citation imaginaire. Le modèle n'a pas « l'intention » de mentir : il complète avec ce qui est plausible.</p>
<h3>Six techniques pour les réduire</h3>
<ol class="steps">
<li>Fournir les documents sources et demander de répondre <b>uniquement</b> à partir d'eux.</li>
<li>Écrire : « Si tu ne sais pas, dis-le. N'invente aucun chiffre ni aucune référence. »</li>
<li>Demander les <b>citations exactes</b> et les sources vérifiables.</li>
<li>Activer la <b>recherche web</b> pour toute information récente.</li>
<li>Faire exécuter les calculs par du <b>code</b>.</li>
<li>Demander une <b>contre-vérification</b> : « Relis ta réponse et signale ce qui pourrait être faux. »</li>
</ol>
<div class="callout warn">Un article de loi, un dosage de médicament, un chiffre ou une citation donnés par une IA ne s'utilisent jamais sans vérification dans la source officielle.</div>`,
ex:"Demande à une IA « Quel est l'article de la norme qui fixe [un détail très précis d'un domaine que tu connais bien] ? ». Vérifie si la référence existe vraiment."},
{t:"Contexte, mémoire et fichiers", s:"Ce que l'IA voit et ce qu'elle retient", h:`
<ul class="clean">
<li><b>Fenêtre de contexte</b> : la quantité de texte que le modèle peut lire en même temps (ta conversation, tes fichiers). Elle est grande (des centaines de pages) mais pas infinie.</li>
<li><b>Nouvelle conversation = page blanche</b>, sauf si la fonction mémoire est activée ou si tu travailles dans un Projet.</li>
<li><b>Les longues conversations se dégradent</b> : le modèle peut oublier ou mélanger des éléments du début. Résume et repars à neuf.</li>
<li><b>Mémoire</b> : certaines IA retiennent des informations sur toi entre les conversations. Tu peux la consulter, la modifier et l'effacer.</li>
<li><b>Fichiers</b> : PDF, Word, Excel, images, captures d'écran. Une photo d'un tableau papier peut être lue et transformée en tableau numérique.</li>
<li><b>Projets</b> (ChatGPT, Claude), <b>Gems</b> (Gemini), <b>Espaces</b> (Perplexity) : des dossiers avec fichiers et instructions permanents.</li>
</ul>`,
ex:"Prends en photo une feuille de notes manuscrites (sans info sensible) et demande à une IA de la retranscrire en tableau. Vérifie les erreurs."},
{t:"Modèles rapides, modèles qui réfléchissent, multimodal", s:"Choisir le bon moteur", h:`
<div class="tbl-wrap"><table><thead><tr><th>Type</th><th>Fonctionnement</th><th>Pour quoi</th></tr></thead><tbody>
<tr><td>Modèle rapide</td><td>Répond immédiatement</td><td>Reformuler, traduire, questions simples</td></tr>
<tr><td>Modèle de raisonnement</td><td>« Réfléchit » plusieurs secondes ou minutes avant de répondre (Thinking, réflexion étendue)</td><td>Problèmes complexes, calculs, analyse, code, planification</td></tr>
<tr><td>Multimodal</td><td>Comprend texte, images, voix, vidéo</td><td>Analyser une photo, discuter à l'oral, lire un plan</td></tr>
<tr><td>Générateur d'images ou de vidéos</td><td>Crée des médias à partir d'une description</td><td>Visuels, affiches, vidéos courtes</td></tr>
</tbody></table></div>
<p>Plus le modèle est puissant, plus il est lent et cher. Utilise le plus simple qui fait bien le travail.</p>`,
ex:"Pose le même problème de logique à une IA en mode rapide puis en mode réflexion. Compare."},
{t:"Agents, outils et automatisation", s:"Quand l'IA agit au lieu de seulement répondre", h:`
<p>Un <b>agent</b> est une IA qui enchaîne plusieurs actions seule pour atteindre un objectif : chercher sur le web, ouvrir des pages, remplir un tableau, écrire et tester du code, envoyer un brouillon.</p>
<ul class="clean">
<li><b>Agents de travail</b> (2026) : ChatGPT Work, Claude Cowork, Vibe Work, Copilot Cowork, Gemini Spark travaillent des heures sur tes fichiers et applications.</li>
<li><b>Agents de navigation</b> : ChatGPT agent, Comet, Claude pour Chrome.</li>
<li><b>Agents de code</b> : Claude Code, Codex, Copilot, Cursor, Antigravity, Vibe Code.</li>
<li><b>Connecteurs et MCP</b> : brancher l'IA sur tes mails, ton agenda, tes fichiers, tes outils métier.</li>
<li><b>Automatisations</b> : Power Automate, Zapier, Make, n8n déclenchent des actions selon des règles.</li>
</ul>
<div class="callout warn"><b>Garde un humain dans la boucle.</b> Un agent peut se tromper, mal comprendre ou être piégé par un contenu malveillant sur une page web (injection de prompt). Valide toute action irréversible : envoi, paiement, suppression, publication.</div>`,
ex:"Avec un assistant qui le permet, demande une recherche en plusieurs étapes et observe chaque action qu'il fait."},
{t:"Confidentialité et données de l'entreprise", s:"Ce qu'on peut confier à une IA", h:`
<p>Tout ce que tu écris dans une IA en ligne est envoyé sur les serveurs de l'éditeur. Selon l'offre, ces données peuvent être conservées, relues pour la sécurité ou utilisées pour améliorer les modèles.</p>
<ul class="clean">
<li>Utilise en priorité les <b>outils fournis par l'entreprise</b>.</li>
<li><b>Anonymise</b> : « le client A », « le projet B », « un collègue ».</li>
<li>Désactive l'utilisation de tes données pour l'entraînement dans les paramètres quand c'est possible.</li>
<li>Ne colle jamais : données personnelles, prix, marchés, contrats, mots de passe.</li>
</ul>
<p>Le détail est dans la section <b>Sécurité &amp; règles</b>.</p>`,
ex:"Ouvre les paramètres de ton IA préférée et trouve l'option qui contrôle l'utilisation de tes conversations pour l'entraînement."},
{t:"Intégrer l'IA dans ton quotidien", s:"Des usages concrets, tous les jours", h:`
<div class="tbl-wrap"><table><thead><tr><th>Moment</th><th>Usage</th><th>Gain</th></tr></thead><tbody>
<tr><td>Le matin</td><td>Résumer les mails, préparer la check-list du jour</td><td>10 à 20 min</td></tr>
<tr><td>Avant une réunion</td><td>Préparer l'ordre du jour et les questions</td><td>Réunion plus efficace</td></tr>
<tr><td>Après une réunion</td><td>Compte rendu et tableau des actions</td><td>20 à 30 min</td></tr>
<tr><td>En déplacement</td><td>Dicter des notes vocales, les transformer en résumé le soir</td><td>Rien n'est oublié</td></tr>
<tr><td>Pour les calculs</td><td>Vérifier un budget, une formule Excel</td><td>Moins d'erreurs</td></tr>
<tr><td>Pour apprendre</td><td>Se faire expliquer une notion, réviser avec un quiz</td><td>Montée en compétence</td></tr>
</tbody></table></div>
<div class="callout ok"><b>La méthode en 3 temps :</b> l'IA fait le brouillon, tu corriges et complètes avec ton expertise, tu valides et tu assumes le résultat.</div>`,
ex:"Pendant une semaine, note chaque tâche où l'IA t'a fait gagner du temps et estime le gain. Fais le bilan le vendredi."}
];

/* ====== AVANT / APRÈS ====== */
const BA = [
{t:"Un mail à son propriétaire", bad:"écris un mail à mon propriétaire pour la fuite", good:`Rédige un mail à mon propriétaire pour signaler une fuite d'eau sous l'évier de la cuisine, constatée le 14 octobre. Le placard en dessous commence à gonfler.
Ton : courtois mais ferme. Demande une intervention rapide et propose deux créneaux où je suis disponible : [CRÉNEAUX].
Format : objet, corps de 120 mots maximum, signature [MON NOM].`, why:"Destinataire, faits précis, objectif, ton, longueur et format : la réponse est utilisable immédiatement."},
{t:"Un résumé de document", bad:"résume ce document", good:`Résume le document ci-dessous pour une personne qui doit l'appliquer dès demain.
<document>[TEXTE]</document>
Livre : 5 points clés en liste, les obligations à respecter (avec la section du document), et ce qui change par rapport à avant. 200 mots maximum. Ne mentionne rien qui ne figure pas dans le document.`, why:"Le public et l'objectif changent tout : un résumé pour agir n'est pas un résumé pour comprendre."},
{t:"Une demande d'aide Excel", bad:"formule excel pour faire le total par catégorie", good:`Excel Microsoft 365 en français. Colonne A : dates. Colonne B : montants en euros. Colonne C : catégorie. Cellule F1 : la catégorie choisie.
Donne la formule qui calcule le total de la catégorie choisie, explique-la, et donne un exemple chiffré pour vérifier.`, why:"La version, la structure des données et l'exemple attendu évitent trois allers-retours."}
];

/* ====== TECHNIQUES ====== */
const TECHS = [
{t:"Donner des exemples", d:"Montre un ou deux exemples du résultat attendu. L'IA reproduit la structure, le ton et le niveau de détail. C'est la technique la plus efficace."},
{t:"Délimiter les données", d:"Encadre le texte à traiter avec des guillemets triples \"\"\" ou des balises <document>. L'IA ne confond plus tes instructions et tes données."},
{t:"Faire raisonner étape par étape", d:"« Réfléchis étape par étape et montre ton raisonnement » améliore les calculs et les analyses. Les modèles de raisonnement le font automatiquement."},
{t:"Découper en étapes", d:"Pour un gros travail : d'abord le plan, puis chaque partie, puis la relecture. Chaque étape dans un message séparé."},
{t:"Faire poser des questions", d:"« Avant de répondre, pose-moi les questions nécessaires pour faire un travail parfait. » L'IA identifie ce qui manque."},
{t:"Auto-critique", d:"« Relis ta réponse comme un expert exigeant, liste les faiblesses, puis donne une version corrigée. »"},
{t:"Demander plusieurs versions", d:"« Propose 3 versions : une courte, une détaillée, une plus formelle. » Tu choisis ou tu combines."},
{t:"Imposer l'honnêteté", d:"« Si tu ne sais pas, dis-le. Indique ton niveau de confiance. N'invente aucune source. » Réduit fortement les erreurs."},
{t:"Dire quoi faire, pas seulement quoi éviter", d:"« Écris des phrases de 15 mots maximum » fonctionne mieux que « ne fais pas de phrases longues »."},
{t:"Décrire le lecteur", d:"« Pour un débutant complet » ou « pour un directeur pressé » ajuste le vocabulaire et le niveau de détail."},
{t:"Itérer précisément", d:"Corrige comme un collègue : « plus court », « ton plus ferme », « garde la structure mais change l'exemple »."},
{t:"Créer des gabarits", d:"Un prompt qui marche se garde et se réutilise, avec des [VARIABLES]. C'est le principe de la bibliothèque de cette formation."}
];

/* ====== PROMPTS MAÎTRES ====== */
const MASTERS = [
{t:"Le prompt maître : ingénieur de prompts", tag:"Le plus important", use:"Colle-le dans n'importe quelle IA, remplace la demande brute, réponds à ses questions. Tu obtiens un prompt professionnel à réutiliser.", p:`# RÔLE
Tu es un ingénieur de prompts senior. Ta mission : transformer ma demande brute en un prompt professionnel, complet et directement exploitable par une IA générative (ChatGPT, Claude, Gemini, Vibe, Copilot), puis l'améliorer jusqu'à ce qu'il soit optimal.

# MA DEMANDE BRUTE
"""
[DÉCRIS ICI CE QUE TU VEUX OBTENIR, MÊME EN VRAC]
"""

# PROCÉDURE À SUIVRE STRICTEMENT

Étape 1 – Diagnostic
- Reformule mon objectif réel en une phrase.
- Identifie le livrable attendu : type, longueur, format, destinataire, usage.
- Liste les informations manquantes qui changeraient significativement le résultat.

Étape 2 – Questions
- Pose-moi au maximum 5 questions, numérotées, de la plus importante à la moins importante.
- Pour chacune, propose entre parenthèses une réponse par défaut raisonnable.
- Arrête-toi et attends mes réponses. Si je réponds « par défaut », utilise tes propositions.

Étape 3 – Rédaction du prompt final, structuré ainsi :
1. Rôle et niveau d'expertise attendu
2. Contexte : situation, public, enjeux
3. Tâche précise, découpée en étapes si nécessaire
4. Données d'entrée, délimitées par des balises ou des guillemets triples
5. Contraintes : à faire, à ne pas faire, ton, longueur, langue
6. Format de sortie exact : structure, titres, tableau ou autre
7. Critères de qualité et vérification avant réponse
8. Règle d'honnêteté : signaler les incertitudes, ne jamais inventer de chiffres, de sources, de normes ou de citations

Étape 4 – Contrôle qualité
- Note le prompt final sur 10 selon : clarté, complétude, précision des contraintes, vérifiabilité du résultat.
- Indique les 3 points faibles restants et intègre leur correction dans une version finale.

# RÈGLES
- Aucune flatterie, aucun remplissage.
- Si ma demande est mal posée, irréaliste ou s'il existe une meilleure approche pour atteindre mon objectif, dis-le clairement et propose mieux.
- Le prompt final doit être autonome : compréhensible sans cette conversation.
- Livre le prompt final dans un seul bloc de code, prêt à copier.`},
{t:"Prompt système : assistant professionnel rigoureux", tag:"À installer une fois", use:"Colle-le dans les instructions personnalisées de ton IA (voir le tableau plus bas). Il s'appliquera à toutes tes conversations.", p:`Tu es mon assistant professionnel. Applique ces règles dans toutes tes réponses.

EXACTITUDE
1. Distingue clairement ce qui est certain, probable et incertain.
2. N'invente jamais de faits, chiffres, normes, références réglementaires, citations ou sources. Si tu ne sais pas, dis « je ne sais pas » et indique comment vérifier.
3. Pour toute donnée chiffrée importante, montre le calcul ou cite la source.
4. Signale quand une information peut être dépassée (actualité, prix, réglementation) et utilise la recherche web si elle est disponible.

FRANCHISE
5. Ne cherche pas à me donner raison pour me faire plaisir. Si je me trompe, dis-le directement et explique pourquoi.
6. S'il existe une meilleure manière d'atteindre mon objectif, présente-la en premier, sans détour.
7. Propose toujours les solutions les plus efficaces en priorité.

EFFICACITÉ
8. Réponds d'abord à la question en une à trois phrases, puis détaille si c'est utile.
9. Pas de formules creuses, pas de répétition de ma question, pas de conclusion qui résume ce que tu viens de dire.
10. Si ma demande est ambiguë au point de changer la réponse, pose une question courte avant. Sinon, énonce ton hypothèse et avance.

FORMAT
11. Utilise des listes et des tableaux quand ils facilitent la lecture ; des paragraphes courts sinon.
12. Termine par les actions concrètes à faire quand c'est pertinent.

MON CONTEXTE
Je travaille comme [MÉTIER / POSTE] dans [SECTEUR OU DOMAINE].
Mon niveau : [débutant / intermédiaire / expert] sur [SUJETS].
Je préfère : [style de réponse : direct, pédagogique, détaillé…].`},
{t:"Protocole de contre-vérification", tag:"Avant d'utiliser une réponse importante", use:"Colle une réponse d'IA (de préférence dans une autre IA ou une nouvelle conversation) pour la faire auditer.", p:`Agis comme un relecteur critique indépendant et exigeant. Voici une réponse produite par une IA :

<reponse>
[COLLE LA RÉPONSE À VÉRIFIER]
</reponse>

Contexte de la question d'origine : [QUESTION POSÉE]

1. Liste chaque affirmation factuelle vérifiable (faits, chiffres, références, dates).
2. Pour chacune, donne un niveau de confiance (élevé / moyen / faible) et la raison.
3. Repère les erreurs de raisonnement, les calculs faux (refais-les), les contradictions et les omissions importantes.
4. Indique ce qui doit être vérifié dans une source officielle, et quel type de source consulter.
5. Propose une version corrigée de la réponse.

Ne valide rien par complaisance. Si la réponse est bonne, dis-le en une phrase et explique pourquoi.`},
{t:"Prompt expert : analyse et décision", tag:"Pour les sujets à enjeu", use:"Pour une décision importante : choix d'un fournisseur, d'une méthode, d'une organisation.", p:`# RÔLE
Tu es un conseiller expert en [DOMAINE], réputé pour ses analyses franches et ses recommandations tranchées.

# SITUATION
[DÉCRIS LA SITUATION, LES ENJEUX, LES CONTRAINTES (budget, délai, ressources)]

# DÉCISION À PRENDRE
[LA QUESTION]

# OPTIONS ENVISAGÉES
[OPTION 1], [OPTION 2], [OPTION 3]. Ajoute toute option pertinente que j'aurais oubliée.

# CE QUE J'ATTENDS
1. Les critères de décision pertinents, pondérés, en justifiant la pondération.
2. Un tableau d'évaluation de chaque option sur chaque critère.
3. Les risques principaux de chaque option et comment les réduire.
4. Ta recommandation claire, en une phrase, puis argumentée.
5. Les conditions qui te feraient changer de recommandation.
6. Les trois premières actions à lancer cette semaine.

# RÈGLES
- Signale chaque hypothèse que tu fais.
- Si une information manque pour trancher, dis lequel et quel impact elle a.
- Ne cherche pas à me rassurer : si mon approche est mauvaise, dis-le.`}
];

/* ====== QUIZ ====== */
const QUIZ = [
{q:"Comment un grand modèle de langage produit-il une réponse ?",o:["Il cherche la réponse exacte dans une base de données","Il prédit la suite de texte la plus probable, morceau par morceau","Il recopie une page web","Un humain répond en direct"],a:1,e:"Il génère du texte token par token en prédisant la suite la plus plausible. D'où sa fluidité, et ses erreurs."},
{q:"Qu'est-ce qu'une hallucination ?",o:["Un bug d'affichage","Une réponse fausse présentée avec assurance","Une image générée","Un refus de répondre"],a:1,e:"Le modèle complète avec du plausible, même faux : normes, chiffres ou sources inventées."},
{q:"Quelle est la meilleure façon de fiabiliser un calcul avec une IA ?",o:["Lui faire confiance","Lui demander d'exécuter le calcul en code et vérifier l'ordre de grandeur","Poser la question deux fois","Utiliser un générateur d'images"],a:1,e:"Le code calcule exactement. Ton contrôle d'ordre de grandeur détecte une erreur de donnée ou d'unité."},
{q:"Quels sont les blocs qui changent le plus le résultat d'un prompt ?",o:["La politesse","Le contexte, la tâche précise et le format","La longueur du prompt","Les majuscules"],a:1,e:"Contexte, tâche et format définissent ce que l'IA doit produire et pour qui."},
{q:"Que faire après 30 échanges quand les réponses se dégradent ?",o:["Insister","Demander un résumé, ouvrir une nouvelle conversation et le coller","Changer de langue","Écrire en majuscules"],a:1,e:"Les longues conversations se dégradent. Repartir à neuf avec un résumé est la solution."},
{q:"Quel outil répond uniquement à partir de tes documents, avec citations ?",o:["Midjourney","NotebookLM","Suno","CapCut"],a:1,e:"NotebookLM travaille exclusivement sur les sources ajoutées au carnet."},
{q:"Sur GitHub, qu'est-ce qu'une pull request ?",o:["Une demande d'accès au dépôt","Une demande de fusion de modifications, relue avant validation","Un téléchargement","Un ticket de bug"],a:1,e:"La PR présente les modifications d'une branche pour qu'elles soient relues puis fusionnées."},
{q:"Qu'est-ce qu'un commit ?",o:["Un enregistrement de modifications avec un message","Un mot de passe","Une branche","Un serveur"],a:0,e:"Un commit est un point de sauvegarde dans l'historique Git."},
{q:"Comment publier gratuitement un site HTML en ligne ?",o:["GitHub Pages sur un dépôt public","En l'envoyant par mail","Sur Hugging Face Datasets","Via un GPT"],a:0,e:"GitHub Pages héberge gratuitement les sites statiques des dépôts publics."},
{q:"Tu as publié par erreur une clé API sur GitHub. Que fais-tu ?",o:["Tu supprimes le fichier, c'est réglé","Tu révoques la clé immédiatement et en crées une nouvelle","Tu passes le dépôt en privé, c'est suffisant","Rien"],a:1,e:"L'historique garde la clé et des robots scannent GitHub en permanence. Une clé publiée est compromise."},
{q:"Sur Hugging Face, que faut-il vérifier avant d'utiliser un modèle au travail ?",o:["Le nombre de likes","La licence","La couleur du logo","La date de création du compte"],a:1,e:"La licence dit si l'usage commercial est permis. Certaines l'interdisent."},
{q:"Quel format de fichier de modèle est le plus sûr sur Hugging Face ?",o:[".safetensors",".exe",".bin pickle",".zip"],a:0,e:"Les fichiers pickle peuvent contenir du code exécutable. safetensors ne contient que des données."},
{q:"Dans Cursor, que fais-tu avant de laisser l'agent faire une grosse modification ?",o:["Rien","Un commit et une demande de plan","Désinstaller les extensions","Fermer le projet"],a:1,e:"Le commit permet de revenir en arrière ; le plan permet de valider l'approche avant le code."},
{q:"Qu'est-ce que Claude Code ?",o:["Un générateur d'images","Un agent de développement qui lit, modifie, teste et commite du code","Une extension de traduction","Un antivirus"],a:1,e:"Claude Code travaille dans le terminal, l'IDE, l'application ou le web."},
{q:"Quelle donnée peut-on coller dans une IA grand public ?",o:["Le prix d'un marché","Les coordonnées d'un client","Un texte générique que tu as écrit, sans info sensible","Le mot de passe de la messagerie"],a:2,e:"Rien de confidentiel, de personnel ou de sécurité dans un outil grand public."},
{q:"Une voix au téléphone, identique à celle de ton directeur, demande un virement urgent. Que fais-tu ?",o:["Tu fais le virement","Tu raccroches et rappelles la personne sur un numéro connu","Tu demandes à l'IA","Tu envoies un SMS"],a:1,e:"Les voix se clonent en quelques secondes d'enregistrement. On vérifie toujours par un autre canal."},
{q:"Quelle technique est la plus efficace pour obtenir le format exact voulu ?",o:["Être poli","Donner un exemple du résultat attendu","Écrire en anglais","Répéter la demande"],a:1,e:"Un exemple vaut mille consignes : l'IA reproduit structure et ton."},
{q:"Quelle est la différence entre ChatGPT Plus et l'API d'OpenAI ?",o:["Aucune","Plus est un abonnement à l'interface, l'API est facturée à l'usage pour les programmes","L'API est gratuite","Plus sert seulement aux images"],a:1,e:"Les deux sont facturés séparément : forfait pour l'interface, au token pour l'API."},
{q:"Pourquoi utiliser une IA locale avec Ollama ?",o:["Elle est plus puissante que tout","Les données ne quittent pas l'ordinateur","Elle cherche mieux sur le web","Elle génère des vidéos"],a:1,e:"Le principal intérêt est la confidentialité, au prix d'une puissance moindre."},
{q:"Quel événement a rendu l'IA générative grand public, le 30 novembre 2022 ?",o:["La sortie de GPT-4","Le lancement de ChatGPT","La création de Mistral AI","L'AI Act"],a:1,e:"ChatGPT atteint 100 millions d'utilisateurs en environ deux mois."},
{q:"Quelle invention de 2017 est à la base de tous les grands modèles actuels ?",o:["Le Transformer","Le smartphone","Le cloud","Le GPU"],a:0,e:"L'article « Attention Is All You Need » de Google a introduit le Transformer."},
{q:"Qui possède Cursor depuis le 14 août 2026 ?",o:["Microsoft","OpenAI","SpaceX","Google"],a:2,e:"SpaceX, qui avait déjà absorbé xAI en février 2026, a racheté Cursor pour 60 milliards de dollars."},
{q:"Comment s'appelle Le Chat de Mistral depuis 2026 ?",o:["Vibe","Muse","Spark","Argon"],a:0,e:"Le Chat est devenu Vibe, avec trois modes : Chat, Work et Code."},
{q:"Que prévoit l'omnibus numérique européen de juillet 2026 ?",o:["La suppression de l'AI Act","Le report des règles sur les systèmes à haut risque au 2 décembre 2027","L'interdiction de ChatGPT","Une taxe sur l'IA"],a:1,e:"Les obligations de transparence restent en vigueur depuis le 2 août 2026 ; seules les règles sur le haut risque sont repoussées."},
{q:"Quel est le modèle Anthropic le plus capable accessible au public au 17 octobre 2026 ?",o:["Claude 3 Opus","Claude Fable 5.1","Claude Mythos 5.1","Claude Haiku 5.5"],a:1,e:"Mythos 5.1 est réservé aux partenaires de cybersécurité ; Fable 5.1 est la version publique avec garde-fous."},
{q:"Qui reste responsable d'un document produit avec l'aide de l'IA ?",o:["L'éditeur de l'IA","Personne","Toi, qui le valides et le signes","L'ordinateur"],a:2,e:"L'IA prépare, l'humain vérifie et assume."}
];

/* ====== GLOSSAIRE ====== */
const GLOSS = [
["Agent","IA qui enchaîne plusieurs actions seule (chercher, cliquer, coder, tester) pour atteindre un objectif."],
["API","Interface de programmation : la porte d'entrée qu'un service ouvre pour que d'autres programmes lui demandent quelque chose (météo, paiement, connexion, modèle d'IA) selon des règles précises."],
["Artefact","Chez Claude : document, code ou application généré et affiché à côté de la conversation."],
["Biais","Tendance d'un modèle à reproduire des stéréotypes ou déséquilibres présents dans ses données d'entraînement."],
["Branche","Version parallèle d'un projet Git pour travailler sans toucher à la version principale."],
["Chain of thought","Raisonnement étape par étape demandé au modèle pour améliorer sa fiabilité."],
["Clé API","Code secret qui identifie et facture ton usage d'une API. À protéger comme un mot de passe."],
["Commit","Enregistrement d'un ensemble de modifications dans l'historique Git, avec un message."],
["Contexte (fenêtre de)","Quantité de texte que le modèle peut lire en une fois : conversation, fichiers, instructions."],
["Date de coupure","Date jusqu'à laquelle vont les connaissances d'un modèle."],
["Deepfake","Image, vidéo ou voix truquée par IA pour imiter une personne réelle."],
["Diffusion","Technique de génération d'images qui part d'un bruit aléatoire et l'affine progressivement."],
["Embedding","Représentation d'un texte sous forme de nombres, pour comparer des textes par leur sens."],
["Fine-tuning","Réentraîner un modèle existant sur des données spécifiques pour le spécialiser."],
["Fork","Copie du dépôt de quelqu'un d'autre dans son propre compte."],
["GGUF","Format de fichier de modèles compressés pour les faire tourner sur un ordinateur ordinaire."],
["GPT","Generative Pre-trained Transformer. Aussi le nom des assistants personnalisés de ChatGPT."],
["GPU","Carte graphique : le composant qui fait tourner les modèles d'IA rapidement."],
["Hallucination","Réponse fausse présentée comme vraie par un modèle."],
["Injection de prompt","Instruction cachée dans une page ou un document pour détourner une IA ou un agent."],
["LLM","Large Language Model : grand modèle de langage, comme GPT, Claude, Gemini, Mistral."],
["MCP","Model Context Protocol : standard ouvert pour connecter une IA à des outils et des sources de données."],
["Merge","Fusion des modifications d'une branche dans une autre."],
["Modèle à poids ouverts","Modèle dont les fichiers sont publiés et peuvent être téléchargés et utilisés librement selon leur licence."],
["Multimodal","Capable de traiter plusieurs types de contenus : texte, image, son, vidéo."],
["Paramètres","Les milliards de valeurs internes d'un modèle. Plus il y en a, plus le modèle est capable et gourmand."],
["Prompt","Instruction ou question donnée à une IA."],
["Prompt système","Instructions permanentes qui cadrent le comportement de l'IA dans toute la conversation."],
["Pull request","Demande de fusion de modifications sur GitHub, relue avant validation."],
["Quantification","Compression d'un modèle (ex. 4 bits) pour réduire sa taille et sa mémoire, avec une légère perte de qualité."],
["RAG","Retrieval-Augmented Generation : l'IA cherche d'abord dans tes documents puis répond en s'appuyant dessus."],
["Raisonnement (modèle de)","Modèle qui réfléchit avant de répondre, plus lent mais plus fiable sur les tâches complexes."],
["Dépôt (repository)","Dossier de projet versionné avec Git, avec tout son historique."],
["Space","Sur Hugging Face : application de démonstration d'un modèle, utilisable dans le navigateur."],
["Température","Réglage de la créativité d'un modèle : basse = stable et prévisible, haute = variée."],
["Token","Morceau de mot traité par le modèle. Sert d'unité de mesure du contexte et de facturation."],
["Transformer","Architecture de réseau de neurones inventée en 2017, à la base de tous les grands modèles actuels."],
["Vibe coding","Créer une application en décrivant ce qu'on veut à une IA, sans écrire le code soi-même. À ne pas confondre avec Vibe, le nouveau nom de Le Chat de Mistral."],
["Agent de travail","Agent qui réalise des tâches longues dans tes fichiers et applications : ChatGPT Work, Claude Cowork, Vibe Work, Copilot Cowork."],
["Omnibus numérique","Règlement européen de juillet 2026 qui modifie l'AI Act, notamment en repoussant les règles sur les systèmes à haut risque."],
["Classe Mythos","Modèles d'Anthropic aux capacités de cybersécurité jugées trop dangereuses pour une diffusion libre ; Fable en est la version publique avec garde-fous."],
["Poids (d'un modèle)","Les paramètres appris pendant l'entraînement. Un modèle « à poids ouverts » les publie pour que chacun puisse le télécharger."]
];

/* ====== PROGRAMME 4 SEMAINES ====== */
const PLAN = [
{w:"Semaine 1 · Les bases", d:["Lire la chronologie de l'histoire de l'IA et le tableau « Où en est-on »","Lire les modules 1 à 4 des fondamentaux","Régler la confidentialité de tes comptes","Poser la même question aux deux IA et comparer","Installer le prompt système de la section Prompt maître"]},
{w:"Semaine 2 · Le prompt", d:["Lire la méthode des 7 blocs","Réécrire 3 de tes demandes habituelles avec la méthode","Utiliser le prompt maître sur un vrai besoin","Obtenir au moins 70 dans l'analyseur de l'atelier","Copier 5 prompts de la bibliothèque dans tes favoris"]},
{w:"Semaine 3 · Les outils", d:["Suivre les cours ChatGPT ou Claude jusqu'au bout","Créer un Projet ou un Gem pour un de tes sujets","Tester NotebookLM sur une documentation","Créer une image avec deux générateurs différents","Faire une recherche sourcée et vérifier 3 sources"]},
{w:"Semaine 4 · Niveau avancé", d:["Suivre le cours GitHub et créer un dépôt de test","Explorer 3 Spaces sur Hugging Face","Découvrir Cursor ou Claude Code sur un petit projet","Créer une petite application HTML avec une IA","Réussir le quiz final avec au moins 70 % de bonnes réponses"]}
];

/* ====== CHECK-LIST AVANT ENVOI ====== */
const SECCHECK = [
"Mon texte ne contient aucun nom, téléphone, adresse ou donnée personnelle.",
"Aucun prix, marché, contrat ou document interne confidentiel.",
"Aucun mot de passe, code d'accès ou clé API.",
"J'utilise un outil autorisé par mon entreprise pour ce type de contenu.",
"Je vérifierai les chiffres, références et consignes avant de les utiliser.",
"Pour la santé, le droit ou l'argent, je confirmerai avec un professionnel.",
"Je relirai le résultat avant de l'envoyer ou de le publier.",
"Je sais que c'est moi qui assume le document final."
];
