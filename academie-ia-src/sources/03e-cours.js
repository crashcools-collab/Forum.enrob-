/* ====== COURS PAR OUTIL (3/3) : construire avec l'IA ====== */
COURS.push(
{
id:'agents', n:'Construire un agent IA', by:'Du sans-code au code', cat:'construire', lvl:'Apprenant → expert', dur:'4 h', niv:4,
pitch:"De l'assistant personnalisé sans code jusqu'à l'agent programmé avec outils, mémoire et serveur MCP : architecture, frameworks, sécurité, évaluation et déploiement.", hk:['MCP','agent','Agent'],
ch:[
{t:"Qu'est-ce qu'un agent, exactement ?", h:`
<p>Un <b>agent</b> est un modèle d'IA placé dans une boucle : il reçoit un objectif, réfléchit, utilise un outil, observe le résultat, et recommence jusqu'à avoir fini. Un chatbot répond ; un agent agit.</p>
<div class="tbl-wrap"><table><thead><tr><th>Composant</th><th>Rôle</th><th>Exemple</th></tr></thead><tbody>
<tr><td><b>Modèle</b></td><td>Le cerveau qui raisonne et décide</td><td>Claude Opus 5.5, GPT-6.1 Sol, Gemini 4 Argon</td></tr>
<tr><td><b>Instructions</b></td><td>Le rôle, les règles, les limites</td><td>« Tu gères ma boîte mail. Ne supprime jamais rien. »</td></tr>
<tr><td><b>Outils</b></td><td>Les actions possibles</td><td>Recherche web, lire un fichier, envoyer un mail, exécuter du code</td></tr>
<tr><td><b>Mémoire</b></td><td>Ce dont il se souvient</td><td>Historique de la tâche, notes, base de documents</td></tr>
<tr><td><b>Garde-fous</b></td><td>Ce qui l'empêche de mal faire</td><td>Confirmation humaine, droits limités, budget maximum</td></tr>
</tbody></table></div>
<p>Il existe trois niveaux pour construire un agent : <b>sans code</b> (assistants personnalisés), <b>avec peu de code</b> (plateformes visuelles comme n8n) et <b>en code</b> (SDK et frameworks). Les chapitres suivants les couvrent dans l'ordre.</p>`},
{t:"Niveau 1 : les assistants personnalisés sans code", h:`
<div class="tbl-wrap"><table><thead><tr><th>Outil</th><th>Où</th><th>Points forts</th></tr></thead><tbody>
<tr><td>GPTs</td><td>ChatGPT → GPTs → Créer</td><td>Instructions, fichiers, recherche web, actions vers des API externes</td></tr>
<tr><td>Projets et Compétences (Skills)</td><td>Claude</td><td>Base de connaissances, instructions ; les Skills ajoutent des procédures et des scripts réutilisables</td></tr>
<tr><td>Gems</td><td>Gemini</td><td>Instructions et fichiers, accès aux applications Google</td></tr>
<tr><td>Agents Vibe</td><td>Mistral Vibe (ex-Le Chat)</td><td>Agents personnalisés, acteur européen</td></tr>
<tr><td>Copilot Studio</td><td>Microsoft 365</td><td>Agents d'entreprise branchés sur SharePoint, Teams et les données internes</td></tr>
</tbody></table></div>
<h3>La méthode pour un bon assistant</h3>
<ol class="steps">
<li>Écris une mission en une phrase : « Tu aides les débutants à comprendre leurs factures d'énergie. »</li>
<li>Décris le public, le ton, le format des réponses.</li>
<li>Liste ce qu'il doit faire et ce qu'il ne doit jamais faire.</li>
<li>Ajoute des documents de référence et deux ou trois exemples de bonnes réponses.</li>
<li>Teste avec 10 questions variées, dont des pièges, et corrige les instructions.</li>
</ol>`},
{t:"Niveau 2 : les agents visuels (low-code)", h:`
<p>Les plateformes d'automatisation proposent des blocs « agent » qu'on relie à des outils, sans programmer.</p>
<ul class="clean">
<li><b>n8n</b> : le nœud « AI Agent » se connecte à un modèle (OpenAI, Anthropic, Google, Mistral, Ollama), à une mémoire et à des outils (Gmail, Google Sheets, requêtes HTTP, serveurs MCP). Open source, auto-hébergeable.</li>
<li><b>Zapier Agents</b> et <b>Make</b> : agents qui utilisent les milliers d'intégrations de ces plateformes.</li>
<li><b>Dify</b> et <b>Flowise</b> : plateformes open source pour construire des applications d'IA et des agents avec RAG, en glisser-déposer.</li>
</ul>
<div class="ex"><b class="t">Exemple concret</b><p>Déclencheur : nouveau mail reçu avec une facture en pièce jointe → agent : lit le PDF, extrait fournisseur, montant et date → outil : ajoute une ligne dans Google Sheets → outil : envoie un résumé sur ton téléphone. Une confirmation humaine est demandée si le montant dépasse 500 €.</p></div>`},
{t:"Niveau 3 : un agent en code, la boucle d'outils", h:`
<p>Le principe est le même chez tous les fournisseurs (OpenAI, Anthropic, Google, Mistral) : tu décris tes outils, le modèle demande à en appeler un, ton programme l'exécute et renvoie le résultat. Exemple minimal en Python avec l'API Claude :</p>
<pre class="code">import anthropic
client = anthropic.Anthropic()  # lit la clé dans ANTHROPIC_API_KEY

outils = [{
    "name": "convertir_devise",
    "description": "Convertit un montant d'euros en dollars.",
    "input_schema": {"type": "object",
                     "properties": {"euros": {"type": "number"}},
                     "required": ["euros"]}
}]

def convertir_devise(euros):
    return euros * 1.10   # en réalité : appeler une API de taux de change

messages = [{"role": "user", "content": "Combien font 250 euros en dollars ?"}]
while True:
    rep = client.messages.create(model="claude-sonnet-5-5", max_tokens=1024,
                                 tools=outils, messages=messages)
    messages.append({"role": "assistant", "content": rep.content})
    if rep.stop_reason != "tool_use":
        print(rep.content[0].text)
        break
    resultats = []
    for bloc in rep.content:
        if bloc.type == "tool_use":
            valeur = convertir_devise(**bloc.input)
            resultats.append({"type": "tool_result", "tool_use_id": bloc.id,
                              "content": str(valeur)})
    messages.append({"role": "user", "content": resultats})</pre>
<p>C'est toute la mécanique d'un agent : une boucle, des outils décrits par un schéma, et le modèle qui décide quand s'arrêter. Les frameworks du chapitre suivant ajoutent la mémoire, le suivi, le parallélisme et la sécurité.</p>`},
{t:"Les frameworks et protocoles d'agents", h:`
<div class="tbl-wrap"><table><thead><tr><th>Outil</th><th>Éditeur</th><th>Particularité</th></tr></thead><tbody>
<tr><td>OpenAI Agents SDK, AgentKit</td><td>OpenAI</td><td>Agents, transferts entre agents, garde-fous, traçage ; AgentKit (octobre 2025) ajoute un constructeur visuel</td></tr>
<tr><td>Claude Agent SDK</td><td>Anthropic</td><td>Le moteur de Claude Code disponible pour tes propres agents : fichiers, terminal, sous-agents, MCP</td></tr>
<tr><td>Agent Development Kit (ADK)</td><td>Google</td><td>Agents multi-étapes, intégration Gemini et Vertex AI</td></tr>
<tr><td>Microsoft Agent Framework</td><td>Microsoft</td><td>Successeur de Semantic Kernel et AutoGen</td></tr>
<tr><td>LangChain et LangGraph</td><td>LangChain</td><td>Très répandus ; LangGraph modélise un agent comme un graphe d'étapes</td></tr>
<tr><td>LlamaIndex</td><td>LlamaIndex</td><td>Spécialiste du RAG et des agents sur documents</td></tr>
<tr><td>CrewAI</td><td>CrewAI</td><td>Équipes d'agents avec des rôles</td></tr>
<tr><td>smolagents</td><td>Hugging Face</td><td>Agents minimalistes qui écrivent du code pour agir</td></tr>
<tr><td>AI SDK</td><td>Vercel</td><td>Agents et chat dans les applications web JavaScript</td></tr>
</tbody></table></div>
<h3>Les deux protocoles à connaître</h3>
<ul class="clean">
<li><b>MCP</b> (Model Context Protocol) : relie un agent à des outils et des données. Créé par Anthropic en 2024, géré par la Linux Foundation depuis décembre 2025.</li>
<li><b>A2A</b> (Agent2Agent) : fait dialoguer des agents de fournisseurs différents. Lancé par Google en 2025, également confié à la Linux Foundation.</li>
</ul>`},
{t:"Créer son propre serveur MCP", h:`
<p>Un serveur MCP expose des outils que n'importe quel client compatible (Claude, ChatGPT, Cursor, Copilot, Vibe…) peut utiliser. Exemple avec le SDK Python officiel :</p>
<pre class="code">pip install "mcp[cli]"

# fichier serveur.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Notes")
notes = []

@mcp.tool()
def ajouter_note(texte: str) -> str:
    """Ajoute une note à la liste."""
    notes.append(texte)
    return f"Note ajoutée ({len(notes)} au total)"

@mcp.tool()
def lister_notes() -> list[str]:
    """Renvoie toutes les notes."""
    return notes

if __name__ == "__main__":
    mcp.run()</pre>
<p>On déclare ensuite ce serveur dans son client. Par exemple dans Claude Code : <code>claude mcp add notes -- python serveur.py</code>. Des centaines de serveurs prêts à l'emploi existent (GitHub, Google Drive, Slack, bases de données, navigateurs) : voir la section Ressources.</p>`},
{t:"Mémoire, connaissances et état", h:`
<ul class="clean">
<li><b>Mémoire courte</b> : l'historique de la conversation, limité par la fenêtre de contexte. Pour les tâches longues, l'agent résume régulièrement ce qui est fait.</li>
<li><b>Mémoire longue</b> : des notes écrites dans un fichier ou une base, relues au début de chaque session (préférences, décisions).</li>
<li><b>Connaissances</b> : un RAG (base vectorielle) pour retrouver les bons passages dans de nombreux documents.</li>
<li><b>État</b> : où en est la tâche (étape, fichiers produits). Les frameworks comme LangGraph le sauvegardent pour reprendre après une coupure.</li>
</ul>`},
{t:"Évaluer, surveiller et sécuriser", h:`
<div class="two"><div><h3>Évaluer</h3><ul class="clean">
<li>Constitue un jeu de 20 à 100 tâches de test avec le résultat attendu.</li>
<li>Mesure le taux de réussite, le coût et la durée à chaque changement.</li>
<li>Garde les traces (logs) de chaque étape pour comprendre les échecs.</li>
</ul></div><div><h3>Sécuriser</h3><ul class="clean no">
<li>Droits minimaux : un agent qui lit les mails n'a pas besoin de les supprimer.</li>
<li>Confirmation humaine pour envoyer, payer, supprimer, publier.</li>
<li>Méfiance envers tout contenu externe (pages web, mails, documents) : risque d'injection de prompt.</li>
<li>Budget maximum en tokens et en nombre d'étapes.</li>
<li>Clés API dans des variables d'environnement, jamais dans le code.</li>
</ul></div></div>`},
{t:"Projet final : ton premier agent", h:`
<div class="ex"><b class="t">Projet</b><p>Construis un agent de veille : chaque matin, il cherche les actualités d'un sujet que tu choisis, sélectionne les 5 plus importantes, les résume en 3 lignes avec leur source et t'envoie le tout par mail. Version sans code : une tâche planifiée dans ChatGPT ou un workflow n8n. Version code : un script Python avec un outil de recherche, lancé chaque jour par GitHub Actions.</p></div>`}
]},
{
id:'automatisation', n:'Automatiser avec l\'IA', by:'Zapier, Make, n8n, Power Automate, scripts', cat:'construire', lvl:'Débutant → affirmé', dur:'3 h', niv:3,
pitch:"Faire travailler l'IA à ta place, automatiquement : déclencheurs, actions, webhooks, Zapier, Make, n8n, Power Automate, scripts planifiés, et 12 idées prêtes à construire.", hk:['Zapier','n8n','Power Automate'],
ch:[
{t:"Les notions de base", h:`
<div class="tbl-wrap"><table><thead><tr><th>Notion</th><th>Explication</th><th>Exemple</th></tr></thead><tbody>
<tr><td><b>Déclencheur</b></td><td>L'événement qui lance l'automatisation</td><td>Un nouveau mail, un formulaire rempli, chaque lundi à 8 h</td></tr>
<tr><td><b>Action</b></td><td>Ce qui est fait ensuite</td><td>Résumer avec l'IA, créer une ligne de tableur, envoyer un message</td></tr>
<tr><td><b>Condition</b></td><td>Une règle qui oriente le flux</td><td>Si le mail contient « facture », sinon…</td></tr>
<tr><td><b>Donnée</b></td><td>Ce qui circule d'une étape à l'autre</td><td>L'expéditeur, le texte, la pièce jointe</td></tr>
<tr><td><b>Webhook</b></td><td>Une adresse web qui déclenche le flux quand une application l'appelle</td><td>Un site envoie les commandes vers ton automatisation</td></tr>
<tr><td><b>API</b></td><td>La porte d'entrée programmable d'un service</td><td>L'API d'OpenAI, de Google Sheets, de Slack</td></tr>
</tbody></table></div>
<p>L'IA apporte ce que les automatisations classiques ne savaient pas faire : <b>comprendre</b> un texte libre, <b>classer</b>, <b>extraire</b> des informations, <b>rédiger</b> une réponse, <b>décider</b> d'une étape.</p>`},
{t:"Choisir son outil", h:`
<div class="tbl-wrap"><table><thead><tr><th>Outil</th><th>Pour qui</th><th>Points forts</th><th>Limites</th></tr></thead><tbody>
<tr><td>Zapier</td><td>Débutant</td><td>Le plus simple, des milliers d'applications, étapes IA et agents</td><td>Cher à grand volume</td></tr>
<tr><td>Make</td><td>Intermédiaire</td><td>Scénarios visuels complexes, bon rapport qualité-prix</td><td>Plus long à prendre en main</td></tr>
<tr><td>n8n</td><td>Intermédiaire à expert</td><td>Open source, auto-hébergeable, très fort sur les agents IA</td><td>Installation et maintenance si auto-hébergé</td></tr>
<tr><td>Power Automate</td><td>Environnement Microsoft</td><td>Intégré à Microsoft 365, création en langage naturel avec Copilot</td><td>Surtout utile dans l'écosystème Microsoft</td></tr>
<tr><td>Apps Script</td><td>Environnement Google</td><td>Scripts gratuits dans Sheets, Gmail, Drive</td><td>Demande un peu de code</td></tr>
<tr><td>Agents de travail</td><td>Tous</td><td>ChatGPT Work, Claude Cowork, tâches planifiées : décrire la tâche en français</td><td>Moins prévisible qu'un flux fixe</td></tr>
</tbody></table></div>`},
{t:"Pas à pas : une automatisation avec étape IA", h:`
<p>Objectif : chaque mail reçu d'un client est classé (question, réclamation, commande), résumé, et enregistré dans un tableau.</p>
<ol class="steps">
<li><b>Déclencheur</b> : « Nouveau mail » dans Gmail ou Outlook, filtré sur un libellé ou un dossier.</li>
<li><b>Étape IA</b> : envoie le texte au modèle avec une consigne précise et un format de sortie fixe :<br><code>Classe ce mail en QUESTION, RECLAMATION ou COMMANDE. Réponds uniquement en JSON : {"type": "", "resume": "", "urgence": 1-3}</code></li>
<li><b>Condition</b> : si urgence = 3, envoyer une notification immédiate.</li>
<li><b>Action</b> : ajouter une ligne dans Google Sheets ou Excel avec date, expéditeur, type, résumé.</li>
<li><b>Test</b> : essaie avec 10 vrais mails variés avant d'activer.</li>
</ol>
<div class="callout info">Demander une sortie en JSON avec des valeurs imposées rend l'étape IA fiable : les étapes suivantes savent exactement quoi lire.</div>`},
{t:"n8n en détail", h:`
<ul class="clean">
<li><b>Démarrer</b> : version cloud sur n8n.io, ou en local avec Docker : <code>docker run -it --rm -p 5678:5678 docker.n8n.io/n8nio/n8n</code>, puis ouvrir <code>http://localhost:5678</code>.</li>
<li><b>Nœuds</b> : chaque étape est un nœud (déclencheur, application, code, condition, IA). On les relie à la souris.</li>
<li><b>Nœud AI Agent</b> : on lui branche un modèle de discussion, une mémoire et des outils. L'agent choisit seul quel outil utiliser.</li>
<li><b>Modèles locaux</b> : n8n se connecte à Ollama pour garder toutes les données sur ta machine.</li>
<li><b>Modèles de flux</b> : des milliers de workflows prêts à importer sur le site de n8n.</li>
</ul>`},
{t:"Automatiser en code", h:`
<p>Pour un contrôle total et un coût minimal : un petit script appelle l'API d'un modèle, et une tâche planifiée le lance.</p>
<pre class="code"># resume_du_jour.py : résume un fichier texte avec l'API Mistral
import os, requests
texte = open("notes.txt", encoding="utf-8").read()
r = requests.post("https://api.mistral.ai/v1/chat/completions",
    headers={"Authorization": f"Bearer {os.environ['MISTRAL_API_KEY']}"},
    json={"model": "mistral-small-latest",
          "messages": [{"role": "user", "content": "Résume en 5 points :\\n" + texte}]})
print(r.json()["choices"][0]["message"]["content"])</pre>
<p>Pour le lancer automatiquement : le planificateur de tâches de Windows, <code>cron</code> sur Mac et Linux, ou une GitHub Action avec <code>on: schedule</code> (la clé est alors stockée dans les Secrets du dépôt).</p>`},
{t:"Les bonnes pratiques", h:`
<ul class="clean ok">
<li>Commencer petit : une seule automatisation utile, puis l'améliorer.</li>
<li>Prévoir les erreurs : que se passe-t-il si l'IA répond mal ou si un service est en panne ?</li>
<li>Garder un journal de chaque exécution.</li>
<li>Mettre une validation humaine avant toute action irréversible.</li>
<li>Surveiller les coûts : chaque appel IA est facturé.</li>
<li>Ne pas faire transiter de données sensibles par des services non validés.</li>
</ul>`},
{t:"12 idées d'automatisations avec l'IA", h:`
<div class="tbl-wrap"><table><thead><tr><th>Idée</th><th>Déclencheur</th><th>Rôle de l'IA</th></tr></thead><tbody>
<tr><td>Tri des mails</td><td>Nouveau mail</td><td>Classer, résumer, proposer une réponse</td></tr>
<tr><td>Factures</td><td>Pièce jointe PDF</td><td>Extraire montant, date, fournisseur</td></tr>
<tr><td>Compte rendu de réunion</td><td>Fin d'enregistrement</td><td>Transcrire, résumer, lister les actions</td></tr>
<tr><td>Veille</td><td>Chaque matin</td><td>Chercher, sélectionner, résumer les actualités</td></tr>
<tr><td>Réseaux sociaux</td><td>Nouvel article publié</td><td>Rédiger trois publications adaptées</td></tr>
<tr><td>Formulaires</td><td>Réponse reçue</td><td>Analyser le sentiment, alerter si négatif</td></tr>
<tr><td>Support</td><td>Nouveau ticket</td><td>Proposer une réponse à partir de la documentation</td></tr>
<tr><td>Traduction</td><td>Nouveau document dans un dossier</td><td>Traduire et déposer la version traduite</td></tr>
<tr><td>Photos</td><td>Nouvelle image</td><td>Décrire, renommer, classer</td></tr>
<tr><td>Agenda</td><td>Chaque soir</td><td>Préparer le programme du lendemain</td></tr>
<tr><td>Dépenses</td><td>Relevé mensuel</td><td>Catégoriser et produire un bilan</td></tr>
<tr><td>Code</td><td>Nouvelle pull request</td><td>Revue automatique par un agent</td></tr>
</tbody></table></div>`}
]},
{
id:'siteweb', n:'Créer un site web avec l\'IA', by:'Du prototype à la mise en ligne', cat:'construire', lvl:'Novice → affirmé', dur:'3 h', niv:2,
pitch:"Comprendre comment marche un site, le créer avec l'IA (Claude, ChatGPT, Lovable, Bolt, v0, Cursor), le mettre en ligne gratuitement, y ajouter de l'IA sans exposer ses clés.", hk:['Lovable','v0','Cursor'],
ch:[
{t:"Comment fonctionne un site web", h:`
<div class="tbl-wrap"><table><thead><tr><th>Élément</th><th>Rôle</th></tr></thead><tbody>
<tr><td><b>HTML</b></td><td>Le contenu et la structure (titres, textes, images, boutons)</td></tr>
<tr><td><b>CSS</b></td><td>L'apparence (couleurs, polices, mise en page, version mobile)</td></tr>
<tr><td><b>JavaScript</b></td><td>L'interactivité (calculs, menus, formulaires)</td></tr>
<tr><td><b>Front-end / back-end</b></td><td>Ce qui tourne dans le navigateur / ce qui tourne sur un serveur (base de données, comptes, paiements, clés secrètes)</td></tr>
<tr><td><b>Hébergement</b></td><td>L'ordinateur qui sert le site à tout le monde</td></tr>
<tr><td><b>Nom de domaine</b></td><td>L'adresse lisible (monsite.fr), loué une dizaine d'euros par an</td></tr>
</tbody></table></div>
<p>Un <b>site statique</b> (une vitrine, un portfolio, une page comme cette formation) n'a besoin que de fichiers HTML, CSS et JavaScript : il s'héberge gratuitement. Une <b>application</b> avec comptes et données a besoin d'un back-end.</p>`},
{t:"Quel outil d'IA pour quel site", h:`
<div class="tbl-wrap"><table><thead><tr><th>Besoin</th><th>Outil</th><th>Niveau</th></tr></thead><tbody>
<tr><td>Une page simple, tout de suite</td><td>Artefacts de Claude, Canvas de ChatGPT ou de Gemini</td><td>Novice</td></tr>
<tr><td>Une application complète sans coder</td><td>Lovable, Bolt, v0, Replit</td><td>Débutant</td></tr>
<tr><td>Un projet que tu veux contrôler et faire évoluer</td><td>Cursor, Claude Code, Codex, Copilot, Antigravity</td><td>Apprenant à expert</td></tr>
</tbody></table></div>
<p>Le « <b>vibe coding</b> » (expression d'Andrej Karpathy, février 2025) consiste à décrire ce qu'on veut et à laisser l'IA écrire tout le code. Parfait pour un prototype ; pour un site sérieux, il faut quand même relire, tester et comprendre l'essentiel.</p>`},
{t:"Pas à pas : un site vitrine en une page", h:`
<ol class="steps">
<li>Demande à Claude ou ChatGPT : « Crée une page HTML unique, sans dépendance externe, pour [ton projet]. Sections : accueil, services, tarifs, contact. Style [style]. Elle doit être parfaite sur téléphone. »</li>
<li>Regarde le résultat dans l'aperçu, demande des corrections une par une.</li>
<li>Télécharge le fichier et nomme-le <code>index.html</code>.</li>
<li>Crée un dépôt sur GitHub, dépose le fichier (Add file → Upload files).</li>
<li>Active GitHub Pages (Settings → Pages → branche main). Ton site est en ligne en deux minutes. Le cours GitHub détaille chaque étape.</li>
</ol>`},
{t:"Pas à pas : une application avec base de données", h:`
<ol class="steps">
<li>Sur Lovable, Bolt ou v0, décris l'application : « Une application de liste de lecture : je me connecte, j'ajoute des livres avec une note, je filtre par genre. »</li>
<li>L'outil génère l'interface et propose de brancher une base de données (souvent Supabase) pour les comptes et les données.</li>
<li>Teste chaque écran, demande les corrections écran par écran.</li>
<li>Publie avec le bouton de déploiement de l'outil, ou exporte le code vers GitHub pour continuer dans Cursor ou Claude Code.</li>
</ol>
<div class="callout warn">Vérifie les règles d'accès de la base (dans Supabase, la « Row Level Security ») : sans elles, n'importe qui peut lire ou modifier les données de tous les utilisateurs.</div>`},
{t:"Mettre en ligne : les hébergeurs", h:`
<div class="tbl-wrap"><table><thead><tr><th>Hébergeur</th><th>Idéal pour</th><th>Offre gratuite</th></tr></thead><tbody>
<tr><td>GitHub Pages</td><td>Sites statiques à partir d'un dépôt</td><td>Oui, pour les dépôts publics</td></tr>
<tr><td>Netlify</td><td>Sites statiques et fonctions serveur simples</td><td>Oui</td></tr>
<tr><td>Vercel</td><td>Applications Next.js, fonctions serveur, AI SDK</td><td>Oui, pour usage personnel</td></tr>
<tr><td>Cloudflare Pages</td><td>Sites rapides partout dans le monde</td><td>Oui</td></tr>
</tbody></table></div>
<p>Pour un nom de domaine : achète-le chez un registraire, puis indique dans ses réglages DNS l'adresse donnée par ton hébergeur. Le HTTPS (cadenas) est fourni automatiquement par ces hébergeurs.</p>`},
{t:"Ajouter de l'IA à son site", h:`
<p>Pour qu'un site utilise un modèle (chat, résumé, génération), il appelle une API. <b>La règle d'or : la clé API ne doit jamais être dans le code visible du navigateur</b>, sinon n'importe qui la récupère et l'utilise à tes frais.</p>
<ol class="steps">
<li>Crée une <b>fonction serveur</b> (Netlify Functions, Vercel Functions, Cloudflare Workers) qui contient la clé dans une variable d'environnement.</li>
<li>Ta page envoie la question à cette fonction, qui appelle le modèle et renvoie la réponse.</li>
<li>Ajoute une limite d'utilisation pour éviter les abus.</li>
</ol>
<p>Les bibliothèques comme l'AI SDK de Vercel simplifient l'affichage des réponses en continu et l'appel des outils.</p>`},
{t:"Un site de qualité", h:`
<ul class="clean">
<li><b>Mobile d'abord</b> : la majorité des visites se font sur téléphone.</li>
<li><b>Accessibilité</b> : contrastes suffisants, textes alternatifs sur les images, navigation au clavier.</li>
<li><b>Référencement</b> : un titre et une description par page, des titres hiérarchisés, un contenu utile.</li>
<li><b>Performance</b> : images compressées, peu de scripts externes.</li>
<li><b>Obligations légales en France</b> : mentions légales ; bandeau de consentement si tu utilises des cookies de mesure d'audience ou de publicité.</li>
</ul>
<div class="ex"><b class="t">Exercice</b><p>Crée ton portfolio ou la page d'un projet perso avec une IA, mets-le en ligne sur GitHub Pages, puis demande à une autre IA de l'auditer : accessibilité, mobile, référencement. Applique trois corrections.</p></div>`}
]},
{
id:'claudecode', n:'Claude Code', by:'Anthropic', cat:'construire', lvl:'Apprenant → expert', dur:'2 h 30', niv:4,
pitch:"L'agent de développement d'Anthropic : installation, CLAUDE.md, mode plan, permissions, sous-agents, hooks, MCP, compétences, plugins, mode non interactif et GitHub.", hk:['Claude Code'],
ch:[
{t:"Présentation et installation", h:`
<p><b>Claude Code</b> est un agent qui travaille dans un projet : il lit et modifie les fichiers, lance des commandes et des tests, fait des commits et ouvre des pull requests. Il existe en ligne de commande, en extensions VS Code et JetBrains, dans l'application de bureau et sur le web (claude.ai/code), où il travaille dans un environnement cloud relié à GitHub.</p>
<pre class="code"># macOS, Linux
curl -fsSL https://claude.ai/install.sh | bash
# Windows (PowerShell)
irm https://claude.ai/install.ps1 | iex
# ou avec Node.js
npm install -g @anthropic-ai/claude-code

cd mon-projet
claude</pre>
<p>Il s'utilise avec un abonnement Claude (Pro, Max, Team, Enterprise) ou une clé API. La documentation officielle donne la méthode d'installation à jour.</p>`},
{t:"Les commandes et réglages essentiels", h:`
<div class="tbl-wrap"><table><thead><tr><th>Commande</th><th>Effet</th></tr></thead><tbody>
<tr><td><code>/init</code></td><td>Analyse le projet et crée un fichier CLAUDE.md</td></tr>
<tr><td><code>/model</code></td><td>Choisir le modèle (Opus, Sonnet, Haiku, Fable selon l'offre)</td></tr>
<tr><td><kbd>Maj</kbd> + <kbd>Tab</kbd></td><td>Changer de mode : normal, acceptation automatique des modifications, mode plan</td></tr>
<tr><td><kbd>Échap</kbd> deux fois</td><td>Revenir en arrière dans la conversation ou annuler des modifications</td></tr>
<tr><td><code>/clear</code>, <code>/compact</code></td><td>Repartir de zéro, ou résumer la conversation pour libérer du contexte</td></tr>
<tr><td><code>/mcp</code>, <code>claude mcp add</code></td><td>Gérer les serveurs MCP</td></tr>
<tr><td><code>claude -p "…"</code></td><td>Mode non interactif, pour les scripts et l'intégration continue</td></tr>
</tbody></table></div>`},
{t:"CLAUDE.md : la mémoire du projet", h:`
<p>Le fichier <code>CLAUDE.md</code> à la racine est lu à chaque session. On y met ce qu'un nouveau développeur devrait savoir :</p>
<pre class="code"># Projet : site de réservation
- Commandes : npm run dev (serveur), npm test (tests)
- Code en TypeScript strict, composants dans src/components
- Ne jamais modifier les fichiers de migration existants
- Toujours lancer les tests avant de proposer un commit</pre>
<p>Il existe aussi un CLAUDE.md personnel (dans ton dossier utilisateur) pour tes préférences sur tous les projets.</p>`},
{t:"Les fonctions avancées", h:`
<ul class="clean">
<li><b>Mode plan</b> : Claude explore et propose un plan sans rien modifier ; tu valides avant l'exécution.</li>
<li><b>Permissions</b> : tu choisis quelles commandes il peut lancer sans demander (fichier settings.json).</li>
<li><b>Sous-agents</b> : agents spécialisés (revue de code, tests, recherche) définis dans <code>.claude/agents/</code>, qui travaillent avec leur propre contexte.</li>
<li><b>Hooks</b> : des commandes lancées automatiquement à certains moments (avant une modification, après une réponse), par exemple formater le code.</li>
<li><b>Commandes personnalisées</b> : tes propres raccourcis <code>/nom</code>.</li>
<li><b>Compétences (Skills)</b> et <b>plugins</b> : ensembles d'instructions, de scripts et d'outils installables et partageables.</li>
<li><b>GitHub</b> : intégration pour mentionner Claude dans une issue ou une pull request et le laisser travailler.</li>
<li><b>Mode rapide</b> : jusqu'à 2,5 fois plus rapide avec Opus 5.5 selon Anthropic.</li>
</ul>`},
{t:"Méthode de travail efficace", h:`
<ol class="steps">
<li>Commence par faire expliquer le projet.</li>
<li>Pour une tâche importante : mode plan, relecture du plan, puis exécution.</li>
<li>Demande des tests, et demande à Claude de les lancer.</li>
<li>Relis les modifications avant de valider ; fais des commits fréquents.</li>
<li>Une session par tâche ; <code>/clear</code> entre deux sujets.</li>
</ol>
<div class="ex"><b class="t">Exercice</b><p>Dans un petit projet, lance <code>/init</code>, relis et complète le CLAUDE.md, puis demande en mode plan l'ajout d'une fonctionnalité simple. Valide le plan, laisse-le coder et tester, puis relis la différence.</p></div>`}
]},
{
id:'codex', n:'OpenAI Codex', by:'OpenAI', cat:'construire', lvl:'Apprenant → expert', dur:'1 h 30', niv:4,
pitch:"L'agent de code d'OpenAI : en ligne de commande, dans l'éditeur, dans le cloud et sur GitHub, avec AGENTS.md, modes d'approbation et MCP.", hk:['Codex'],
ch:[
{t:"Présentation et installation", h:`
<p><b>Codex</b> est l'agent de développement d'OpenAI, inclus dans les offres ChatGPT. Il fonctionne en <b>ligne de commande</b> (Codex CLI, open source), en <b>extension</b> pour VS Code et les éditeurs dérivés, dans le <b>cloud</b> (tâches lancées depuis ChatGPT qui travaillent en parallèle dans un environnement isolé) et sur <b>GitHub</b> pour la revue de code. Depuis septembre 2026, il utilise GPT-6.1 Sol.</p>
<pre class="code">npm install -g @openai/codex
codex          # se connecter avec son compte ChatGPT
codex exec "ajoute des tests au module de paiement"   # mode non interactif</pre>`},
{t:"AGENTS.md et réglages", h:`
<ul class="clean">
<li><b>AGENTS.md</b> : fichier d'instructions à la racine du projet, lu par Codex (et par d'autres agents qui ont adopté ce format) : commandes, conventions, interdits.</li>
<li><b>Modes d'approbation</b> : lecture seule, automatique dans le dossier du projet, ou accès complet. Commence toujours par le mode le plus restrictif.</li>
<li><b>Configuration</b> : fichier <code>~/.codex/config.toml</code> pour le modèle, les serveurs MCP et les permissions.</li>
<li><b>Revue de code</b> : sur GitHub, mentionner Codex dans une pull request lance une revue automatique.</li>
</ul>`},
{t:"Codex, Claude Code, Copilot, Cursor : que choisir ?", h:`
<div class="tbl-wrap"><table><thead><tr><th>Outil</th><th>Atout principal</th></tr></thead><tbody>
<tr><td>Codex</td><td>Inclus dans ChatGPT, tâches cloud en parallèle</td></tr>
<tr><td>Claude Code</td><td>Très complet (sous-agents, hooks, compétences, plugins), fort sur les grands projets</td></tr>
<tr><td>GitHub Copilot</td><td>Intégré à GitHub, choix de plusieurs agents (Copilot, Claude, Codex)</td></tr>
<tr><td>Cursor</td><td>Éditeur complet avec autocomplétion excellente ; plus de modèles OpenAI à partir du 12 novembre 2026</td></tr>
<tr><td>Antigravity</td><td>Environnement de Google centré sur les agents et Gemini</td></tr>
<tr><td>Vibe Code</td><td>Agent européen de Mistral</td></tr>
</tbody></table></div>
<div class="ex"><b class="t">Exercice</b><p>Donne la même petite tâche (ajouter une fonctionnalité et ses tests) à deux agents différents sur deux branches. Compare la qualité du code, le temps et le nombre de corrections nécessaires.</p></div>`}
]}
);
