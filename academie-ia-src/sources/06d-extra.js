/* ====== QUIZ ET GLOSSAIRE : créer des programmes ====== */
QUIZ.splice(QUIZ.length - 1, 0,
{q:"Quelle est la règle d'or pour réussir un programme ?",o:["Tout prévoir avant d'écrire une ligne","Commencer petit et terminer","Choisir le langage le plus difficile","Ne jamais tester"],a:1,e:"Un petit programme fini vaut mieux que dix gros projets abandonnés."},
{q:"Quelle technologie permet de faire une application Android et iPhone avec un seul code ?",o:["Flutter ou React Native","VBA","Bash","SQL"],a:0,e:"Flutter (Dart) et React Native (JavaScript) ciblent les deux systèmes."},
{q:"Quel outil transforme un programme Python en .exe ?",o:["PyInstaller","Photoshop","Git","Docker"],a:0,e:"pyinstaller --onefile crée un exécutable autonome."},
{q:"Combien coûte le programme développeur d'Apple pour publier sur l'App Store ?",o:["Gratuit","25 $ une fois","99 $ par an","1 000 $"],a:2,e:"Google Play demande une inscription unique de 25 $."},
{q:"Quel format utilisent les extensions de Chrome et Edge ?",o:["Manifest V3","GGUF","MP3","DOCX"],a:0,e:"Le Manifest V2 a été abandonné au profit du V3."},
{q:"Pour une application web, où doit se trouver la logique sensible et les clés secrètes ?",o:["Dans le front-end","Dans le back-end","Dans le titre de la page","Dans une image"],a:1,e:"Tout ce qui est dans le navigateur peut être lu et modifié par l'utilisateur."},
{q:"Quelle carte est un vrai petit ordinateur sous Linux ?",o:["Arduino","ESP32","Raspberry Pi","Clé USB"],a:2,e:"Arduino et ESP32 sont des microcontrôleurs, plus simples."},
{q:"Pourquoi Windows affiche-t-il « Windows a protégé votre ordinateur » au lancement d'un programme maison ?",o:["Le programme est forcément un virus","Le programme n'est pas signé numériquement","L'ordinateur est trop vieux","Il manque Internet"],a:1,e:"Un certificat de signature de code fait disparaître cet avertissement pour les programmes diffusés."}
);
GLOSS.push(
["Back-end","Partie d'une application qui tourne sur un serveur : logique, base de données, clés secrètes."],
["Bibliothèque","Code réutilisable écrit par d'autres, qu'on ajoute à son projet."],
["Compilateur","Programme qui traduit le code source en programme exécutable (C, C++, Rust, Go)."],
["Conteneur","Paquet qui contient une application et tout ce dont elle a besoin pour tourner partout de la même façon (Docker)."],
["Dépendance","Bibliothèque dont un projet a besoin pour fonctionner."],
["Exécutable","Fichier programme qu'on lance directement, comme un .exe sous Windows."],
["Framework","Cadre de travail qui fournit une structure et des outils pour construire un type de programme (React, Django, Flutter)."],
["Front-end","Partie d'une application que voit l'utilisateur, dans le navigateur ou l'application."],
["IDE","Environnement de développement : éditeur de code avec outils intégrés (VS Code, Cursor, JetBrains)."],
["Interpréteur","Programme qui exécute le code ligne par ligne sans le compiler à l'avance (Python, JavaScript)."],
["Manifest V3","Format actuel des extensions de navigateur Chrome, Edge et Firefox."],
["Microcontrôleur","Petit processeur programmable qui pilote des capteurs et des moteurs (Arduino, ESP32)."],
["PWA","Progressive Web App : site web installable comme une application, utilisable hors connexion."],
["SDK","Kit de développement : bibliothèques et outils fournis pour programmer avec une plateforme ou une API."],
["Signature de code","Certificat numérique qui prouve l'auteur d'un programme et qu'il n'a pas été modifié."]
);
