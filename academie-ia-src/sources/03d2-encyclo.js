/* ====== ENCYCLOPÉDIE DE L'IA (2/2) ====== */
{p:'tech', t:"La pile de l'IA, du silicium à l'application", s:"Tout ce qu'il y a en dessous et au-dessus d'un chatbot", h:`
<p>Quand tu poses une question à ChatGPT, tu utilises la couche la plus haute d'un empilement de technologies. Comprendre cette pile permet de savoir qui contrôle quoi, d'où viennent les coûts et où se situe chaque outil. La section « La pile de l'IA » détaille chaque étage.</p>
<div class="tbl-wrap"><table><thead><tr><th>Étage</th><th>Ce que c'est</th><th>Acteurs</th></tr></thead><tbody>
<tr><td>7. Usages et société</td><td>Ce que les gens font avec l'IA, et les règles qui l'encadrent</td><td>Utilisateurs, entreprises, États, Union européenne</td></tr>
<tr><td>6. Applications</td><td>Les produits finis : assistants, outils métier, sites</td><td>ChatGPT, Claude, Gemini, Copilot, Cursor, Perplexity</td></tr>
<tr><td>5. Agents et automatisations</td><td>Des IA qui enchaînent des actions avec des outils</td><td>ChatGPT Work, Claude Cowork, n8n, Zapier, Codex</td></tr>
<tr><td>4. Frameworks et protocoles</td><td>Les briques pour construire : SDK, MCP, A2A, bases vectorielles</td><td>Agents SDK, Claude Agent SDK, LangChain, MCP</td></tr>
<tr><td>3. API et plateformes</td><td>L'accès aux modèles à la demande, facturé au token</td><td>API OpenAI, Claude, Gemini, Mistral ; AWS Bedrock, Azure, Vertex AI</td></tr>
<tr><td>2. Modèles</td><td>Les réseaux entraînés : fermés ou à poids ouverts</td><td>GPT-6, Claude, Gemini, Mistral, Llama, Muse, DeepSeek, Qwen</td></tr>
<tr><td>1. Infrastructure et cloud</td><td>Centres de données, réseau, électricité, refroidissement</td><td>Microsoft, Amazon, Google, Oracle, CoreWeave</td></tr>
<tr><td>0. Puces</td><td>GPU et accélérateurs qui font les calculs</td><td>Nvidia, AMD, Google (TPU), TSMC, ASML, SK Hynix</td></tr>
</tbody></table></div>
<div class="callout ok"><b>À retenir :</b> chaque étage dépend de celui du dessous. Une pénurie de puces, une coupure d'accès à un modèle (comme OpenAI envers Cursor en novembre 2026) ou une nouvelle loi se répercutent jusqu'à l'utilisateur.</div>`},

{p:'monde', t:"Les puces et le matériel", s:"GPU, TPU, mémoire et géopolitique des semi-conducteurs", h:`
<p>Entraîner et faire tourner un modèle, c'est faire des milliards de multiplications en parallèle. Les <b>GPU</b> (processeurs graphiques), conçus à l'origine pour les jeux vidéo, sont parfaits pour ça.</p>
<div class="tbl-wrap"><table><thead><tr><th>Acteur</th><th>Rôle</th></tr></thead><tbody>
<tr><td><b>Nvidia</b></td><td>Domine le marché des puces d'IA (générations H100 en 2022, Blackwell annoncée en 2024) grâce aussi à CUDA, son logiciel de programmation lancé en 2006. Première entreprise à dépasser 5 000 milliards de dollars de valorisation (octobre 2025) ; rachète Hugging Face en 2026.</td></tr>
<tr><td><b>Google</b></td><td>Ses propres puces, les <b>TPU</b>, utilisées pour entraîner Gemini et louées dans son cloud</td></tr>
<tr><td><b>AMD, Amazon, Microsoft, Meta</b></td><td>Puces concurrentes ou maison (Instinct, Trainium, Maia, MTIA) pour réduire la dépendance à Nvidia</td></tr>
<tr><td><b>TSMC</b> (Taïwan)</td><td>Fabrique la quasi-totalité des puces d'IA les plus avancées</td></tr>
<tr><td><b>ASML</b> (Pays-Bas)</td><td>Seul fabricant des machines de lithographie EUV indispensables aux puces les plus fines ; investisseur de Mistral en 2025</td></tr>
<tr><td><b>SK Hynix, Samsung, Micron</b></td><td>Mémoire HBM, ultra-rapide, empilée à côté des GPU</td></tr>
</tbody></table></div>
<p><b>Géopolitique :</b> depuis 2022, les États-Unis limitent l'exportation des puces d'IA avancées vers la Chine. Les laboratoires chinois (DeepSeek, Alibaba) ont répondu par des modèles plus efficaces et par des puces nationales (Huawei Ascend).</p>
<div class="callout ok"><b>À retenir :</b> l'IA dépend d'une chaîne matérielle très concentrée : quelques entreprises, et une seule usine géante à Taïwan pour les puces les plus avancées.</div>`},

