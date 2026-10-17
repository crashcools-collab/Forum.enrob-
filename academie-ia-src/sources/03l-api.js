/* ====== Les API expliquées simplement ====== */
const CHAPITRE_API = `
<p><b>API</b> veut dire <i>Application Programming Interface</i>, en français « interface de programmation ». C'est une <b>porte d'entrée</b> qu'un logiciel ou un service ouvre pour que d'autres programmes puissent lui demander quelque chose, en suivant des règles précises.</p>
<div class="callout info"><b>L'image du restaurant.</b> Tu es le client (ton programme). La cuisine, c'est le service (par exemple un service météo). Tu n'entres pas en cuisine : tu passes commande au <b>serveur</b>, c'est l'API. Le <b>menu</b>, c'est la documentation qui dit ce que tu peux commander et comment. Ta <b>commande</b> est la requête, le <b>plat</b> est la réponse. La cuisine garde ses recettes secrètes : elle ne montre que ce qui est au menu.</div>

<h3>Tu en utilises des dizaines chaque jour sans le savoir</h3>
<div class="tbl-wrap"><table><thead><tr><th>Situation</th><th>L'API derrière</th></tr></thead><tbody>
<tr><td>L'application météo de ton téléphone</td><td>Elle demande les prévisions à l'API d'un service météo</td></tr>
<tr><td>Le bouton « Se connecter avec Google »</td><td>Le site utilise l'API de connexion de Google, sans jamais voir ton mot de passe</td></tr>
<tr><td>Payer en ligne sur un site marchand</td><td>Le site envoie le paiement à l'API d'un prestataire comme Stripe</td></tr>
<tr><td>Une carte affichée sur un site</td><td>L'API d'un service de cartographie fournit la carte</td></tr>
<tr><td>Un comparateur de vols ou d'hôtels</td><td>Il interroge les API des compagnies et des plateformes</td></tr>
<tr><td>Une application qui « parle » avec ChatGPT, Claude ou Gemini</td><td>Elle envoie les questions à l'API du modèle d'IA</td></tr>
<tr><td>Excel qui affiche un taux de change à jour</td><td>Il récupère la donnée auprès d'une API financière</td></tr>
</tbody></table></div>

<h3>Comment ça marche concrètement</h3>
<ol class="steps">
<li>Ton programme envoie une <b>requête</b> à une adresse web précise (le « point d'accès », ou endpoint).</li>
<li>La requête indique une <b>méthode</b> : GET pour lire, POST pour créer ou envoyer, PUT ou PATCH pour modifier, DELETE pour supprimer.</li>
<li>Elle contient souvent une <b>clé</b> qui prouve qui tu es, et des <b>données</b> au format JSON.</li>
<li>Le service répond avec un <b>code</b> (200 = réussi, 401 = clé manquante ou fausse, 404 = introuvable, 429 = trop de demandes, 500 = erreur du service) et des <b>données</b>, le plus souvent en JSON.</li>
</ol>
<p>Essaie tout de suite : colle cette adresse dans ton navigateur. C'est l'API gratuite d'Open-Meteo, qui ne demande pas de clé.</p>
<pre class="code">https://api.open-meteo.com/v1/forecast?latitude=48.85&amp;longitude=2.35&amp;current=temperature_2m</pre>
<p>Tu obtiens un texte au format JSON qui contient, entre autres, la température actuelle à Paris (<code>"temperature_2m"</code>). Ce texte n'est pas fait pour un humain mais pour un programme, qui va le lire et l'afficher joliment. Le même appel en Python :</p>
<pre class="code">import requests
r = requests.get("https://api.open-meteo.com/v1/forecast",
                 params={"latitude": 48.85, "longitude": 2.35, "current": "temperature_2m"})
print(r.json()["current"]["temperature_2m"], "°C à Paris")</pre>

<h3>Pourquoi les API existent</h3>
<div class="tbl-wrap"><table><thead><tr><th>Raison</th><th>Explication</th></tr></thead><tbody>
<tr><td><b>Ne pas réinventer la roue</b></td><td>Une application de livraison n'a pas besoin de créer sa propre carte du monde ni son propre système de paiement : elle utilise ceux qui existent.</td></tr>
<tr><td><b>Protéger et séparer</b></td><td>Le service garde son code et ses données secrets ; il n'expose que ce qu'il a décidé de partager, avec des règles.</td></tr>
<tr><td><b>Contrôler l'accès</b></td><td>Grâce aux clés, le service sait qui l'utilise, combien, et peut limiter ou couper un accès.</td></tr>
<tr><td><b>Automatiser</b></td><td>Les programmes se parlent entre eux sans humain : un nouveau client dans le site crée automatiquement une facture dans le logiciel comptable.</td></tr>
<tr><td><b>Faire un métier</b></td><td>Beaucoup d'entreprises vendent leur service à l'usage via une API : c'est le cas d'OpenAI, d'Anthropic, de Google ou de Mistral pour leurs modèles.</td></tr>
<tr><td><b>Assembler comme des briques</b></td><td>Une application moderne est souvent un assemblage de plusieurs API : connexion, paiement, cartes, mails, IA.</td></tr>
</tbody></table></div>

<h3>Les différents types d'API</h3>
<ul class="clean">
<li><b>API web REST</b> : les plus courantes, des adresses web et du JSON, comme l'exemple météo.</li>
<li><b>GraphQL</b> : on demande exactement les champs voulus en une seule requête.</li>
<li><b>Webhooks</b> : l'inverse, c'est le service qui appelle ton programme quand un événement arrive (un paiement reçu, un formulaire rempli).</li>
<li><b>Temps réel</b> (WebSocket) : une connexion qui reste ouverte, pour les messageries, la voix en direct ou les cours de bourse.</li>
<li><b>API de bibliothèques et de systèmes</b> : les fonctions qu'un langage, une bibliothèque ou Windows mettent à disposition des programmes.</li>
</ul>

<h3>Le lien avec l'IA</h3>
<ul class="clean">
<li>Les <b>modèles d'IA</b> sont proposés via des API : ton programme envoie un texte, une image ou un son, et reçoit la réponse du modèle. C'est comme ça qu'on ajoute l'IA à un site, une application ou une automatisation.</li>
<li>Avec le <b>function calling</b>, c'est l'IA qui décide d'appeler une API : chercher la météo, réserver un créneau, lire un agenda.</li>
<li>Le <b>MCP</b> est un standard qui permet de brancher facilement des API sur les agents d'IA.</li>
<li>Un <b>agent</b>, c'est en grande partie un modèle d'IA qui sait utiliser des API pour agir dans le monde.</li>
</ul>

<h3>Les règles de sécurité</h3>
<ul class="clean no">
<li>Une clé API est un secret, comme un mot de passe : jamais dans le code d'une page web visible, jamais sur GitHub, jamais envoyée par message.</li>
<li>Une clé volée peut être utilisée à tes frais : fixe une limite de dépenses quand le service le permet.</li>
</ul>
<ul class="clean ok">
<li>Range les clés dans des variables d'environnement ou des coffres à secrets.</li>
<li>Si une clé fuit : supprime-la dans la console du service et crée-en une nouvelle.</li>
</ul>
<div class="callout ok"><b>À retenir :</b> une API, c'est un serveur de restaurant pour les programmes. Elle permet de réutiliser des services, de les assembler et de tout automatiser, sans jamais voir l'intérieur de la cuisine.</div>`;

