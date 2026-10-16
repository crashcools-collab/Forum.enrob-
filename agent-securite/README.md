# Sentinelle — agent de sécurité local avec LM Studio

Agent qui surveille ton PC (Windows en priorité, Linux et macOS pris en charge) et utilise un modèle local
LM Studio pour **expliquer** les alertes. Aucune donnée ne quitte la machine.

## Ce que ce n'est pas

Ce n'est **pas** un antivirus et ça ne remplace ni Microsoft Defender ni le pare-feu Windows. Garde-les actifs :
Sentinelle vérifie justement qu'ils le sont. C'est une couche de surveillance et d'explication en plus.

## Conception : pourquoi le LLM n'a aucun pouvoir

Les guides CISA/NSA et le retour d'expérience d'Anthropic convergent sur un point : l'injection de prompt n'a pas
de solution de fond. Un agent IA qui lit les données de ton PC (des noms de processus et des tâches planifiées
qu'un attaquant peut avoir écrits) **et** qui peut agir sur le système réunit la « triade létale ». Sentinelle casse
donc cette triade :

| Couche | Qui décide | Peut être trompée par une injection ? |
|---|---|---|
| Collecte (ports, processus, démarrage, pare-feu, antivirus) | Code fixe, lecture seule | Non |
| Règles et gravité des alertes | Code fixe | Non |
| Explication et priorisation | LM Studio | Oui, d'où son rôle **uniquement consultatif** |
| Actions (bloquer un port, arrêter un processus) | Liste blanche dans le code + ta confirmation `OUI` | Non |

Protections concrètes :
- Le LLM **ne peut ni baisser une gravité, ni créer une alerte, ni lancer une action**. Sa réponse est validée :
  identifiants inconnus et champs en trop sont jetés, et les textes sont tronqués.
- Les données envoyées au LLM sont **expurgées** (`password=…`, jetons, longues clés → `[MASQUÉ]`).
- Une URL LM Studio non locale est **refusée** par défaut, et les requêtes ignorent les proxys système.
- Une règle fixe détecte le **texte d'injection de prompt** caché dans les processus et tâches de démarrage.
- Avant d'arrêter un processus, l'agent vérifie que le PID désigne toujours le même programme
  (protection contre la réutilisation de PID).
- Chaque scan, requête LLM et action est tracé dans `~/.sentinelle/audit.jsonl`.

## Ce qui est contrôlé

- **Ton API LM Studio** : écoute-t-elle sur le réseau (`0.0.0.0`) ? Répond-elle sans authentification ?
  Si les deux sont vrais, l'alerte est **CRITIQUE**.
- Ports dangereux ouverts au réseau : RDP, SMB, VNC, Telnet, WinRM, Jupyter, Ollama, Marimo…
- Programmes lancés depuis Temp/Téléchargements, surtout s'ils écoutent sur le réseau.
- Faux processus système (`svchost.exe` hors de `C:\Windows`, sosies du type `scvhost.exe`).
- Lignes de commande d'attaque : PowerShell encodé ou masqué, `certutil -urlcache`, `mshta http…`,
  `curl | sh`, reverse shells…
- Persistance : clés registre Run/RunOnce, dossier Démarrage, tâches planifiées (et équivalents Linux/macOS).
- Pare-feu Windows et Defender (temps réel, âge des signatures).
- Nouveaux ports ou programmes de démarrage apparus depuis ta **référence**.
- Versions vulnérables de `starlette` / `marimo`, d'après les CVE citées dans l'article.

## Installation (Windows) — recommandé

1. Télécharger et **décompresser** `Sentinelle-Windows.zip` (clic droit → « Extraire tout »).
2. Double-cliquer sur **`INSTALLER.bat`** et accepter la demande de droits administrateur.
   Si Windows affiche « Windows a protégé votre ordinateur » : « Informations complémentaires » → « Exécuter quand même ».
3. Répondre aux questions (Entrée = oui). L'installeur :
   - installe Python 3.12 pour tous les utilisateurs via `winget` s'il manque, ou si le Python existant est
     dans un dossier modifiable par ton compte ;
   - copie Sentinelle dans `C:\Program Files\Sentinelle`, dans un environnement Python isolé (`venv` + `psutil`) ;
   - crée `C:\ProgramData\Sentinelle` pour les rapports et le journal, en lecture seule pour les utilisateurs ;
   - crée le raccourci **Sentinelle** sur le Bureau (tableau de bord) et un dossier dans le menu Démarrer
     (tableau de bord, scan rapide, désinstallation) ;
   - propose la **surveillance automatique** à chaque ouverture de session (tâche planifiée, toutes les 5 min,
     fenêtre d'alerte si grave).
4. Dans LM Studio : charger un modèle (un modèle instruct de 7-8 B suffit, par exemple Qwen 2.5 7B Instruct),
   puis **Developer → Start Server**.

Pourquoi ces emplacements : Sentinelle tourne **en administrateur**. Si son code était dans un dossier modifiable
par ton compte, un malware lancé sans droits particuliers pourrait le remplacer et obtenir les droits admin au
prochain démarrage. Dans `Program Files`, seul un administrateur peut le modifier.

Réinstaller par-dessus (mise à jour) : relancer `INSTALLER.bat`. Les rapports et la référence sont conservés.
Désinstaller : menu Démarrer → Sentinelle → **Désinstaller Sentinelle**.

### Installation manuelle (Linux, macOS ou développement)

1. Python 3.9+, puis dans ce dossier : `pip install -r requirements.txt`
2. Lancer les commandes ci-dessous dans un terminal administrateur (ou avec `sudo`) : sans ça, une partie des
   processus et connexions est invisible et les actions de pare-feu échouent.

## Utilisation

```bat
:: 1. Sur un PC que tu considères sain : enregistrer la référence
python sentinelle.py reference

:: 2. Scan avec analyse IA
python sentinelle.py scan

:: 3. Scan + propositions de correction (chaque action demande OUI)
python sentinelle.py scan --interactif

:: 4. Surveillance continue (toutes les 5 min, fenêtre d'alerte si grave)
python sentinelle.py surveiller --intervalle 300 --popup

:: Sans IA (règles seules), ou avec un autre modèle ou port
python sentinelle.py --sans-llm scan
python sentinelle.py --modele qwen2.5-7b-instruct --url-lmstudio http://127.0.0.1:1234/v1 scan
```

Code de sortie de `scan` : `2` s'il existe une alerte ÉLEVÉE ou CRITIQUE, `0` sinon (utile pour l'automatisation).
Les rapports sont enregistrés dans `%USERPROFILE%\.sentinelle\rapports\`.

Si tu as activé l'authentification par jeton dans LM Studio, définis la variable `LMSTUDIO_API_KEY`.

### Lancement automatique à l'ouverture de session

`lancer-sentinelle.bat` démarre la surveillance. Pour l'exécuter à chaque connexion avec les droits
administrateur (dans un terminal admin) :

```bat
schtasks /create /tn "Sentinelle" /sc onlogon /rl highest /tr "\"%CD%\lancer-sentinelle.bat\""
```

## Tableau de bord de contrôle

```bat
python tableau_de_bord.py
```

Ou double-clic sur `ouvrir-tableau-de-bord.bat` (clic droit → « Exécuter en tant qu'administrateur » pour avoir
une visibilité complète et pouvoir bloquer des ports). Le navigateur s'ouvre sur `http://127.0.0.1:8765`.

Fonctions :
- état global du PC, compteurs par gravité (cliquables pour filtrer) et état de l'API LM Studio
  (arrêtée, locale ou **exposée au réseau**, avec ou sans authentification, modèle chargé) ;
- scan à la demande, avec ou sans analyse IA, et enregistrement de la référence ;
- alertes détaillées : preuves, avis de l'IA, bouton d'action corrective avec la commande exacte affichée,
  à confirmer en tapant `OUI` ;
- surveillance automatique (1 min à 1 h) avec notifications du navigateur pour les nouvelles alertes graves ;
  l'IA n'est réinterrogée que si les alertes changent ;
- historique des scans, actions exécutées, journal d'audit, export du rapport en Markdown.

Sécurité du tableau de bord (il peut arrêter des processus, donc c'est une cible) :
- écoute **uniquement sur 127.0.0.1**, jamais sur le réseau ;
- **jeton secret** généré à chaque démarrage, présent dans le lien ouvert par la console et exigé sur chaque
  appel : un site web malveillant ouvert dans ton navigateur ne peut pas piloter le tableau de bord ;
- contrôle des en-têtes `Host`, `Origin` et `Sec-Fetch-Site` (contre le DNS rebinding et le CSRF) ;
- CSP stricte, aucune ressource externe (fonctionne hors ligne), données toujours affichées comme du texte :
  un malware qui met du HTML dans son nom de processus ne peut pas injecter de script ;
- le navigateur n'envoie qu'un identifiant d'alerte : la commande exécutée vient toujours du code de Sentinelle.

Si tu fermes l'onglet, relance le lien complet affiché dans la console (il contient `jeton=…`).

## Sécuriser LM Studio lui-même (à faire en priorité)

1. **LM Studio → Developer → Settings** : désactiver **« Serve on Local Network »**. L'API n'écoute alors
   que sur `127.0.0.1`.
2. Si ta version le propose, activer l'**authentification par jeton** de l'API.
3. Bloquer en plus le port dans le pare-feu (Windows ne filtre pas le trafic local, donc LM Studio reste
   utilisable sur ton PC) :
   `netsh advfirewall firewall add rule name=Sentinelle-bloque-1234 dir=in action=block protocol=TCP localport=1234`
   Pour annuler : `netsh advfirewall firewall delete rule name=Sentinelle-bloque-1234`
4. Ne télécharger des modèles que depuis des sources reconnues, et ne pas donner à un agent branché sur
   LM Studio un accès en écriture à tes fichiers ou à un shell sans confirmation.

## Limites (honnêtement)

- Les règles détectent des **schémas connus**, pas un malware sophistiqué conçu pour se fondre dans le système.
- Les faux positifs existent (un installeur dans Téléchargements, un outil de dev qui écoute sur `0.0.0.0`).
  Rien n'est jamais fait sans ton `OUI`.
- Le contrôle des paquets Python ne couvre que l'environnement qui exécute Sentinelle.
- Les numéros de CVE viennent de l'article fourni : vérifie-les sur nvd.nist.gov avant de t'y fier.
- Un attaquant déjà administrateur sur la machine peut neutraliser n'importe quel outil local, celui-ci compris.