{p:'monde', t:"Centres de données, énergie et environnement", s:"Ce que consomme vraiment l'IA", h:`
<p>Les modèles tournent dans des <b>centres de données</b> : des bâtiments remplis de serveurs, de réseaux et de systèmes de refroidissement. Les plus grands projets se comptent en gigawatts, l'équivalent de centrales électriques entières : Stargate d'OpenAI (annoncé en janvier 2025), Colossus de xAI à Memphis, les campus de Meta, Microsoft, Amazon et Google.</p>
<div class="tbl-wrap"><table><thead><tr><th>Indicateur</th><th>Chiffre publié</th><th>Source</th></tr></thead><tbody>
<tr><td>Électricité des centres de données dans le monde en 2024</td><td>Environ 415 TWh, soit environ 1,5 % de l'électricité mondiale</td><td>Agence internationale de l'énergie (rapport « Energy and AI », avril 2025)</td></tr>
<tr><td>Projection pour 2030</td><td>Environ 945 TWh, plus du double, tirée par l'IA</td><td>Même rapport</td></tr>
<tr><td>Une requête texte médiane à Gemini</td><td>0,24 Wh d'énergie et 0,26 mL d'eau</td><td>Google, août 2025</td></tr>
</tbody></table></div>
<p>Une question simple consomme peu. L'impact vient du volume (des milliards de requêtes par jour), de l'entraînement des modèles, des modèles de raisonnement qui produisent beaucoup de tokens, et surtout de la génération de vidéos, bien plus gourmande que le texte.</p>
<div class="callout ok"><b>À retenir :</b> utilise le plus petit modèle qui fait le travail, et évite de générer des images ou des vidéos inutiles.</div>`},

{p:'usage', t:"Modèles fermés et modèles ouverts", s:"Poids ouverts, licences, quantification et IA locale", h:`
<div class="tbl-wrap"><table><thead><tr><th></th><th>Modèle fermé</th><th>Modèle à poids ouverts</th></tr></thead><tbody>
<tr><td>Exemples (octobre 2026)</td><td>GPT-6, Claude Fable 5.1 et 5.5, Gemini 4 Argon, Grok 4.7</td><td>Muse Spark Open, Mistral Large 4 et Medium 3.5, DeepSeek V4, Qwen, gpt-oss, Gemma</td></tr>
<tr><td>Accès</td><td>Uniquement via l'application ou l'API de l'éditeur</td><td>Téléchargeable, utilisable sur ses propres serveurs ou son ordinateur</td></tr>
<tr><td>Avantages</td><td>Souvent les plus performants, rien à installer</td><td>Confidentialité totale possible, personnalisation, pas de dépendance</td></tr>
<tr><td>Inconvénients</td><td>Dépendance à un fournisseur, données envoyées en ligne</td><td>Matériel coûteux pour les grands modèles, sécurité à gérer soi-même</td></tr>
</tbody></table></div>
<p>« Open source » au sens strict impliquerait de publier aussi les données et le code d'entraînement, ce que peu font. On parle donc plutôt de <b>poids ouverts</b>. Chaque modèle a sa licence : Apache 2.0 et MIT sont libres ; d'autres imposent des conditions.</p>
<p><b>Quantification</b> : on compresse les poids (de 16 bits à 4 bits par exemple) pour faire tenir un modèle dans moins de mémoire, avec une petite perte de qualité. C'est ce qui permet de faire tourner un modèle de 8 milliards de paramètres sur un ordinateur portable avec Ollama ou LM Studio.</p>
<div class="callout ok"><b>À retenir :</b> l'écart entre modèles fermés et ouverts s'est fortement réduit depuis 2024, notamment grâce aux laboratoires chinois et à Mistral.</div>`},

