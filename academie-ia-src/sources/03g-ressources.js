/* ====== NIVEAUX ====== */
const NIVEAUX = [
{n:1, t:'Novice', d:"Tu n'as jamais (ou presque) utilisé d'IA. Objectif : comprendre ce que c'est, l'utiliser sans risque et obtenir tes premiers bons résultats."},
{n:2, t:'Débutant', d:"Tu utilises un assistant de temps en temps. Objectif : maîtriser le prompt, choisir le bon outil, créer tes premières images et pages web."},
{n:3, t:'Apprenant', d:"Tu utilises l'IA chaque semaine. Objectif : comprendre comment elle fonctionne, automatiser, travailler avec GitHub, sécuriser tes usages."},
{n:4, t:'Affirmé', d:"Tu es à l'aise avec plusieurs outils. Objectif : construire des agents, utiliser les API, les agents de code, les modèles ouverts et l'IA locale."},
{n:5, t:'Expert', d:"Tu construis des systèmes d'IA. Objectif : entraîner et affiner des modèles, les servir en production, évaluer, maîtriser la sécurité et l'alignement."}
];
const NIV_COURS = {chatgpt:1, claude:1, gemini:1, perplexity:1, mistral:2, copilot:2, notebooklm:2, creation:2, siteweb:2, github:3, automatisation:3, cyber:3, jeux:3, huggingface:4, cursor:4, api:4, local:4, agents:4, claudecode:4, codex:4};
const NIV_ENC = [1,2,3,4,4,3,4,3,2,3,3,4, 2,3,2,3,5,2,5,3,2,3,1,1, 5,5,5];

/* ====== ENCYCLOPÉDIE : chapitres experts ====== */
ENCYCLO.push(
{p:'tech', t:"Les mathématiques derrière les modèles", s:"Vecteurs, matrices, softmax, fonction de perte et gradient", h:`
<div class="tbl-wrap"><table><thead><tr><th>Notion</th><th>Rôle dans un modèle</th></tr></thead><tbody>
<tr><td><b>Vecteurs et matrices</b></td><td>Chaque token est un vecteur ; chaque couche multiplie ces vecteurs par des matrices de poids. Un modèle, c'est surtout des multiplications de matrices, d'où l'importance des GPU.</td></tr>
<tr><td><b>Produit scalaire</b></td><td>Mesure la ressemblance entre deux vecteurs. L'attention compare ainsi chaque token aux autres (requêtes, clés, valeurs).</td></tr>
<tr><td><b>Softmax</b></td><td>Transforme une liste de scores en probabilités qui font 100 %. Utilisé dans l'attention et pour choisir le token suivant.</td></tr>
<tr><td><b>Fonction de perte</b> (entropie croisée)</td><td>Mesure à quel point le modèle s'est trompé sur le token suivant. L'entraînement cherche à la faire baisser.</td></tr>
<tr><td><b>Gradient et descente de gradient</b></td><td>Le gradient indique dans quelle direction modifier chaque poids pour réduire l'erreur ; on avance par petits pas (le taux d'apprentissage). Les optimiseurs comme Adam ajustent ces pas.</td></tr>
<tr><td><b>Température et échantillonnage</b></td><td>Divise les scores avant le softmax : basse, le modèle choisit presque toujours le token le plus probable ; haute, il varie davantage. Le « top-p » limite le tirage aux tokens les plus probables.</td></tr>
</tbody></table></div>
<p>Pour aller plus loin : la série vidéo de 3Blue1Brown sur les réseaux de neurones et le cours « Neural Networks: Zero to Hero » d'Andrej Karpathy (voir Ressources) montrent ces calculs pas à pas.</p>`},
{p:'tech', t:"Affiner et entraîner ses propres modèles", s:"Fine-tuning, LoRA, données, outils et coûts", h:`
<ol class="steps">
<li><b>Choisir un modèle de base</b> à poids ouverts adapté à la taille de ta machine (par exemple un modèle de 1 à 8 milliards de paramètres pour commencer).</li>
<li><b>Préparer les données</b> : quelques centaines à quelques milliers d'exemples de qualité au format question / réponse attendue. La qualité compte bien plus que la quantité.</li>
<li><b>Entraîner avec LoRA ou QLoRA</b> : au lieu de modifier tous les poids, on entraîne de petites matrices ajoutées au modèle. C'est faisable sur une seule carte graphique, voire sur un service de notebooks en ligne.</li>
<li><b>Outils</b> : TRL et PEFT de Hugging Face, Unsloth (rapide et économe en mémoire), LLaMA-Factory (interface complète), ou les services de fine-tuning des API (OpenAI, Mistral, Google).</li>
<li><b>Évaluer</b> sur des exemples jamais vus pendant l'entraînement, et comparer au modèle de départ avec un bon prompt.</li>
<li><b>Publier ou déployer</b> : sur Hugging Face, ou convertir en GGUF pour Ollama.</li>
</ol>
<p>Au-delà du fine-tuning, on peut faire de l'<b>alignement par préférences</b> (DPO, une méthode plus simple que le RLHF), ou entraîner un petit modèle de zéro pour apprendre : le projet nanochat d'Andrej Karpathy (octobre 2025) montre un mini-ChatGPT complet entraîné pour quelques centaines de dollars.</p>`},
{p:'tech', t:"Servir un modèle en production", s:"Inférence, latence, coûts, serveurs et observabilité", h:`
<div class="tbl-wrap"><table><thead><tr><th>Sujet</th><th>Ce qu'il faut maîtriser</th></tr></thead><tbody>
<tr><td><b>Serveurs d'inférence</b></td><td>vLLM, llama.cpp, Ollama, ou les services gérés (AWS Bedrock, Azure AI Foundry, Google Vertex AI, Hugging Face Inference Endpoints)</td></tr>
<tr><td><b>Latence</b></td><td>Temps avant le premier token et vitesse de génération ; le streaming affiche la réponse au fur et à mesure</td></tr>
<tr><td><b>Débit et coûts</b></td><td>Regroupement des requêtes (batching), cache des préfixes communs (prompt caching), choix du plus petit modèle suffisant, routage entre modèles</td></tr>
<tr><td><b>Sorties structurées</b></td><td>Imposer un schéma JSON pour que le reste du programme puisse lire la réponse sans erreur</td></tr>
<tr><td><b>Observabilité</b></td><td>Journaliser les prompts, les réponses, les outils appelés, les coûts et les erreurs ; tracer les agents étape par étape</td></tr>
<tr><td><b>Évaluations continues</b></td><td>Un jeu de tests relancé à chaque changement de prompt ou de modèle</td></tr>
<tr><td><b>Sécurité</b></td><td>Filtrage des entrées et sorties, limites d'usage, protection contre l'injection, isolement des outils</td></tr>
</tbody></table></div>`}
);

