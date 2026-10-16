# Système multi-agents autonome

Vous donnez un objectif (« crée une fonction fibonacci testée », « écris un parseur CSV qui… ») ;
le système le découpe en tâches, écrit le code, le teste dans un bac à sable et s'arrête quand
**tous les tests passent**, ou quand un budget est épuisé.

- **Orchestration** : LangGraph (pattern superviseur)
- **LLM** : LM Studio en local, un seul modèle pour tous les agents (Qwen3.6-35B-A3B)
- **Mémoire et reprise** : PostgreSQL + pgvector
- **Recherche web** : SearXNG auto-hébergé
- **Exécution du code** : conteneur Docker sans réseau

## Comment ça marche

```
START → plan → route ─┬→ recherche ──────┐
                      ├→ développeur ────┤
                      ├→ approve_deps ───┤  (pause : validation humaine)
                      ├→ testeur ────────┤
                      ├→ replan ─────────┘→ route
                      └→ finish → END
```

| Agent | Rôle | Utilise le LLM ? |
|---|---|---|
| **Manager** | Découpe l'objectif en tâches testables, choisit le prochain agent, redécoupe une tâche qui échoue, écrit le rapport | Oui pour planifier et replanifier ; **non** pour router (règle fixe, plus fiable) |
| **Développeur** | Écrit le code dans le workspace, corrige d'après le rapport du Testeur | Oui (thinking) |
| **Recherche Web** | Une requête SearXNG, lecture des 2 meilleures pages, synthèse avec sources | Oui |
| **Testeur** | Écrit les tests pytest à partir du critère d'acceptation, les exécute, analyse les échecs | Oui (thinking) |
| **Mémoire** | Retrouve les leçons des exécutions passées, enregistre les nouvelles | Non : c'est un module (recherche vectorielle) |

Les règles qui empêchent le système de « tricher » ou de tourner en rond :

- **Le verdict vient de pytest**, jamais de l'avis du modèle. SUCCESS uniquement si chaque tâche a passé ses tests.
- **Le Développeur ne peut pas écrire dans `tests/`.** Les tests d'une tâche sont écrits une seule fois et ne sont réécrits (une fois) que si l'analyse conclut que le test lui-même est faux.
- **Toute la suite de tests tourne à chaque fois** : une régression sur une tâche précédente fait échouer la tâche en cours.
- **3 tentatives maximum par tâche.** Si le même échec revient deux fois de suite, le Manager reprend la main tout de suite : il redécoupe la tâche (2 niveaux maximum) ou l'abandonne.
- **Budgets** : 50 itérations, 3 h, 300 appels LLM (modifiables dans `.env`). Fin en SUCCESS, PARTIAL (budget épuisé) ou FAILED (tâche bloquée).
- **Validation humaine avant tout accès réseau** : si le code a besoin d'une bibliothèque externe (`requirements.txt`), l'exécution se met en pause et vous demande l'autorisation.

## Installation (Windows, RTX 4070 Ti 12 Go, 32 Go de RAM)

### 0. Récupérer le code

Toutes les commandes qui suivent se lancent **dans le dossier `systeme-agents`**, pas dans votre dossier utilisateur.

```powershell
cd $HOME
git clone -b claude/adoring-goodall-b0yn8n https://github.com/crashcools-collab/Forum.enrob-.git forum-enrobe
cd forum-enrobe\systeme-agents
```

Sans Git : sur GitHub, choisissez la branche `claude/adoring-goodall-b0yn8n`, puis Code → Download ZIP, décompressez, et placez-vous dans le dossier `systeme-agents` avec `cd`.

### 1. LM Studio

1. Chargez **Qwen3.6-35B-A3B** (votre GGUF ~3 bits, ~15 Go) avec ces réglages :
   - **Context Length : 32768**
   - **GPU Offload : au maximum**
   - **Experts MoE sur le CPU** (option du type « Force Model Expert Weights onto CPU ») si le modèle ne tient pas entièrement en VRAM
   - **Flash Attention : activé**
2. Chargez aussi un **petit modèle d'embeddings**, par exemple Qwen3-Embedding-0.6B (1024 dimensions).
3. Onglet Developer : **démarrez le serveur** (port 1234) et **désactivez le déchargement automatique** (TTL / auto-unload), sinon le modèle sera rechargé en pleine exécution.

### 2. Docker Desktop

1. **Lancez Docker Desktop** et attendez « Engine running » en bas à gauche. Si `docker` répond `failed to connect to the docker API ... dockerDesktopLinuxEngine`, c'est que Docker Desktop n'est pas démarré.
2. Copiez `wslconfig.example` vers `%UserProfile%\.wslconfig`, puis lancez `wsl --shutdown`. Sans ça, Docker peut réserver jusqu'à la moitié de votre RAM et pousser le modèle dans le swap.
3. Dans le dossier `systeme-agents` :

```powershell
docker compose up -d
docker build -t agents-sandbox:latest sandbox/
```

4. Remplacez `secret_key` dans `searxng/settings.yml` par une valeur aléatoire.

### 3. Python (3.10 ou plus récent)

Créez un environnement propre au projet avec le lanceur `py`. Il évite d'utiliser par erreur le Python d'un autre outil présent dans le PATH.

```powershell
py -3.10 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
copy .env.example .env
```