ENCYCLO.push({p:'base', t:"Les API expliquées simplement", s:"C'est quoi, à quoi ça sert, pourquoi ça existe", h:CHAPITRE_API +
  '<div class="ex"><b class="t">Exercice</b><p>Ouvre l\'adresse de l\'API Open-Meteo dans ton navigateur et repère la température. Puis demande à une IA : « Écris un petit programme qui affiche la météo de ma ville avec l\'API Open-Meteo, et explique chaque ligne. »</p></div>'});
NIV_ENC.push(1);

// Le premier chapitre du cours « Les API d'IA » reprend l'explication complète
const coursApi = COURS.find(c => c.id === 'api');
coursApi.ch[0] = {t:"C'est quoi une API, à quoi ça sert, pourquoi", h:CHAPITRE_API + `
<h3>Les consoles des fournisseurs d'IA</h3>
<div class="tbl-wrap"><table><thead><tr><th>Fournisseur</th><th>Console développeur</th></tr></thead><tbody>
<tr><td>OpenAI</td><td>platform.openai.com</td></tr>
<tr><td>Anthropic</td><td>Claude Console (console développeur d'Anthropic)</td></tr>
<tr><td>Google</td><td>aistudio.google.com, ou Vertex AI pour les entreprises</td></tr>
<tr><td>Mistral</td><td>console.mistral.ai</td></tr>
</tbody></table></div>
<p>L'abonnement à l'interface (ChatGPT Plus, Claude Pro…) et l'API sont facturés séparément.</p>`};
