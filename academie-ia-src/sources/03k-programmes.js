/* ====== FILIÈRE : créer toute sorte de programme ====== */
COURS.push(
{
id:'creerprog', n:'Créer n\'importe quel programme avec l\'IA', by:'La méthode universelle', cat:'programmes', lvl:'Novice → expert', dur:'3 h',
pitch:"La méthode qui marche pour tout programme : définir le besoin, choisir la bonne technologie, construire avec un agent, tester, empaqueter, distribuer et maintenir. Avec le tableau géant « quel programme, quelle technologie ».",
ch:[
{t:"La méthode universelle en 8 étapes", h:`
<ol class="steps">
<li><b>Le besoin</b> : qui va utiliser le programme, pour faire quoi, sur quel appareil (PC, téléphone, navigateur, serveur, objet).</li>
<li><b>Le cahier des charges</b> : la liste des fonctions, classées en « indispensable », « utile », « plus tard ».</li>
<li><b>Le choix de la technologie</b> : selon l'appareil cible et ton niveau (voir le tableau du chapitre suivant).</li>
<li><b>Le prototype</b> : une première version minuscule qui fait une seule chose, construite avec l'IA en une heure.</li>
<li><b>Le développement par petites étapes</b> : une fonction à la fois, testée, puis enregistrée dans Git.</li>
<li><b>Les tests</b> : vérifier chaque fonction, les cas limites, les erreurs ; demander à l'IA d'écrire des tests automatiques.</li>
<li><b>L'empaquetage et la distribution</b> : transformer le code en programme installable (exécutable, application, extension, site en ligne).</li>
<li><b>La maintenance</b> : corriger les bugs, mettre à jour les dépendances, écouter les utilisateurs.</li>
</ol>
<div class="callout ok"><b>La règle d'or :</b> commence petit et termine. Un petit programme fini vaut mieux que dix gros projets abandonnés.</div>`},
{t:"Quel programme, quelle technologie", h:`
<div class="tbl-wrap"><table><thead><tr><th>Tu veux créer…</th><th>Technologies conseillées</th><th>Difficulté</th></tr></thead><tbody>
<tr><td>Un petit outil dans le navigateur (calculatrice, convertisseur, jeu simple)</td><td>Une page HTML, CSS et JavaScript</td><td>Novice</td></tr>
<tr><td>Un script qui automatise une tâche sur ton PC</td><td>Python, PowerShell (Windows), Bash (Mac, Linux), .bat pour les lancements simples</td><td>Débutant</td></tr>
<tr><td>Un site vitrine</td><td>HTML et CSS, ou un générateur de site ; hébergement GitHub Pages</td><td>Débutant</td></tr>
<tr><td>Une application web avec comptes et données</td><td>React ou Next.js + Supabase, ou Python (FastAPI, Django) + PostgreSQL</td><td>Apprenant à affirmé</td></tr>
<tr><td>Un logiciel de bureau (Windows, Mac, Linux)</td><td>Electron ou Tauri (technologies web), Python avec PySide ou Tkinter, C# avec .NET</td><td>Apprenant</td></tr>
<tr><td>Une application mobile</td><td>Flutter ou React Native (Expo) pour Android et iPhone ; Kotlin (Android) ou Swift (iPhone) en natif ; PWA pour commencer</td><td>Apprenant à affirmé</td></tr>
<tr><td>Une extension de navigateur</td><td>JavaScript avec le format Manifest V3 (Chrome, Edge, Firefox)</td><td>Débutant à apprenant</td></tr>
<tr><td>Un bot (Discord, Telegram)</td><td>Python ou JavaScript avec la bibliothèque de la plateforme</td><td>Débutant à apprenant</td></tr>
<tr><td>Un outil en ligne de commande</td><td>Python, Go ou Rust</td><td>Apprenant</td></tr>
<tr><td>Une API pour d'autres programmes</td><td>Python (FastAPI), Node.js, Go</td><td>Affirmé</td></tr>
<tr><td>Un jeu vidéo</td><td>Godot, Unity, Unreal, Phaser (voir le cours dédié)</td><td>Débutant à expert</td></tr>
<tr><td>Un programme pour objet connecté</td><td>Arduino (C++), MicroPython sur ESP32, Python sur Raspberry Pi</td><td>Apprenant</td></tr>
<tr><td>Un agent ou une application d'IA</td><td>Python ou TypeScript avec les SDK d'IA, MCP (voir les cours dédiés)</td><td>Affirmé</td></tr>
<tr><td>Un logiciel très performant (moteur, système, temps réel)</td><td>C, C++, Rust</td><td>Expert</td></tr>
</tbody></table></div>`},
{t:"Les langages de programmation, lequel pour quoi", h:`
<div class="tbl-wrap"><table><thead><tr><th>Langage</th><th>Points forts</th><th>Utilisé pour</th></tr></thead><tbody>
<tr><td><b>Python</b></td><td>Lisible, énorme écosystème, idéal pour débuter</td><td>IA, données, scripts, automatisation, back-end</td></tr>
<tr><td><b>JavaScript / TypeScript</b></td><td>Le langage du navigateur ; TypeScript ajoute la vérification des types</td><td>Sites, applications web, extensions, bureau (Electron), mobile (React Native)</td></tr>
<tr><td><b>C#</b></td><td>Complet, bien outillé par Microsoft</td><td>Logiciels Windows, jeux Unity, back-end</td></tr>
<tr><td><b>Java / Kotlin</b></td><td>Robustes, très répandus en entreprise</td><td>Android, back-end d'entreprise</td></tr>
<tr><td><b>Swift</b></td><td>Moderne, conçu par Apple</td><td>iPhone, iPad, Mac</td></tr>
<tr><td><b>Dart</b></td><td>Le langage de Flutter</td><td>Applications mobiles et bureau multiplateformes</td></tr>
<tr><td><b>Go</b></td><td>Simple, rapide, excellent pour les serveurs</td><td>API, outils en ligne de commande, cloud</td></tr>
<tr><td><b>Rust</b></td><td>Très rapide et sûr pour la mémoire</td><td>Logiciels système, outils performants, Tauri</td></tr>
<tr><td><b>C / C++</b></td><td>Contrôle total et vitesse maximale</td><td>Systèmes, jeux (Unreal), électronique, moteurs</td></tr>
<tr><td><b>SQL</b></td><td>Le langage des bases de données</td><td>Stocker et interroger des données</td></tr>
<tr><td><b>PowerShell / Bash</b></td><td>Piloter le système</td><td>Scripts d'administration et d'automatisation</td></tr>
</tbody></table></div>
<p>Avec l'IA, le langage compte moins qu'avant pour écrire du code. Il compte toujours pour <b>lire</b>, <b>comprendre</b> et <b>corriger</b> ce que l'IA produit. Commence par Python ou JavaScript.</p>`},
{t:"Écrire un cahier des charges que l'IA comprend", h:`
<pre class="prompt">Je veux créer [TYPE DE PROGRAMME] pour [QUI] afin de [OBJECTIF].
Il doit fonctionner sur [APPAREILS / SYSTÈMES].

Fonctions indispensables :
1. [FONCTION]
2. [FONCTION]
Fonctions pour plus tard : [LISTE]

Contraintes : [hors ligne, gratuit, données sur l'appareil, langue française, accessibilité…]
Mon niveau : [débutant / intermédiaire / expert].

Avant d'écrire du code :
1. Propose la technologie la plus adaptée et explique pourquoi, avec une alternative.
2. Décris l'architecture (fichiers, composants, données).
3. Découpe le travail en étapes testables.
Attends ma validation avant de coder.</pre>
<p>Ce prompt marche avec Claude, ChatGPT, Gemini, et dans les agents de code (Claude Code, Codex, Cursor, Copilot). En mode plan, l'agent explore puis propose sans rien modifier.</p>`},
{t:"Construire avec un agent de code", h:`
<ol class="steps">
<li>Crée un dossier de projet et un dépôt Git dès le départ.</li>
<li>Écris un fichier d'instructions pour l'agent (<code>CLAUDE.md</code>, <code>AGENTS.md</code> ou règles Cursor) : technologie, commandes, conventions, interdits.</li>
<li>Demande une étape à la fois : « Crée la structure du projet et une fenêtre vide qui s'ouvre », puis « ajoute la liste », etc.</li>
<li>Après chaque étape : lance le programme, vérifie, puis fais un commit.</li>
<li>Si quelque chose casse : colle le message d'erreur exact et décris ce que tu attendais.</li>
<li>Demande régulièrement : « Relis le projet et propose des améliorations de structure, de sécurité et de lisibilité. »</li>
</ol>`},
{t:"Tester et déboguer", h:`
<ul class="clean">
<li><b>Tests unitaires</b> : vérifient chaque fonction séparément (pytest en Python, Vitest ou Jest en JavaScript, xUnit en C#).</li>
<li><b>Tests de bout en bout</b> : simulent un vrai utilisateur (Playwright pour le web).</li>
<li><b>Débogueur</b> : met le programme en pause ligne par ligne pour voir les valeurs (intégré à VS Code).</li>
<li><b>Journaux</b> : afficher ce que fait le programme aide à comprendre un bug.</li>
<li><b>Méthode</b> : reproduire le bug, isoler la cause, corriger, ajouter un test pour qu'il ne revienne jamais.</li>
</ul>
<pre class="prompt">Voici une erreur :
"""[MESSAGE D'ERREUR COMPLET]"""
Ce que je faisais : [ACTION]. Ce que j'attendais : [RÉSULTAT].
Explique la cause, propose la correction minimale et un test qui vérifie la correction.</pre>`},
{t:"Empaqueter et distribuer", h:`
<div class="tbl-wrap"><table><thead><tr><th>Type</th><th>Comment le distribuer</th></tr></thead><tbody>
<tr><td>Page ou site web</td><td>GitHub Pages, Netlify, Vercel, Cloudflare Pages</td></tr>
<tr><td>Script</td><td>Un fichier à partager, avec un mode d'emploi ; ou un exécutable</td></tr>
<tr><td>Logiciel de bureau</td><td>Un installateur (.exe, .msi sous Windows, .dmg sous Mac), le Microsoft Store, le Mac App Store</td></tr>
<tr><td>Application mobile</td><td>Google Play (inscription unique de 25 $), App Store (programme développeur Apple à 99 $ par an), ou PWA sans store</td></tr>
<tr><td>Extension</td><td>Chrome Web Store, boutique d'extensions d'Edge et de Firefox, marketplace de VS Code</td></tr>
<tr><td>Outil pour développeurs</td><td>PyPI (Python), npm (JavaScript), GitHub Releases</td></tr>
</tbody></table></div>
<div class="callout">Un programme Windows non signé déclenche l'avertissement « Windows a protégé votre ordinateur ». Pour le diffuser largement, il faut un certificat de signature de code.</div>`},
{t:"Maintenir et faire évoluer", h:`
<ul class="clean">
<li>Numérote les versions (1.0, 1.1, 2.0) et tiens un journal des changements.</li>
<li>Mets à jour les dépendances régulièrement : beaucoup de failles viennent de bibliothèques anciennes (Dependabot le signale sur GitHub).</li>
<li>Recueille les retours des utilisateurs et classe-les par priorité.</li>
<li>Garde les sauvegardes et l'historique Git : on peut toujours revenir en arrière.</li>
<li>Documente : un README clair, et des commentaires sur ce qui n'est pas évident.</li>
</ul>
<div class="ex"><b class="t">Projet</b><p>Choisis un programme dont tu as vraiment besoin. Écris son cahier des charges avec le prompt du chapitre 4, fais choisir la technologie à l'IA, construis le prototype en une soirée, puis termine la version 1.0 en suivant les 8 étapes.</p></div>`}
]},
{
id:'scripts', n:'Scripts et automatisations sur ton PC', by:'.bat, PowerShell, Python, Bash', cat:'programmes', lvl:'Novice → apprenant', dur:'2 h',
pitch:"Les petits programmes qui font gagner des heures : renommer des fichiers, trier des dossiers, sauvegarder, lancer des applications, avec .bat, PowerShell, Python et Bash, et les planifier.",
ch:[
{t:"Quel langage de script choisir", h:`
<div class="tbl-wrap"><table><thead><tr><th>Langage</th><th>Système</th><th>Idéal pour</th></tr></thead><tbody>
<tr><td><b>.bat</b> (invite de commandes)</td><td>Windows</td><td>Lancer des programmes, des menus simples, copier des fichiers</td></tr>
<tr><td><b>PowerShell</b></td><td>Windows (et aussi Mac, Linux)</td><td>Administration de Windows, fichiers, réseau, Microsoft 365 ; bien plus puissant que .bat</td></tr>
<tr><td><b>Python</b></td><td>Tous</td><td>Tout le reste : fichiers, Excel, PDF, web, IA</td></tr>
<tr><td><b>Bash</b></td><td>Mac, Linux, serveurs</td><td>Commandes système, serveurs, conteneurs</td></tr>
</tbody></table></div>`},
{t:"Exemples prêts à adapter", h:`
<p><b>.bat</b> : sauvegarder un dossier avec la date</p>
<pre class="code">@echo off
set "JOUR=%date:~-4%-%date:~3,2%-%date:~0,2%"
robocopy "%USERPROFILE%\\Documents" "D:\\Sauvegardes\\%JOUR%" /E
echo Sauvegarde terminée.
pause</pre>
<p><b>PowerShell</b> : ranger les fichiers du dossier Téléchargements par extension</p>
<pre class="code">$source = "$env:USERPROFILE\\Downloads"
Get-ChildItem $source -File | ForEach-Object {
    $dossier = Join-Path $source ($_.Extension.TrimStart('.').ToUpper())
    New-Item -ItemType Directory -Force -Path $dossier | Out-Null
    Move-Item $_.FullName $dossier
}</pre>
<p><b>Python</b> : renommer des photos avec un numéro</p>
<pre class="code">from pathlib import Path
dossier = Path("photos")
for i, f in enumerate(sorted(dossier.glob("*.jpg")), start=1):
    f.rename(dossier / f"vacances_{i:03}.jpg")</pre>
<div class="callout warn">Teste toujours un script qui déplace ou supprime des fichiers sur une <b>copie</b> du dossier d'abord.</div>`},
{t:"Faire écrire ses scripts par l'IA", h:`
<pre class="prompt">Écris un script [PowerShell / Python / .bat / Bash] pour [SYSTÈME] qui [TÂCHE PRÉCISE].
Dossier concerné : [CHEMIN]. Règles : [ex. ne jamais supprimer, ignorer les fichiers cachés].
Ajoute :
- un mode « simulation » qui affiche ce qui serait fait sans rien modifier,
- des messages clairs en français,
- la gestion des erreurs.
Explique comment le lancer et comment le tester sans risque.</pre>`},
{t:"Planifier et lancer automatiquement", h:`
<ul class="clean">
<li><b>Windows</b> : le Planificateur de tâches (« Créer une tâche de base ») lance un script à heure fixe, au démarrage ou à l'ouverture de session.</li>
<li><b>Mac et Linux</b> : <code>cron</code> (commande <code>crontab -e</code>) ou les agents de lancement sur Mac.</li>
<li><b>Dans le cloud</b> : GitHub Actions avec <code>on: schedule</code>, sans laisser son PC allumé.</li>
<li><b>Raccourci</b> : un raccourci sur le bureau ou une touche du clavier pour lancer un script d'un clic.</li>
</ul>
<div class="ex"><b class="t">Exercice</b><p>Fais écrire par une IA un script qui range ton dossier Téléchargements par type de fichier, teste-le en mode simulation, puis planifie-le chaque vendredi.</p></div>`}
]},
{
id:'bureau', n:'Créer un logiciel de bureau', by:'Windows, Mac, Linux', cat:'programmes', lvl:'Apprenant → affirmé', dur:'2 h 30',
pitch:"Créer un vrai logiciel avec fenêtres, boutons et menus : choisir entre Electron, Tauri, Python ou .NET, construire avec l'IA, puis fabriquer un exécutable et un installateur.",
ch:[
{t:"Les grandes familles", h:`
<div class="tbl-wrap"><table><thead><tr><th>Technologie</th><th>Langage</th><th>Avantages</th><th>Inconvénients</th></tr></thead><tbody>
<tr><td><b>Electron</b></td><td>HTML, CSS, JavaScript</td><td>Une seule base pour Windows, Mac et Linux ; utilisé par VS Code, Discord, Slack</td><td>Programmes lourds (navigateur intégré)</td></tr>
<tr><td><b>Tauri</b></td><td>HTML, CSS, JavaScript + Rust</td><td>Très léger, sûr ; la version 2 vise aussi le mobile</td><td>Rust pour les fonctions avancées</td></tr>
<tr><td><b>Python + Tkinter</b></td><td>Python</td><td>Inclus avec Python, idéal pour de petits outils</td><td>Apparence datée</td></tr>
<tr><td><b>Python + PySide (Qt)</b></td><td>Python</td><td>Interfaces professionnelles, multiplateforme</td><td>Plus complexe</td></tr>
<tr><td><b>.NET (WPF, WinUI, MAUI)</b></td><td>C#</td><td>Logiciels Windows natifs ; MAUI vise aussi Mac et mobile</td><td>Surtout orienté Microsoft</td></tr>
<tr><td><b>Flutter</b></td><td>Dart</td><td>Bureau et mobile avec le même code</td><td>Écosystème bureau plus jeune</td></tr>
</tbody></table></div>`},
{t:"Un premier logiciel en Python", h:`
<pre class="code">import tkinter as tk

def convertir():
    try:
        euros = float(champ.get().replace(",", "."))
        resultat.config(text=f"{euros * 1.10:.2f} $")
    except ValueError:
        resultat.config(text="Entre un nombre")

fenetre = tk.Tk()
fenetre.title("Convertisseur")
champ = tk.Entry(fenetre, width=20)
champ.pack(padx=20, pady=10)
tk.Button(fenetre, text="Convertir", command=convertir).pack()
resultat = tk.Label(fenetre, text="")
resultat.pack(pady=10)
fenetre.mainloop()</pre>
<p>Demande ensuite à l'IA : « Transforme ce programme en version PySide avec un design moderne, un menu et une sauvegarde des préférences. »</p>`},
{t:"Fabriquer un exécutable et un installateur", h:`
<ul class="clean">
<li><b>Python</b> : <code>pip install pyinstaller</code> puis <code>pyinstaller --onefile --windowed mon_programme.py</code> crée un .exe autonome dans le dossier <code>dist</code>.</li>
<li><b>Electron</b> : Electron Forge ou electron-builder produisent les installateurs Windows, Mac et Linux.</li>
<li><b>Tauri</b> : <code>npm run tauri build</code> produit les installateurs natifs.</li>
<li><b>.NET</b> : publication en exécutable autonome ou empaquetage MSIX pour le Microsoft Store.</li>
<li><b>Installateur Windows</b> : Inno Setup ou les outils intégrés aux frameworks.</li>
</ul>
<div class="callout">Sans signature de code, Windows affiche un avertissement au premier lancement. C'est normal pour un programme personnel ; pour le diffuser, un certificat de signature est recommandé.</div>`},
{t:"Les bonnes pratiques", h:`
<ul class="clean">
<li>Sauvegarder les réglages et données dans les dossiers prévus par le système (AppData sous Windows), pas à côté du programme.</li>
<li>Gérer les erreurs avec des messages compréhensibles.</li>
<li>Prévoir les mises à jour (Electron et Tauri ont des modules de mise à jour automatique).</li>
<li>Tester sur un autre ordinateur que le sien avant de diffuser.</li>
</ul>
<div class="ex"><b class="t">Projet</b><p>Crée un petit logiciel de liste de tâches avec sauvegarde automatique, d'abord en Tkinter, puis fabrique son .exe avec PyInstaller et teste-le sur un autre PC.</p></div>`}
]},
{
id:'mobile', n:'Créer une application mobile', by:'Android et iPhone', cat:'programmes', lvl:'Apprenant → expert', dur:'3 h',
pitch:"Créer une application pour téléphone : PWA, Flutter, React Native avec Expo, ou natif en Kotlin et Swift ; tester sur son téléphone et publier sur Google Play et l'App Store.",
ch:[
{t:"Les quatre chemins", h:`
<div class="tbl-wrap"><table><thead><tr><th>Chemin</th><th>Pour qui</th><th>Avantages</th><th>Limites</th></tr></thead><tbody>
<tr><td><b>PWA</b> (site installable)</td><td>Débutant</td><td>Un site web qui s'installe comme une application, sans store ; cette Académie en est une</td><td>Accès limité à certaines fonctions du téléphone, surtout sur iPhone</td></tr>
<tr><td><b>Flutter</b> (Google, langage Dart)</td><td>Apprenant</td><td>Un seul code pour Android, iPhone, web et bureau ; interfaces très soignées</td><td>Un nouveau langage à apprendre</td></tr>
<tr><td><b>React Native avec Expo</b></td><td>Apprenant (qui connaît JavaScript)</td><td>JavaScript ou TypeScript, test instantané sur son téléphone avec l'application Expo Go</td><td>Certaines fonctions avancées demandent du code natif</td></tr>
<tr><td><b>Natif</b> : Kotlin (Android), Swift (iPhone)</td><td>Affirmé à expert</td><td>Performances et intégration maximales</td><td>Deux applications à écrire</td></tr>
</tbody></table></div>
<p>Des outils de création sans code ou assistés par IA permettent aussi de générer une application mobile en la décrivant, pour un prototype.</p>`},
{t:"Démarrer avec Expo", h:`
<pre class="code">npx create-expo-app@latest mon-app
cd mon-app
npx expo start      # scanne le QR code avec l'application Expo Go sur ton téléphone</pre>
<p>Chaque modification du code s'affiche immédiatement sur le téléphone. Demande à ton agent de code : « Ajoute un écran de liste avec ajout et suppression d'éléments, sauvegardés sur le téléphone. »</p>`},
{t:"Ce qu'une application doit gérer", h:`
<ul class="clean">
<li><b>Navigation</b> entre les écrans.</li>
<li><b>Stockage</b> sur le téléphone, et synchronisation avec un serveur si besoin (Supabase, Firebase).</li>
<li><b>Permissions</b> : caméra, position, notifications ; les demander seulement quand c'est nécessaire et expliquer pourquoi.</li>
<li><b>Hors connexion</b> : l'application doit rester utilisable sans réseau quand c'est possible.</li>
<li><b>Tailles d'écran</b> et mode sombre.</li>
</ul>`},
{t:"Publier sur les stores", h:`
<div class="tbl-wrap"><table><thead><tr><th></th><th>Google Play</th><th>App Store</th></tr></thead><tbody>
<tr><td>Compte développeur</td><td>Inscription unique de 25 $</td><td>Programme développeur Apple à 99 $ par an</td></tr>
<tr><td>Matériel</td><td>N'importe quel ordinateur</td><td>Un Mac est nécessaire pour la compilation native (des services cloud comme EAS d'Expo peuvent la faire)</td></tr>
<tr><td>Validation</td><td>Examen de l'application, tests obligatoires avec des testeurs pour les nouveaux comptes personnels</td><td>Examen manuel, règles strictes</td></tr>
<tr><td>À fournir</td><td colspan="2">Icône, captures d'écran, description, politique de confidentialité, déclaration des données collectées</td></tr>
</tbody></table></div>
<div class="ex"><b class="t">Projet</b><p>Crée avec Expo une application de suivi d'habitudes : liste, coche quotidienne, statistiques de la semaine. Teste-la une semaine sur ton propre téléphone avant d'envisager une publication.</p></div>`}
]},
{
id:'webapp', n:'Créer une application web complète', by:'Front, back, base de données, déploiement', cat:'programmes', lvl:'Apprenant → expert', dur:'3 h 30',
pitch:"Aller au-delà du site vitrine : interface React ou Next.js, serveur, base de données, comptes utilisateurs, paiements, sécurité et mise en production.",
ch:[
{t:"L'architecture d'une application web", h:`
<div class="tbl-wrap"><table><thead><tr><th>Couche</th><th>Rôle</th><th>Technologies courantes</th></tr></thead><tbody>
<tr><td><b>Front-end</b></td><td>Ce que voit l'utilisateur, dans le navigateur</td><td>React, Next.js, Vue, Svelte ; Tailwind CSS pour le style</td></tr>
<tr><td><b>Back-end</b></td><td>La logique, les règles, les calculs, les clés secrètes</td><td>Node.js, Python (FastAPI, Django), Go ; fonctions serverless</td></tr>
<tr><td><b>Base de données</b></td><td>Stocker les données</td><td>PostgreSQL, SQLite, MySQL ; Supabase et Firebase les proposent clés en main</td></tr>
<tr><td><b>Authentification</b></td><td>Les comptes et connexions</td><td>Supabase Auth, Firebase Auth, Auth.js, Clerk</td></tr>
<tr><td><b>Paiements</b></td><td>Encaisser de l'argent</td><td>Stripe, et d'autres prestataires de paiement</td></tr>
<tr><td><b>Hébergement</b></td><td>Faire tourner le tout en ligne</td><td>Vercel, Netlify, Render, Railway, Fly.io, ou un serveur avec Docker</td></tr>
</tbody></table></div>`},
{t:"Une pile simple et efficace pour démarrer", h:`
<ol class="steps">
<li><b>Next.js</b> pour l'interface et les fonctions serveur, dans un seul projet.</li>
<li><b>Supabase</b> pour la base PostgreSQL, les comptes et le stockage de fichiers.</li>
<li><b>Vercel</b> pour la mise en ligne à chaque commit sur GitHub.</li>
</ol>
<p>Les générateurs comme Lovable, Bolt ou v0 produisent souvent exactement ce type de projet ; on peut ensuite l'exporter sur GitHub et le faire évoluer avec Cursor, Claude Code ou Codex.</p>`},
{t:"Une API en Python avec FastAPI", h:`
<pre class="code">pip install fastapi uvicorn

# fichier main.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
taches = []

class Tache(BaseModel):
    titre: str
    faite: bool = False

@app.get("/taches")
def lister():
    return taches

@app.post("/taches")
def ajouter(t: Tache):
    taches.append(t)
    return t

# lancer : uvicorn main:app --reload
# documentation automatique : http://127.0.0.1:8000/docs</pre>`},
{t:"La sécurité, non négociable", h:`
<ul class="clean no">
<li>Ne jamais faire confiance aux données envoyées par le navigateur : tout vérifier côté serveur.</li>
<li>Ne jamais mettre une clé secrète dans le code du front-end.</li>
<li>Ne jamais stocker un mot de passe en clair (les services d'authentification s'en chargent).</li>
</ul>
<ul class="clean ok">
<li>Activer les règles d'accès de la base (Row Level Security dans Supabase).</li>
<li>Protéger contre les failles classiques (injection SQL, XSS) : voir l'OWASP Top 10 et le cours Cybersécurité.</li>
<li>Mettre à jour les dépendances, utiliser HTTPS, limiter le nombre de requêtes.</li>
<li>RGPD : informer sur les données collectées, permettre leur suppression.</li>
</ul>`},
{t:"Mettre en production", h:`
<ul class="clean">
<li>Variables d'environnement pour les clés, différentes en développement et en production.</li>
<li>Déploiement automatique à chaque commit sur la branche principale.</li>
<li>Sauvegardes de la base de données.</li>
<li>Surveillance des erreurs et des performances.</li>
<li><b>Docker</b> : empaquette l'application et tout ce dont elle a besoin dans un conteneur qui tourne partout de la même façon.</li>
</ul>
<div class="ex"><b class="t">Projet</b><p>Crée une application de réservation de créneaux : comptes utilisateurs, calendrier, confirmation par mail, tableau d'administration. Next.js + Supabase + Vercel, construite étape par étape avec un agent de code.</p></div>`}
]},
{
id:'extensions', n:'Extensions, plugins et bots', by:'Navigateur, VS Code, Office, Discord, Telegram', cat:'programmes', lvl:'Débutant → affirmé', dur:'2 h',
pitch:"Ajouter des super-pouvoirs aux logiciels existants : extensions de navigateur, extensions VS Code, compléments Office, bots Discord et Telegram, et outils pour les assistants d'IA.",
ch:[
{t:"Une extension de navigateur", h:`
<p>Les navigateurs basés sur Chromium (Chrome, Edge) et Firefox utilisent le format <b>Manifest V3</b>. Une extension minimale tient en deux fichiers :</p>
<pre class="code">// manifest.json
{
  "manifest_version": 3,
  "name": "Compteur de mots",
  "version": "1.0",
  "action": { "default_popup": "popup.html" },
  "permissions": ["activeTab", "scripting"]
}</pre>
<p>Ajoute un <code>popup.html</code> avec un bouton et un petit script, puis charge le dossier dans <code>chrome://extensions</code> (mode développeur → « Charger l'extension non empaquetée »). La publication sur le Chrome Web Store demande des frais d'inscription uniques de 5 $.</p>
<div class="callout warn">Demande le moins de permissions possible : une extension qui lit tous les sites est une cible idéale pour les pirates.</div>`},
{t:"Une extension pour VS Code", h:`
<pre class="code">npx --package yo --package generator-code -- yo code   # génère un projet d'extension
# ouvrir le dossier dans VS Code, puis F5 pour tester dans une fenêtre dédiée</pre>
<p>Les extensions VS Code s'écrivent en TypeScript et se publient sur la marketplace. Elles fonctionnent aussi dans les éditeurs dérivés comme Cursor.</p>`},
{t:"Compléments Office et scripts", h:`
<ul class="clean">
<li><b>Compléments Office</b> (Word, Excel, Outlook, PowerPoint) : des applications web intégrées dans un volet, en JavaScript.</li>
<li><b>VBA</b> : macros dans Excel et Word, pratiques pour automatiser un classeur.</li>
<li><b>Office Scripts</b> et <b>Apps Script</b> (Google) : automatiser les tableurs dans le cloud.</li>
</ul>`},
{t:"Des bots pour Discord et Telegram", h:`
<ul class="clean">
<li><b>Telegram</b> : crée le bot en parlant à @BotFather, qui donne un jeton ; programme-le en Python (python-telegram-bot) ou JavaScript.</li>
<li><b>Discord</b> : crée une application dans le portail développeur, ajoute un bot, puis programme-le avec discord.py ou discord.js.</li>
<li>Branche une API d'IA pour en faire un assistant, en gardant le jeton et la clé secrets, et en limitant ce que le bot peut faire.</li>
<li>Héberge-le sur un petit serveur ou un service cloud pour qu'il reste en ligne.</li>
</ul>`},
{t:"Des outils pour les assistants d'IA", h:`
<ul class="clean">
<li><b>Serveurs MCP</b> : donner de nouveaux outils à Claude, ChatGPT, Cursor ou Copilot (voir le cours « Construire un agent »).</li>
<li><b>Compétences (Skills)</b> pour Claude et <b>applications</b> dans ChatGPT.</li>
<li><b>GPTs</b>, <b>Gems</b> et agents personnalisés sans code.</li>
</ul>
<div class="ex"><b class="t">Projet</b><p>Crée une extension de navigateur qui résume la page en cours en trois points, en appelant une API d'IA via un petit serveur qui garde la clé secrète.</p></div>`}
]},
{
id:'cli', n:'Outils en ligne de commande et API', by:'Pour les développeurs', cat:'programmes', lvl:'Apprenant → expert', dur:'1 h 30',
pitch:"Créer des outils pour le terminal et des API que d'autres programmes utilisent : Python, Go, Rust, arguments, configuration, documentation et distribution.",
ch:[
{t:"Un outil en ligne de commande en Python", h:`
<pre class="code">pip install typer

# fichier taches.py
import typer
app = typer.Typer()

@app.command()
def ajouter(titre: str, urgent: bool = False):
    """Ajoute une tâche."""
    typer.echo(("[URGENT] " if urgent else "") + titre)

@app.command()
def lister():
    """Liste les tâches."""
    typer.echo("Aucune tâche pour l'instant.")

if __name__ == "__main__":
    app()

# python taches.py ajouter "Payer la facture" --urgent
# python taches.py --help</pre>`},
{t:"Choisir son langage pour un outil", h:`
<div class="tbl-wrap"><table><thead><tr><th>Langage</th><th>Atout</th></tr></thead><tbody>
<tr><td>Python (Typer, Click, argparse)</td><td>Le plus rapide à écrire</td></tr>
<tr><td>Go (Cobra)</td><td>Un seul exécutable sans dépendance, très rapide</td></tr>
<tr><td>Rust (clap)</td><td>Performances et fiabilité maximales</td></tr>
<tr><td>Node.js</td><td>Idéal si l'écosystème JavaScript est déjà utilisé</td></tr>
</tbody></table></div>`},
{t:"Concevoir une bonne API", h:`
<ul class="clean">
<li>Des adresses claires et cohérentes : <code>GET /clients</code>, <code>POST /clients</code>, <code>GET /clients/42</code>.</li>
<li>Des réponses en JSON avec des codes HTTP justes (200, 201, 400, 401, 404, 500).</li>
<li>Une documentation au format OpenAPI, générée automatiquement par FastAPI par exemple.</li>
<li>Une authentification par clé ou par jeton, des limites d'utilisation, une numérotation des versions (<code>/v1/</code>).</li>
</ul>
<div class="ex"><b class="t">Projet</b><p>Écris un outil en ligne de commande qui interroge une API d'IA pour résumer un fichier texte, avec des options pour la langue et la longueur, puis publie-le sur GitHub avec un README.</p></div>`}
]},
{
id:'objets', n:'Objets connectés et électronique', by:'Arduino, ESP32, Raspberry Pi', cat:'programmes', lvl:'Débutant → expert', dur:'2 h',
pitch:"Programmer le monde physique : capteurs, moteurs, écrans et objets connectés avec Arduino, ESP32 et Raspberry Pi, jusqu'à l'IA embarquée.",
ch:[
{t:"Choisir sa carte", h:`
<div class="tbl-wrap"><table><thead><tr><th>Carte</th><th>Ce que c'est</th><th>Idéal pour</th></tr></thead><tbody>
<tr><td><b>Arduino</b></td><td>Microcontrôleur simple, programmé en C++ avec l'IDE Arduino</td><td>Débuter, capteurs, LED, moteurs</td></tr>
<tr><td><b>ESP32</b></td><td>Microcontrôleur bon marché avec Wi-Fi et Bluetooth</td><td>Objets connectés, domotique ; programmable en C++ ou MicroPython</td></tr>
<tr><td><b>Raspberry Pi</b></td><td>Un vrai petit ordinateur sous Linux</td><td>Serveur maison, caméra intelligente, petits modèles d'IA en local</td></tr>
</tbody></table></div>`},
{t:"Le premier programme : faire clignoter une LED", h:`
<pre class="code">// Arduino (C++)
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}
void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}</pre>
<p>Ensuite : lire un capteur de température, afficher sur un petit écran, envoyer les mesures en Wi-Fi avec un ESP32. L'IA écrit très bien ce code si tu lui donnes la carte exacte et le schéma de branchement.</p>
<div class="callout warn">Électricité : travaille hors tension pour câbler, respecte les tensions des composants, et ne touche jamais au 230 V du secteur sans compétence.</div>`},
{t:"L'IA dans les objets", h:`
<ul class="clean">
<li><b>IA embarquée (TinyML)</b> : des modèles minuscules tournent directement sur microcontrôleur, par exemple pour reconnaître un mot-clé ou un geste (TensorFlow Lite pour microcontrôleurs, Edge Impulse).</li>
<li><b>Raspberry Pi</b> : peut faire tourner de petits modèles de langage avec llama.cpp ou Ollama, ou de la détection d'objets sur la caméra.</li>
<li><b>Domotique</b> : Home Assistant, open source, relie les objets de la maison et s'interface avec des assistants d'IA.</li>
</ul>
<div class="ex"><b class="t">Projet</b><p>Construis une station météo avec un ESP32 et un capteur de température et d'humidité, qui envoie ses mesures sur un tableau de bord web, puis demande à une IA de commenter la tendance de la semaine.</p></div>`}
]}
);
Object.assign(NIV_COURS, {creerprog:1, scripts:2, bureau:3, mobile:4, webapp:4, extensions:3, cli:4, objets:3});

