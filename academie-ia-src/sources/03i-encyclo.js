/* ====== ENCYCLOPÉDIE : l'IA dans chaque domaine ====== */
ENCYCLO_PARTS.domaines = 'L\'IA dans chaque domaine';
ENCYCLO.push(
{p:'domaines', t:"L'IA et la santé", s:"Imagerie, recherche de médicaments, assistants médicaux", h:`
<ul class="clean">
<li><b>Imagerie médicale</b> : c'est le premier domaine d'usage réel. Les autorités sanitaires américaines ont autorisé plusieurs centaines de dispositifs médicaux à base d'IA, en majorité en radiologie (détection de nodules, de fractures, de cancers du sein).</li>
<li><b>Biologie et médicaments</b> : AlphaFold prédit la forme des protéines (prix Nobel de chimie 2024) ; AlphaFold 3 (2024) modélise aussi leurs interactions avec d'autres molécules. Des laboratoires utilisent l'IA pour concevoir de nouveaux candidats médicaments.</li>
<li><b>Assistants pour soignants</b> : transcription automatique des consultations et rédaction des comptes rendus, pour rendre du temps au soin.</li>
<li><b>Pour les patients</b> : comprendre un compte rendu, préparer ses questions, mais jamais remplacer un diagnostic.</li>
</ul>
<div class="callout warn">Les données de santé sont les plus sensibles qui soient. Ne les confie qu'à des services conçus et autorisés pour elles.</div>`},
{p:'domaines', t:"L'IA et la science", s:"Quand l'IA accélère la découverte", h:`
<div class="tbl-wrap"><table><thead><tr><th>Domaine</th><th>Exemple</th></tr></thead><tbody>
<tr><td>Biologie</td><td>AlphaFold : la structure de presque toutes les protéines connues mise à disposition des chercheurs</td></tr>
<tr><td>Météo</td><td>Les modèles de prévision par IA, comme GraphCast de Google DeepMind (2023), rivalisent avec les modèles physiques en une fraction du temps de calcul</td></tr>
<tr><td>Mathématiques</td><td>Des systèmes d'IA ont atteint en 2025 le niveau médaille d'or aux Olympiades internationales de mathématiques</td></tr>
<tr><td>Matériaux</td><td>Découverte de nouveaux cristaux et matériaux candidats</td></tr>
<tr><td>Recherche bibliographique</td><td>Agents qui lisent et synthétisent des centaines d'articles (Deep Research, Elicit, Consensus)</td></tr>
</tbody></table></div>
<p>Les laboratoires d'IA affichent tous l'ambition de créer des « scientifiques IA » capables de mener des expériences de bout en bout ; en 2026, l'IA reste surtout un accélérateur entre les mains des chercheurs.</p>`},
{p:'domaines', t:"Robotique et IA incarnée", s:"Quand l'IA sort de l'écran", h:`
<ul class="clean">
<li><b>Modèles pour robots</b> : des modèles « vision-langage-action » comprennent une consigne en langage naturel et la transforment en mouvements. Google DeepMind a présenté Gemini Robotics en 2025.</li>
<li><b>Humanoïdes</b> : de nombreuses entreprises développent des robots humanoïdes (Figure, Tesla avec Optimus, Unitree, Agility, Boston Dynamics), testés dans des usines et entrepôts.</li>
<li><b>Open source</b> : Hugging Face a lancé LeRobot (2024), une bibliothèque et des bras robotisés à bas prix pour apprendre la robotique avec l'IA.</li>
<li><b>Limites</b> : le monde physique est bien plus difficile que le texte : peu de données, sécurité des personnes, coût du matériel.</li>
</ul>`},
{p:'domaines', t:"Voitures autonomes et transports", s:"Le plus long chantier de l'IA", h:`
<ul class="clean">
<li>Les premiers grands défis de voitures autonomes datent de 2004 et 2005 (DARPA Grand Challenge).</li>
<li><b>Waymo</b> (groupe Alphabet) exploite des robotaxis sans conducteur ouverts au public dans plusieurs villes américaines.</li>
<li>Les approches diffèrent : capteurs multiples (lidar, radar, caméras) et cartes détaillées, ou caméras seules et apprentissage de bout en bout (approche de Tesla).</li>
<li>Les niveaux d'autonomie vont de 0 (aucune aide) à 5 (aucun conducteur nécessaire, partout).</li>
<li>Enjeux : sécurité, responsabilité en cas d'accident, réglementation, acceptation par le public.</li>
</ul>`},
{p:'domaines', t:"L'IA et l'éducation", s:"Tuteurs, triche et nouvelles compétences", h:`
<ul class="clean">
<li><b>Tuteurs personnels</b> : les modes d'apprentissage de ChatGPT, Claude et Gemini, ou Khanmigo, guident l'élève sans donner la réponse.</li>
<li><b>Pour les enseignants</b> : préparer des cours, des exercices différenciés, des grilles de correction.</li>
<li><b>Le défi de la triche</b> : les détecteurs de texte généré par IA ne sont pas fiables et produisent des faux positifs ; les évaluations évoluent vers l'oral, le travail en classe et l'analyse du processus.</li>
<li><b>Nouvelles compétences</b> : savoir formuler une question, vérifier une source, garder son esprit critique et comprendre les limites de l'IA.</li>
</ul>`},
{p:'domaines', t:"L'IA et la création artistique", s:"Outil, collaborateur ou concurrent ?", h:`
<ul class="clean">
<li><b>Nouveaux outils</b> : images, vidéos, musique, voix, aide à l'écriture et au montage. Beaucoup de créateurs les intègrent dans leur processus.</li>
<li><b>Débat sur l'entraînement</b> : les modèles ont appris sur des œuvres sans autorisation explicite des auteurs ; plusieurs procès sont en cours (presse, auteurs, studios de cinéma, banques d'images) et certains se sont conclus par des accords.</li>
<li><b>Droit d'auteur sur les créations IA</b> : dans de nombreux pays, une œuvre produite entièrement par une IA, sans apport créatif humain suffisant, n'est pas protégée par le droit d'auteur.</li>
<li><b>Transparence</b> : en Europe, les contenus générés doivent être signalés comme tels.</li>
</ul>`},
{p:'domaines', t:"L'IA en Chine", s:"Le second pôle mondial", h:`
<ul class="clean">
<li><b>Acteurs</b> : DeepSeek, Alibaba (Qwen), ByteDance (Doubao), Moonshot (Kimi), Zhipu, Baidu, Tencent (Hunyuan).</li>
<li><b>Stratégie des poids ouverts</b> : de nombreux modèles chinois sont publiés librement et figurent parmi les plus téléchargés au monde.</li>
<li><b>Efficacité</b> : contraints par les restrictions américaines sur les puces, les laboratoires chinois ont misé sur des architectures économes (mélange d'experts, entraînement optimisé).</li>
<li><b>Réglementation</b> : la Chine encadre depuis 2023 les services d'IA générative, avec des obligations sur les contenus.</li>
<li><b>Confidentialité</b> : les applications en ligne de ces éditeurs hébergent les données en Chine ; utiliser leurs modèles en local évite ce problème.</li>
</ul>`},
{p:'domaines', t:"L'IA en Europe et en France", s:"Réglementation, champions et souveraineté", h:`
<ul class="clean">
<li><b>Mistral AI</b> : le champion européen, avec la plus grosse levée de fonds de l'histoire de la tech européenne (3 milliards d'euros, septembre 2026).</li>
<li><b>Hugging Face</b> : fondée par des Français, plateforme mondiale de l'IA ouverte, en cours de rachat par Nvidia.</li>
<li><b>Recherche</b> : la France compte de nombreux chercheurs de premier plan (Yann LeCun notamment) et des laboratoires de grands groupes américains à Paris.</li>
<li><b>Investissements</b> : au sommet de Paris de février 2025, la France a annoncé 109 milliards d'euros d'investissements dans l'IA, notamment dans des centres de données.</li>
<li><b>AI Act</b> : l'Europe est la première à encadrer l'IA par une loi complète, assouplie en 2026 par l'omnibus numérique.</li>
<li><b>Enjeu de souveraineté</b> : dépendance aux puces, aux clouds et aux modèles américains ; volonté de développer des alternatives européennes.</li>
</ul>`},
{p:'domaines', t:"Les grands débats sur l'avenir de l'IA", s:"AGI, risques, ouverture, emploi : les positions en présence", h:`
<div class="tbl-wrap"><table><thead><tr><th>Débat</th><th>Positions</th></tr></thead><tbody>
<tr><td><b>L'IA générale arrive-t-elle ?</b></td><td>Les dirigeants d'OpenAI, d'Anthropic et de Google DeepMind l'annoncent pour les prochaines années ; d'autres chercheurs, comme Yann LeCun, estiment que les modèles de langage actuels n'y mèneront pas seuls.</td></tr>
<tr><td><b>Risques graves</b></td><td>Geoffrey Hinton et Yoshua Bengio alertent sur des risques majeurs (perte de contrôle, armes) ; d'autres jugent ces craintes exagérées et préfèrent se concentrer sur les problèmes actuels (biais, désinformation, emploi).</td></tr>
<tr><td><b>Ouvrir ou fermer les modèles</b></td><td>Les partisans de l'ouverture (Meta, Mistral, laboratoires chinois) mettent en avant l'innovation et l'indépendance ; d'autres craignent la diffusion de capacités dangereuses.</td></tr>
<tr><td><b>Réguler</b></td><td>L'Europe a légiféré ; d'autres pays préfèrent des engagements volontaires pour ne pas freiner l'innovation.</td></tr>
<tr><td><b>Emploi</b></td><td>Transformation des métiers et gains de productivité pour les uns, risque de suppression massive d'emplois pour les autres.</td></tr>
</tbody></table></div>
<div class="callout ok"><b>À retenir :</b> personne ne connaît l'avenir de l'IA. Les meilleurs experts sont en désaccord : méfie-toi de quiconque présente une prédiction comme une certitude.</div>`}
);
NIV_ENC.push(2, 3, 3, 2, 2, 2, 3, 2, 3);