/* ====== HISTOIRE : de 1943 à 2016 ====== */
HIST.push(
{d:'1943-12-31',s:'1943',a:'Recherche',c:'societe',t:'Premier modèle mathématique du neurone',w:"Warren McCulloch et Walter Pitts montrent qu'un réseau de neurones simplifiés peut calculer. L'idée des réseaux de neurones est née."},
{d:'1950-10-01',s:'octobre 1950',a:'Recherche',c:'societe',t:'Alan Turing : « Les machines peuvent-elles penser ? »',w:"Il propose le jeu de l'imitation, futur « test de Turing »."},
{d:'1956-08-31',s:'été 1956',a:'Recherche',c:'societe',t:'Conférence de Dartmouth : naissance du terme « intelligence artificielle »',w:"John McCarthy, Marvin Minsky et d'autres lancent l'IA comme discipline."},
{d:'1958-07-01',s:'1958',a:'Recherche',c:'modele',t:'Le perceptron de Frank Rosenblatt',w:"Premier réseau de neurones capable d'apprendre à reconnaître des formes simples."},
{d:'1966-01-01',s:'1966',a:'Recherche',c:'produit',t:'ELIZA, le premier chatbot',w:"Joseph Weizenbaum crée au MIT un programme qui imite un psychothérapeute. Les utilisateurs s'y attachent déjà."},
{d:'1969-01-01',s:'1969',a:'Recherche',c:'societe',t:'Le livre « Perceptrons » de Minsky et Papert',w:"Il démontre les limites des réseaux à une couche et contribue à freiner la recherche sur les réseaux de neurones."},
{d:'1974-01-01',s:'1974–1980',a:'Recherche',c:'entreprise',t:'Premier « hiver de l\'IA »',w:"Les promesses ne sont pas tenues : les financements s'effondrent au Royaume-Uni et aux États-Unis."},
{d:'1980-01-01',s:'années 1980',a:'Recherche',c:'produit',t:'L\'âge des systèmes experts',w:"Des milliers de règles écrites à la main pour diagnostiquer ou configurer : premier succès commercial de l'IA."},
{d:'1986-10-09',s:'1986',a:'Recherche',c:'societe',t:'La rétropropagation popularisée',w:"Rumelhart, Hinton et Williams montrent comment entraîner des réseaux à plusieurs couches. La base de tout le deep learning."},
{d:'1987-01-01',s:'1987–1993',a:'Recherche',c:'entreprise',t:'Second hiver de l\'IA',w:"Effondrement du marché des machines spécialisées et des systèmes experts, trop coûteux à maintenir."},
{d:'1989-01-01',s:'1989',a:'Recherche',c:'modele',t:'Yann LeCun et les réseaux convolutifs',w:"Ils lisent les chiffres manuscrits ; utilisés ensuite pour lire une grande partie des chèques aux États-Unis."},
{d:'1997-05-11',a:'IBM',c:'produit',t:'Deep Blue bat Garry Kasparov aux échecs',w:"Première victoire d'un ordinateur sur le champion du monde en match. Une IA de calcul et de règles, pas d'apprentissage."},
{d:'1997-11-15',s:'1997',a:'Recherche',c:'modele',t:'Les réseaux LSTM',w:"Hochreiter et Schmidhuber créent des réseaux capables de mémoriser sur de longues séquences : reconnaissance vocale et traduction des années 2010."},
{d:'2006-07-01',s:'2006',a:'Recherche',c:'societe',t:'Le retour des réseaux profonds',w:"Geoffrey Hinton montre comment entraîner des réseaux à nombreuses couches : le terme « deep learning » s'impose."},
{d:'2009-06-20',s:'2009',a:'Recherche',c:'societe',t:'ImageNet',w:"Fei-Fei Li publie une base de millions d'images étiquetées, qui servira de banc d'essai à la vision par ordinateur."},
{d:'2011-02-16',a:'IBM',c:'produit',t:'Watson gagne au jeu télévisé Jeopardy!',w:"L'IA bat les meilleurs champions humains de quiz."},
{d:'2011-10-04',a:'Apple',c:'produit',t:'Siri sur l\'iPhone 4S',w:"Premier assistant vocal grand public."},
{d:'2012-09-30',a:'Recherche',c:'modele',t:'AlexNet remporte ImageNet',w:"Krizhevsky, Sutskever et Hinton écrasent la concurrence grâce à un réseau profond entraîné sur GPU. Le point de départ de la révolution actuelle."},
{d:'2013-01-16',s:'2013',a:'Google',c:'modele',t:'Word2vec',w:"Les mots deviennent des vecteurs : « roi − homme + femme ≈ reine ». Naissance des embeddings modernes."},
{d:'2014-01-26',s:'janvier 2014',a:'Google',c:'entreprise',t:'Google rachète DeepMind',w:"Le laboratoire londonien de Demis Hassabis devient le fer de lance de Google en IA."},
{d:'2014-06-10',s:'2014',a:'Recherche',c:'modele',t:'Les réseaux antagonistes (GAN)',w:"Ian Goodfellow invente une méthode où deux réseaux s'affrontent : premiers visages synthétiques réalistes."},
{d:'2015-12-11',a:'OpenAI',c:'entreprise',t:'Création d\'OpenAI',w:"Laboratoire fondé notamment par Sam Altman, Elon Musk, Ilya Sutskever et Greg Brockman, à l'origine à but non lucratif."},
{d:'2016-03-15',a:'Google',c:'modele',t:'AlphaGo bat Lee Sedol au go (4 à 1)',w:"Un jeu jugé trop intuitif pour les machines tombe dix ans plus tôt que prévu, grâce à l'apprentissage profond et par renforcement."},
{d:'2019-03-27',a:'Recherche',c:'societe',t:'Prix Turing pour Hinton, LeCun et Bengio',w:"Les trois « parrains du deep learning » reçoivent l'équivalent du Nobel de l'informatique."}
);

