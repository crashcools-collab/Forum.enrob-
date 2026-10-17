/* ====== QUIZ ET GLOSSAIRE : compléments ====== */
QUIZ.splice(QUIZ.length - 1, 0,
{q:"En quelle année le terme « intelligence artificielle » est-il apparu ?",o:["1943","1956","1997","2012"],a:1,e:"À la conférence de Dartmouth, organisée notamment par John McCarthy et Marvin Minsky."},
{q:"Quel événement de 2012 a lancé la révolution actuelle de l'apprentissage profond ?",o:["Deep Blue","AlexNet gagne ImageNet","La sortie de Siri","ChatGPT"],a:1,e:"Un réseau profond entraîné sur GPU écrase la concurrence en reconnaissance d'images."},
{q:"Que fait le mécanisme d'attention d'un Transformer ?",o:["Il surveille l'utilisateur","Il relie chaque mot aux autres mots pertinents du texte","Il compresse les images","Il bloque les contenus dangereux"],a:1,e:"C'est l'idée centrale de l'article de 2017 « Attention Is All You Need »."},
{q:"Pour apprendre de nouvelles connaissances à un assistant, quelle méthode essayer en premier ?",o:["Le fine-tuning","Les instructions et les documents joints, puis le RAG","Réentraîner le modèle de zéro","Changer de modèle"],a:1,e:"Le fine-tuning sert surtout à imposer un style ou un format, pas à apprendre des faits."},
{q:"Qu'est-ce qu'un serveur MCP ?",o:["Un serveur de jeux","Un programme qui expose des outils et des données à un agent d'IA","Un antivirus","Une carte graphique"],a:1,e:"MCP est le standard ouvert qui relie les agents aux outils, géré par la Linux Foundation depuis décembre 2025."},
{q:"Dans une automatisation, à quoi sert un déclencheur ?",o:["À arrêter le flux","À lancer le flux quand un événement se produit","À payer l'abonnement","À traduire"],a:1,e:"Un nouveau mail, un formulaire, une heure précise : c'est le point de départ."},
{q:"Où doit se trouver la clé API d'un site qui utilise une IA ?",o:["Dans le code HTML visible","Dans une fonction côté serveur, en variable d'environnement","Dans le titre de la page","Dans un commentaire"],a:1,e:"Tout ce qui est dans le navigateur peut être lu par n'importe qui."},
{q:"Quelle est la mesure la plus efficace pour protéger son PC ?",o:["Changer de fond d'écran","Les mises à jour automatiques","Éteindre le Wi-Fi","Installer plusieurs antivirus"],a:1,e:"La plupart des attaques exploitent des failles déjà corrigées par les mises à jour."},
{q:"Tester la sécurité d'un site sans autorisation, c'est :",o:["Légal si on ne casse rien","Un délit puni par le Code pénal","Recommandé","Obligatoire pour apprendre"],a:1,e:"La sécurité offensive s'apprend sur des plateformes prévues pour (Root-Me, TryHackMe) ou dans un cadre contractuel."},
{q:"Quel moteur de jeu est entièrement gratuit et open source ?",o:["Unreal Engine","Unity","Godot","RPG Maker"],a:2,e:"Godot est libre et gratuit, idéal pour débuter en 2D comme en 3D."},
{q:"Quelle couche se trouve tout en bas de la pile de l'IA ?",o:["Les applications","Les agents","Les puces (GPU, TPU)","Les API"],a:2,e:"Tout repose sur le matériel : Nvidia, TSMC, ASML, la mémoire HBM."}
);
GLOSS.push(
["A2A","Agent2Agent : protocole lancé par Google en 2025 pour faire dialoguer des agents de fournisseurs différents."],
["CUDA","Plateforme logicielle de Nvidia (2006) pour programmer les GPU ; l'une des raisons de sa domination."],
["DPO","Direct Preference Optimization : méthode d'alignement par préférences, plus simple que le RLHF."],
["EDR","Logiciel de sécurité qui surveille le comportement des ordinateurs et détecte les attaques, au-delà de l'antivirus classique."],
["Hameçonnage","Phishing : faux message qui pousse à cliquer, donner un mot de passe ou payer."],
["Inférence","Le fait d'utiliser un modèle déjà entraîné pour produire une réponse, par opposition à l'entraînement."],
["LoRA","Méthode d'affinage qui n'entraîne que de petites matrices ajoutées au modèle : rapide et peu coûteuse."],
["Mélange d'experts (MoE)","Architecture où seule une partie du modèle s'active pour chaque token : très grand mais rapide."],
["Moteur de jeu","Logiciel qui fournit le rendu, la physique, le son et les outils pour créer un jeu : Godot, Unity, Unreal."],
["Pentest","Test d'intrusion : attaque autorisée par contrat pour trouver les failles d'un système."],
["PNJ","Personnage non joueur d'un jeu vidéo, parfois animé par un modèle de langage."],
["Rançongiciel","Logiciel malveillant qui chiffre les fichiers et réclame une rançon."],
["RLHF","Apprentissage par renforcement avec retour humain : les préférences de personnes guident le modèle."],
["Softmax","Fonction qui transforme des scores en probabilités totalisant 100 %."],
["TPU","Tensor Processing Unit : puce spécialisée de Google pour l'IA."],
["Webhook","Adresse web qu'une application appelle pour déclencher automatiquement une action."],
["Zéro confiance","Approche de sécurité où aucun accès n'est accordé par défaut, même à l'intérieur du réseau."]
);
