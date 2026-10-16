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

### 1. LM Studio

1. Chargez **Qwen3.6-35B-A3B** (votre GGUF ~3 bits, ~15 Go) avec ces réglages :
   - **Context Length : 32768**
   - **GPU Offload : au maximum**
   - **Experts MoE sur le CPU** (option du type « Force Model Expert Weights onto CPU ») si le modèle ne tient pas entièrement en VRAM
   - **Flash Attention : activé**
2. Chargez aussi un **petit modèle d'embeddings**, par exemple Qwen3-Embedding-0.6B (1024 dimensions).
3. Onglet Developer : **démarrez le serveur** (port 1234) et **désactivez le déchargement automatique** (TTL / auto-unload), sinon le modèle sera rechargé en pleine exécution.

### 2. Docker Desktop

1. Copiez `wslconfig.example` vers `%UserProfile%\.wslconfig`, puis lancez `wsl --shutdown`. Sans ça, Docker peut réserver jusqu'à la moitié de votre RAM et pousser le modèle dans le swap.
2. Dans ce dossier :

```powershell
docker compose up -d
docker build -t agents-sandbox:latest sandbox/
```

3. Remplacez `secret_key` dans `searxng/settings.yml` par une valeur aléatoire.

### 3. Python (3.11 ou plus récent)

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
copy .env.example .env
```

Dans `.env`, mettez dans `LLM_MODEL` et `EMBED_MODEL` les identifiants **exacts** de vos modèles dans LM Studio. La commande suivante les liste :

```powershell
python -m agents check
```

Tout doit être `OK` avant de lancer une exécution. La ligne « Désactivation du thinking » indique si LM Studio respecte l'option qui coupe le raisonnement pour les réponses simples. Si ce n'est pas le cas, le système fonctionne quand même, mais plus lentement.

## Utilisation

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