{p:'usage', t:"Mesurer l'intelligence : benchmarks et classements", s:"Comment on compare les modèles, et pourquoi il faut s'en méfier", h:`
<div class="tbl-wrap"><table><thead><tr><th>Test</th><th>Ce qu'il mesure</th></tr></thead><tbody>
<tr><td>MMLU (2020)</td><td>Connaissances dans 57 matières ; désormais presque saturé</td></tr>
<tr><td>GPQA (2023)</td><td>Questions de sciences de niveau doctorat, « impossibles à googliser »</td></tr>
<tr><td>SWE-bench (2023)</td><td>Résoudre de vrais bugs dans de vrais projets de code</td></tr>
<tr><td>FrontierMath (2024)</td><td>Problèmes de mathématiques de niveau recherche</td></tr>
<tr><td>Humanity's Last Exam (2025)</td><td>Questions expertes très difficiles dans toutes les disciplines</td></tr>
<tr><td>ARC-AGI</td><td>Énigmes visuelles faciles pour l'humain, difficiles pour l'IA : mesure la capacité d'adaptation</td></tr>
<tr><td>LMArena</td><td>Des utilisateurs comparent deux réponses anonymes et votent : un classement par préférence</td></tr>
<tr><td>Durée des tâches (METR)</td><td>Longueur des tâches qu'un agent réussit seul ; elle double environ tous les sept mois selon les mesures publiées en 2025</td></tr>
</tbody></table></div>
<p><b>Les pièges :</b> un test peut fuiter dans les données d'entraînement (contamination), les éditeurs choisissent les tests où ils brillent, et un bon score ne garantit pas une bonne expérience sur tes tâches réelles.</p>
<div class="callout ok"><b>À retenir :</b> le meilleur benchmark, c'est ton propre usage. Teste deux ou trois modèles sur tes vraies demandes.</div>`},

{p:'usage', t:"Les limites des IA actuelles", s:"Hallucinations, biais, flagornerie et raisonnement fragile", h:`
<div class="tbl-wrap"><table><thead><tr><th>Limite</th><th>Ce qui se passe</th><th>Parade</th></tr></thead><tbody>
<tr><td><b>Hallucination</b></td><td>Invente des faits, des sources, des citations avec assurance</td><td>Demander les sources, vérifier, fournir les documents</td></tr>
<tr><td><b>Flagornerie</b> (sycophancy)</td><td>Donne raison à l'utilisateur pour lui plaire. En avril 2025, OpenAI a dû annuler une mise à jour de GPT-4o devenue trop complaisante.</td><td>Demander explicitement la critique, ne pas orienter la question</td></tr>
<tr><td><b>Biais</b></td><td>Reproduit les stéréotypes présents dans les données</td><td>Rester critique, varier les sources</td></tr>
<tr><td><b>Connaissances datées</b></td><td>Ignore ce qui s'est passé après son entraînement</td><td>Activer la recherche web</td></tr>
<tr><td><b>Raisonnement fragile</b></td><td>Réussit un problème difficile puis échoue sur une variante simple</td><td>Mode réflexion, vérification par code</td></tr>
<tr><td><b>Fiabilité des agents</b></td><td>Une petite erreur au début d'une longue tâche peut tout faire dérailler</td><td>Étapes de validation, garder la main</td></tr>
</tbody></table></div>
<div class="callout ok"><b>À retenir :</b> l'IA est très forte et faillible à la fois. Ton esprit critique reste indispensable.</div>`},

