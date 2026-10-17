/* ====== COURS : compétences techniques et pratiques avancées ====== */
COURS.push(
{
id:'python', n:'Python pour l\'IA', by:'Le langage de l\'IA', cat:'dev', lvl:'Novice → affirmé', dur:'4 h',
pitch:"Le langage dans lequel presque toute l'IA est écrite : installer, écrire ses premiers scripts, utiliser les notebooks, manipuler des données, appeler un modèle par API, organiser un projet.",
ch:[
{t:"Pourquoi Python et comment l'installer", h:`
<p><b>Python</b> est le langage de référence de l'IA : PyTorch, Transformers, scikit-learn, LangChain, les SDK d'OpenAI, d'Anthropic, de Google et de Mistral sont tous en Python. Il est lisible, gratuit, et une IA peut t'expliquer chaque ligne.</p>
<div class="tbl-wrap"><table><thead><tr><th>Option</th><th>Pour qui</th><th>Comment</th></tr></thead><tbody>
<tr><td><b>Google Colab</b></td><td>Novice : rien à installer</td><td>colab.research.google.com, un notebook dans le navigateur avec GPU gratuit limité</td></tr>
<tr><td><b>Installation classique</b></td><td>Débutant</td><td>python.org (cocher « Add Python to PATH » sous Windows), puis un éditeur comme VS Code</td></tr>
<tr><td><b>uv</b></td><td>Apprenant et plus</td><td>Gestionnaire moderne et très rapide de versions de Python, d'environnements et de paquets</td></tr>
</tbody></table></div>
<pre class="code">python --version          # vérifier l'installation
python -m venv .venv      # créer un environnement isolé pour le projet
.venv\\Scripts\\activate    # l'activer sous Windows (source .venv/bin/activate sur Mac et Linux)
pip install requests pandas   # installer des bibliothèques</pre>`},
{t:"Les bases du langage en 15 minutes", h:`
<pre class="code"># Variables et types
prenom = "Léa"            # texte (str)
age = 32                  # entier (int)
taille = 1.68             # décimal (float)
inscrit = True            # booléen

# Listes et dictionnaires
outils = ["ChatGPT", "Claude", "Gemini"]
modele = {"nom": "Claude", "editeur": "Anthropic", "contexte": 1_000_000}

# Conditions
if age >= 18:
    print("majeur")
else:
    print("mineur")

# Boucles
for outil in outils:
    print(outil.upper())

# Fonctions
def cout_tokens(nb_tokens, prix_par_million):
    return nb_tokens / 1_000_000 * prix_par_million

print(cout_tokens(250_000, 4))   # 1.0</pre>
<div class="callout info">Méthode efficace : écris un petit script, demande à une IA « explique-moi chaque ligne », modifie-le, casse-le, répare-le. On apprend Python en le pratiquant, pas en le lisant.</div>`},
{t:"Les notebooks Jupyter", h:`
<p>Un <b>notebook</b> mélange des cellules de code, leurs résultats (tableaux, graphiques) et du texte explicatif. C'est l'outil de travail standard en IA et en analyse de données.</p>
<ul class="clean">
<li><b>Google Colab</b> : gratuit, en ligne, avec accès limité à des GPU pour tester des modèles.</li>
<li><b>Jupyter</b> en local : <code>pip install jupyterlab</code> puis <code>jupyter lab</code>.</li>
<li><b>VS Code</b> et <b>Cursor</b> ouvrent directement les fichiers <code>.ipynb</code>.</li>
<li>On exécute une cellule avec <kbd>Maj</kbd> + <kbd>Entrée</kbd> ; l'ordre d'exécution compte.</li>
</ul>`},
{t:"Manipuler des données avec pandas", h:`
<pre class="code">import pandas as pd

df = pd.read_csv("depenses.csv")          # aussi read_excel, read_json
print(df.head())                          # 5 premières lignes
print(df.describe())                      # statistiques de base
par_cat = df.groupby("categorie")["montant"].sum().sort_values(ascending=False)
print(par_cat)
df[df["montant"] > 100].to_excel("grosses_depenses.xlsx", index=False)</pre>
<p>Avec <b>matplotlib</b> ou <b>plotly</b>, une ligne suffit pour un graphique : <code>par_cat.plot(kind="bar")</code>. Les assistants qui exécutent du code (ChatGPT, Claude, Gemini) utilisent exactement ces bibliothèques quand tu leur donnes un fichier Excel.</p>`},
{t:"Appeler un modèle d'IA depuis Python", h:`
<pre class="code">pip install anthropic openai

# Avec Claude
import anthropic
client = anthropic.Anthropic()            # clé dans la variable ANTHROPIC_API_KEY
rep = client.messages.create(
    model="claude-haiku-5-5", max_tokens=500,
    messages=[{"role": "user", "content": "Trois idées de nom pour un club de lecture."}])
print(rep.content[0].text)

# Avec OpenAI
from openai import OpenAI
MODELE = "..."                            # nom exact : voir la liste des modèles dans la documentation d'OpenAI
client = OpenAI()                         # clé dans la variable OPENAI_API_KEY
rep = client.responses.create(model=MODELE, input="Trois idées de nom pour un club de lecture.")
print(rep.output_text)</pre>
<p class="small muted">Les noms exacts des modèles disponibles sont listés dans la documentation de chaque fournisseur ; ils changent à chaque nouvelle génération.</p>
<div class="callout warn">Ne mets jamais une clé dans le code. Utilise des variables d'environnement ou un fichier <code>.env</code> ajouté au <code>.gitignore</code>.</div>`},
{t:"Organiser un vrai projet", h:`
<ul class="clean">
<li>Un dossier par projet, un environnement virtuel par projet.</li>
<li>Un fichier <code>requirements.txt</code> (ou <code>pyproject.toml</code>) qui liste les dépendances.</li>
<li>Un <code>README.md</code> qui explique comment installer et lancer.</li>
<li>Git dès le premier jour, avec un <code>.gitignore</code> qui exclut <code>.venv</code> et <code>.env</code>.</li>
<li>Des petites fonctions, des noms clairs, et des tests avec <b>pytest</b> pour le code important.</li>
</ul>
<div class="ex"><b class="t">Projet</b><p>Écris un script qui lit un fichier texte, l'envoie à un modèle pour en tirer cinq points clés, et enregistre le résumé dans un nouveau fichier. Puis ajoute une boucle pour traiter tous les fichiers d'un dossier.</p></div>`}
]},
{
id:'ml', n:'Machine learning classique', by:'scikit-learn, données, évaluation', cat:'dev', lvl:'Apprenant → expert', dur:'3 h',
pitch:"Avant les LLM, il y a le machine learning qui fait tourner la banque, le commerce et l'industrie : régression, classification, arbres, évaluation, surapprentissage, avec scikit-learn.",
ch:[
{t:"Le principe et le vocabulaire", h:`
<div class="tbl-wrap"><table><thead><tr><th>Terme</th><th>Sens</th></tr></thead><tbody>
<tr><td><b>Caractéristiques</b> (features, X)</td><td>Les informations d'entrée : surface, quartier, âge d'un logement</td></tr>
<tr><td><b>Cible</b> (label, y)</td><td>Ce qu'on veut prédire : le prix</td></tr>
<tr><td><b>Régression</b></td><td>Prédire un nombre (prix, température, ventes)</td></tr>
<tr><td><b>Classification</b></td><td>Prédire une catégorie (spam ou non, type de client)</td></tr>
<tr><td><b>Regroupement</b> (clustering)</td><td>Trouver des groupes sans étiquette</td></tr>
<tr><td><b>Jeu d'entraînement / de test</b></td><td>On apprend sur une partie des données et on vérifie sur une autre, jamais vue</td></tr>
</tbody></table></div>
<p>Pour des données en tableau, le machine learning classique est souvent plus rapide, moins cher et plus fiable qu'un grand modèle de langage.</p>`},
{t:"Les algorithmes essentiels", h:`
<div class="tbl-wrap"><table><thead><tr><th>Algorithme</th><th>Idée</th><th>Quand l'utiliser</th></tr></thead><tbody>
<tr><td>Régression linéaire et logistique</td><td>Une droite (ou une courbe en S) qui sépare ou prédit</td><td>Point de départ, résultats explicables</td></tr>
<tr><td>Arbre de décision</td><td>Une suite de questions oui / non</td><td>Règles lisibles par un humain</td></tr>
<tr><td>Forêt aléatoire</td><td>Des centaines d'arbres qui votent</td><td>Robuste, peu de réglages</td></tr>
<tr><td>Gradient boosting (XGBoost, LightGBM)</td><td>Des arbres qui corrigent les erreurs des précédents</td><td>Souvent le meilleur sur données en tableau</td></tr>
<tr><td>k plus proches voisins</td><td>On regarde les exemples les plus ressemblants</td><td>Recommandation simple</td></tr>
<tr><td>k-moyennes (k-means)</td><td>Regroupe les points autour de k centres</td><td>Segmentation de clients</td></tr>
</tbody></table></div>`},
{t:"Un premier modèle en dix lignes", h:`
<pre class="code">pip install scikit-learn

from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

X, y = load_iris(return_X_y=True)                    # 150 fleurs, 3 espèces
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
modele = RandomForestClassifier(random_state=42).fit(X_train, y_train)
pred = modele.predict(X_test)
print(accuracy_score(y_test, pred))
print(classification_report(y_test, pred))</pre>`},
{t:"Évaluer correctement", h:`
<ul class="clean">
<li><b>Exactitude</b> (accuracy) : part de bonnes réponses. Trompeuse si une classe est rare : un détecteur de fraude qui dit toujours « pas de fraude » a 99 % d'exactitude et ne sert à rien.</li>
<li><b>Précision et rappel</b> : parmi les alertes, combien sont justes ; parmi les vrais cas, combien sont trouvés.</li>
<li><b>Matrice de confusion</b> : le tableau des bonnes et mauvaises prédictions par classe.</li>
<li><b>Erreur moyenne</b> (MAE, RMSE) pour la régression.</li>
<li><b>Validation croisée</b> : on répète l'évaluation sur plusieurs découpages pour un résultat stable.</li>
</ul>`},
{t:"Les pièges classiques", h:`
<div class="tbl-wrap"><table><thead><tr><th>Piège</th><th>Symptôme</th><th>Remède</th></tr></thead><tbody>
<tr><td><b>Surapprentissage</b></td><td>Excellent sur l'entraînement, mauvais sur le test : le modèle a appris par cœur</td><td>Plus de données, modèle plus simple, régularisation</td></tr>
<tr><td><b>Fuite de données</b></td><td>Résultats trop beaux : une information du futur ou de la cible s'est glissée dans X</td><td>Vérifier chaque colonne, séparer avant tout traitement</td></tr>
<tr><td><b>Données biaisées</b></td><td>Le modèle reproduit des discriminations</td><td>Analyser les résultats par groupe</td></tr>
<tr><td><b>Dérive</b></td><td>Les performances baissent avec le temps</td><td>Surveiller et réentraîner régulièrement</td></tr>
</tbody></table></div>
<div class="ex"><b class="t">Exercice</b><p>Sur Kaggle, prends le jeu de données « Titanic », entraîne une forêt aléatoire pour prédire la survie, et fais-toi expliquer par une IA chaque étape et chaque métrique.</p></div>`}
]},
{
id:'rag', n:'Le RAG de A à Z', by:'Faire répondre une IA à partir de tes documents', cat:'construire', lvl:'Affirmé → expert', dur:'3 h',
pitch:"Construire un assistant qui répond à partir de milliers de documents : découpage, embeddings, bases vectorielles, recherche hybride, reranking, évaluation et pièges.", hk:['RAG'],
ch:[
{t:"Le principe en quatre étapes", h:`
<ol class="steps">
<li><b>Ingestion</b> : convertir les documents en texte propre (PDF, Word, pages web), avec des outils comme MarkItDown ou Docling.</li>
<li><b>Découpage</b> (chunking) : couper en morceaux de quelques centaines de mots, avec un léger chevauchement, en respectant les titres et paragraphes.</li>
<li><b>Indexation</b> : transformer chaque morceau en embedding et le stocker dans une base vectorielle, avec ses métadonnées (source, page, date).</li>
<li><b>Réponse</b> : pour chaque question, chercher les morceaux les plus proches, les donner au modèle avec la consigne de répondre uniquement à partir d'eux et de citer les sources.</li>
</ol>`},
{t:"Un RAG minimal en Python", h:`
<pre class="code">pip install sentence-transformers numpy

from sentence_transformers import SentenceTransformer
import numpy as np

modele = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")  # bon en français
morceaux = ["Le remboursement est possible sous 30 jours avec le ticket.",
            "La garantie couvre les pannes pendant deux ans.",
            "La livraison est gratuite dès 50 euros d'achat."]
vecteurs = modele.encode(morceaux, normalize_embeddings=True)

question = "Combien de temps dure la garantie ?"
q = modele.encode([question], normalize_embeddings=True)[0]
scores = vecteurs @ q                       # similarité cosinus
meilleurs = [morceaux[i] for i in np.argsort(-scores)[:2]]

prompt = ("Réponds uniquement à partir des extraits ci-dessous et cite-les. "
          "Si la réponse n'y est pas, dis-le.\\n\\n" + "\\n".join(meilleurs) +
          "\\n\\nQuestion : " + question)
# … puis envoyer prompt à un modèle (voir le cours Python)</pre>`},
{t:"Choisir sa base vectorielle", h:`
<div class="tbl-wrap"><table><thead><tr><th>Outil</th><th>Type</th><th>Idéal pour</th></tr></thead><tbody>
<tr><td>Chroma</td><td>Bibliothèque légère</td><td>Prototypes, projets personnels</td></tr>
<tr><td>FAISS</td><td>Bibliothèque de Meta</td><td>Recherche très rapide en mémoire</td></tr>
<tr><td>pgvector</td><td>Extension de PostgreSQL</td><td>Garder vecteurs et données métier dans la même base (Supabase l'inclut)</td></tr>
<tr><td>Qdrant, Weaviate, Milvus</td><td>Bases spécialisées</td><td>Gros volumes, filtres, production</td></tr>
<tr><td>Pinecone</td><td>Service géré</td><td>Ne rien administrer</td></tr>
</tbody></table></div>`},
{t:"Améliorer la qualité", h:`
<ul class="clean">
<li><b>Recherche hybride</b> : combiner la recherche par le sens (vecteurs) et par mots-clés (BM25), indispensable pour les noms propres, références et codes.</li>
<li><b>Reranking</b> : un second modèle reclasse les 20 ou 50 premiers résultats pour garder les plus pertinents.</li>
<li><b>Réécriture de la question</b> : le modèle reformule ou décompose la question avant la recherche.</li>
<li><b>Métadonnées et filtres</b> : date, type de document, service, langue.</li>
<li><b>Morceaux contextualisés</b> : ajouter à chaque morceau un court résumé du document d'origine améliore nettement la recherche.</li>
<li><b>RAG agentique</b> : l'agent décide lui-même quand et comment chercher, et peut chercher plusieurs fois.</li>
</ul>`},
{t:"Évaluer un RAG", h:`
<div class="tbl-wrap"><table><thead><tr><th>Mesure</th><th>Question posée</th></tr></thead><tbody>
<tr><td>Rappel de la recherche</td><td>Les bons passages sont-ils dans les résultats ?</td></tr>
<tr><td>Fidélité</td><td>La réponse s'appuie-t-elle uniquement sur les passages fournis ?</td></tr>
<tr><td>Pertinence</td><td>La réponse répond-elle vraiment à la question ?</td></tr>
<tr><td>Citations</td><td>Les sources citées sont-elles les bonnes ?</td></tr>
</tbody></table></div>
<p>Constitue 50 questions avec leur bonne réponse et le document source, et mesure à chaque modification. Des bibliothèques comme Ragas automatisent une partie de ces mesures.</p>
<div class="ex"><b class="t">Projet</b><p>Construis un RAG sur la documentation d'un logiciel que tu utilises : 50 pages, une interface Gradio, des réponses avec citations. Mesure sa fidélité sur 20 questions.</p></div>`}
]},
{
id:'promptpro', n:'Prompt engineering avancé', by:'Pour les experts', cat:'construire', lvl:'Apprenant → expert', dur:'2 h 30',
pitch:"Au-delà des 7 blocs : prompts système de production, sorties structurées, chaînage, méta-prompting, évaluation des prompts, défense contre l'injection et conseils propres à chaque modèle.",
ch:[
{t:"Le prompt système de production", h:`
<p>Dans une application, le prompt système est un véritable cahier des charges. Structure recommandée :</p>
<pre class="code">&lt;role&gt;Qui est l'assistant, pour qui, dans quel but.&lt;/role&gt;
&lt;contexte&gt;Informations stables : produit, public, ton, date du jour.&lt;/contexte&gt;
&lt;regles&gt;
1. Ce qu'il doit toujours faire.
2. Ce qu'il ne doit jamais faire, et pourquoi.
3. Quoi faire en cas de doute ou de demande hors sujet.
&lt;/regles&gt;
&lt;format&gt;Structure exacte de la réponse, longueur, langue.&lt;/format&gt;
&lt;exemples&gt;Deux ou trois échanges types, dont un cas limite.&lt;/exemples&gt;</pre>
<p>Expliquer <b>pourquoi</b> une règle existe aide le modèle à l'appliquer intelligemment dans les cas imprévus.</p>`},
{t:"Sorties structurées et fiabilité", h:`
<ul class="clean">
<li><b>Sorties structurées</b> : les API d'OpenAI, d'Anthropic, de Google et de Mistral permettent d'imposer un schéma JSON. La réponse est alors toujours lisible par ton programme.</li>
<li><b>Valeurs imposées</b> : donner la liste exacte des catégories possibles plutôt que laisser le modèle inventer.</li>
<li><b>Auto-cohérence</b> : poser plusieurs fois la même question et garder la réponse majoritaire, pour les décisions importantes.</li>
<li><b>Vérification séparée</b> : un second appel vérifie le premier (exactitude, respect des règles).</li>
</ul>`},
{t:"Chaînage et décomposition", h:`
<ol class="steps">
<li>Découpe une tâche complexe en étapes qui ont chacune un prompt simple : extraire, puis analyser, puis rédiger, puis relire.</li>
<li>Chaque étape reçoit uniquement ce dont elle a besoin.</li>
<li>Les étapes indépendantes peuvent tourner en parallèle.</li>
<li>Tu peux tester et améliorer chaque étape séparément.</li>
</ol>
<p>C'est souvent plus fiable qu'un seul prompt géant, et moins cher si les étapes simples utilisent un petit modèle.</p>`},
{t:"Évaluer ses prompts comme du code", h:`
<ul class="clean">
<li>Constitue un jeu d'essai : 30 à 100 entrées réelles et variées, avec le résultat attendu ou des critères.</li>
<li>Note automatiquement ce qui peut l'être (format, présence d'une information) et utilise un modèle comme juge pour le reste, avec une grille précise.</li>
<li>Change une seule chose à la fois et compare les scores.</li>
<li>Versionne tes prompts dans Git comme du code.</li>
</ul>`},
{t:"Se défendre contre l'injection de prompt", h:`
<ul class="clean no">
<li>Tout texte venant de l'extérieur (page web, mail, document, message d'utilisateur) peut contenir des instructions malveillantes.</li>
<li>Aucune instruction dans le prompt ne garantit à 100 % qu'elles seront ignorées.</li>
</ul>
<ul class="clean ok">
<li>Délimite clairement les contenus externes et dis au modèle de les traiter comme des données.</li>
<li>Limite les outils et les droits de l'agent ; exige une confirmation humaine pour les actions sensibles.</li>
<li>Sépare les agents : celui qui lit des contenus externes ne doit pas avoir accès aux secrets.</li>
<li>Surveille et journalise les appels d'outils.</li>
</ul>`},
{t:"Conseils propres à chaque famille de modèles", h:`
<div class="tbl-wrap"><table><thead><tr><th>Modèles</th><th>Conseils</th></tr></thead><tbody>
<tr><td>Claude</td><td>Balises XML pour structurer, instructions précises et explicites, exemples ; donner un rôle dans le prompt système</td></tr>
<tr><td>GPT</td><td>Consignes claires et hiérarchisées ; pour les modèles qui raisonnent, décrire l'objectif et les critères plutôt que les étapes de réflexion</td></tr>
<tr><td>Gemini</td><td>Excellent avec beaucoup de contexte et de fichiers multimédias ; mettre la question après les documents</td></tr>
<tr><td>Modèles de raisonnement en général</td><td>Moins de « réfléchis étape par étape », plus de contexte, de contraintes et de critères de réussite</td></tr>
<tr><td>Petits modèles locaux</td><td>Consignes courtes, exemples, une seule tâche par prompt</td></tr>
</tbody></table></div>
<p>Chaque éditeur publie un guide officiel de prompt : c'est la meilleure source pour son propre modèle.</p>`}
]},
{
id:'imagepro', n:'Les images comme un pro', by:'ComfyUI, ControlNet, LoRA, édition', cat:'creation', lvl:'Apprenant → expert', dur:'3 h',
pitch:"Aller au-delà du simple prompt : contrôler la pose et la composition, garder un personnage cohérent, entraîner un style, retoucher, agrandir, et travailler en local avec ComfyUI.",
ch:[
{t:"Le prompt d'image avancé", h:`
<ul class="clean">
<li><b>Ordre</b> : sujet, action, décor, style, cadrage, objectif photo, lumière, palette, ambiance.</li>
<li><b>Vocabulaire photo</b> : plan large, plan américain, gros plan, contre-plongée, 35 mm, 85 mm, faible profondeur de champ, heure dorée, lumière de studio.</li>
<li><b>Vocabulaire artistique</b> : aquarelle, gravure, rendu 3D, illustration vectorielle, peinture à l'huile, pixel art.</li>
<li><b>Prompt négatif</b> : ce qu'on ne veut pas (texte, flou, mains déformées), selon les outils.</li>
<li><b>Graine</b> (seed) : fixer la graine permet de refaire la même image en changeant un seul détail.</li>
</ul>`},
{t:"Garder un personnage ou un produit cohérent", h:`
<ul class="clean">
<li><b>Édition par la conversation</b> : Nano Banana (Gemini), GPT Image et FLUX Kontext modifient une image existante en gardant le sujet.</li>
<li><b>Image de référence</b> : Midjourney (modèle d'édition de la V8.2), Firefly et la plupart des outils acceptent des références de sujet et de style.</li>
<li><b>Planche de personnage</b> : générer d'abord le personnage sous plusieurs angles, puis s'en servir comme référence.</li>
<li><b>LoRA</b> : entraîner un petit adaptateur sur 15 à 30 images d'un personnage ou d'un style, pour les modèles ouverts.</li>
</ul>`},
{t:"ComfyUI et le contrôle total", h:`
<p><b>ComfyUI</b> est l'outil open source de référence pour la génération locale : on relie des nœuds (modèle, prompt, échantillonneur, décodeur) dans un graphe. Les graphes s'enregistrent et se partagent.</p>
<div class="tbl-wrap"><table><thead><tr><th>Technique</th><th>Ce qu'elle permet</th></tr></thead><tbody>
<tr><td>ControlNet</td><td>Imposer une pose, des contours, une profondeur ou un croquis</td></tr>
<tr><td>IP-Adapter</td><td>S'inspirer du style ou du sujet d'une image de référence</td></tr>
<tr><td>Inpainting / outpainting</td><td>Refaire une zone de l'image ou l'agrandir au-delà de ses bords</td></tr>
<tr><td>Upscaling</td><td>Augmenter la résolution en ajoutant des détails</td></tr>
<tr><td>Vidéo</td><td>Animer une image ou générer des clips avec des modèles ouverts</td></tr>
</tbody></table></div>
<p>Matériel : une carte graphique avec au moins 8 Go de mémoire pour les modèles courants, davantage pour les grands modèles et la vidéo.</p>`},
{t:"Flux de travail professionnel", h:`
<ol class="steps">
<li>Brief : usage, format, public, contraintes de marque.</li>
<li>Exploration : 20 à 50 propositions rapides pour trouver la direction.</li>
<li>Sélection et itération sur 2 ou 3 pistes.</li>
<li>Retouche : correction des détails (mains, texte, logos) par inpainting ou dans un logiciel de retouche.</li>
<li>Agrandissement et export aux bons formats.</li>
<li>Vérification des droits et mention « généré par IA » si l'image est diffusée.</li>
</ol>`}
]},
{
id:'voix', n:'L\'IA vocale et audio', by:'Transcription, synthèse, agents vocaux', cat:'creation', lvl:'Débutant → expert', dur:'2 h',
pitch:"Transcrire, faire parler, traduire, dialoguer à voix haute, créer de la musique : les outils, les API d'agents vocaux, les modèles ouverts et les règles éthiques.",
ch:[
{t:"Les quatre familles de l'audio", h:`
<div class="tbl-wrap"><table><thead><tr><th>Famille</th><th>Outils</th></tr></thead><tbody>
<tr><td><b>Reconnaissance vocale</b> (parole → texte)</td><td>Whisper et ses dérivés (faster-whisper), Voxtral de Mistral (2025), services de Google, Microsoft, ElevenLabs</td></tr>
<tr><td><b>Synthèse vocale</b> (texte → parole)</td><td>ElevenLabs, voix d'OpenAI et de Google, modèles ouverts comme Kokoro</td></tr>
<tr><td><b>Conversation vocale</b></td><td>ChatGPT Voice, Gemini Live ; pour les développeurs : API temps réel d'OpenAI, Live API de Gemini, agents conversationnels d'ElevenLabs</td></tr>
<tr><td><b>Musique et sons</b></td><td>Suno, effets sonores d'ElevenLabs, modèles ouverts de génération audio</td></tr>
</tbody></table></div>`},
{t:"Transcrire en local et gratuitement", h:`
<pre class="code">pip install openai-whisper      # nécessite aussi ffmpeg
whisper reunion.mp3 --language French --model medium</pre>
<p>Le modèle « medium » est un bon compromis ; « large » est plus précis mais plus lent. Les données ne quittent pas ton ordinateur. Pour un compte rendu, enchaîne avec un modèle de langage qui résume la transcription.</p>`},
{t:"Construire un agent vocal", h:`
<ol class="steps">
<li>Choisis une architecture : soit un modèle vocal de bout en bout (latence faible, conversation naturelle), soit la chaîne transcription → modèle de langage → synthèse (plus de contrôle, plus de latence).</li>
<li>Écris un prompt système adapté à l'oral : phrases courtes, pas de listes, confirmer les informations importantes.</li>
<li>Ajoute des outils (prendre rendez-vous, chercher une commande).</li>
<li>Gère les interruptions et les silences.</li>
<li>Annonce clairement à l'interlocuteur qu'il parle à une IA.</li>
</ol>`},
{t:"Éthique et droit de la voix", h:`
<ul class="clean no">
<li>Cloner la voix d'une personne sans son accord écrit est interdit et dangereux (arnaques, usurpation).</li>
<li>Enregistrer une conversation sans prévenir les participants est illégal dans de nombreux cas.</li>
</ul>
<ul class="clean ok">
<li>Utilise les voix de synthèse fournies, ou ta propre voix.</li>
<li>Signale les contenus audio générés par IA, comme l'impose l'AI Act européen.</li>
</ul>`}
]},
{
id:'vision', n:'Vision par ordinateur', by:'Classer, détecter, segmenter, lire', cat:'dev', lvl:'Affirmé → expert', dur:'2 h',
pitch:"Apprendre aux machines à voir : classification d'images, détection d'objets avec YOLO, segmentation avec SAM, lecture de documents (OCR) et modèles de langage multimodaux.",
ch:[
{t:"Les tâches de la vision", h:`
<div class="tbl-wrap"><table><thead><tr><th>Tâche</th><th>Question</th><th>Exemple</th></tr></thead><tbody>
<tr><td>Classification</td><td>Qu'y a-t-il sur l'image ?</td><td>Photo d'un chat</td></tr>
<tr><td>Détection</td><td>Où sont les objets ?</td><td>Rectangles autour des voitures et piétons</td></tr>
<tr><td>Segmentation</td><td>Quels pixels appartiennent à quel objet ?</td><td>Détourage parfait d'une personne</td></tr>
<tr><td>OCR et compréhension de documents</td><td>Que dit le document ?</td><td>Lire une facture, un formulaire</td></tr>
<tr><td>Estimation de pose</td><td>Comment le corps est-il positionné ?</td><td>Analyse de geste sportif</td></tr>
</tbody></table></div>`},
{t:"Détecter des objets avec YOLO", h:`
<pre class="code">pip install ultralytics

from ultralytics import YOLO
modele = YOLO("yolo11n.pt")          # petit modèle pré-entraîné sur 80 types d'objets
resultats = modele("rue.jpg")
resultats[0].show()                  # affiche les détections
for boite in resultats[0].boxes:
    print(modele.names[int(boite.cls)], float(boite.conf))</pre>
<p>On peut ensuite l'entraîner sur ses propres objets avec quelques centaines d'images annotées (outils d'annotation comme Label Studio ou Roboflow).</p>`},
{t:"Segmentation, OCR et modèles multimodaux", h:`
<ul class="clean">
<li><b>Segment Anything</b> (SAM, Meta) découpe n'importe quel objet sur un simple clic ou une description.</li>
<li><b>OCR moderne</b> : Mistral OCR, Docling, ou directement un modèle multimodal (Claude, GPT, Gemini) qui lit et comprend un document photographié.</li>
<li><b>Modèles de langage multimodaux</b> : pour beaucoup de tâches, il suffit maintenant de demander « liste les produits visibles sur ce rayon et leur prix ». Les modèles spécialisés restent plus rapides et moins chers pour le temps réel et les gros volumes.</li>
</ul>
<div class="ex"><b class="t">Exercice</b><p>Compte automatiquement les voitures sur une vidéo de rue avec YOLO, puis compare avec la réponse d'un modèle multimodal sur quelques images.</p></div>`}
]},
{
id:'etudier', n:'Apprendre et étudier avec l\'IA', by:'Méthodes, tuteurs, outils', cat:'travail', lvl:'Novice → apprenant', dur:'1 h 30',
pitch:"Utiliser l'IA pour vraiment apprendre, pas pour tricher : modes d'apprentissage des assistants, méthodes efficaces, fiches, quiz, langues, et les pièges à éviter.",
ch:[
{t:"Les modes d'apprentissage des assistants", h:`
<div class="tbl-wrap"><table><thead><tr><th>Outil</th><th>Fonction</th></tr></thead><tbody>
<tr><td>ChatGPT</td><td>Mode « Étudier » (juillet 2025) : guide par des questions au lieu de donner la réponse</td></tr>
<tr><td>Claude</td><td>Mode d'apprentissage : explique et fait réfléchir plutôt que de faire à ta place</td></tr>
<tr><td>Gemini</td><td>Apprentissage guidé (août 2025), avec images, vidéos et quiz</td></tr>
<tr><td>NotebookLM</td><td>Fiches, quiz, cartes mentales et résumés audio à partir de tes cours</td></tr>
<tr><td>Khanmigo (Khan Academy)</td><td>Tuteur conçu pour les élèves</td></tr>
</tbody></table></div>`},
{t:"Les méthodes qui marchent, boostées par l'IA", h:`
<ul class="clean">
<li><b>Méthode Feynman</b> : explique une notion à l'IA comme à un enfant, et demande-lui de pointer tes erreurs et tes trous.</li>
<li><b>Récupération active</b> : fais-toi interroger plutôt que relire. « Pose-moi 10 questions sur ce chapitre, une à la fois. »</li>
<li><b>Répétition espacée</b> : génère des fiches question / réponse et révise-les dans une application comme Anki.</li>
<li><b>Exemples concrets</b> : demande trois exemples tirés de ta vie ou de ton domaine.</li>
<li><b>Correction exigeante</b> : « Note ma réponse sur 10 comme un examinateur strict et explique ce qui manque. »</li>
</ul>`},
{t:"Apprendre une langue", h:`
<ul class="clean">
<li>Conversation orale quotidienne avec le mode vocal, en demandant d'être corrigé après chaque phrase.</li>
<li>Jeu de rôle : commander au restaurant, entretien d'embauche, appel téléphonique.</li>
<li>Textes adaptés à ton niveau sur des sujets qui t'intéressent, avec le vocabulaire nouveau en fin de texte.</li>
<li>Explication des fautes récurrentes dans tes écrits.</li>
</ul>`},
{t:"Les pièges", h:`
<ul class="clean no">
<li>Faire faire ses devoirs : on obtient la note, pas la compétence, et c'est souvent sanctionné.</li>
<li>Croire une explication fausse : vérifier les points importants dans le cours ou un manuel.</li>
<li>Remplacer la réflexion : chercher d'abord seul quelques minutes, puis demander de l'aide.</li>
</ul>
<div class="ex"><b class="t">Exercice</b><p>Choisis un sujet que tu ne connais pas, active le mode d'apprentissage d'un assistant, et fais-toi enseigner les bases en 30 minutes. Le lendemain, demande un quiz sans relire.</p></div>`}
]},
{
id:'entreprendre', n:'Entreprendre avec l\'IA', by:'Créer, vendre, gérer', cat:'travail', lvl:'Débutant → affirmé', dur:'2 h',
pitch:"Utiliser l'IA à chaque étape d'un projet d'entreprise : idée, étude de marché, offre, site, marketing, relation client, gestion, et les limites légales.",
ch:[
{t:"De l'idée au projet", h:`
<ol class="steps">
<li><b>Générer et filtrer des idées</b> : demande 30 idées liées à tes compétences, puis fais-les classer par marché, coût de lancement et concurrence.</li>
<li><b>Étude de marché</b> : recherche approfondie sur la taille du marché, les concurrents, les prix, avec sources.</li>
<li><b>Interviews clients</b> : prépare les questions avec l'IA, mais parle à de vraies personnes. L'IA ne remplace pas le terrain.</li>
<li><b>Modèle économique</b> : fais calculer coûts, prix, marge et seuil de rentabilité, en vérifiant les calculs.</li>
<li><b>Avocat du diable</b> : demande les dix raisons pour lesquelles ton projet pourrait échouer.</li>
</ol>`},
{t:"Lancer et vendre", h:`
<ul class="clean">
<li>Site et page de vente : voir le cours « Créer un site web avec l'IA ».</li>
<li>Identité : noms, slogans, logos (à vérifier auprès de l'INPI avant de les adopter).</li>
<li>Contenus : articles, publications, vidéos courtes, newsletters.</li>
<li>Publicité : variantes d'annonces à tester, analyse des résultats.</li>
<li>Prospection : messages personnalisés, en respectant le RGPD.</li>
</ul>`},
{t:"Gérer au quotidien", h:`
<ul class="clean">
<li>Relation client : réponses aux questions fréquentes, assistant sur le site, tri des demandes.</li>
<li>Administration : devis, factures, relances, courriers (relus par toi).</li>
<li>Finances : analyse des dépenses, prévisions, tableaux de bord.</li>
<li>Automatisations : voir le cours « Automatiser avec l'IA ».</li>
</ul>
<div class="callout warn">L'IA ne remplace ni un expert-comptable ni un avocat pour les statuts, la fiscalité, les contrats et les obligations légales. Elle t'aide à préparer tes questions et à comprendre leurs réponses.</div>`}
]},
{
id:'localpro', n:'IA locale avancée', by:'Matériel, quantification, serveurs, interfaces', cat:'dev', lvl:'Affirmé → expert', dur:'2 h',
pitch:"Monter sa propre station d'IA : choisir le matériel, comprendre la quantification, servir des modèles avec llama.cpp et vLLM, une interface type ChatGPT, et brancher le tout à ses agents.",
ch:[
{t:"Choisir son matériel", h:`
<div class="tbl-wrap"><table><thead><tr><th>Configuration</th><th>Ce qu'elle fait tourner confortablement</th></tr></thead><tbody>
<tr><td>Portable récent, 16 Go de mémoire</td><td>Modèles de 3 à 8 milliards de paramètres, transcription Whisper</td></tr>
<tr><td>Mac avec puce Apple et 32 à 64 Go de mémoire unifiée</td><td>Modèles de 14 à 32 milliards et plus ; la mémoire unifiée est un gros avantage</td></tr>
<tr><td>PC avec carte graphique de 12 à 24 Go</td><td>Modèles de 14 à 32 milliards, génération d'images et de vidéos rapide</td></tr>
<tr><td>Station avec plusieurs cartes ou serveur</td><td>Modèles de 70 milliards et plus, usage en équipe</td></tr>
</tbody></table></div>
<p>Règle approximative : en 4 bits, compte environ 0,6 Go de mémoire par milliard de paramètres, plus la place du contexte.</p>`},
{t:"Quantification et formats", h:`
<ul class="clean">
<li><b>GGUF</b> : le format de llama.cpp, d'Ollama et de LM Studio. Les suffixes Q4_K_M, Q5_K_M, Q8_0 indiquent le niveau de compression.</li>
<li><b>Q4_K_M</b> est le compromis courant ; Q8 est presque identique à l'original mais deux fois plus lourd.</li>
<li><b>MLX</b> : format optimisé pour les puces Apple.</li>
<li><b>AWQ, GPTQ, FP8</b> : formats pour les serveurs GPU et vLLM.</li>
</ul>`},
{t:"Servir et utiliser ses modèles", h:`
<pre class="code"># llama.cpp : serveur compatible avec l'API OpenAI
llama-server -m modele-Q4_K_M.gguf --port 8080

# vLLM : serveur de production sur GPU
pip install vllm
vllm serve Qwen/Qwen3-8B</pre>
<ul class="clean">
<li>Ces serveurs exposent une API compatible OpenAI : la plupart des outils (Open WebUI, n8n, Continue, scripts) s'y branchent en changeant juste l'adresse.</li>
<li><b>Open WebUI</b> donne une interface type ChatGPT, avec comptes, documents et outils.</li>
<li>Pour un usage en équipe, place le serveur derrière une authentification ; ne l'expose jamais directement sur internet.</li>
</ul>
<div class="ex"><b class="t">Projet</b><p>Installe Ollama et Open WebUI, charge deux modèles de tailles différentes, ajoute tes documents, et compare qualité et vitesse sur dix questions.</p></div>`}
]}
);
Object.assign(NIV_COURS, {python:2, ml:4, rag:5, promptpro:4, imagepro:4, voix:3, vision:5, etudier:1, entreprendre:2, localpro:5});