RES_CATS.prog = 'Créer des programmes';
RESSOURCES.push(
{n:'electron/electron',u:GH+'electron/electron',s:'GitHub',c:'prog',v:3,d:"Créer des logiciels de bureau avec HTML, CSS et JavaScript."},
{n:'tauri-apps/tauri',u:GH+'tauri-apps/tauri',s:'GitHub',c:'prog',v:4,d:"Logiciels de bureau et mobiles très légers avec technologies web et Rust."},
{n:'flutter/flutter',u:GH+'flutter/flutter',s:'GitHub',c:'prog',v:3,d:"Applications mobiles, web et bureau avec un seul code."},
{n:'expo/expo',u:GH+'expo/expo',s:'GitHub',c:'prog',v:3,d:"Créer et tester des applications React Native sur son téléphone en quelques minutes."},
{n:'fastapi/fastapi',u:GH+'fastapi/fastapi',s:'GitHub',c:'prog',v:4,d:"Créer des API en Python, rapides et documentées automatiquement."},
{n:'pyinstaller/pyinstaller',u:GH+'pyinstaller/pyinstaller',s:'GitHub',c:'prog',v:3,d:"Transformer un programme Python en exécutable."},
{n:'GoogleChrome/chrome-extensions-samples',u:GH+'GoogleChrome/chrome-extensions-samples',s:'GitHub',c:'prog',v:3,d:"Exemples officiels d'extensions Chrome en Manifest V3."},
{n:'microsoft/vscode-extension-samples',u:GH+'microsoft/vscode-extension-samples',s:'GitHub',c:'prog',v:4,d:"Exemples officiels d'extensions pour VS Code."},
{n:'home-assistant/core',u:GH+'home-assistant/core',s:'GitHub',c:'prog',v:3,d:"La plateforme open source de domotique."},
{n:'Documentation Arduino',u:'https://docs.arduino.cc',s:'Documentation',c:'prog',v:2,d:"Tutoriels officiels pour débuter en électronique programmable."},
{n:'MDN Web Docs',u:'https://developer.mozilla.org/fr/',s:'Documentation',c:'prog',v:2,d:"La référence du HTML, du CSS et du JavaScript, en français."}
);