{p:'monde', t:"Sécurité et alignement de l'IA", s:"Comment les laboratoires essaient de garder le contrôle", h:`
<p>L'<b>alignement</b> consiste à faire en sorte qu'une IA fasse ce que l'on veut vraiment, de façon sûre, même dans des situations imprévues. Plus les modèles sont capables, plus la question devient sérieuse.</p>
<ul class="clean">
<li><b>Cadres de sécurité</b> : Anthropic publie sa politique de mise à l'échelle responsable (2023) avec des niveaux de sécurité (ASL) ; OpenAI a son « Preparedness Framework » (2023) ; Google DeepMind son « Frontier Safety Framework » (2024). Ils définissent des seuils de capacités dangereuses (cyberattaque, armes biologiques, autonomie) et les protections associées.</li>
<li><b>Red teaming</b> : des équipes attaquent le modèle avant sa sortie pour trouver ses failles.</li>
<li><b>Interprétabilité</b> : comprendre ce qui se passe dans les poids. En 2024, Anthropic a montré qu'on pouvait identifier et amplifier un « concept » à l'intérieur de Claude.</li>
<li><b>Instituts publics</b> : le Royaume-Uni puis les États-Unis ont créé des instituts d'évaluation de l'IA après le sommet de Bletchley Park (novembre 2023) ; un rapport scientifique international dirigé par Yoshua Bengio est paru en janvier 2025.</li>
</ul>
<h3>2026 : l'année des modèles retenus</h3>
<p>Pour la première fois, des laboratoires ont jugé leurs meilleurs modèles trop risqués pour une diffusion libre, surtout en cybersécurité : Claude Mythos (avril 2026) réservé à des partenaires de défense via Project Glasswing, Fable 5 diffusé avec des garde-fous, GPT-6 Astra présenté comme le premier modèle d'OpenAI au niveau « critique » en cybersécurité, Gemini 4 Argon d'abord réservé à des partenaires de sécurité.</p>
<div class="callout ok"><b>À retenir :</b> la sécurité de l'IA n'est plus un sujet théorique : elle décide aujourd'hui de qui a accès à quels modèles.</div>`},

{p:'monde', t:"L'économie de l'IA", s:"Qui paie, qui gagne, combien ça coûte", h:`
<ul class="clean">
<li><b>Abonnements</b> : la plupart des assistants ont une offre gratuite, une offre à une vingtaine d'euros par mois, et des offres haut de gamme pour les gros utilisateurs. ChatGPT a ajouté la publicité dans ses offres gratuites en 2026.</li>
<li><b>API</b> : facturation au million de tokens. Exemple en octobre 2026 : Claude Opus 5.5 à 4 $ en entrée et 20 $ en sortie ; Gemini 4 Argon à 2 $ et 10 $ jusqu'au 30 novembre 2026, puis 4 $ et 20 $.</li>
<li><b>Investissements</b> : Microsoft a investi plus de 13 milliards de dollars dans OpenAI ; Amazon et Google des milliards dans Anthropic ; Mistral a levé 3 milliards d'euros en septembre 2026.</li>
<li><b>Rachats géants de 2026</b> : SpaceX absorbe xAI (février, ensemble valorisé 1 250 milliards de dollars) puis Cursor (60 milliards) ; Nvidia rachète Hugging Face (12,9 milliards).</li>
<li><b>Dépenses d'infrastructure</b> : les grands groupes du numérique investissent chaque année des centaines de milliards de dollars dans les centres de données.</li>
</ul>
<p>Le débat sur une possible « bulle » est permanent : les revenus progressent très vite, mais les dépenses encore plus. Le patron de Hugging Face parlait fin 2025 d'une « bulle des LLM » plutôt que d'une bulle de l'IA.</p>
<div class="callout ok"><b>À retenir :</b> l'IA est l'un des secteurs les plus concentrés et les plus capitalistiques de l'histoire de l'économie.</div>`},