/* ====== LA PILE DE L'IA ====== */
const PILE = [
{e:7, t:'Usages et société', d:"Ce que les gens font avec l'IA, et ce qui l'encadre : usages personnels et professionnels, éducation, emploi, lois, éthique.", a:"Utilisateurs, entreprises, États, Union européenne (AI Act), CNIL, ANSSI", toi:"Utiliser l'IA de façon efficace, critique et sûre.", go:[['bases','Les fondamentaux'],['securite','Sécurité & règles'],['encyclo','Encyclopédie : travail, droit']]},
{e:6, t:'Applications', d:"Les produits finis : assistants de discussion, outils de bureautique, éditeurs de code, générateurs d'images, sites et applications.", a:"ChatGPT, Claude, Gemini, Vibe, Copilot, Perplexity, Cursor, Midjourney", toi:"Choisir le bon outil, maîtriser ses fonctions avancées, créer tes propres sites.", go:[['cours','Cours par outil'],['outils','Panorama des IA'],['cours:siteweb','Créer un site web']]},
{e:5, t:'Agents et automatisations', d:"Des IA qui enchaînent des actions avec des outils, seules ou dans des flux automatisés.", a:"ChatGPT Work, Claude Cowork, Codex, Claude Code, n8n, Zapier, Make, Power Automate", toi:"Automatiser tes tâches répétitives et confier des missions longues à des agents.", go:[['cours:automatisation','Automatiser avec l\'IA'],['cours:agents','Construire un agent'],['cours:claudecode','Claude Code']]},
{e:4, t:'Frameworks et protocoles', d:"Les briques pour construire des applications d'IA : kits de développement, protocoles de connexion, bases vectorielles.", a:"OpenAI Agents SDK, Claude Agent SDK, Google ADK, LangGraph, LlamaIndex, MCP, A2A", toi:"Programmer tes agents, créer tes serveurs MCP, brancher l'IA sur tes données.", go:[['cours:agents','Construire un agent'],['ressources','Ressources GitHub']]},
{e:3, t:'API et plateformes', d:"L'accès aux modèles à la demande, facturé au token, directement ou via les grands clouds.", a:"API OpenAI, Claude, Gemini, Mistral, DeepSeek ; AWS Bedrock, Azure AI Foundry, Google Vertex AI, Hugging Face", toi:"Appeler un modèle depuis ton code, maîtriser les coûts et les clés.", go:[['cours:api','Les API d\'IA'],['cours:huggingface','Hugging Face']]},
{e:2, t:'Modèles', d:"Les réseaux entraînés eux-mêmes, fermés ou à poids ouverts, généralistes ou spécialisés.", a:"GPT-6, Claude Fable et 5.5, Gemini 4 Argon, Grok 4.7, Mistral Large 4, Muse Spark, DeepSeek V4, Qwen, gpt-oss", toi:"Comprendre leur fonctionnement, les comparer, les faire tourner en local, les affiner.", go:[['encyclo','Encyclopédie : comment ça marche'],['cours:local','IA locale'],['histoire','Histoire de l\'IA']]},
{e:1, t:'Infrastructure et cloud', d:"Les centres de données, le réseau, l'électricité et le refroidissement qui font tourner les modèles.", a:"Microsoft Azure, Amazon Web Services, Google Cloud, Oracle, CoreWeave ; projets Stargate, Colossus", toi:"Comprendre d'où viennent les coûts, l'impact énergétique et la dépendance aux fournisseurs.", go:[['encyclo','Encyclopédie : énergie et économie']]},
{e:0, t:'Puces et matériel', d:"Les processeurs qui font les calculs : GPU, TPU, mémoire HBM, et la chaîne de fabrication.", a:"Nvidia, AMD, Google (TPU), Amazon (Trainium), TSMC, ASML, SK Hynix, Samsung", toi:"Comprendre la géopolitique de l'IA et choisir ton matériel pour l'IA locale.", go:[['encyclo','Encyclopédie : les puces']]}
];

