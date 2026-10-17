/* ====== COURS : deep learning, vidéo, métiers ====== */
COURS.push(
{
id:'pytorch', n:'Deep learning en pratique', by:'PyTorch, de zéro à un premier réseau', cat:'dev', lvl:'Affirmé → expert', dur:'3 h',
pitch:"Écrire et entraîner soi-même des réseaux de neurones avec PyTorch : tenseurs, gradient automatique, boucle d'entraînement, réseaux d'images, et la recette d'un mini-GPT.",
ch:[
{t:"Tenseurs et gradient automatique", h:`
<p><b>PyTorch</b> (créé par Meta, géré par la PyTorch Foundation) est le framework utilisé par la plupart des laboratoires. Ses deux briques : les <b>tenseurs</b> (des tableaux de nombres à plusieurs dimensions, calculés sur GPU) et l'<b>autograd</b> (le calcul automatique des gradients).</p>
<pre class="code">pip install torch

import torch
x = torch.tensor([2.0, 3.0], requires_grad=True)
y = (x ** 2).sum()        # y = x1² + x2²
y.backward()              # calcule dy/dx automatiquement
print(x.grad)             # tensor([4., 6.])  car la dérivée de x² est 2x

appareil = "cuda" if torch.cuda.is_available() else "cpu"   # "mps" sur Mac</pre>`},
{t:"La boucle d'entraînement", h:`
<pre class="code">import torch, torch.nn as nn

# Données factices : apprendre y = 3x + 1
X = torch.linspace(-1, 1, 200).unsqueeze(1)
y = 3 * X + 1 + 0.1 * torch.randn_like(X)

modele = nn.Sequential(nn.Linear(1, 16), nn.ReLU(), nn.Linear(16, 1))
perte_fn = nn.MSELoss()
optimiseur = torch.optim.Adam(modele.parameters(), lr=0.01)

for epoque in range(500):
    pred = modele(X)                 # 1. prédire
    perte = perte_fn(pred, y)        # 2. mesurer l'erreur
    optimiseur.zero_grad()           # 3. remettre les gradients à zéro
    perte.backward()                 # 4. calculer les gradients
    optimiseur.step()                # 5. ajuster les poids
    if epoque % 100 == 0:
        print(epoque, perte.item())</pre>
<p>Ces cinq lignes sont le cœur de tout entraînement, du petit réseau jusqu'aux plus grands modèles de langage.</p>`},
{t:"Un réseau qui reconnaît des images", h:`
<pre class="code">pip install torchvision

from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import torch.nn as nn, torch

donnees = datasets.MNIST("data", train=True, download=True, transform=transforms.ToTensor())
lot = DataLoader(donnees, batch_size=64, shuffle=True)

reseau = nn.Sequential(
    nn.Conv2d(1, 16, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
    nn.Conv2d(16, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
    nn.Flatten(), nn.Linear(32 * 7 * 7, 10))
opt = torch.optim.Adam(reseau.parameters(), lr=1e-3)

for images, chiffres in lot:            # une époque
    perte = nn.functional.cross_entropy(reseau(images), chiffres)
    opt.zero_grad(); perte.backward(); opt.step()</pre>
<p>En une époque, ce petit réseau convolutif reconnaît les chiffres manuscrits avec une précision d'environ 98 %, comme les réseaux de Yann LeCun à la fin des années 1980, mais en quelques secondes.</p>`},
{t:"Les notions qui font progresser", h:`
<ul class="clean">
<li><b>Normalisation</b> (BatchNorm, LayerNorm) : stabilise l'entraînement.</li>
<li><b>Dropout</b> et régularisation : limitent le surapprentissage.</li>
<li><b>Taux d'apprentissage</b> : le réglage le plus important ; on l'augmente au début puis on le fait décroître.</li>
<li><b>Transfert d'apprentissage</b> : partir d'un modèle pré-entraîné au lieu de partir de zéro.</li>
<li><b>Précision mixte</b> : calculer en 16 bits pour aller deux fois plus vite.</li>
<li><b>Suivi des expériences</b> : TensorBoard ou Weights &amp; Biases pour visualiser les courbes.</li>
</ul>`},
{t:"Vers un mini-GPT", h:`
<ol class="steps">
<li>Découper un texte en tokens (au début, des caractères).</li>
<li>Créer des embeddings et des positions.</li>
<li>Empiler des blocs Transformer : attention multi-têtes, couche linéaire, normalisation, connexions résiduelles.</li>
<li>Entraîner à prédire le token suivant avec l'entropie croisée.</li>
<li>Générer du texte en tirant les tokens un par un.</li>
</ol>
<p>Le dépôt nanoGPT et la vidéo « Let's build GPT » d'Andrej Karpathy suivent exactement ce chemin en quelques centaines de lignes ; nanochat va jusqu'à un assistant complet. Voir la section Ressources.</p>`}
]},
{
id:'video', n:'La vidéo IA de A à Z', by:'Du prompt au montage final', cat:'creation', lvl:'Débutant → expert', dur:'2 h 30',
pitch:"Créer des vidéos avec l'IA : choisir son générateur, écrire un prompt de plan, garder des personnages cohérents, ajouter voix et musique, monter, et respecter les règles.",
ch:[
{t:"Les générateurs en octobre 2026", h:`
<div class="tbl-wrap"><table><thead><tr><th>Outil</th><th>Points forts</th></tr></thead><tbody>
<tr><td>Gemini Omni et Veo 3.1 (Google, via Gemini et Flow)</td><td>Réalisme, son et dialogues intégrés, création à partir de n'importe quelle entrée</td></tr>
<tr><td>Sora 2 (OpenAI)</td><td>Scènes cohérentes avec son, application dédiée</td></tr>
<tr><td>Runway</td><td>Suite professionnelle complète : génération, retouche, effets</td></tr>
<tr><td>Kling, Luma, Hailuo et autres</td><td>Bonne qualité de mouvement, tarifs variés</td></tr>
<tr><td>Modèles ouverts dans ComfyUI</td><td>Contrôle total et génération en local avec une bonne carte graphique</td></tr>
<tr><td>HeyGen, Synthesia</td><td>Avatars qui parlent, vidéos de formation, traduction avec synchronisation labiale</td></tr>
</tbody></table></div>`},
{t:"Écrire un prompt de plan", h:`
<p>Structure : <b>type de plan</b> + <b>sujet</b> + <b>action</b> + <b>décor</b> + <b>mouvement de caméra</b> + <b>lumière</b> + <b>ambiance sonore</b> + <b>style</b> + <b>durée</b>.</p>
<pre class="prompt">Travelling latéral lent, plan moyen. Une cycliste traverse un pont métallique sous une pluie fine, à la tombée de la nuit. Reflets des lampadaires sur la chaussée mouillée, brume légère. Son : pluie, sonnette de vélo au loin. Style cinéma réaliste, couleurs froides. 8 secondes.</pre>
<ul class="clean">
<li>Une seule action principale par plan.</li>
<li>Décris le mouvement de caméra avec le vocabulaire du cinéma : travelling, panoramique, plan fixe, zoom, drone, caméra à l'épaule.</li>
<li>Pour les dialogues, écris la réplique exacte entre guillemets et qui la prononce.</li>
</ul>`},
{t:"Cohérence et narration", h:`
<ol class="steps">
<li>Écris un script et découpe-le en plans de 5 à 10 secondes (storyboard).</li>
<li>Crée d'abord des images de référence des personnages et des lieux avec un générateur d'images.</li>
<li>Utilise ces images comme point de départ (image vers vidéo) pour garder la cohérence.</li>
<li>Génère plusieurs versions par plan et garde la meilleure.</li>
<li>Assemble, ajoute voix, musique et bruitages, étalonne les couleurs.</li>
</ol>`},
{t:"Son, montage et diffusion", h:`
<ul class="clean">
<li><b>Voix</b> : ElevenLabs ou les voix intégrées ; <b>musique</b> : Suno (vérifie les droits de ton offre).</li>
<li><b>Montage</b> : DaVinci Resolve (gratuit), CapCut, Premiere Pro, Descript.</li>
<li><b>Sous-titres</b> automatiques pour les réseaux sociaux.</li>
<li><b>Formats</b> : 16:9 pour YouTube, 9:16 pour les formats courts verticaux.</li>
<li><b>Mention obligatoire</b> : signale qu'il s'agit d'une vidéo générée ou modifiée par IA ; les plateformes et l'AI Act l'exigent.</li>
</ul>
<div class="callout warn">Jamais de vidéo réaliste d'une personne réelle sans son accord : c'est un deepfake, avec des risques juridiques sérieux.</div>
<div class="ex"><b class="t">Projet</b><p>Réalise un court-métrage de 30 secondes : un script de 4 plans, des images de référence, la génération des plans, une voix off, une musique, et le montage final.</p></div>`}
]},
{
id:'metiers', n:'Les métiers de l\'IA', by:'Carrières, compétences, formations', cat:'travail', lvl:'Novice → expert', dur:'1 h 30',
pitch:"Tous les métiers de l'IA, des plus accessibles aux plus techniques : ce qu'ils font, les compétences demandées, comment se former et comment construire un portfolio.",
ch:[
{t:"La carte des métiers", h:`
<div class="tbl-wrap"><table><thead><tr><th>Métier</th><th>Ce qu'il fait</th><th>Compétences clés</th></tr></thead><tbody>
<tr><td><b>Ingénieur IA</b> (AI engineer)</td><td>Construit des applications et des agents avec des modèles existants</td><td>Python ou TypeScript, API, RAG, agents, évaluation</td></tr>
<tr><td><b>Ingénieur machine learning</b></td><td>Entraîne, affine et déploie des modèles</td><td>PyTorch, données, MLOps, GPU</td></tr>
<tr><td><b>Data scientist</b></td><td>Analyse les données et construit des modèles prédictifs</td><td>Statistiques, Python, scikit-learn, communication</td></tr>
<tr><td><b>Data engineer</b></td><td>Construit les flux et les bases de données qui alimentent l'IA</td><td>SQL, pipelines, cloud</td></tr>
<tr><td><b>MLOps / plateforme</b></td><td>Fait tourner les modèles de façon fiable en production</td><td>Cloud, conteneurs, surveillance, coûts</td></tr>
<tr><td><b>Chercheur en IA</b></td><td>Invente de nouvelles méthodes</td><td>Mathématiques, doctorat le plus souvent, publications</td></tr>
<tr><td><b>Spécialiste sécurité de l'IA</b></td><td>Teste et protège les systèmes d'IA</td><td>Cybersécurité, red teaming, injection de prompt</td></tr>
<tr><td><b>Chef de produit IA</b></td><td>Définit ce que le produit doit faire et mesure son succès</td><td>Compréhension des modèles, utilisateurs, évaluation</td></tr>
<tr><td><b>Automatisation et intégration</b></td><td>Déploie l'IA dans les processus d'une entreprise</td><td>n8n, Make, Power Automate, connaissance métier</td></tr>
<tr><td><b>Formateur et consultant IA</b></td><td>Forme les équipes et accompagne l'adoption</td><td>Pédagogie, panorama des outils, gouvernance</td></tr>
<tr><td><b>Juriste et éthicien de l'IA</b></td><td>Conformité AI Act, RGPD, droit d'auteur, politiques d'usage</td><td>Droit, compréhension technique</td></tr>
<tr><td><b>Créateur de contenu IA</b></td><td>Images, vidéos, musique et publicités générées</td><td>Direction artistique, maîtrise des outils</td></tr>
</tbody></table></div>`},
{t:"Se former", h:`
<ul class="clean">
<li><b>Gratuit</b> : les cours de la section Ressources (Hugging Face, fast.ai, Karpathy, DeepLearning.AI, Elements of AI, Google).</li>
<li><b>Diplômes</b> : écoles d'ingénieurs et masters en IA et science des données ; formations professionnelles et reconversions courtes en développement IA.</li>
<li><b>Certifications</b> des grands clouds (AWS, Microsoft, Google) pour les métiers techniques.</li>
<li><b>Pratique</b> : compétitions Kaggle, contributions open source sur GitHub et Hugging Face.</li>
</ul>`},
{t:"Construire un portfolio qui convainc", h:`
<ol class="steps">
<li>Trois à cinq projets concrets qui résolvent de vrais problèmes, plutôt que des tutoriels recopiés.</li>
<li>Pour chaque projet : un dépôt GitHub propre, un README clair, une démo en ligne (un Space Hugging Face ou un site).</li>
<li>Des résultats mesurés : précision, temps gagné, coût.</li>
<li>Un article ou une courte vidéo qui explique ta démarche.</li>
<li>Une présence active : contributions open source, publications sur ce que tu apprends.</li>
</ol>
<div class="ex"><b class="t">Exercice</b><p>Choisis un métier de la liste, demande à une IA un plan de formation de six mois adapté à ton niveau et à ton temps disponible, puis lance le premier projet de ton portfolio cette semaine.</p></div>`}
]}
);
Object.assign(NIV_COURS, {pytorch:5, video:3, metiers:1});