{p:'monde', t:"L'IA et le travail", s:"Ce qui change, ce qui reste humain", h:`
<p>L'IA automatise d'abord des <b>tâches</b>, pas des métiers entiers. Les métiers changent : certaines tâches disparaissent, d'autres apparaissent.</p>
<div class="tbl-wrap"><table><thead><tr><th>Domaine</th><th>Ce que l'IA fait déjà bien</th><th>Ce qui reste humain</th></tr></thead><tbody>
<tr><td>Programmation</td><td>Écrire, tester et corriger du code ; agents qui travaillent des heures</td><td>Comprendre le besoin, l'architecture, la responsabilité</td></tr>
<tr><td>Rédaction et communication</td><td>Premiers jets, reformulation, traduction</td><td>Le point de vue, la relation, la stratégie</td></tr>
<tr><td>Service client</td><td>Réponses aux questions fréquentes</td><td>Cas complexes, empathie, décision commerciale</td></tr>
<tr><td>Analyse et recherche</td><td>Synthèse de documents, analyse de données</td><td>Le jugement, la vérification, l'interprétation</td></tr>
<tr><td>Création visuelle</td><td>Images, vidéos, déclinaisons</td><td>La direction artistique, le sens</td></tr>
</tbody></table></div>
<p><b>Les compétences qui prennent de la valeur :</b> savoir formuler un besoin, vérifier un résultat, comprendre son domaine en profondeur, organiser le travail avec des agents, et décider.</p>
<div class="callout ok"><b>À retenir :</b> la meilleure protection, c'est de savoir utiliser l'IA mieux que les autres dans son propre domaine.</div>`},

{p:'monde', t:"Le droit de l'IA", s:"RGPD, AI Act, droit d'auteur et grands procès", h:`
<div class="tbl-wrap"><table><thead><tr><th>Sujet</th><th>Ce qu'il faut savoir</th></tr></thead><tbody>
<tr><td><b>RGPD</b></td><td>Toute donnée personnelle est protégée. En décembre 2024, l'autorité italienne a infligé 15 millions d'euros d'amende à OpenAI ; en janvier 2025, elle a bloqué DeepSeek.</td></tr>
<tr><td><b>AI Act européen</b></td><td>En vigueur depuis août 2024. Interdictions depuis février 2025, règles pour les grands modèles depuis août 2025, transparence des contenus générés depuis août 2026. L'omnibus numérique de juillet 2026 repousse les règles sur le haut risque au 2 décembre 2027.</td></tr>
<tr><td><b>Droit d'auteur</b></td><td>Procès du New York Times contre OpenAI et Microsoft (depuis décembre 2023) ; Disney et Universal contre Midjourney (juin 2025) ; Anthropic a accepté de payer 1,5 milliard de dollars à des auteurs pour clore un procès sur des livres piratés (septembre 2025).</td></tr>
<tr><td><b>Deepfakes</b></td><td>Après le scandale des images de Grok (janvier 2026), plusieurs pays ont bloqué l'outil ; l'Union européenne interdit à partir du 2 décembre 2026 les images intimes truquées sans consentement.</td></tr>
<tr><td><b>IA et État</b></td><td>Conflit entre Anthropic et le Pentagone en 2026 sur les usages militaires ; contrôles des exportations de modèles et de puces.</td></tr>
</tbody></table></div>
<div class="callout ok"><b>À retenir :</b> en Europe, tout contenu généré par IA et diffusé doit être signalé, et aucune donnée personnelle ne doit être confiée à une IA sans base légale.</div>`},