/* ====== RESSOURCES : les meilleurs dépôts et cours ====== */
const RES_CATS = {local:'Faire tourner l\'IA chez soi', agents:'Agents et MCP', code:'Agents de code', auto:'Automatisation et plateformes', donnees:'Documents et données', media:'Images, son, vidéo', train:'Entraîner et affiner', apprendre:'Apprendre l\'IA', modeles:'Modèles et données Hugging Face', cyber:'Cybersécurité', jeux:'Jeux vidéo'};
const GH = 'https://github.com/', HF = 'https://huggingface.co/';
const RESSOURCES = [
{n:'ollama/ollama',u:GH+'ollama/ollama',s:'GitHub',c:'local',v:2,d:"Lancer des modèles ouverts sur son ordinateur en une commande."},
{n:'ggml-org/llama.cpp',u:GH+'ggml-org/llama.cpp',s:'GitHub',c:'local',v:4,d:"Le moteur d'inférence en C++ qui fait tourner les modèles quantifiés partout, base de nombreux outils."},
{n:'open-webui/open-webui',u:GH+'open-webui/open-webui',s:'GitHub',c:'local',v:3,d:"Une interface de discussion type ChatGPT pour tes modèles locaux ou tes API."},
{n:'vllm-project/vllm',u:GH+'vllm-project/vllm',s:'GitHub',c:'local',v:5,d:"Le serveur d'inférence haute performance de référence pour la production."},
{n:'Mintplex-Labs/anything-llm',u:GH+'Mintplex-Labs/anything-llm',s:'GitHub',c:'local',v:2,d:"Application tout-en-un pour discuter avec tes documents en local."},
{n:'openai/openai-agents-python',u:GH+'openai/openai-agents-python',s:'GitHub',c:'agents',v:4,d:"Le kit officiel d'OpenAI pour programmer des agents."},
{n:'anthropics/claude-agent-sdk-python',u:GH+'anthropics/claude-agent-sdk-python',s:'GitHub',c:'agents',v:4,d:"Le moteur de Claude Code pour construire tes propres agents."},
{n:'google/adk-python',u:GH+'google/adk-python',s:'GitHub',c:'agents',v:4,d:"Agent Development Kit de Google."},
{n:'langchain-ai/langgraph',u:GH+'langchain-ai/langgraph',s:'GitHub',c:'agents',v:4,d:"Construire des agents fiables sous forme de graphes d'étapes, avec état et reprise."},
{n:'run-llama/llama_index',u:GH+'run-llama/llama_index',s:'GitHub',c:'agents',v:4,d:"Le spécialiste des agents et du RAG sur tes documents."},
{n:'crewAIInc/crewAI',u:GH+'crewAIInc/crewAI',s:'GitHub',c:'agents',v:3,d:"Des équipes d'agents avec des rôles qui collaborent."},
{n:'huggingface/smolagents',u:GH+'huggingface/smolagents',s:'GitHub',c:'agents',v:3,d:"Agents minimalistes de Hugging Face, faciles à lire et à comprendre."},
{n:'microsoft/agent-framework',u:GH+'microsoft/agent-framework',s:'GitHub',c:'agents',v:4,d:"Le framework d'agents de Microsoft, successeur de Semantic Kernel et AutoGen."},
{n:'browser-use/browser-use',u:GH+'browser-use/browser-use',s:'GitHub',c:'agents',v:4,d:"Donner à un agent le contrôle d'un navigateur web."},
{n:'vercel/ai',u:GH+'vercel/ai',s:'GitHub',c:'agents',v:4,d:"L'AI SDK : chat, agents et outils dans les applications web JavaScript."},
{n:'modelcontextprotocol/servers',u:GH+'modelcontextprotocol/servers',s:'GitHub',c:'agents',v:3,d:"Les serveurs MCP de référence (fichiers, Git, recherche, mémoire…)."},
{n:'modelcontextprotocol/python-sdk',u:GH+'modelcontextprotocol/python-sdk',s:'GitHub',c:'agents',v:4,d:"Le SDK officiel pour créer un serveur MCP en Python."},
{n:'punkpeye/awesome-mcp-servers',u:GH+'punkpeye/awesome-mcp-servers',s:'GitHub',c:'agents',v:3,d:"Une liste géante de serveurs MCP classés par usage."},
{n:'anthropics/claude-code',u:GH+'anthropics/claude-code',s:'GitHub',c:'code',v:4,d:"Le dépôt de Claude Code : documentation, signalements, plugins d'exemple."},
{n:'anthropics/skills',u:GH+'anthropics/skills',s:'GitHub',c:'code',v:3,d:"Des compétences (Skills) d'exemple pour Claude, à réutiliser et adapter."},
{n:'openai/codex',u:GH+'openai/codex',s:'GitHub',c:'code',v:4,d:"Codex CLI, l'agent de code open source d'OpenAI."},
{n:'google-gemini/gemini-cli',u:GH+'google-gemini/gemini-cli',s:'GitHub',c:'code',v:3,d:"L'agent open source de Google dans le terminal."},
{n:'n8n-io/n8n',u:GH+'n8n-io/n8n',s:'GitHub',c:'auto',v:3,d:"Automatisations et agents IA visuels, auto-hébergeables."},
{n:'langgenius/dify',u:GH+'langgenius/dify',s:'GitHub',c:'auto',v:3,d:"Plateforme pour créer des applications d'IA, des agents et du RAG sans beaucoup de code."},
{n:'FlowiseAI/Flowise',u:GH+'FlowiseAI/Flowise',s:'GitHub',c:'auto',v:3,d:"Construire des agents et des chaînes d'IA en glisser-déposer."},
{n:'infiniflow/ragflow',u:GH+'infiniflow/ragflow',s:'GitHub',c:'auto',v:4,d:"Moteur RAG open source spécialisé dans les documents complexes."},
{n:'microsoft/markitdown',u:GH+'microsoft/markitdown',s:'GitHub',c:'donnees',v:3,d:"Convertit PDF, Word, Excel, PowerPoint en texte Markdown lisible par une IA."},
{n:'docling-project/docling',u:GH+'docling-project/docling',s:'GitHub',c:'donnees',v:4,d:"Analyse avancée de documents (tableaux, mise en page) pour l'IA."},
{n:'firecrawl/firecrawl',u:GH+'firecrawl/firecrawl',s:'GitHub',c:'donnees',v:4,d:"Transforme des sites web en données propres pour les modèles."},
{n:'comfyanonymous/ComfyUI',u:GH+'comfyanonymous/ComfyUI',s:'GitHub',c:'media',v:4,d:"L'interface par nœuds de référence pour générer images et vidéos en local."},
{n:'AUTOMATIC1111/stable-diffusion-webui',u:GH+'AUTOMATIC1111/stable-diffusion-webui',s:'GitHub',c:'media',v:3,d:"L'interface historique de Stable Diffusion."},
{n:'openai/whisper',u:GH+'openai/whisper',s:'GitHub',c:'media',v:3,d:"Transcription audio précise et multilingue."},
{n:'huggingface/diffusers',u:GH+'huggingface/diffusers',s:'GitHub',c:'media',v:4,d:"La bibliothèque des modèles de diffusion (images, vidéo, audio)."},
{n:'huggingface/transformers',u:GH+'huggingface/transformers',s:'GitHub',c:'train',v:4,d:"La bibliothèque de référence pour utiliser et entraîner les modèles."},
{n:'huggingface/trl',u:GH+'huggingface/trl',s:'GitHub',c:'train',v:5,d:"Fine-tuning et alignement (SFT, DPO, renforcement)."},
{n:'huggingface/peft',u:GH+'huggingface/peft',s:'GitHub',c:'train',v:5,d:"LoRA et autres méthodes d'affinage économes."},
{n:'unslothai/unsloth',u:GH+'unslothai/unsloth',s:'GitHub',c:'train',v:4,d:"Affiner des modèles plus vite avec moins de mémoire, avec des notebooks prêts."},
{n:'hiyouga/LLaMA-Factory',u:GH+'hiyouga/LLaMA-Factory',s:'GitHub',c:'train',v:4,d:"Interface complète pour affiner des centaines de modèles."},
{n:'pytorch/pytorch',u:GH+'pytorch/pytorch',s:'GitHub',c:'train',v:5,d:"Le framework d'apprentissage profond utilisé par la plupart des laboratoires."},
{n:'openai/gpt-oss',u:GH+'openai/gpt-oss',s:'GitHub',c:'train',v:4,d:"Les modèles à poids ouverts d'OpenAI et leur code de référence."},
{n:'karpathy/nanoGPT',u:GH+'karpathy/nanoGPT',s:'GitHub',c:'apprendre',v:5,d:"Un GPT entraînable en quelques centaines de lignes : pour comprendre de l'intérieur."},
{n:'karpathy/nanochat',u:GH+'karpathy/nanochat',s:'GitHub',c:'apprendre',v:5,d:"Un mini-ChatGPT complet, de l'entraînement à l'interface, pour quelques centaines de dollars de calcul."},
{n:'rasbt/LLMs-from-scratch',u:GH+'rasbt/LLMs-from-scratch',s:'GitHub',c:'apprendre',v:4,d:"Construire un LLM de zéro, pas à pas, en PyTorch."},
{n:'mlabonne/llm-course',u:GH+'mlabonne/llm-course',s:'GitHub',c:'apprendre',v:4,d:"Un cours complet et gratuit sur les LLM, avec feuilles de route et notebooks."},
{n:'microsoft/generative-ai-for-beginners',u:GH+'microsoft/generative-ai-for-beginners',s:'GitHub',c:'apprendre',v:2,d:"21 leçons gratuites de Microsoft pour débuter avec l'IA générative."},
{n:'microsoft/AI-For-Beginners',u:GH+'microsoft/AI-For-Beginners',s:'GitHub',c:'apprendre',v:3,d:"Un programme de 12 semaines sur les bases de l'IA."},
{n:'dair-ai/Prompt-Engineering-Guide',u:GH+'dair-ai/Prompt-Engineering-Guide',s:'GitHub',c:'apprendre',v:2,d:"Le guide de référence des techniques de prompt."},
{n:'openai/openai-cookbook',u:GH+'openai/openai-cookbook',s:'GitHub',c:'apprendre',v:3,d:"Recettes officielles pour utiliser l'API d'OpenAI."},
{n:'anthropics/anthropic-cookbook',u:GH+'anthropics/anthropic-cookbook',s:'GitHub',c:'apprendre',v:3,d:"Recettes officielles pour utiliser Claude : outils, RAG, agents."},
{n:'anthropics/courses',u:GH+'anthropics/courses',s:'GitHub',c:'apprendre',v:2,d:"Les cours d'Anthropic : prompt engineering, utilisation de l'API, outils."},
{n:'OWASP/CheatSheetSeries',u:GH+'OWASP/CheatSheetSeries',s:'GitHub',c:'cyber',v:3,d:"Les fiches de bonnes pratiques de sécurité de l'OWASP, pour développeurs."},
{n:'godotengine/godot',u:GH+'godotengine/godot',s:'GitHub',c:'jeux',v:2,d:"Le moteur de jeu libre et gratuit, 2D et 3D."},
{n:'phaserjs/phaser',u:GH+'phaserjs/phaser',s:'GitHub',c:'jeux',v:2,d:"Créer des jeux 2D pour le navigateur en JavaScript."},
{n:'mrdoob/three.js',u:GH+'mrdoob/three.js',s:'GitHub',c:'jeux',v:3,d:"La 3D dans le navigateur."},
{n:'Cours LLM de Hugging Face',u:HF+'learn/llm-course',s:'Hugging Face',c:'apprendre',v:3,d:"Le cours gratuit sur les grands modèles de langage, des bases au fine-tuning."},
{n:'Cours Agents de Hugging Face',u:HF+'learn/agents-course',s:'Hugging Face',c:'apprendre',v:3,d:"Construire des agents, avec certificat gratuit."},
{n:'Cours MCP de Hugging Face',u:HF+'learn/mcp-course',s:'Hugging Face',c:'apprendre',v:4,d:"Comprendre et construire avec le Model Context Protocol."},
{n:'Cours Deep RL de Hugging Face',u:HF+'learn/deep-rl-course',s:'Hugging Face',c:'apprendre',v:5,d:"L'apprentissage par renforcement profond, de la théorie à la pratique."},
{n:'Cours Diffusion de Hugging Face',u:HF+'learn/diffusion-course',s:'Hugging Face',c:'apprendre',v:4,d:"Comprendre et entraîner des modèles de diffusion."},
{n:'Cours Audio de Hugging Face',u:HF+'learn/audio-course',s:'Hugging Face',c:'apprendre',v:4,d:"Reconnaissance vocale, synthèse vocale et classification audio."},
{n:'Cours Vision de Hugging Face',u:HF+'learn/computer-vision-course',s:'Hugging Face',c:'apprendre',v:4,d:"La vision par ordinateur avec les modèles modernes."},
{n:'Open-Source AI Cookbook',u:HF+'learn/cookbook',s:'Hugging Face',c:'apprendre',v:4,d:"Des notebooks concrets : RAG, agents, fine-tuning avec des modèles ouverts."},
{n:'Modèles Mistral AI',u:HF+'mistralai',s:'Hugging Face',c:'modeles',v:3,d:"Les modèles ouverts de Mistral, très bons en français."},
{n:'Modèles Qwen',u:HF+'Qwen',s:'Hugging Face',c:'modeles',v:3,d:"La famille Qwen d'Alibaba, de toutes tailles."},
{n:'Modèles DeepSeek',u:HF+'deepseek-ai',s:'Hugging Face',c:'modeles',v:4,d:"DeepSeek V4 et les modèles de raisonnement R1."},
{n:'Modèles Meta',u:HF+'meta-llama',s:'Hugging Face',c:'modeles',v:3,d:"Les modèles Llama de Meta."},
{n:'Modèles OpenAI (gpt-oss, Whisper)',u:HF+'openai',s:'Hugging Face',c:'modeles',v:3,d:"Les modèles à poids ouverts d'OpenAI."},
{n:'Modèles Google (Gemma)',u:HF+'google',s:'Hugging Face',c:'modeles',v:3,d:"Gemma et les autres modèles ouverts de Google."},
{n:'FLUX (Black Forest Labs)',u:HF+'black-forest-labs',s:'Hugging Face',c:'modeles',v:3,d:"Les modèles d'images FLUX."},
{n:'SmolLM (Hugging Face)',u:HF+'HuggingFaceTB',s:'Hugging Face',c:'modeles',v:3,d:"De très petits modèles efficaces, idéaux pour apprendre et pour les appareils modestes."},
{n:'Sentence Transformers',u:HF+'sentence-transformers',s:'Hugging Face',c:'modeles',v:4,d:"Des modèles d'embeddings pour la recherche par le sens et le RAG."},
{n:'Classement MTEB des embeddings',u:HF+'spaces/mteb/leaderboard',s:'Hugging Face',c:'modeles',v:4,d:"Comparer les modèles d'embeddings avant de construire un RAG."},
{n:'FineWeb',u:HF+'datasets/HuggingFaceFW/fineweb',s:'Hugging Face',c:'modeles',v:5,d:"Un immense jeu de données web nettoyé pour entraîner des modèles ; FineWeb-2 couvre de nombreuses langues."},
{n:'Spaces de Hugging Face',u:HF+'spaces',s:'Hugging Face',c:'modeles',v:1,d:"Des milliers de démos d'IA à essayer gratuitement dans le navigateur."},
{n:'Elements of AI',u:'https://www.elementsofai.com',s:'Cours gratuit',c:'apprendre',v:1,d:"Le cours d'introduction à l'IA de l'université d'Helsinki, disponible en français, sans prérequis."},
{n:'3Blue1Brown : réseaux de neurones',u:'https://www.3blue1brown.com/topics/neural-networks',s:'Cours gratuit',c:'apprendre',v:3,d:"Les vidéos les plus claires pour visualiser les réseaux de neurones et les Transformers."},
{n:'Neural Networks: Zero to Hero',u:'https://karpathy.ai/zero-to-hero.html',s:'Cours gratuit',c:'apprendre',v:5,d:"Andrej Karpathy construit les réseaux de neurones et GPT de zéro, en vidéo."},
{n:'fast.ai',u:'https://course.fast.ai',s:'Cours gratuit',c:'apprendre',v:4,d:"Le cours pratique de deep learning, très orienté résultats."},
{n:'Google Machine Learning Crash Course',u:'https://developers.google.com/machine-learning/crash-course',s:'Cours gratuit',c:'apprendre',v:3,d:"Les bases du machine learning par Google."},
{n:'DeepLearning.AI Short Courses',u:'https://www.deeplearning.ai/short-courses/',s:'Cours gratuit',c:'apprendre',v:3,d:"Des dizaines de cours courts : agents, RAG, MCP, prompt, avec les éditeurs eux-mêmes."},
{n:'Stanford CS224N',u:'https://web.stanford.edu/class/cs224n/',s:'Cours gratuit',c:'apprendre',v:5,d:"Le cours universitaire de référence sur le traitement du langage et les modèles de langage."},
{n:'Root-Me',u:'https://www.root-me.org',s:'Plateforme',c:'cyber',v:3,d:"Plateforme française d'entraînement à la sécurité offensive, légale et gratuite."},
{n:'TryHackMe',u:'https://tryhackme.com',s:'Plateforme',c:'cyber',v:2,d:"Parcours très guidés pour débuter en cybersécurité."},
{n:'PortSwigger Web Security Academy',u:'https://portswigger.net/web-security',s:'Plateforme',c:'cyber',v:3,d:"Le cours gratuit de référence sur la sécurité des applications web."},
{n:'Guide d\'hygiène informatique de l\'ANSSI',u:'https://cyber.gouv.fr',s:'Guide officiel',c:'cyber',v:2,d:"Les 42 mesures de base pour sécuriser une organisation, par l'agence française."},
{n:'Cybermalveillance.gouv.fr',u:'https://www.cybermalveillance.gouv.fr',s:'Service public',c:'cyber',v:1,d:"Assistance et prévention pour les particuliers et les entreprises victimes."},
{n:'OWASP GenAI Security Project',u:'https://genai.owasp.org',s:'Guide',c:'cyber',v:4,d:"Le Top 10 des risques des applications d'IA et les bonnes pratiques associées."},
{n:'Documentation de Godot',u:'https://docs.godotengine.org',s:'Documentation',c:'jeux',v:2,d:"La documentation officielle, avec un tutoriel de premier jeu complet."}
];
