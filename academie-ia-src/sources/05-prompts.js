/* ====== BIBLIOTHÈQUE DE PROMPTS ====== */
const PR_CATS = {
  quotidien:'Vie quotidienne', creation:'Écriture & créativité', mail:'Mails & courriers', rapport:'Rapports & comptes rendus',
  synth:'Synthèse & analyse', excel:'Excel & données', apprendre:'Apprendre & se former', manager:'Management & équipe',
  recherche:'Recherche & vérification', image:'Image & vidéo', code:'Code & automatisation', decision:'Décision & stratégie', perso:'Carrière & perso'
};
const PROMPTS = [
/* --- Vie quotidienne --- */
{c:'quotidien',t:'Vérifier un calcul ou un budget',ia:'ChatGPT, Claude, Gemini',p:`Tu es un conseiller rigoureux. Vérifie le calcul suivant en l'exécutant avec du code, sans estimation de tête.

Données :
"""
[COLLE TES CHIFFRES : revenus, dépenses, mensualités, taux…]
"""

Livre :
1. Le détail de chaque étape du calcul, avec les unités.
2. Le résultat final, arrondi au centime.
3. Un contrôle d'ordre de grandeur en une phrase.
4. Les erreurs ou incohérences que tu repères dans mes données.
Si une donnée manque, demande-la avant de calculer.`},
{c:'quotidien',t:'Organiser un voyage',ia:'Toutes, Perplexity pour les infos récentes',p:`Tu es un organisateur de voyages expérimenté. Prépare un séjour à [DESTINATION] du [DATE DE DÉPART] au [DATE DE RETOUR].
Voyageurs : [QUI, âges]. Budget : [BUDGET] par personne hors transport. Nous aimons : [CENTRES D'INTÉRÊT]. Nous évitons : [CE QUE VOUS N'AIMEZ PAS].

Livre :
1. Un programme jour par jour (matin, après-midi, soir), 3 activités maximum par jour.
2. Les quartiers où loger, avec avantages et inconvénients.
3. Une estimation des dépenses par poste.
4. Les formalités et précautions (papiers, santé, climat à cette période).
Signale ce qui doit être vérifié sur un site officiel (horaires, prix, formalités).`},
{c:'quotidien',t:'Construire un budget mensuel',ia:'Toutes',p:`Aide-moi à construire mon budget mensuel.
Revenus nets : [MONTANT]. Dépenses fixes : [LOYER, ABONNEMENTS, CRÉDITS…]. Dépenses variables connues : [COURSES, ESSENCE, LOISIRS…]. Objectif : [ÉPARGNER X € / REMBOURSER / PRÉPARER UN ACHAT].

1. Présente mon budget dans un tableau (poste, montant, part du revenu).
2. Repère les postes au-dessus des repères habituels.
3. Propose 5 économies concrètes classées par impact.
4. Donne un plan d'épargne réaliste pour atteindre mon objectif.
Ne recommande aucun produit financier précis.`},
{c:'quotidien',t:'Comparer des produits avant un achat',ia:'Perplexity, ChatGPT, Gemini',p:`Je veux acheter [PRODUIT] pour [USAGE]. Budget maximum : [BUDGET]. Critères importants : [CRITÈRES].
1. Explique les caractéristiques qui comptent vraiment pour cet usage, et celles qui sont du marketing.
2. Propose 3 à 5 modèles actuels dans mon budget, avec un tableau comparatif.
3. Indique les défauts connus de chacun.
4. Donne ta recommandation selon mon usage.
Cite tes sources (tests, comparatifs) avec leur date.`},
{c:'quotidien',t:'Menus de la semaine avec ce que j\'ai',ia:'Toutes',p:`Voici ce que j'ai dans mon frigo et mes placards : [LISTE].
Nous sommes [NOMBRE] personnes. Contraintes : [RÉGIME, ALLERGIES, TEMPS DE CUISINE MAXIMUM].
Propose 7 dîners simples qui utilisent en priorité ce que j'ai, avec pour chacun : temps de préparation et étapes courtes. Termine par la liste de courses complémentaire, classée par rayon.`},
{c:'quotidien',t:'Préparer un rendez-vous médical',ia:'Claude, ChatGPT',p:`J'ai rendez-vous chez [MÉDECIN / SPÉCIALISTE] pour [MOTIF].
Mes symptômes ou ma situation : [DESCRIPTION, depuis quand, ce qui aggrave ou soulage].
Aide-moi à préparer ce rendez-vous :
1. Les informations à donner au médecin, dans un ordre clair.
2. Les questions utiles à poser.
3. Les documents à apporter.
Ne pose aucun diagnostic et ne propose aucun traitement : c'est le rôle du médecin.`},
{c:'quotidien',t:'Comprendre un document administratif ou un contrat',ia:'Claude, ChatGPT',p:`Explique-moi ce document comme à quelqu'un qui n'est pas juriste.
<document>
[COLLE LE TEXTE, SANS TES DONNÉES PERSONNELLES]
</document>
1. De quoi s'agit-il, en 3 phrases.
2. Mes obligations et mes droits, en liste.
3. Les dates limites et les montants.
4. Les clauses inhabituelles ou à surveiller.
5. Ce que je devrais faire vérifier par un professionnel.`},
{c:'quotidien',t:'Résoudre un problème informatique',ia:'Toutes',p:`J'ai un problème avec [APPAREIL / LOGICIEL, modèle et version].
Ce qui se passe : [DESCRIPTION]. Message d'erreur exact : [MESSAGE]. Ce que j'ai déjà essayé : [ESSAIS].
Guide-moi pas à pas, une étape à la fois, en commençant par la solution la plus simple et la moins risquée. Attends mon retour après chaque étape. Préviens-moi avant toute manipulation qui pourrait effacer des données.`},
/* --- Écriture & créativité --- */
{c:'creation',t:'Écrire une histoire courte',ia:'Claude, ChatGPT',p:`Écris une nouvelle de [LONGUEUR, ex. 1 500 mots] dans le genre [GENRE].
Personnage principal : [PERSONNAGE]. Lieu et époque : [CADRE]. Thème : [THÈME].
Style : [STYLE, ex. phrases courtes, dialogues vivants]. Fin : [OUVERTE / HEUREUSE / RETOURNEMENT].
Évite les clichés du genre. Avant d'écrire, propose-moi 3 idées d'intrigue en deux lignes chacune et attends mon choix.`},
{c:'creation',t:'Discours pour un événement',ia:'Toutes',p:`Écris un discours de [DURÉE] minutes pour [ÉVÉNEMENT : mariage, anniversaire, départ en retraite…].
Je suis [MON LIEN AVEC LA PERSONNE]. La personne : [3 TRAITS ET 2 ANECDOTES VRAIES].
Ton : [ÉMOUVANT / DRÔLE / LES DEUX]. Le discours doit pouvoir se lire à voix haute : phrases courtes, pauses indiquées par « / ». Propose aussi une version plus courte d'une minute.`},
{c:'creation',t:'Publication pour les réseaux sociaux',ia:'Toutes',p:`Rédige une publication pour [RÉSEAU : LinkedIn, Instagram, Facebook] sur [SUJET].
Objectif : [INFORMER / FAIRE RÉAGIR / ANNONCER]. Public : [PUBLIC].
Contraintes : une première ligne qui donne envie de lire, [LONGUEUR], [AVEC / SANS] émojis, 3 hashtags pertinents maximum. Propose 3 versions de ton différent.`},
{c:'creation',t:'Trouver un nom',ia:'Toutes',p:`Trouve 20 noms pour [PROJET : entreprise, association, produit, chaîne].
Ce que c'est : [DESCRIPTION]. Valeurs : [VALEURS]. Public : [PUBLIC]. Langue : [LANGUE].
Classe-les en 4 styles (descriptif, évocateur, inventé, jeu de mots). Pour les 5 meilleurs, explique pourquoi. Rappelle-moi de vérifier la disponibilité du nom (marque, nom de domaine) avant de le choisir.`},
{c:'creation',t:'Séance de brainstorming',ia:'Toutes',p:`Je cherche des idées pour : [PROBLÈME OU PROJET].
Contraintes : [BUDGET, TEMPS, MOYENS].
1. Donne 30 idées en vrac, des plus classiques aux plus audacieuses.
2. Regroupe-les par thème.
3. Choisis les 3 plus prometteuses et explique comment les tester rapidement et à faible coût.`},
/* --- Mails --- */
{c:'mail',t:'Mail professionnel parfait',ia:'Toutes',p:`Rédige un mail professionnel.
- Destinataire : [QUI, sa fonction, notre relation]
- Objectif : [CE QUE JE VEUX OBTENIR]
- Points à faire passer : [POINTS]
- Ton : [cordial / ferme / formel]

Format : objet clair (8 mots maximum), formule d'appel, corps de 120 mots maximum avec la demande dès la deuxième phrase, une action attendue avec une date, formule de politesse. Propose deux variantes d'objet.`},
{c:'mail',t:'Annoncer une mauvaise nouvelle',ia:'Claude, ChatGPT',p:`Je dois annoncer à [DESTINATAIRE] que [MAUVAISE NOUVELLE, ex. le projet sera livré avec une semaine de retard].
Raison réelle : [RAISON]. Ce que je peux proposer : [SOLUTION].
Rédige un mail honnête et direct : la nouvelle dans les deux premières phrases, l'explication sans excuses excessives, la solution, la suite. 150 mots maximum. Ton respectueux.`},
{c:'mail',t:'Relance sans être pénible',ia:'Toutes',p:`Rédige une relance pour [DESTINATAIRE] qui n'a pas répondu à ma demande du [DATE] concernant [SUJET].
C'est la [PREMIÈRE / DEUXIÈME / TROISIÈME] relance. Conséquence si pas de réponse : [CONSÉQUENCE].
Ton : courtois, de plus en plus ferme selon le numéro de relance. 80 mots maximum. Rappelle la demande initiale en une phrase.`},
{c:'mail',t:'Réponse à un mail agressif',ia:'Claude, ChatGPT',p:`J'ai reçu ce mail agressif :
"""
[COLLE LE MAIL]
"""
Les faits réels : [TA VERSION].
1. Analyse en 3 lignes ce que la personne demande vraiment.
2. Rédige une réponse calme et professionnelle qui recadre sans escalade, répond sur les faits et propose une suite (appel, réunion).
3. Indique ce qu'il ne faut surtout pas écrire.`},
{c:'mail',t:'Résumer un long fil de mails',ia:'Copilot, Gemini, Claude',p:`Voici un fil de mails :
"""
[COLLE LE FIL]
"""
Résume-le ainsi : sujet en une phrase, positions de chaque intervenant (par fonction), décisions prises, questions encore ouvertes, ce qu'on attend de moi. Format : liste courte. Puis propose une réponse si une action m'est demandée.`},
/* --- Rapports --- */
{c:'rapport',t:'Rapport mensuel d\'activité',ia:'Toutes',p:`Rédige un rapport mensuel d'activité à partir de ces éléments :
"""
[CHIFFRES, PROJETS, FAITS MARQUANTS, PROBLÈMES]
"""
Destinataire : [direction / client / équipe].
Structure : synthèse en 5 lignes, chiffres clés (tableau), faits marquants, difficultés et actions, perspectives du mois prochain. Style factuel, 1 page. N'invente aucun chiffre : si une donnée manque, laisse « [À COMPLÉTER] ».`},
{c:'rapport',t:'Compte rendu de réunion',ia:'Toutes',p:`Transforme cette transcription ou ces notes de réunion en compte rendu.
"""
[TRANSCRIPTION OU NOTES]
"""
Livre : participants (fonctions), objet, points abordés (résumé de 2 lignes chacun), décisions, tableau des actions (action / responsable / échéance), date de la prochaine réunion. Signale les actions sans responsable ou sans échéance.`},
{c:'rapport',t:'Transformer un texte en note de synthèse',ia:'Claude, ChatGPT',p:`Transforme ce texte en note de synthèse d'une page pour [DESTINATAIRE] qui a 2 minutes pour la lire.
"""
[TEXTE]
"""
Structure : l'essentiel en 3 phrases, contexte, points clés en liste, ce qui est attendu du lecteur. Phrases courtes, aucun jargon non expliqué.`},
{c:'rapport',t:'Relire et améliorer un document',ia:'Claude, ChatGPT',p:`Relis ce document comme un relecteur exigeant.
"""
[DOCUMENT]
"""
1. Corrige l'orthographe et la grammaire (liste des corrections).
2. Repère les phrases floues, trop longues ou ambiguës, et propose une reformulation.
3. Signale les incohérences de chiffres ou de dates.
4. Donne une note de clarté sur 10 et les trois améliorations prioritaires.
Ne change pas le sens. Ne me flatte pas.`},
/* --- Synthèse & analyse --- */
{c:'synth',t:'Résumé en 3 niveaux',ia:'Toutes',p:`Résume le contenu suivant en trois niveaux :
1. Une phrase.
2. Cinq points clés.
3. Un résumé détaillé d'une demi-page.
"""
[CONTENU]
"""
Indique à la fin ce que le texte ne dit pas mais qu'un lecteur voudrait savoir.`},
{c:'synth',t:'Comparer des offres ou des devis',ia:'Claude, ChatGPT',p:`Compare les offres suivantes :
"""
[OFFRE A]
---
[OFFRE B]
---
[OFFRE C]
"""
Critères : [PRIX, DÉLAI, GARANTIES, QUALITÉ, SERVICE…], avec une pondération : [POIDS].
Livre un tableau comparatif, les points cachés ou absents dans chaque offre, une note pondérée, et une recommandation argumentée. Signale les éléments que tu ne peux pas comparer faute d'information.`},
{c:'synth',t:'Forces, faiblesses, risques',ia:'Toutes',p:`Analyse ce projet ou cette idée : [DESCRIPTION].
Fais une analyse en 4 cases (forces, faiblesses, opportunités, menaces), avec 3 à 5 points concrets par case. Puis : les 3 risques les plus graves et comment les réduire. Sois critique : ne cherche pas à me rassurer.`},
{c:'synth',t:'Extraire les données d\'un texte en tableau',ia:'Toutes',p:`Extrais de ce texte toutes les informations de type [DATES / QUANTITÉS / NOMS DE PRODUITS / MONTANTS] et présente-les dans un tableau avec les colonnes : [COLONNES].
"""
[TEXTE]
"""
N'ajoute rien qui ne figure pas dans le texte. Mets « ? » quand l'information est incomplète.`},
/* --- Excel --- */
{c:'excel',t:'Créer une formule Excel',ia:'Toutes, Copilot',p:`Dans Excel [VERSION, ex. Microsoft 365 en français], j'ai :
- Colonne A : [CONTENU]
- Colonne B : [CONTENU]
Je veux obtenir en colonne C : [RÉSULTAT ATTENDU].
Donne la formule exacte avec les séparateurs de la version française, explique-la morceau par morceau, donne un exemple chiffré pour vérifier, et signale les cas qui provoquent une erreur (cellule vide, texte).`},
{c:'excel',t:'Comprendre une formule existante',ia:'Toutes',p:`Explique-moi cette formule Excel comme à un débutant, morceau par morceau :
[FORMULE]
Puis dis-moi si elle peut être simplifiée et propose la version simplifiée.`},
{c:'excel',t:'Analyser un tableau de données',ia:'ChatGPT, Claude, Copilot',p:`Je joins un fichier [EXCEL / CSV] contenant [DESCRIPTION DES DONNÉES].
1. Décris la structure (colonnes, types, lignes, valeurs manquantes).
2. Calcule les indicateurs clés : [INDICATEURS].
3. Repère les anomalies et valeurs aberrantes.
4. Propose 3 graphiques utiles et crée-les.
5. Résume les enseignements en 5 points.
Exécute les calculs avec du code, ne les estime pas.`},
{c:'excel',t:'Concevoir un tableau de suivi',ia:'Claude, ChatGPT',p:`Conçois un tableau Excel de suivi de [SUJET, ex. dépenses du foyer par mois].
Besoins : [CE QUE JE VEUX SUIVRE].
Livre : la liste des colonnes avec leur type et un exemple, les formules de calcul, les mises en forme conditionnelles utiles, un onglet de synthèse. Si tu peux créer le fichier, crée-le.`},
{c:'excel',t:'Macro VBA ou script',ia:'ChatGPT, Claude',p:`Écris une macro VBA pour Excel qui [ACTION, ex. copie chaque ligne où la colonne D vaut "Terminé" dans l'onglet Archive].
Contraintes : code commenté en français, gestion des erreurs, aucune suppression de données sans confirmation. Explique comment l'installer et la lancer, et comment la tester sur une copie du fichier.`},
/* --- Apprendre --- */
{c:'apprendre',t:'Professeur particulier sur n\'importe quel sujet',ia:'Toutes',p:`Tu es un formateur patient et exigeant. Je veux apprendre : [SUJET].
Mon niveau : [NIVEAU]. Mon objectif : [OBJECTIF]. Temps disponible : [TEMPS PAR JOUR].
1. Pose-moi 3 questions pour évaluer mon niveau réel.
2. Ensuite, propose un programme progressif.
3. Enseigne une notion à la fois, avec un exemple concret tiré de [MON MÉTIER], puis vérifie que j'ai compris par une question avant de passer à la suite.
Si je me trompe, dis-le clairement et explique pourquoi.`},
{c:'apprendre',t:'Expliquer simplement',ia:'Toutes',p:`Explique [NOTION] en trois niveaux :
1. Pour un enfant de 12 ans.
2. Pour un adulte non spécialiste.
3. Pour un professionnel du domaine.
Donne ensuite une analogie avec la vie de tous les jours et une erreur fréquente de compréhension.`},
{c:'apprendre',t:'Quiz d\'entraînement',ia:'Toutes',p:`Fais-moi passer un quiz de [NOMBRE] questions sur [SUJET], niveau [NIVEAU].
Une question à la fois, à choix multiples. Attends ma réponse, corrige-moi avec une explication, puis passe à la suivante. À la fin, donne mon score et les notions à revoir.`},
{c:'apprendre',t:'Fiches de révision',ia:'Toutes, NotebookLM',p:`À partir de ce cours :
"""
[CONTENU DU COURS]
"""
Crée 15 fiches question / réponse pour réviser, des plus simples aux plus difficiles. Ajoute une fiche « pièges à éviter ».`},
{c:'apprendre',t:'Préparer un examen ou une certification',ia:'Toutes',p:`Je prépare [EXAMEN / CERTIFICATION, ex. permis de conduire, TOEIC, concours] pour le [DATE].
Programme officiel : [COLLE OU DÉCRIS]. Mes points faibles : [POINTS].
Construis un planning de révision semaine par semaine, avec des exercices et des tests blancs. Indique quelles informations je dois vérifier dans les documents officiels.`},
/* --- Management --- */
{c:'manager',t:'Préparer un entretien difficile',ia:'Claude, ChatGPT',p:`Je dois avoir un entretien avec un membre de mon équipe à propos de [SITUATION, sans nom].
Objectif : [OBJECTIF]. Ce que je crains : [CRAINTE].
Prépare : l'introduction, les faits à présenter (méthode faits / impact / attente), les questions ouvertes à poser, les réactions possibles et comment y répondre, la conclusion avec engagement. Puis joue le rôle de la personne pour que je m'entraîne, une réplique à la fois.`},
{c:'manager',t:'Fiche de poste',ia:'Toutes',p:`Rédige une fiche de poste pour : [POSTE, ex. assistant commercial].
Contexte : [ENTREPRISE, ÉQUIPE, LIEU].
Structure : mission principale, activités, compétences techniques, savoir-être, conditions de travail, habilitations requises. Langage simple, non discriminant.`},
{c:'manager',t:'Organiser le planning de l\'équipe',ia:'Claude, ChatGPT',p:`Aide-moi à organiser le planning de la semaine.
Équipe : [EFFECTIF ET COMPÉTENCES, sans noms].
Tâches et projets : [LISTE AVEC DURÉES ET BESOINS].
Contraintes : [CONGÉS, MATÉRIEL, MÉTÉO, PRIORITÉS].
Propose un planning en tableau jour par jour, signale les conflits et les risques, et propose une alternative si une tâche prend une journée de retard.`},
{c:'manager',t:'Message de reconnaissance',ia:'Toutes',p:`Rédige un message de remerciement à l'équipe pour [RÉALISATION]. Points concrets à mentionner : [DÉTAILS]. Ton sincère, sans formules creuses, 100 mots. Version écrite et version à dire à l'oral.`},
/* --- Recherche --- */
{c:'recherche',t:'Recherche sourcée et vérifiable',ia:'Perplexity, ChatGPT, Gemini, Claude',p:`Recherche : [QUESTION PRÉCISE].
Période : [PÉRIODE]. Pays : [PAYS].
Sources acceptées : officielles, professionnelles, scientifiques. Exclues : forums, blogs anonymes.
Pour chaque affirmation : la source, sa date et le lien. Sépare clairement ce qui est établi, ce qui est débattu et ce que tu n'as pas trouvé. Termine par les 3 sources les plus fiables.`},
{c:'recherche',t:'Vérifier une information (fact-checking)',ia:'Perplexity, Claude, ChatGPT',p:`Vérifie cette affirmation : « [AFFIRMATION] ».
1. Est-elle vraie, fausse, partiellement vraie ou invérifiable ?
2. Quelles sources la confirment ou l'infirment ?
3. D'où vient-elle probablement ?
4. Quel est le niveau de confiance de ta conclusion ?
Ne conclus pas sans source.`},
{c:'recherche',t:'Veille sur un sujet',ia:'Perplexity, ChatGPT (tâches planifiées)',p:`Fais une veille sur [SUJET, ex. les nouveaux modèles d'IA] pour les [PÉRIODE].
Classe les informations : réglementation, technique, marché, entreprises. Pour chacune : titre, date, source avec lien, résumé en 2 lignes, ce que ça change concrètement pour moi.`},
/* --- Image & vidéo --- */
{c:'image',t:'Affiche d\'événement',ia:'GPT Image, Ideogram, Canva',p:`Crée une affiche verticale au format A3 (ratio 3:4) pour [ÉVÉNEMENT].
Texte exact à afficher : « [TITRE] » et « [DATE, HEURE, LIEU] ».
Style : [STYLE, ex. graphique et moderne], lisible de loin, couleurs [COULEURS], une illustration simple en rapport avec le thème, aucun logo de marque.
Le texte doit être parfaitement orthographié et centré.`},
{c:'image',t:'Image réaliste pour une présentation',ia:'Midjourney, GPT Image, Gemini',p:`Photographie réaliste de [SUJET, ex. une rue de Paris sous la pluie, la nuit], [ACTION], dans [LIEU], [MOMENT DE LA JOURNÉE ET LUMIÈRE], plan [LARGE / MOYEN / RAPPROCHÉ], angle [AU SOL / EN HAUTEUR], ambiance [AMBIANCE], couleurs naturelles, aucune personne reconnaissable, aucun texte. Format 16:9.`},
{c:'image',t:'Retoucher une photo existante',ia:'Gemini, GPT Image, Firefly',p:`À partir de la photo jointe, [MODIFICATION, ex. retire le cône au premier plan / éclaircis le ciel]. Ne modifie rien d'autre : même cadrage, mêmes couleurs, mêmes personnes. N'utilise jamais ce type de retouche pour un document de preuve (constat, état des lieux).`},
{c:'image',t:'Schéma explicatif',ia:'Claude, ChatGPT, Napkin',p:`Crée un schéma clair qui explique [PROCESSUS, ex. le fonctionnement d'un modèle d'IA].
Format : étapes numérotées de gauche à droite, une icône simple par étape, un texte de 5 mots maximum par étape. Si tu ne peux pas générer d'image, produis-le en SVG ou en diagramme.`},
{c:'image',t:'Script de vidéo de formation',ia:'Toutes',p:`Écris le script d'une vidéo de formation de [DURÉE] minutes sur [SUJET], pour [PUBLIC].
Format en tableau : temps / ce qu'on voit à l'écran / ce que dit la voix / texte affiché. Phrases courtes, un message par séquence, un résumé final. Prévois un plan adapté à un avatar ou à des images d'illustration.`},
/* --- Code --- */
{c:'code',t:'Créer une petite application web',ia:'Claude, ChatGPT, Cursor',p:`Crée une page HTML unique (HTML, CSS et JavaScript dans le même fichier, sans dépendance externe) qui [FONCTION, ex. calcule le coût d'un trajet en voiture].
Champs : [CHAMPS]. Résultat : [RÉSULTAT ATTENDU].
Contraintes : utilisable sur téléphone, interface en français, couleurs sombre et orange, calculs vérifiés, messages d'erreur clairs si un champ est vide. Explique comment l'ouvrir et la tester.`},
{c:'code',t:'Comprendre et corriger un bug',ia:'Claude, ChatGPT, Cursor',p:`Voici un code qui ne fonctionne pas :
\`\`\`
[CODE]
\`\`\`
Message d'erreur : [ERREUR]. Comportement attendu : [ATTENDU]. Comportement observé : [OBSERVÉ].
1. Explique la cause du problème simplement.
2. Donne la correction minimale.
3. Explique comment vérifier que c'est corrigé.`},
{c:'code',t:'Automatiser une tâche répétitive',ia:'ChatGPT, Claude, Copilot',p:`Chaque [FRÉQUENCE], je fais à la main : [DÉCRIS LA TÂCHE ÉTAPE PAR ÉTAPE].
Outils disponibles : [Excel, Outlook, Teams, Power Automate, Python…].
Propose la meilleure façon d'automatiser cette tâche, du plus simple au plus avancé, avec pour chaque option : effort de mise en place, gain de temps, risques. Puis détaille pas à pas l'option recommandée.`},
{c:'code',t:'Message de commit et description de PR',ia:'Claude, ChatGPT, Copilot',p:`Voici les modifications que j'ai faites :
"""
[DIFF OU DESCRIPTION DES CHANGEMENTS]
"""
Rédige : un message de commit (titre de 60 caractères maximum à l'impératif, puis corps qui explique pourquoi), et une description de pull request avec : résumé, changements, comment tester.`},
/* --- Décision --- */
{c:'decision',t:'Prendre une décision difficile',ia:'Claude, ChatGPT',p:`Je dois décider : [DÉCISION].
Options : [OPTIONS]. Critères importants pour moi : [CRITÈRES]. Contraintes : [BUDGET, DÉLAI…].
1. Tableau des options selon chaque critère.
2. Les risques et ce qui peut mal tourner pour chaque option.
3. Ta recommandation tranchée et pourquoi.
4. Ce qui te ferait changer d'avis.
Ne cherche pas à me donner raison : si mon raisonnement a une faille, dis-le.`},
{c:'decision',t:'Avocat du diable',ia:'Toutes',p:`Voici mon plan : [PLAN].
Joue l'avocat du diable : trouve les 7 meilleures objections, les hypothèses fragiles et les angles morts. Pour chaque faille, propose une parade. Termine par une note de solidité du plan sur 10.`},
{c:'decision',t:'Préparer une négociation',ia:'Claude, ChatGPT',p:`Je négocie avec [INTERLOCUTEUR] à propos de [SUJET].
Mon objectif idéal : [OBJECTIF]. Mon minimum acceptable : [SEUIL]. Ce que je sais de l'autre partie : [INFOS].
Prépare : mes arguments classés, ses arguments probables et mes réponses, les concessions possibles par ordre, ma solution de repli. Puis simule la négociation en jouant l'autre partie.`},
/* --- Perso --- */
{c:'perso',t:'CV adapté à une offre',ia:'Claude, ChatGPT',p:`Voici mon CV :
"""
[CV]
"""
Et l'offre visée :
"""
[OFFRE]
"""
1. Évalue l'adéquation sur 10 et explique.
2. Réécris les expériences pour mettre en avant ce que cherche l'offre, sans rien inventer.
3. Liste les mots-clés de l'offre absents de mon CV.
4. Propose un titre et une accroche de 3 lignes.`},
{c:'perso',t:'Préparer un entretien d\'embauche',ia:'Toutes',p:`Je passe un entretien pour le poste de [POSTE] chez [TYPE D'ENTREPRISE].
Mon parcours : [RÉSUMÉ].
Pose-moi les 10 questions les plus probables, une à la fois. Après chaque réponse, évalue-la (clarté, exemples, impact), et propose une version améliorée. Sois exigeant.`},
{c:'perso',t:'Organiser son temps',ia:'Toutes',p:`Voici tout ce que j'ai à faire cette semaine :
"""
[LISTE EN VRAC]
"""
Mes contraintes : [HORAIRES, RENDEZ-VOUS]. Classe les tâches (urgent / important), estime leur durée, et propose un planning réaliste jour par jour avec des marges. Dis-moi ce que je devrais déléguer ou abandonner.`},
{c:'perso',t:'Écrire une lettre administrative',ia:'Toutes',p:`Rédige une lettre à [ORGANISME] pour [OBJET].
Mes informations : [ÉLÉMENTS UTILES, sans numéro sensible].
Format : lettre formelle avec objet, références, exposé des faits, demande précise, pièces jointes, formule de politesse. Indique si cette démarche nécessite un envoi en recommandé.`}
];