Si PowerShell refuse `Activate.ps1` (« l'exécution de scripts est désactivée »), lancez une fois `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. Une fois l'environnement activé, l'invite commence par `(.venv)` : toutes les commandes `python` suivantes doivent être lancées dans cette fenêtre.

Dans `.env`, mettez dans `LLM_MODEL` et `EMBED_MODEL` les identifiants **exacts** de vos modèles dans LM Studio. La commande suivante les liste :

```powershell
python -m agents check
```

Tout doit être `OK` avant de lancer une exécution. La ligne « Désactivation du thinking » indique si LM Studio respecte l'option qui coupe le raisonnement pour les réponses simples. Si ce n'est pas le cas, le système fonctionne quand même, mais plus lentement.

## Utilisation

### Le cockpit (recommandé)

```powershell
python -m agents
```

Un terminal interactif, façon Claude Code : vous tapez une demande, les agents travaillent sous vos yeux (activité en cours, chronomètre, résultat de chaque étape), puis vous enchaînez. **Chaque nouvelle demande continue le même projet** : « ajoute une option… », « corrige… ». Le Manager connaît les fichiers existants et les demandes précédentes, et les tests des demandes précédentes restent en place (non-régression).

| Commande | Effet |
|---|---|
| *une phrase* | nouvelle demande dans le projet courant |
| `/fichiers` | arborescence du projet |
| `/voir fichier.py` | afficher un fichier avec coloration |
| `/rapport` | rapport de la dernière exécution |
| `/historique` | demandes déjà réalisées |
| `/projet nom` | changer de projet (créé s'il n'existe pas) |
| `/projets` | lister les projets |
| `/reprendre` | reprendre la dernière exécution interrompue |
| `/check` | vérifier les services |
| `!commande` | lancer une commande dans le dossier du projet, ex. `!python main.py` |
| `/quitter` | quitter (ou Ctrl+D) |

Pour ouvrir directement un projet donné : `python -m agents chat --projet budget`. Les projets sont dans `workspaces/<nom>/`.

### En une commande

```powershell
python -m agents run "crée une fonction fibonacci testée"
```

- Le code produit est dans `workspaces/<thread_id>/`, avec le rapport `REPORT.md`.
- Le journal détaillé (décisions du Manager, raisonnements du modèle, durées, tokens) est dans `logs/<thread_id>.jsonl`.
- **Reprise** après un arrêt (Ctrl+C, LM Studio fermé, plantage) : `python -m agents resume <thread_id>`.
- **Dépendances externes** : le système demande « Autoriser ? [o/N] ». Si vous refusez, il supprime `requirements.txt` et le Développeur réécrit le code avec la bibliothèque standard. Pour répondre à l'avance : `--approve-deps yes` ou `--approve-deps no`.

Codes de sortie : `0` SUCCESS, `1` PARTIAL/FAILED, `3` en attente d'une validation humaine, `4` erreur (LLM injoignable…).

## Juger si le modèle limite le système

Le rapport final contient les métriques et des alertes automatiques :

- **Taux de JSON invalides avant réparation > 15 %** : la quantification 3 bits dégrade le modèle. Essayez **IQ4_XS** (~18-19 Go), si votre RAM le permet.
- **Plus d'un tiers des tâches demandent 3 tentatives** : tâches trop grosses ou modèle trop limité. Reformulez l'objectif plus précisément.
- **tokens/s** : en dessous de ~8, vérifiez le swap (Gestionnaire des tâches → Mémoire). Fermez le navigateur pendant les longues exécutions.

## Choix techniques assumés

- **SDK `openai` directement plutôt que `ChatOpenAI`** : accès direct à `reasoning_content` et à `usage`, une couche de moins. LangGraph n'a pas besoin de LangChain.
- **Routage déterministe** : choisir le prochain agent est une règle simple ; la confier à un modèle quantifié n'ajouterait que des erreurs.
- **Code en blocs `### FICHIER:` plutôt qu'en appels d'outils JSON** : du code échappé dans une chaîne JSON est la première chose qu'un modèle quantifié casse.
- **Sorties structurées** : schéma imposé côté serveur (`response_format`) quand le thinking est coupé ; sinon, extraction et réparation du JSON, puis un second essai en renvoyant l'erreur au modèle.
- **Application hors Docker** : avec LM Studio sur l'hôte, c'est plus simple, ça consomme moins de RAM et ça évite d'exposer le socket Docker à un conteneur.

## Limites connues

- Python uniquement : le bac à sable n'exécute que des tests pytest.
- Le `max_duration` compte aussi le temps passé en pause.
- Le mode `SANDBOX_MODE=local` n'isole rien : à réserver aux tests du système lui-même.
- Le système vise des objectifs bien cadrés (un module, un petit outil). Un projet complet dépassera ce que permet un modèle à 3B paramètres actifs, même bien encadré.

## Tests

```powershell
pytest                                     # LLM simulé, bac à sable local
$env:TEST_DATABASE_URL="postgresql://agents:agents@localhost:5432/agents"; pytest tests/test_postgres.py
$env:RUN_DOCKER_TESTS="1"; pytest tests/test_docker_sandbox.py
$env:TEST_SANDBOX_MODE="docker"; pytest tests/test_graph.py
```