{p:'monde', t:"Les entreprises de l'IA", s:"Qui fait quoi en 2026", h:`
<div class="tbl-wrap"><table><thead><tr><th>Entreprise</th><th>Création, dirigeants</th><th>Ce qu'il faut retenir</th></tr></thead><tbody>
<tr><td><b>OpenAI</b></td><td>2015 ; Sam Altman</td><td>ChatGPT, GPT-6, Codex, Sora ; restructurée en 2025 ; partenaire historique de Microsoft</td></tr>
<tr><td><b>Anthropic</b></td><td>2021 ; Dario et Daniela Amodei</td><td>Claude, Claude Code, MCP ; priorité affichée à la sécurité ; modèles Fable et Mythos</td></tr>
<tr><td><b>Google DeepMind</b></td><td>DeepMind fondé en 2010, racheté par Google en 2014 ; Demis Hassabis</td><td>Gemini, AlphaGo, AlphaFold (prix Nobel 2024)</td></tr>
<tr><td><b>Meta</b></td><td>Mark Zuckerberg ; laboratoire dirigé par Alexandr Wang depuis 2025</td><td>Llama puis Muse Spark, Meta AI ; grands modèles à poids ouverts</td></tr>
<tr><td><b>Microsoft</b></td><td>Satya Nadella</td><td>Copilot, Azure ; propose les modèles d'OpenAI et d'Anthropic</td></tr>
<tr><td><b>Mistral AI</b></td><td>2023, Paris ; Arthur Mensch</td><td>Champion européen, Vibe (ex-Le Chat), modèles ouverts</td></tr>
<tr><td><b>SpaceX (ex-xAI)</b></td><td>xAI créée en 2023 par Elon Musk, fusionnée avec SpaceX en 2026</td><td>Grok, Cursor</td></tr>
<tr><td><b>DeepSeek</b></td><td>2023, Chine</td><td>Modèles ouverts très efficaces ; choc de janvier 2025</td></tr>
<tr><td><b>Alibaba (Qwen)</b></td><td>Chine</td><td>Famille Qwen, très utilisée en open source</td></tr>
<tr><td><b>Nvidia</b></td><td>1993 ; Jensen Huang</td><td>Les puces de l'IA ; rachète Hugging Face</td></tr>
<tr><td><b>Hugging Face</b></td><td>2016 ; Clément Delangue, Julien Chaumond, Thomas Wolf</td><td>Plateforme de l'IA ouverte</td></tr>
</tbody></table></div>`},

{p:'monde', t:"Les grandes figures de l'IA", s:"Les personnes qui ont construit le domaine", h:`
<div class="tbl-wrap"><table><thead><tr><th>Personne</th><th>Contribution</th></tr></thead><tbody>
<tr><td><b>Alan Turing</b></td><td>Pose en 1950 la question « Les machines peuvent-elles penser ? » et propose le test qui porte son nom</td></tr>
<tr><td><b>John McCarthy, Marvin Minsky</b></td><td>Organisent la conférence de Dartmouth (1956) qui lance le terme « intelligence artificielle »</td></tr>
<tr><td><b>Frank Rosenblatt</b></td><td>Invente le perceptron (1958), premier réseau de neurones qui apprend</td></tr>
<tr><td><b>Geoffrey Hinton</b></td><td>Rétropropagation, apprentissage profond ; prix Turing 2018, prix Nobel de physique 2024</td></tr>
<tr><td><b>Yann LeCun</b></td><td>Chercheur français, réseaux convolutifs ; prix Turing 2018 ; longtemps chef scientifique de Meta</td></tr>
<tr><td><b>Yoshua Bengio</b></td><td>Pionnier canadien du deep learning ; prix Turing 2018 ; voix majeure de la sécurité de l'IA</td></tr>
<tr><td><b>Fei-Fei Li</b></td><td>Crée ImageNet (2009), la base d'images qui a déclenché la révolution de 2012</td></tr>
<tr><td><b>Demis Hassabis</b></td><td>Cofondateur de DeepMind, AlphaGo, AlphaFold ; prix Nobel de chimie 2024</td></tr>
<tr><td><b>Ilya Sutskever</b></td><td>Coauteur d'AlexNet, cofondateur d'OpenAI ; fonde Safe Superintelligence en 2024</td></tr>
<tr><td><b>Sam Altman, Dario Amodei, Arthur Mensch</b></td><td>Dirigent OpenAI, Anthropic et Mistral AI</td></tr>
<tr><td><b>Andrej Karpathy</b></td><td>Chercheur et pédagogue ; invente en février 2025 l'expression « vibe coding »</td></tr>
<tr><td><b>Jensen Huang</b></td><td>Fondateur de Nvidia, dont les puces font tourner l'IA</td></tr>
</tbody></table></div>`}
];
