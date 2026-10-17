// Base de connaissances interne (aucune IA, aucun service externe) : planètes, encyclopédie, découvertes, quiz, défis, calendrier.
// Les chiffres sont à jour en octobre 2026 ; ceux qui évoluent vite (lunes, exoplanètes) sont indiqués comme tels.
const Savoir = (() => {
  const planetes = {
    soleil: { icone: '☀️', nasa: 'Sun Solar Dynamics Observatory', resume: 'Notre étoile : une boule de gaz (surtout de l’hydrogène et de l’hélium) qui transforme chaque seconde environ 4 millions de tonnes de sa masse en lumière, par fusion nucléaire au cœur.',
      chiffres: [['1,39 million km', 'diamètre (109 Terres)'], ['99,86 %', 'de la masse du système solaire'], ['5 500 °C', 'en surface'], ['15 millions °C', 'au cœur'], ['4,6 milliards d’années', 'âge'], ['8 min 20 s', 'temps de trajet de sa lumière']],
      fait: 'La lumière qui sort aujourd’hui du Soleil a été produite au cœur il y a des dizaines de milliers d’années : elle met très longtemps à traverser l’intérieur, puis seulement 8 minutes pour nous atteindre.' },
    mercure: { icone: '☿️', nasa: 'Mercury MESSENGER', resume: 'La plus petite planète et la plus proche du Soleil. Sans vraie atmosphère pour garder la chaleur, elle passe de la fournaise au grand froid.',
      chiffres: [['4 879 km', 'diamètre'], ['57,9 millions km', 'distance au Soleil'], ['88 jours', 'durée de l’année'], ['176 jours', 'du lever au lever du Soleil'], ['−180 à +430 °C', 'températures'], ['0', 'lune']],
      fait: 'Un jour solaire y dure 176 jours terrestres, soit deux de ses années. Il y a pourtant de la glace d’eau au fond de cratères polaires jamais éclairés.' },
    venus: { icone: '♀️', nasa: 'Venus', resume: 'Presque la jumelle de la Terre par la taille, mais un enfer : une atmosphère épaisse de gaz carbonique, des nuages d’acide sulfurique et un effet de serre emballé.',
      chiffres: [['12 104 km', 'diamètre'], ['108 millions km', 'distance au Soleil'], ['225 jours', 'durée de l’année'], ['243 jours', 'pour tourner sur elle-même'], ['465 °C', 'en surface, jour et nuit'], ['92 fois', 'la pression de l’air terrestre']],
      fait: 'Son jour est plus long que son année, et elle tourne à l’envers : là-bas, le Soleil se lève à l’ouest. C’est l’astre le plus brillant du ciel après le Soleil et la Lune : « l’étoile du Berger ».' },
    terre: { icone: '🌍', nasa: 'Earth from space', resume: 'La seule planète connue où existe la vie. De l’eau liquide en surface, une atmosphère protectrice et un champ magnétique qui dévie le vent solaire.',
      chiffres: [['12 742 km', 'diamètre'], ['150 millions km', 'distance au Soleil (1 UA)'], ['365,25 jours', 'durée de l’année'], ['23 h 56 min', 'rotation'], ['30 km/s', 'vitesse autour du Soleil'], ['1', 'lune']],
      fait: 'Pendant que tu lis cette phrase, tu as parcouru environ 300 km autour du Soleil.' },
    mars: { icone: '♂️', nasa: 'Mars Perseverance rover', resume: 'La planète rouge doit sa couleur à la rouille (oxyde de fer) de son sol. Elle a eu des rivières et des lacs il y a plus de 3 milliards d’années.',
      chiffres: [['6 779 km', 'diamètre'], ['228 millions km', 'distance au Soleil'], ['687 jours', 'durée de l’année'], ['24 h 37 min', 'durée du jour'], ['−63 °C', 'température moyenne'], ['2', 'lunes : Phobos et Déimos']],
      fait: 'Olympus Mons, son volcan géant, culmine à environ 22 km : deux fois et demie l’Everest. Le rover Perseverance y cherche des traces de vie ancienne depuis 2021.' },
    jupiter: { icone: '♃', nasa: 'Jupiter Juno', resume: 'La géante du système solaire, faite surtout d’hydrogène et d’hélium. Elle pèse deux fois et demie plus que toutes les autres planètes réunies.',
      chiffres: [['139 820 km', 'diamètre (11 Terres)'], ['778 millions km', 'distance au Soleil'], ['11,9 ans', 'durée de l’année'], ['9 h 56 min', 'durée du jour, la plus courte'], ['plus de 90', 'lunes connues'], ['−110 °C', 'au sommet des nuages']],
      fait: 'La Grande Tache rouge est une tempête plus large que la Terre, observée depuis au moins 1830. Sa lune Europe cache un océan d’eau salée sous la glace.' },
    saturne: { icone: '♄', nasa: 'Saturn Cassini', resume: 'La planète aux anneaux : des milliards de morceaux de glace, du grain de poussière au bloc de la taille d’une maison.',
      chiffres: [['116 460 km', 'diamètre'], ['1,43 milliard km', 'distance au Soleil'], ['29,4 ans', 'durée de l’année'], ['10 h 33 min', 'durée du jour'], ['274', 'lunes connues, le record'], ['0,69', 'densité : moins que l’eau']],
      fait: 'Ses anneaux font 280 000 km de large mais souvent moins de 100 mètres d’épaisseur. Saturne flotterait dans une baignoire assez grande !' },
    uranus: { icone: '⛢', nasa: 'Uranus', resume: 'Une géante de glaces couchée sur le côté : son axe est incliné de 98°, sans doute à cause d’une collision géante dans sa jeunesse.',
      chiffres: [['50 724 km', 'diamètre'], ['2,87 milliards km', 'distance au Soleil'], ['84 ans', 'durée de l’année'], ['17 h 14 min', 'durée du jour'], ['29', 'lunes connues'], ['−224 °C', 'record de froid planétaire']],
      fait: 'Chaque pôle connaît 42 ans de jour puis 42 ans de nuit. Première planète découverte au télescope, par William Herschel en 1781.' },
    neptune: { icone: '♆', nasa: 'Neptune Voyager 2', resume: 'La planète la plus lointaine, d’un bleu profond dû au méthane. Elle a été trouvée par le calcul avant d’être vue.',
      chiffres: [['49 244 km', 'diamètre'], ['4,5 milliards km', 'distance au Soleil'], ['165 ans', 'durée de l’année'], ['16 h 6 min', 'durée du jour'], ['16', 'lunes connues'], ['2 000 km/h', 'vents les plus rapides du système solaire']],
      fait: 'Le Français Urbain Le Verrier a calculé sa position en 1846 à partir des perturbations d’Uranus ; elle a été vue à moins d’un degré de l’endroit prévu.' },
    pluton: { icone: '🤍', nasa: 'Pluto New Horizons', resume: 'Une planète naine de la ceinture de Kuiper, déclassée en 2006. Survolée par la sonde New Horizons en 2015, elle s’est révélée étonnamment active.',
      chiffres: [['2 377 km', 'diamètre (plus petite que la Lune)'], ['5,9 milliards km', 'distance moyenne'], ['248 ans', 'durée de l’année'], ['6,4 jours', 'durée du jour'], ['5', 'lunes, dont Charon'], ['−230 °C', 'température']],
      fait: 'Elle porte un immense « cœur » de glace d’azote, Tombaugh Regio, du nom de Clyde Tombaugh qui l’a découverte en 1930.' },
    lune: { icone: '🌙', nasa: 'Moon Lunar Reconnaissance Orbiter', resume: 'Notre satellite est probablement né d’une collision géante entre la jeune Terre et un astre de la taille de Mars, il y a 4,5 milliards d’années.',
      chiffres: [['3 474 km', 'diamètre'], ['384 400 km', 'distance moyenne'], ['29,5 jours', 'cycle des phases'], ['27,3 jours', 'pour tourner sur elle-même'], ['3,8 cm/an', 'elle s’éloigne de nous'], ['12', 'humains y ont marché (1969-1972)']],
      fait: 'Elle nous montre toujours la même face, car elle tourne sur elle-même exactement pendant qu’elle fait le tour de la Terre.' }
  };

  // Fiches de l'encyclopédie
  const F = (id, cat, titre, mots, html, extra = {}) => ({ id, cat, titre, mots, html, ...extra });
  const fiches = [
    // Système solaire : fiches générées depuis les données des planètes
    ...['soleil', 'mercure', 'venus', 'terre', 'lune', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune', 'pluton'].map(id => {
      const p = planetes[id], nom = { soleil: 'Le Soleil', mercure: 'Mercure', venus: 'Vénus', terre: 'La Terre', lune: 'La Lune', mars: 'Mars', jupiter: 'Jupiter', saturne: 'Saturne', uranus: 'Uranus', neptune: 'Neptune', pluton: 'Pluton' }[id];
      return F(id, 'Système solaire', nom, [id, nom.replace(/^(Le |La )/, '').toLowerCase(), 'planete'],
        `<p>${p.resume}</p><div class="chiffres-cles">${p.chiffres.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div><p>✨ ${p.fait}</p>`,
        { nasa: p.nasa, ciel: id === 'terre' ? null : nom.replace(/^(Le |La )/, ''), systeme: id === 'lune' ? 'terre' : id, schema: id === 'soleil' ? 'soleil' : id === 'lune' ? 'phases' : null });
    }),
    F('systeme-solaire', 'Système solaire', 'Le système solaire en un coup d’œil', ['systeme solaire', 'planetes', 'ordre', 'combien de planetes', 'taille'],
      `<p>Le Soleil, 8 planètes, au moins 5 planètes naines (Pluton, Cérès, Éris, Makémaké, Hauméa), des centaines de lunes, plus d’un million d’astéroïdes connus et des milliards de comètes.</p>
      <p>Pour retenir l’ordre des planètes : <b>« Mon Vieux, Tu M’as Jeté Sur Une Nébuleuse »</b> : Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune.</p>
      <p>Les quatre premières sont rocheuses ; Jupiter et Saturne sont des géantes de gaz ; Uranus et Neptune des géantes de glaces.</p>`, { schema: 'tailles', systeme: 'soleil' }),
    F('asteroides', 'Système solaire', 'Astéroïdes et planètes naines', ['asteroide', 'ceres', 'ceinture', 'apophis', 'dinosaures', 'impact', 'bennu'],
      `<p>Les astéroïdes sont des restes rocheux de la formation des planètes. La plupart circulent dans la ceinture principale, entre Mars et Jupiter. Le plus gros, <b>Cérès</b> (940 km), est une planète naine.</p>
      <p>Il y a 66 millions d’années, un astéroïde d’environ 10 km a frappé le Mexique et provoqué la disparition des dinosaures non aviens. Aujourd’hui, les agences spatiales surveillent les objets proches de la Terre. En 2022, la sonde <b>DART</b> de la NASA a réussi à dévier l’astéroïde Dimorphos : une première pour la défense planétaire.</p>
      <p>L’astéroïde <b>Apophis</b> (340 m) frôlera la Terre le <b>13 avril 2029</b> à environ 32 000 km, plus près que nos satellites géostationnaires, sans danger, et visible à l’œil nu depuis l’Europe et l’Afrique.</p>`, { nasa: 'asteroid Bennu OSIRIS-REx' }),
    F('cometes', 'Système solaire', 'Les comètes', ['comete', 'halley', 'queue', 'oort', 'kuiper', 'rosetta', 'neowise'],
      `<p>Des « boules de neige sales » faites de glace et de poussières, venues des confins du système solaire (ceinture de Kuiper et nuage de Oort). Près du Soleil, la glace se sublime : une chevelure et deux queues apparaissent, toujours dirigées à l’opposé du Soleil.</p>
      <p>La <b>comète de Halley</b> revient tous les 76 ans environ : prochain passage en <b>2061</b>. En 2014, la sonde européenne <b>Rosetta</b> a posé le robot Philae sur la comète 67P/Tchourioumov-Guérassimenko.</p>`, { nasa: 'comet', systeme: 'halley' }),
    F('meteores', 'Phénomènes', 'Étoiles filantes et météorites', ['etoile filante', 'meteore', 'meteorite', 'perseides', 'geminides', 'pluie', 'essaim', 'bolide'],
      `<p>Une étoile filante n’est pas une étoile : c’est un grain de poussière, souvent plus petit qu’un grain de sable, qui entre dans l’atmosphère à 11 à 72 km/s et se vaporise à 80-100 km d’altitude en faisant briller l’air.</p>
      <p>Quand la Terre traverse la traînée de poussières laissée par une comète, on observe une <b>pluie d’étoiles filantes</b> : les Perséides en août, les Géminides en décembre (les plus riches). Si un morceau survit et touche le sol, c’est une <b>météorite</b>.</p>
      <p>Conseil : éloigne-toi des lumières, allonge-toi, regarde une grande partie du ciel et laisse tes yeux s’habituer 20 minutes. Pas besoin d’instrument. Le calendrier est dans l’onglet « Outils et calendrier ».</p>`),
    F('lunes', 'Système solaire', 'Les lunes extraordinaires', ['europe', 'encelade', 'titan', 'io', 'ganymede', 'triton', 'lunes', 'satellite', 'ocean'],
      `<ul><li><b>Io</b> (Jupiter) : le monde le plus volcanique connu, plus de 400 volcans actifs.</li>
      <li><b>Europe</b> (Jupiter) : un océan d’eau salée sous 15 à 25 km de glace. La sonde <b>Europa Clipper</b>, lancée en 2024, l’étudiera à partir de 2030.</li>
      <li><b>Ganymède</b> (Jupiter) : la plus grande lune du système solaire, plus grande que Mercure. Destination de la sonde européenne <b>JUICE</b>.</li>
      <li><b>Titan</b> (Saturne) : une atmosphère épaisse, des lacs et des rivières de méthane liquide. Le drone <b>Dragonfly</b> de la NASA doit y voler dans les années 2030.</li>
      <li><b>Encelade</b> (Saturne) : des geysers d’eau jaillissent de son pôle sud ; son océan contient les ingrédients de la vie.</li>
      <li><b>Triton</b> (Neptune) : tourne à l’envers ; c’est sans doute un astre capturé de la ceinture de Kuiper.</li></ul>`, { nasa: 'Europa Enceladus Titan' }),
    F('kuiper-oort', 'Système solaire', 'Ceinture de Kuiper et nuage de Oort', ['kuiper', 'oort', 'frontiere', 'arrokoth', 'heliosphere', 'limite systeme solaire'],
      `<p>Au-delà de Neptune s’étend la <b>ceinture de Kuiper</b> (30 à 50 UA) : des milliers de mondes glacés, dont Pluton et Arrokoth, survolé par New Horizons le 1er janvier 2019. Bien plus loin, le <b>nuage de Oort</b>, sphère de milliards de comètes, s’étendrait jusqu’à 1 ou 2 années-lumière : la vraie frontière gravitationnelle du Soleil.</p>`, { cosmos: 'echelle' }),

    // Étoiles
    F('etoiles', 'Étoiles', 'Qu’est-ce qu’une étoile ?', ['etoile', 'fusion', 'combien d etoiles', 'briller', 'scintiller'],
      `<p>Une étoile est une énorme boule de gaz qui brille grâce à la <b>fusion nucléaire</b> : en son cœur, à des millions de degrés, l’hydrogène se transforme en hélium en libérant une énergie colossale. Sa propre gravité la comprime ; la pression de la chaleur la retient. Cet équilibre peut durer des milliards d’années.</p>
      <p>Les étoiles <b>scintillent</b> parce que leur lumière traverse les turbulences de notre atmosphère. Les planètes, qui sont de petits disques et non des points, scintillent beaucoup moins : c’est une astuce pour les reconnaître.</p>
      <p>À l’œil nu, sous un ciel parfaitement noir, on voit environ 3 000 étoiles à la fois. La Voie lactée en compte 100 à 400 milliards, et l’univers observable environ 10<sup>22</sup> à 10<sup>24</sup> : plus que de grains de sable sur toutes les plages de la Terre.</p>`, { schema: 'hr' }),
    F('vie-etoiles', 'Étoiles', 'Naissance, vie et mort des étoiles', ['vie des etoiles', 'mort', 'naissance', 'geante rouge', 'nebuleuse planetaire', 'evolution'],
      `<p>Les étoiles naissent dans des nuages de gaz et de poussières (nébuleuses) qui s’effondrent sous leur poids. Leur destin dépend surtout de leur <b>masse</b> :</p>
      <ul><li><b>Petites étoiles</b> (naines rouges) : elles brûlent lentement pendant des milliers de milliards d’années, plus que l’âge actuel de l’univers.</li>
      <li><b>Étoiles comme le Soleil</b> : après 10 milliards d’années, elles gonflent en géante rouge, éjectent leurs couches externes (une nébuleuse planétaire) et laissent une naine blanche.</li>
      <li><b>Étoiles massives</b> (plus de 8 Soleils) : elles vivent vite, quelques millions d’années, puis explosent en <b>supernova</b>, en laissant une étoile à neutrons ou un trou noir.</li></ul>
      <p>Le fer de ton sang, le calcium de tes os, l’oxygène que tu respires : tout a été fabriqué dans des étoiles mortes avant la naissance du Soleil. Nous sommes littéralement des poussières d’étoiles.</p>`, { schema: 'vie' }),
    F('couleurs-etoiles', 'Étoiles', 'Couleurs, températures et diagramme HR', ['couleur', 'temperature', 'diagramme', 'hertzsprung', 'russell', 'bleue', 'rouge', 'type spectral'],
      `<p>La couleur d’une étoile indique sa température : les <b>bleues</b> dépassent 20 000 °C, les <b>blanches</b> 10 000 °C, les <b>jaunes</b> comme le Soleil 5 500 °C, les <b>rouges</b> moins de 3 500 °C. C’est l’inverse des robinets !</p>
      <p>En plaçant les étoiles selon leur température et leur luminosité, on obtient le <b>diagramme de Hertzsprung-Russell</b> : la plupart (90 %) se rangent sur une diagonale, la « séquence principale ». Les géantes et les naines blanches occupent d’autres zones.</p>
      <p>Regarde Orion en hiver : Bételgeuse est nettement orangée, Rigel bleutée. Dans le planétarium, les étoiles ont leur vraie couleur.</p>`, { schema: 'hr' }),
    F('trous-noirs', 'Étoiles', 'Les trous noirs', ['trou noir', 'horizon', 'sagittarius', 'm87', 'event horizon', 'singularite', 'gravite'],
      `<p>Un trou noir est une région où la matière est si concentrée que rien, pas même la lumière, ne peut s’en échapper une fois franchi l’<b>horizon des événements</b>. Si la Terre devenait un trou noir, elle tiendrait dans une bille de 9 mm.</p>
      <ul><li><b>Trous noirs stellaires</b> : quelques dizaines de masses solaires, nés de l’effondrement d’étoiles massives.</li>
      <li><b>Trous noirs supermassifs</b> : des millions à des milliards de masses solaires, au centre des galaxies. Le nôtre, <b>Sagittarius A*</b>, pèse 4 millions de Soleils.</li></ul>
      <p>En 2019, l’Event Horizon Telescope a publié la première image de l’ombre d’un trou noir (M87*, 6,5 milliards de masses solaires) ; en 2022, celle de Sagittarius A*. Près d’un trou noir, le temps s’écoule plus lentement : c’est la relativité d’Einstein.</p>`, { schema: 'trounoir', nasa: 'black hole', ciel: 'M87' }),
    F('etoiles-neutrons', 'Étoiles', 'Étoiles à neutrons, pulsars et magnétars', ['etoile a neutrons', 'pulsar', 'magnetar', 'neutron', 'kilonova'],
      `<p>Quand une étoile massive explose, son cœur peut s’effondrer en une boule d’une vingtaine de kilomètres qui contient plus que la masse du Soleil. Une cuillère à café de sa matière pèserait environ un milliard de tonnes.</p>
      <p>Certaines tournent sur elles-mêmes des centaines de fois par seconde et balaient l’espace de faisceaux radio comme des phares : ce sont les <b>pulsars</b>, découverts en 1967 par l’étudiante Jocelyn Bell. Les <b>magnétars</b> ont les champs magnétiques les plus intenses de l’univers.</p>
      <p>En 2017, la collision de deux étoiles à neutrons (GW170817) a été captée en ondes gravitationnelles et en lumière : elle a confirmé que ces collisions fabriquent de l’or et du platine.</p>`, { nasa: 'pulsar neutron star', ciel: 'M1' }),
    F('supernovas', 'Étoiles', 'Les supernovas', ['supernova', 'explosion', 'crabe', '1054', '1987a', 'nova'],
      `<p>L’explosion d’une étoile en fin de vie peut briller autant qu’une galaxie entière pendant quelques semaines. Elle disperse dans l’espace les éléments lourds qui formeront de nouvelles étoiles et planètes.</p>
      <p>En 1054, des astronomes chinois ont noté une « étoile invitée » visible en plein jour pendant 23 jours : son reste est la <b>nébuleuse du Crabe</b> (M1), avec un pulsar en son centre. La dernière supernova visible à l’œil nu est SN 1987A, dans le Grand Nuage de Magellan.</p>`, { ciel: 'M1', nasa: 'supernova remnant' }),
    F('betelgeuse', 'Étoiles', 'Bételgeuse, la géante rouge d’Orion', ['betelgeuse', 'orion', 'geante rouge', 'supergeante'],
      `<p>L’épaule d’Orion est une supergéante rouge si grande que, placée à la place du Soleil, elle engloutirait Mars et peut-être Jupiter. Elle se trouve à environ 550 années-lumière.</p>
      <p>Fin 2019 et début 2020, son éclat a fortement baissé : c’était un nuage de poussières qu’elle avait expulsé, et non l’explosion. Elle deviendra une supernova d’ici quelques centaines de milliers d’années au plus ; elle brillera alors comme une demi-Lune, visible en plein jour. En 2025, des astronomes ont détecté une petite étoile compagne qui tourne autour d’elle.</p>`, { ciel: 'Betelgeuse' }),
    F('exoplanetes', 'Étoiles', 'Les exoplanètes', ['exoplanete', 'autre planete', 'trappist', 'proxima b', '51 pegasi', 'habitable', 'autres mondes'],
      `<p>Une exoplanète tourne autour d’une autre étoile que le Soleil. La première autour d’une étoile semblable au Soleil, <b>51 Pegasi b</b>, a été découverte en 1995 par les Suisses Michel Mayor et Didier Queloz (prix Nobel 2019).</p>
      <p>On en a confirmé <b>plus de 6 000</b> (le compte grandit chaque mois). Le système <b>TRAPPIST-1</b>, à 40 années-lumière, compte sept planètes de la taille de la Terre, dont plusieurs dans la zone où l’eau pourrait être liquide. L’étoile la plus proche, Proxima du Centaure, a elle aussi une planète tempérée.</p>
      <p>On les trouve surtout par la méthode des <b>transits</b> (la planète passe devant son étoile et fait baisser son éclat) et des vitesses radiales (l’étoile « tangue » sous l’effet de la planète).</p>`, { nasa: 'exoplanet', cosmos: 'voisinage' }),
    F('nebuleuses', 'Étoiles', 'Les nébuleuses', ['nebuleuse', 'orion', 'm42', 'piliers', 'aigle', 'pouponniere', 'gaz', 'poussiere'],
      `<p>Des nuages de gaz et de poussières. Certaines sont des <b>pouponnières d’étoiles</b>, comme la grande nébuleuse d’Orion (M42, visible à l’œil nu sous l’épée d’Orion) ou la nébuleuse de l’Aigle et ses célèbres Piliers de la Création. D’autres sont les restes d’étoiles mortes : nébuleuses planétaires (M57, l’Anneau) et restes de supernovas (M1, le Crabe).</p>
      <p>Leurs couleurs sur les photos viennent des atomes qui brillent : le rouge de l’hydrogène, le vert-bleu de l’oxygène.</p>`, { ciel: 'M42', nasa: 'nebula Hubble' }),
    F('amas', 'Étoiles', 'Amas d’étoiles', ['amas', 'pleiades', 'globulaire', 'ouvert', 'm13', 'm45', 'creche'],
      `<p><b>Amas ouverts</b> : quelques centaines d’étoiles jeunes nées ensemble, comme les <b>Pléiades</b> (M45), visibles à l’œil nu en hiver : on en compte 6 ou 7 à l’œil, plus de 1 000 en réalité.</p>
      <p><b>Amas globulaires</b> : des boules de centaines de milliers d’étoiles très vieilles (plus de 10 milliards d’années) qui tournent autour de la galaxie, comme le grand amas d’Hercule (M13).</p>`, { ciel: 'Pleiades' }),
    F('etoile-polaire', 'Observer', 'Trouver l’étoile Polaire et le nord', ['polaire', 'nord', 'grande ourse', 'casserole', 'orientation', 'boussole'],
      `<p>Repère la <b>Grande Ourse</b> (la « casserole »), toujours visible depuis la France. Prolonge environ cinq fois la distance entre les deux étoiles du bord de la casserole (Merak et Dubhe) : tu tombes sur l’<b>étoile Polaire</b>. Elle indique le nord à moins d’un degré près.</p>
      <p>La Polaire n’est pas l’étoile la plus brillante (c’est Sirius), mais elle ne bouge presque pas : tout le ciel semble tourner autour d’elle. Sa hauteur au-dessus de l’horizon est égale à ta latitude : 49° à Paris.</p>`, { ciel: 'Polaris', schema: 'polaire' }),

    // Galaxies et cosmos
    F('voie-lactee', 'Galaxies et cosmos', 'La Voie lactée, notre galaxie', ['voie lactee', 'galaxie', 'notre galaxie', 'bras', 'centre galactique'],
      `<p>Une galaxie spirale barrée d’environ 100 000 années-lumière de diamètre, qui compte 100 à 400 milliards d’étoiles. Le Soleil se trouve dans un petit bras, à 26 000 années-lumière du centre, et en fait le tour en 230 millions d’années.</p>
      <p>La bande laiteuse que l’on voit dans un ciel sans pollution lumineuse, c’est le disque de notre galaxie vu de l’intérieur. En été, regarde vers le Sagittaire, au sud : c’est la direction du centre, où se cache le trou noir Sagittarius A*.</p>`, { cosmos: 'galaxie', nasa: 'Milky Way' }),
    F('andromede', 'Galaxies et cosmos', 'La galaxie d’Andromède', ['andromede', 'm31', 'collision', 'galaxie voisine'],
      `<p>Notre grande voisine, à 2,5 millions d’années-lumière : l’objet le plus lointain visible à l’œil nu. Elle contient environ mille milliards d’étoiles. La lumière que tu en reçois est partie quand les premiers humains du genre <i>Homo</i> marchaient en Afrique.</p>
      <p>Elle se rapproche à 110 km/s. Une fusion avec la Voie lactée est possible dans 4 à 5 milliards d’années ; une étude de 2025 estime qu’elle n’a qu’environ une chance sur deux de se produire dans les 10 milliards d’années à venir. Les étoiles ne se percuteraient pas : elles sont bien trop espacées.</p>
      <p>Pour la voir : en automne, cherche une petite tache floue près du carré de Pégase, de préférence avec des jumelles.</p>`, { ciel: 'M31', cosmos: 'groupe', nasa: 'Andromeda galaxy' }),
    F('galaxies', 'Galaxies et cosmos', 'Les types de galaxies', ['galaxie', 'spirale', 'elliptique', 'irreguliere', 'hubble', 'combien de galaxies'],
      `<p>Edwin Hubble a classé les galaxies selon leur forme : <b>elliptiques</b> (des ballons d’étoiles vieilles), <b>spirales</b> (avec ou sans barre, comme la nôtre) et <b>irrégulières</b>. L’univers observable en compterait environ 2 000 milliards.</p>
      <p>En 1923, en observant des étoiles variables dans Andromède, Hubble a prouvé qu’elle était bien au-delà de la Voie lactée : l’univers est devenu d’un coup immensément plus grand.</p>`, { schema: 'hubble', ciel: 'M51' }),
    F('big-bang', 'Galaxies et cosmos', 'Le Big Bang et l’histoire de l’univers', ['big bang', 'origine', 'age de l univers', 'debut', 'commencement', 'premieres etoiles', 'chronologie'],
      `<p>L’univers a <b>13,8 milliards d’années</b>. Au départ, il était extrêmement chaud et dense, puis il s’est dilaté et refroidi. Le « Big Bang » n’est pas une explosion dans l’espace : c’est l’espace lui-même qui s’étire partout à la fois.</p>
      <ul><li>Premières minutes : formation des noyaux d’hydrogène et d’hélium.</li>
      <li>380 000 ans : l’univers devient transparent ; cette lumière nous parvient encore (le fond diffus cosmologique).</li>
      <li>Environ 100 à 200 millions d’années : les premières étoiles s’allument.</li>
      <li>9,2 milliards d’années : naissance du Soleil et de la Terre.</li></ul>
      <p>Le télescope James Webb observe des galaxies qui existaient moins de 300 millions d’années après le Big Bang.</p>`, { schema: 'chrono', demo: 'expansion' }),
    F('expansion', 'Galaxies et cosmos', 'L’expansion de l’univers', ['expansion', 'redshift', 'decalage vers le rouge', 'hubble lemaitre', 'galaxies s eloignent', 'constante de hubble'],
      `<p>En 1927, le Belge Georges Lemaître propose que l’univers est en expansion ; en 1929, Edwin Hubble montre que plus une galaxie est loin, plus elle s’éloigne vite. La lumière des galaxies lointaines est étirée vers le rouge : c’est le <b>décalage vers le rouge</b>.</p>
      <p>Le rythme actuel est d’environ 70 km/s par mégaparsec, mais deux méthodes de mesure donnent des valeurs différentes (67 et 73) : c’est la <b>tension de Hubble</b>, une énigme non résolue. Depuis 1998, on sait que l’expansion <b>accélère</b>.</p>`, { demo: 'expansion' }),
    F('matiere-noire', 'Galaxies et cosmos', 'Matière noire et énergie noire', ['matiere noire', 'energie noire', 'composition', 'invisible', 'mystere'],
      `<p>Tout ce que nous voyons (étoiles, planètes, gaz, nous) ne représente qu’environ <b>5 %</b> du contenu de l’univers. Environ <b>27 %</b> est une <b>matière noire</b> invisible, détectée seulement par sa gravité : sans elle, les galaxies tourneraient trop vite pour rester entières. Les <b>68 %</b> restants sont une <b>énergie noire</b> qui accélère l’expansion.</p>
      <p>Personne ne sait encore ce qu’elles sont. Les relevés DESI (2024-2025) suggèrent que l’énergie noire pourrait varier avec le temps ; le télescope Euclid cartographie l’univers sombre depuis 2023.</p>`),
    F('fond-diffus', 'Galaxies et cosmos', 'Le fond diffus cosmologique', ['fond diffus', 'cmb', 'rayonnement fossile', 'plus vieille lumiere', 'planck'],
      `<p>La plus vieille lumière de l’univers, émise 380 000 ans après le Big Bang, quand il est devenu transparent. Étirée par l’expansion, elle nous arrive aujourd’hui sous forme de micro-ondes, à −270,4 °C (2,7 K).</p>
      <p>Découverte par hasard en 1964 par Penzias et Wilson, qui croyaient d’abord à des fientes de pigeons dans leur antenne ! Une petite partie de la « neige » des anciennes télévisions venait de là.</p>`),
    F('univers-observable', 'Galaxies et cosmos', 'L’univers observable', ['taille de l univers', 'univers observable', 'infini', 'bord', 'combien grand'],
      `<p>Nous ne voyons que la partie de l’univers dont la lumière a eu le temps de nous parvenir : c’est l’<b>univers observable</b>, une sphère d’environ <b>93 milliards d’années-lumière de diamètre</b>. Plus que 2 × 13,8 milliards, car l’espace s’est dilaté pendant le trajet de la lumière.</p>
      <p>Au-delà, l’univers continue, peut-être à l’infini. Il n’a ni centre ni bord : chaque observateur, partout, se voit au centre de sa propre sphère observable.</p>`, { cosmos: 'echelle' }),
    F('ondes-gravitationnelles', 'Galaxies et cosmos', 'Les ondes gravitationnelles', ['ondes gravitationnelles', 'ligo', 'virgo', 'einstein', 'espace temps'],
      `<p>Prédites par Einstein en 1916 : des vibrations de l’espace-temps lui-même, produites par des masses énormes qui accélèrent, comme deux trous noirs qui fusionnent. Le 14 septembre 2015, les détecteurs LIGO en ont capté une pour la première fois (prix Nobel 2017), venue d’une collision de trous noirs à 1,3 milliard d’années-lumière.</p>
      <p>La déformation mesurée était mille fois plus petite qu’un proton sur 4 km. Le détecteur européen Virgo, près de Pise, participe aux observations ; on en détecte désormais plusieurs par semaine.</p>`),

    // Observer
    F('debuter', 'Observer', 'Bien débuter en astronomie', ['debuter', 'commencer', 'conseils', 'observer', 'premiere fois', 'adaptation', 'lampe rouge'],
      `<ol><li><b>Commence à l’œil nu.</b> Apprends quelques constellations : Grande Ourse, Cassiopée, Orion en hiver, le Triangle d’été.</li>
      <li><b>Laisse tes yeux s’adapter 20 minutes</b> au noir. Une seule lumière blanche ruine cette adaptation : utilise une lampe rouge (ou le mode 🔴 Nuit de cette appli).</li>
      <li><b>Fuis la pollution lumineuse</b> et choisis une nuit sans Lune pour les objets faibles.</li>
      <li><b>Prends des jumelles</b> (7×50 ou 10×50) avant un télescope : cratères lunaires, lunes de Jupiter, Pléiades, Andromède.</li>
      <li><b>Couvre-toi</b> : on a toujours plus froid qu’on ne pense en restant immobile.</li>
      <li><b>Note ce que tu vois</b> et relève les défis de l’onglet « Défis ».</li></ol>`, { schema: 'telescopes' }),
    F('instruments', 'Observer', 'Jumelles et télescopes', ['telescope', 'lunette', 'jumelles', 'grossissement', 'achat', 'acheter', 'dobson', 'instrument'],
      `<p>Le plus important n’est pas le grossissement mais le <b>diamètre</b> (l’ouverture) : plus il est grand, plus l’instrument capte de lumière et montre de détails.</p>
      <ul><li><b>Jumelles 10×50</b> : grossissent 10 fois, 50 mm de diamètre. Parfaites pour débuter.</li>
      <li><b>Lunette</b> (réfracteur, avec des lentilles) : image nette, idéale pour la Lune et les planètes.</li>
      <li><b>Télescope</b> (réflecteur, avec un miroir) : plus de diamètre pour le même prix. Un Dobson de 150 à 200 mm est un excellent premier télescope.</li></ul>
      <p>Méfie-toi des publicités « grossit 500 fois » : au-delà de deux fois le diamètre en millimètres, l’image devient floue.</p>`, { schema: 'telescopes' }),
    F('constellations', 'Observer', 'Les constellations', ['constellation', 'zodiaque', 'signe', 'ophiuchus', 'orion', 'cassiopee', '88'],
      `<p>Le ciel est découpé officiellement en <b>88 constellations</b> depuis 1922 : des régions du ciel, comme les pays d’une carte. Les étoiles d’une constellation n’ont souvent rien à voir entre elles : elles sont à des distances très différentes et semblent proches par effet de perspective.</p>
      <p>Le Soleil traverse en réalité <b>13</b> constellations du zodiaque, dont Ophiuchus (le Serpentaire), et ses dates de passage ont glissé de près d’un mois depuis l’Antiquité à cause de la précession. L’astrologie n’a aucun fondement scientifique ; l’astronomie, si.</p>`, { quiz: 'constellations' }),
    F('magnitude', 'Observer', 'La magnitude : mesurer l’éclat', ['magnitude', 'eclat', 'brillance', 'plus brillante', 'sirius'],
      `<p>Plus la magnitude est <b>petite</b>, plus l’astre est brillant. Une différence de 5 magnitudes correspond à un facteur 100 en éclat.</p>
      <ul><li>Soleil −26,7 · pleine Lune −12,7 · Vénus jusqu’à −4,6 · Jupiter −2,9 au mieux · Sirius −1,46</li>
      <li>Étoiles les plus faibles visibles à l’œil nu : environ 6 sous un ciel noir, 3 ou 4 en ville.</li>
      <li>Le télescope James Webb atteint des objets de magnitude 29 ou plus : des milliards de fois plus faibles.</li></ul>`),
    F('pollution-lumineuse', 'Observer', 'La pollution lumineuse', ['pollution lumineuse', 'ville', 'ciel noir', 'bortle', 'eclairage', 'reserve de ciel etoile'],
      `<p>Plus d’un tiers de l’humanité ne voit plus la Voie lactée. En ville, on ne voit que quelques dizaines d’étoiles contre environ 3 000 sous un ciel noir. L’éclairage nocturne perturbe aussi les oiseaux migrateurs, les insectes et notre sommeil.</p>
      <p>En France, des <b>réserves internationales de ciel étoilé</b> protègent la nuit : Pic du Midi, Cévennes, Alpes Azur Mercantour, Millevaches. Les constellations de satellites (des milliers de Starlink) posent aussi un nouveau défi aux astronomes.</p>`),
    F('photo-ciel', 'Observer', 'Photographier le ciel', ['photo', 'photographier', 'smartphone', 'astrophoto', 'pose longue', 'telephone'],
      `<ul><li><b>Lune au smartphone</b> : pose le téléphone contre l’oculaire de jumelles ou d’un télescope (méthode afocale), baisse l’exposition.</li>
      <li><b>Voie lactée</b> : appareil sur trépied, objectif grand-angle très ouvert (f/2,8 ou moins), pose de 15 à 25 secondes, ISO 1600 à 3200, mise au point manuelle sur une étoile brillante.</li>
      <li><b>Filés d’étoiles</b> : des centaines de photos de 30 s empilées montrent la rotation du ciel autour de la Polaire.</li>
      <li>Beaucoup de smartphones récents ont un mode « nuit » ou « astro » de plusieurs minutes : pose-les bien stables.</li></ul>`),
    F('iss', 'Exploration', 'La Station spatiale internationale', ['iss', 'station spatiale', 'pesquet', 'adenot', 'astronaute', 'voir l iss'],
      `<p>Elle tourne à environ 400 km d’altitude, à 28 000 km/h : un tour de la Terre en 92 minutes, soit environ 16 levers de Soleil par jour. Occupée en permanence depuis novembre 2000. Sa fin de vie est prévue vers 2030.</p>
      <p>On la voit à l’œil nu comme un point très brillant qui traverse le ciel en quelques minutes sans clignoter, juste après le coucher ou avant le lever du Soleil. Les Français Thomas Pesquet (2016-2017 et 2021) et Sophie Adenot (mission εpsilon, 2026) y ont séjourné.</p>`, { nasa: 'International Space Station' }),
    F('aurores', 'Phénomènes', 'Les aurores polaires', ['aurore', 'boreale', 'australe', 'vent solaire', 'tempete solaire', 'eruption solaire'],
      `<p>Des particules du vent solaire, guidées par le champ magnétique terrestre vers les pôles, excitent les atomes de la haute atmosphère : l’oxygène brille en vert (et en rouge plus haut), l’azote en bleu et violet.</p>
      <p>Lors des grandes tempêtes solaires, comme en mai et en octobre 2024, des aurores ont été visibles jusqu’en France et dans le sud de l’Europe. Le Soleil était alors au maximum de son cycle d’activité de 11 ans.</p>`, { nasa: 'aurora' }),

    // Phénomènes
    F('phases-lune', 'Phénomènes', 'Les phases de la Lune', ['phase', 'phases', 'croissant', 'pleine lune', 'nouvelle lune', 'quartier', 'gibbeuse'],
      `<p>La Lune ne produit pas de lumière : elle est toujours éclairée à moitié par le Soleil. Selon sa position autour de la Terre, nous voyons une portion plus ou moins grande de sa moitié éclairée. Le cycle complet dure <b>29,5 jours</b>.</p>
      <p>Astuce : dans l’hémisphère nord, si le croissant forme un <b>« p »</b> (arrondi à droite), elle est en <b>premier</b> quartier et croît ; s’il forme un « d » (arrondi à gauche), elle <b>décroît</b>. La Lune ment : « C » comme croissant ne marche pas !</p>
      <p>Le meilleur moment pour observer les cratères aux jumelles n’est pas la pleine Lune mais le premier quartier : les ombres sont longues le long du terminateur.</p>`, { schema: 'phases', demo: 'phases', ciel: 'Lune' }),
    F('saisons', 'Phénomènes', 'Pourquoi les saisons ?', ['saison', 'ete', 'hiver', 'solstice', 'equinoxe', 'inclinaison', 'axe'],
      `<p>Ce n’est <b>pas</b> la distance au Soleil : la Terre en est même au plus près début janvier, en plein hiver boréal ! C’est l’<b>inclinaison de 23,4°</b> de l’axe de la Terre.</p>
      <p>En juin, l’hémisphère nord penche vers le Soleil : les rayons arrivent plus droits (ils chauffent davantage une même surface) et les jours sont longs. En décembre, c’est l’inverse. Les saisons sont donc opposées dans l’hémisphère sud.</p>
      <p>Solstices : vers le 21 juin et le 21 décembre. Équinoxes (jour et nuit égaux) : vers le 20 mars et le 22 septembre.</p>`, { schema: 'saisons', demo: 'saisons' }),
    F('eclipses', 'Phénomènes', 'Les éclipses', ['eclipse', 'eclipse solaire', 'eclipse lunaire', 'lune rouge', 'lune de sang', 'totale', 'annulaire'],
      `<p><b>Éclipse de Soleil</b> : la Lune passe devant le Soleil (à la nouvelle Lune). Par un hasard extraordinaire, le Soleil est 400 fois plus grand que la Lune mais aussi 400 fois plus loin : elle le couvre presque exactement. Pendant la totalité, on voit la couronne solaire et des étoiles en plein jour.</p>
      <p><b>Éclipse de Lune</b> : la Lune passe dans l’ombre de la Terre (à la pleine Lune). Elle devient rouge cuivré, éclairée par la lumière de tous les couchers de Soleil de la Terre filtrée par notre atmosphère.</p>
      <p>Il n’y en a pas à chaque Lune car l’orbite lunaire est inclinée de 5° : il faut que les trois astres soient bien alignés.</p>
      <p><b>⚠️ Ne regarde jamais une éclipse de Soleil sans lunettes spéciales certifiées ISO 12312-2.</b> Prochaine éclipse totale proche de la France : <b>2 août 2027</b>, visible totale dans le sud de l’Espagne et en Afrique du Nord.</p>`, { schema: 'eclipses', demo: 'eclipses' }),
    F('marees', 'Phénomènes', 'Les marées', ['maree', 'ocean', 'attraction', 'gravitation lune', 'vive eau', 'mont saint michel'],
      `<p>La Lune attire un peu plus fort le côté de la Terre qui lui fait face que le centre, et le centre un peu plus que le côté opposé : les océans forment deux bourrelets, d’où deux marées hautes par jour environ.</p>
      <p>Quand le Soleil et la Lune sont alignés (nouvelle et pleine Lune), leurs effets s’additionnent : ce sont les grandes marées de vives-eaux. En baie du Mont-Saint-Michel, le marnage dépasse 14 mètres.</p>`),
    F('lumiere', 'Phénomènes', 'La lumière et l’année-lumière', ['annee lumiere', 'vitesse de la lumiere', 'lumiere', 'passe', 'regarder loin', 'spectre', 'ondes', 'infrarouge'],
      `<p>La lumière parcourt <b>299 792 km par seconde</b>. Une année-lumière est la distance qu’elle parcourt en un an : environ <b>9 461 milliards de km</b>. C’est une distance, pas une durée.</p>
      <p>Regarder loin, c’est regarder dans le passé : tu vois la Lune telle qu’elle était il y a 1,3 seconde, le Soleil il y a 8 minutes, Andromède il y a 2,5 millions d’années.</p>
      <p>Nos yeux ne voient qu’une toute petite partie de la lumière. Les télescopes observent aussi en radio, infrarouge (James Webb), ultraviolet, rayons X et gamma : chaque « couleur » révèle d’autres phénomènes.</p>`, { schema: 'spectre' }),

    // Exploration
    F('conquete', 'Exploration', 'La conquête spatiale', ['conquete spatiale', 'spoutnik', 'gagarine', 'apollo', 'armstrong', 'premier homme', 'lune 1969', 'histoire espace'],
      `<ul><li><b>4 octobre 1957</b> : Spoutnik 1, premier satellite artificiel (URSS).</li>
      <li><b>12 avril 1961</b> : Youri Gagarine, premier humain dans l’espace.</li>
      <li><b>16 juin 1963</b> : Valentina Terechkova, première femme dans l’espace.</li>
      <li><b>21 juillet 1969</b> : Neil Armstrong et Buzz Aldrin marchent sur la Lune (Apollo 11). Douze astronautes y ont marché jusqu’à Apollo 17 en décembre 1972.</li>
      <li><b>1990</b> : lancement du télescope spatial Hubble.</li>
      <li><b>1998 à 2000</b> : construction puis occupation permanente de la Station spatiale internationale.</li>
      <li><b>2021</b> : lancement du télescope James Webb ; le rover Perseverance et l’hélicoptère Ingenuity sur Mars.</li>
      <li><b>2026</b> : Artemis II, premier vol habité autour de la Lune depuis 1972.</li></ul>`, { nasa: 'Apollo 11' }),
    F('telescopes-spatiaux', 'Exploration', 'Les grands télescopes', ['hubble', 'james webb', 'jwst', 'euclid', 'gaia', 'rubin', 'elt', 'telescope spatial'],
      `<ul><li><b>Hubble</b> (1990) : miroir de 2,4 m, en orbite à 540 km. Il a mesuré l’âge de l’univers et révélé le champ profond.</li>
      <li><b>James Webb</b> (lancé le 25 décembre 2021) : miroir de 6,5 m, observe en infrarouge depuis le point de Lagrange L2, à 1,5 million de km.</li>
      <li><b>Gaia</b> (2013-2025) : a mesuré la position et le mouvement de près de 2 milliards d’étoiles de la Voie lactée.</li>
      <li><b>Euclid</b> (2023) : cartographie la matière noire et l’énergie noire.</li>
      <li><b>Observatoire Vera C. Rubin</b> (Chili, premières images en 2025) : sa caméra de 3,2 milliards de pixels photographie tout le ciel austral tous les trois jours environ.</li>
      <li><b>ELT</b> européen (Chili, en construction) : miroir de 39 m, le plus grand télescope optique du monde.</li></ul>`, { nasa: 'James Webb Space Telescope' }),
    F('sondes', 'Exploration', 'Les sondes spatiales', ['sonde', 'voyager', 'new horizons', 'juno', 'perseverance', 'parker', 'cassini', 'rosetta', 'juice', 'clipper'],
      `<ul><li><b>Voyager 1 et 2</b> (1977) : ont survolé Jupiter, Saturne, Uranus et Neptune ; elles voyagent maintenant dans l’espace interstellaire avec un disque d’or porteur de sons et d’images de la Terre.</li>
      <li><b>Cassini</b> (1997-2017) : 13 ans autour de Saturne, avant de plonger dans la planète.</li>
      <li><b>New Horizons</b> : survol de Pluton en 2015, puis d’Arrokoth en 2019.</li>
      <li><b>Juno</b> : en orbite autour de Jupiter depuis 2016.</li>
      <li><b>Parker Solar Probe</b> : le 24 décembre 2024, elle est passée à 6,1 millions de km du Soleil à environ 690 000 km/h, l’objet humain le plus rapide.</li>
      <li><b>JUICE</b> (ESA, 2023) et <b>Europa Clipper</b> (NASA, 2024) : en route vers les lunes glacées de Jupiter.</li></ul>`, { nasa: 'Voyager spacecraft' }),
    F('vie-ailleurs', 'Exploration', 'Y a-t-il de la vie ailleurs ?', ['vie extraterrestre', 'extraterrestre', 'aliens', 'vie ailleurs', 'seti', 'drake', 'ovni'],
      `<p>Nous n’avons, à ce jour, <b>aucune preuve</b> de vie ailleurs que sur Terre. Mais les ingrédients sont partout : eau, molécules organiques, énergie. Les meilleures pistes dans le système solaire : le sous-sol de Mars, les océans cachés d’Europe et d’Encelade, Titan.</p>
      <p>Au-delà, on analyse l’atmosphère des exoplanètes à la recherche de gaz produits par la vie (biosignatures). Avec des milliards de planètes dans notre seule galaxie, beaucoup de scientifiques pensent que la vie microbienne existe ailleurs ; la question d’une vie intelligente reste totalement ouverte.</p>`),

    // Histoire
    F('histoire', 'Histoire', 'Les grands noms de l’astronomie', ['histoire', 'galilee', 'copernic', 'kepler', 'newton', 'eratosthene', 'hubble', 'einstein', 'astronome'],
      `<ul><li><b>Ératosthène</b> (vers −240) : mesure la circonférence de la Terre avec des ombres et un bâton.</li>
      <li><b>Copernic</b> (1543) : place le Soleil, et non la Terre, au centre.</li>
      <li><b>Galilée</b> (1609-1610) : tourne une lunette vers le ciel et découvre les lunes de Jupiter, les phases de Vénus, les cratères lunaires.</li>
      <li><b>Kepler</b> (1609-1619) : les planètes suivent des ellipses.</li>
      <li><b>Newton</b> (1687) : la même gravitation fait tomber la pomme et tourner la Lune.</li>
      <li><b>Henrietta Leavitt</b> (1912) : une loi des étoiles variables qui permet de mesurer les distances cosmiques.</li>
      <li><b>Einstein</b> (1915) : la relativité générale ; la gravité courbe l’espace-temps.</li>
      <li><b>Hubble et Lemaître</b> (1920s) : les galaxies et l’expansion de l’univers.</li>
      <li><b>Vera Rubin</b> (années 1970) : la rotation des galaxies révèle la matière noire.</li></ul>`)
  ];

  // Découvertes à couper le souffle
  const decouvertes = [
    { titre: 'Le point bleu pâle', annee: 1990, chiffre: '6 milliards de km', texte: 'Le 14 février 1990, Voyager 1 se retourne et photographie la Terre : un pixel bleuté perdu dans un rayon de Soleil. Carl Sagan : « C’est ici. C’est notre foyer. C’est nous. »', nasa: 'pale blue dot Voyager', cosmos: 'echelle' },
    { titre: 'Les Piliers de la Création', annee: 1995, chiffre: '5 années-lumière de haut', texte: 'Des colonnes de gaz et de poussières dans la nébuleuse de l’Aigle, où naissent des étoiles. Photographiées par Hubble en 1995, puis en infrarouge par James Webb en 2022, qui voit à travers la poussière.', nasa: 'Pillars of Creation', ciel: 'M16' },
    { titre: 'Des milliers de galaxies dans un grain de sable', annee: 2022, chiffre: '≈ 2 000 milliards de galaxies', texte: 'Le premier champ profond de James Webb couvre la taille d’un grain de sable tenu à bout de bras… et contient des milliers de galaxies. Chaque point est un monde de milliards d’étoiles.', nasa: 'Webb deep field' },
    { titre: 'La première image d’un trou noir', annee: 2019, chiffre: '6,5 milliards de Soleils', texte: 'Huit radiotélescopes répartis sur la planète, synchronisés en un télescope de la taille de la Terre, ont révélé l’ombre du trou noir de la galaxie M87, à 55 millions d’années-lumière.', nasa: 'M87 black hole Event Horizon Telescope', ciel: 'M87', fiche: 'trous-noirs' },
    { titre: 'Entendre l’espace-temps vibrer', annee: 2015, chiffre: '1/1 000 de proton', texte: 'Deux trous noirs ont fusionné il y a 1,3 milliard d’années. Leur onde gravitationnelle a traversé l’univers et a fait vibrer les détecteurs LIGO d’un millième de la taille d’un proton. Einstein l’avait prédit 100 ans plus tôt.', fiche: 'ondes-gravitationnelles' },
    { titre: 'L’or vient des étoiles', annee: 2017, chiffre: 'plusieurs Terres d’or', texte: 'La collision de deux étoiles à neutrons, observée en ondes gravitationnelles et en lumière, a produit une « kilonova » qui a fabriqué des métaux lourds : l’or de tes bijoux est né dans un cataclysme semblable.', fiche: 'etoiles-neutrons', nasa: 'kilonova neutron star merger' },
    { titre: 'Voyager 1 à un jour-lumière', annee: 2026, chiffre: '≈ 26 milliards de km', texte: 'Vers la mi-novembre 2026, un signal radio met 24 heures pour atteindre Voyager 1. Lancée en 1977, elle est le seul objet humain si lointain, et son petit émetteur de 22 watts nous parle encore.', systeme: 'Voyager 1', cosmos: 'echelle' },
    { titre: 'Des geysers sur une lune de glace', annee: 2005, chiffre: '≈ 400 kg d’eau par seconde', texte: 'La sonde Cassini découvre des jets d’eau jaillissant du pôle sud d’Encelade, lune de Saturne. Elle les traverse et y trouve du sel, des molécules organiques et du phosphore : un océan caché aux ingrédients de la vie.', nasa: 'Enceladus geysers', fiche: 'lunes' },
    { titre: 'Sept Terres autour d’une petite étoile', annee: 2017, chiffre: '40 années-lumière', texte: 'Autour de l’étoile naine TRAPPIST-1 tournent sept planètes de la taille de la Terre. Depuis l’une d’elles, les autres apparaîtraient dans le ciel plus grandes que notre Lune.', fiche: 'exoplanetes', nasa: 'TRAPPIST-1' },
    { titre: 'L’univers accélère', annee: 1998, chiffre: '68 % d’énergie noire', texte: 'En mesurant des supernovas lointaines, deux équipes découvrent que l’expansion de l’univers ne ralentit pas : elle accélère. Une mystérieuse énergie noire domine le cosmos (prix Nobel 2011).', fiche: 'matiere-noire', demo: 'expansion' },
    { titre: 'Les galaxies de l’aube cosmique', annee: 2025, chiffre: '< 300 millions d’années après le Big Bang', texte: 'Le télescope James Webb a observé des galaxies déjà brillantes alors que l’univers n’avait que 2 % de son âge actuel, plus tôt et plus nombreuses que prévu. Les théories de formation des galaxies sont en train d’être revues.', nasa: 'Webb early galaxies', fiche: 'big-bang' },
    { titre: 'Laniakea, notre « horizon immense »', annee: 2014, chiffre: '100 000 galaxies', texte: 'En cartographiant les mouvements de milliers de galaxies, des astronomes ont dessiné notre superamas, baptisé Laniakea, « horizon immense » en hawaïen. La Voie lactée y est une poussière en bordure.', cosmos: 'toile' },
    { titre: 'Des visiteurs venus d’autres étoiles', annee: 2025, chiffre: '3 objets connus', texte: '’Oumuamua (2017), la comète Borisov (2019), puis 3I/ATLAS (2025) : trois objets nés autour d’autres étoiles ont traversé notre système solaire. Ce sont des échantillons d’autres systèmes planétaires.', nasa: 'interstellar object' },
    { titre: 'Pluton a un cœur', annee: 2015, chiffre: '1 000 km de glace d’azote', texte: 'Après neuf ans et demi de voyage, New Horizons survole Pluton et découvre un immense cœur de glace, des montagnes de glace d’eau et un ciel bleu. Un monde vivant, que l’on croyait mort.', systeme: 'pluton', nasa: 'Pluto New Horizons heart' },
    { titre: 'La plus vieille lumière de l’univers', annee: 1965, chiffre: '13,8 milliards d’années', texte: 'Une antenne capte un bruit de fond venu de toutes les directions : la lumière émise 380 000 ans après le Big Bang. Les satellites COBE, WMAP et Planck en ont tiré la carte de bébé de notre univers.', fiche: 'fond-diffus', nasa: 'cosmic microwave background Planck' },
    { titre: 'Bételgeuse s’assombrit', annee: 2020, chiffre: '−60 % d’éclat', texte: 'L’épaule d’Orion perd plus de la moitié de son éclat. Le monde se demande si elle va exploser… C’était un gigantesque nuage de poussière qu’elle venait de cracher. Elle explosera, mais sans doute pas de notre vivant.', ciel: 'Betelgeuse', fiche: 'betelgeuse' }
  ];

  // Quiz par thème : [question, [réponses], indice de la bonne, explication]
  const quiz = {
    'Système solaire': [
      ['Quelle est la planète la plus chaude du système solaire ?', ['Mercure', 'Vénus', 'Mars', 'Jupiter'], 1, 'Vénus, à 465 °C, à cause de son effet de serre emballé, alors que Mercure est plus proche du Soleil.'],
      ['Combien de planètes compte le système solaire ?', ['7', '8', '9', '12'], 1, 'Huit depuis 2006 : Pluton est désormais une planète naine.'],
      ['Quelle planète a le plus de lunes connues ?', ['Jupiter', 'Uranus', 'Saturne', 'Neptune'], 2, 'Saturne, avec 274 lunes connues en 2025.'],
      ['Combien de temps met la lumière du Soleil pour nous atteindre ?', ['8 secondes', '8 minutes', '8 heures', '8 jours'], 1, 'Environ 8 minutes et 20 secondes.'],
      ['Sur quelle planète le jour est-il plus long que l’année ?', ['Mars', 'Vénus', 'Neptune', 'Mercure'], 1, 'Vénus : 243 jours pour tourner sur elle-même, 225 pour faire le tour du Soleil.'],
      ['Qu’est-ce qui forme les anneaux de Saturne ?', ['Du gaz', 'De la glace et des roches', 'Du sable', 'De la lumière'], 1, 'Des milliards de morceaux de glace d’eau, de la poussière au bloc de plusieurs mètres.'],
      ['Où se trouve la ceinture principale d’astéroïdes ?', ['Entre la Terre et Mars', 'Entre Mars et Jupiter', 'Après Neptune', 'Autour du Soleil, avant Mercure'], 1, 'Entre Mars et Jupiter. Au-delà de Neptune, c’est la ceinture de Kuiper.'],
      ['Quelle est la plus grande lune du système solaire ?', ['La Lune', 'Titan', 'Ganymède', 'Europe'], 2, 'Ganymède, lune de Jupiter, plus grande que la planète Mercure.']
    ],
    'Étoiles': [
      ['Une étoile bleue est…', ['plus froide qu’une rouge', 'plus chaude qu’une rouge', 'en train de mourir', 'très proche'], 1, 'Bleu = très chaud (plus de 20 000 °C), rouge = plus froid (moins de 3 500 °C).'],
      ['Quelle est l’étoile la plus brillante du ciel nocturne ?', ['L’étoile Polaire', 'Sirius', 'Véga', 'Bételgeuse'], 1, 'Sirius, magnitude −1,46, à 8,6 années-lumière. La Polaire n’est que la 48e environ.'],
      ['Que deviendra le Soleil à la fin de sa vie ?', ['Un trou noir', 'Une supernova', 'Une naine blanche', 'Une étoile à neutrons'], 2, 'Il n’est pas assez massif pour exploser : il deviendra une géante rouge puis une naine blanche, dans environ 5 milliards d’années.'],
      ['Quelle est l’étoile la plus proche du Soleil ?', ['Sirius', 'Proxima du Centaure', 'Véga', 'Alpha du Centaure A'], 1, 'Proxima du Centaure, une naine rouge à 4,24 années-lumière.'],
      ['Une année-lumière est…', ['une durée', 'une distance', 'une vitesse', 'une luminosité'], 1, 'C’est la distance parcourue par la lumière en un an : environ 9 461 milliards de km.'],
      ['Combien pèserait une cuillère à café d’étoile à neutrons ?', ['1 kg', '1 tonne', '1 million de tonnes', 'Environ un milliard de tonnes'], 3, 'De l’ordre d’un milliard de tonnes : la matière y est comprimée comme dans un noyau d’atome.'],
      ['D’où vient le fer de notre sang ?', ['Du noyau terrestre', 'D’étoiles mortes', 'Du Soleil actuel', 'Des comètes'], 1, 'Il a été fabriqué dans des étoiles massives et des supernovas, avant la naissance du Soleil.'],
      ['Pourquoi les étoiles scintillent-elles ?', ['Elles clignotent vraiment', 'À cause de l’atmosphère', 'Elles tournent', 'À cause de la Lune'], 1, 'Les turbulences de l’air dévient leur lumière. Dans l’espace, elles ne scintillent pas.']
    ],
    'Galaxies et cosmos': [
      ['Quel âge a l’univers ?', ['4,6 milliards d’années', '13,8 milliards d’années', '100 milliards d’années', 'Il a toujours existé'], 1, '13,8 milliards d’années. 4,6 milliards, c’est l’âge du Soleil.'],
      ['Quelle part de l’univers est faite de matière ordinaire ?', ['Environ 5 %', 'Environ 30 %', 'Environ 68 %', '100 %'], 0, 'Environ 5 %. Le reste : 27 % de matière noire et 68 % d’énergie noire.'],
      ['À quelle distance se trouve la galaxie d’Andromède ?', ['2 500 années-lumière', '250 000 années-lumière', '2,5 millions d’années-lumière', '2,5 milliards d’années-lumière'], 2, '2,5 millions d’années-lumière : l’objet le plus lointain visible à l’œil nu.'],
      ['Qui a proposé le premier l’expansion de l’univers ?', ['Einstein', 'Georges Lemaître', 'Galilée', 'Newton'], 1, 'Le Belge Georges Lemaître, en 1927, deux ans avant les observations de Hubble.'],
      ['Combien de temps met le Soleil pour faire le tour de la Voie lactée ?', ['1 an', '230 000 ans', '230 millions d’années', '13 milliards d’années'], 2, 'Environ 230 millions d’années : une « année galactique ».'],
      ['Qu’est-ce que le fond diffus cosmologique ?', ['La lumière des étoiles mortes', 'La plus vieille lumière de l’univers', 'Un nuage de poussière', 'Le bruit des trous noirs'], 1, 'La lumière émise 380 000 ans après le Big Bang, aujourd’hui à 2,7 K.'],
      ['Qu’y a-t-il au centre de la Voie lactée ?', ['Le Soleil', 'Un trou noir supermassif', 'Rien', 'Une étoile géante'], 1, 'Sagittarius A*, un trou noir de 4 millions de masses solaires.'],
      ['Le Big Bang était…', ['une explosion dans l’espace', 'la dilatation de l’espace lui-même', 'l’explosion d’une étoile', 'une collision de galaxies'], 1, 'Ce n’est pas une explosion dans un espace vide : c’est l’espace qui s’étire partout.']
    ],
    'Observer le ciel': [
      ['Comment trouver l’étoile Polaire ?', ['Avec la Grande Ourse', 'Avec Orion', 'C’est la plus brillante', 'Avec la Lune'], 0, 'Prolonge cinq fois l’écart entre les deux étoiles du bord de la « casserole ».'],
      ['Combien de temps faut-il pour que les yeux s’adaptent au noir ?', ['10 secondes', '1 minute', 'Environ 20 minutes', '2 heures'], 2, 'Environ 20 à 30 minutes. Une lumière blanche ruine cette adaptation ; utilise une lumière rouge.'],
      ['Quel est le meilleur moment pour observer les cratères de la Lune ?', ['La pleine Lune', 'Le premier quartier', 'La nouvelle Lune', 'En plein jour'], 1, 'Au quartier, les ombres le long du terminateur font ressortir le relief.'],
      ['Quand voir les Perséides ?', ['Mi-janvier', 'Mi-avril', 'Mi-août', 'Mi-décembre'], 2, 'Autour du 12 août. En décembre ce sont les Géminides, encore plus riches.'],
      ['Pour un télescope, quelle caractéristique compte le plus ?', ['Le grossissement', 'Le diamètre', 'La couleur', 'Le poids'], 1, 'Le diamètre (l’ouverture) : il détermine la quantité de lumière captée et la finesse des détails.'],
      ['Quelle « étoile » brillante ne scintille presque pas ?', ['Une planète', 'Une naine rouge', 'Une étoile filante', 'Un satellite géostationnaire'], 0, 'Les planètes sont de petits disques, moins sensibles aux turbulences.'],
      ['Combien d’étoiles voit-on à l’œil nu sous un ciel parfaitement noir ?', ['Une centaine', 'Environ 3 000', 'Un million', 'Des milliards'], 1, 'Environ 3 000 à la fois (6 000 sur toute la sphère céleste).'],
      ['Combien de constellations officielles compte le ciel ?', ['12', '48', '88', '110'], 2, '88 constellations, fixées par l’Union astronomique internationale en 1922.']
    ],
    'Exploration': [
      ['Qui a été le premier humain dans l’espace ?', ['Neil Armstrong', 'Youri Gagarine', 'Buzz Aldrin', 'John Glenn'], 1, 'Youri Gagarine, le 12 avril 1961.'],
      ['En quelle année l’humain a-t-il marché sur la Lune pour la première fois ?', ['1957', '1961', '1969', '1975'], 2, 'Le 21 juillet 1969 (heure de Paris), avec Apollo 11.'],
      ['Combien de personnes ont marché sur la Lune ?', ['2', '6', '12', '24'], 2, 'Douze astronautes, de 1969 à 1972.'],
      ['Quel est l’objet humain le plus lointain ?', ['Hubble', 'Voyager 1', 'New Horizons', 'L’ISS'], 1, 'Voyager 1, lancée en 1977, à environ un jour-lumière fin 2026.'],
      ['À quelle vitesse tourne la Station spatiale internationale ?', ['2 800 km/h', '28 000 km/h', '280 000 km/h', 'Elle est immobile'], 1, 'Environ 28 000 km/h : un tour de Terre en 92 minutes.'],
      ['Où se trouve le télescope James Webb ?', ['En orbite basse', 'Sur la Lune', 'À 1,5 million de km de la Terre', 'Au Chili'], 2, 'Au point de Lagrange L2, à 1,5 million de km, à l’opposé du Soleil.'],
      ['Quelle sonde a survolé Pluton en 2015 ?', ['Voyager 2', 'Cassini', 'New Horizons', 'Juno'], 2, 'New Horizons, le 14 juillet 2015.'],
      ['Comment s’appelle le rover de la NASA qui explore Mars depuis 2021 ?', ['Curiosity', 'Perseverance', 'Spirit', 'Sojourner'], 1, 'Perseverance, accompagné jusqu’en 2024 de l’hélicoptère Ingenuity.']
    ]
  };

  // Le saviez-vous ?
  const faits = [
    'Il y a plus d’étoiles dans l’univers observable que de grains de sable sur toutes les plages de la Terre.',
    'Sur Vénus, le Soleil se lève à l’ouest et se couche à l’est.',
    'Une journée sur Mercure (du lever au lever du Soleil) dure 176 jours terrestres.',
    'La Lune s’éloigne de la Terre de 3,8 cm par an, à peu près la vitesse de pousse de tes ongles.',
    'Saturne est moins dense que l’eau.',
    'Les empreintes des astronautes d’Apollo resteront sur la Lune des millions d’années : il n’y a pas de vent pour les effacer.',
    'Une cuillère à café d’étoile à neutrons pèse environ un milliard de tonnes.',
    'Le Soleil représente 99,86 % de la masse du système solaire.',
    'Tu vois Andromède telle qu’elle était il y a 2,5 millions d’années.',
    'Dans l’espace, il n’y a pas de son : pas d’air pour le transporter.',
    'L’ISS fait environ 16 fois le tour de la Terre par jour : les astronautes voient 16 levers de Soleil.',
    'Les astronautes grandissent de quelques centimètres en apesanteur : leur colonne vertébrale se détend.',
    'La Grande Tache rouge de Jupiter pourrait contenir la Terre.',
    'Olympus Mons, sur Mars, est presque trois fois plus haut que l’Everest.',
    'Les étoiles que tu vois à l’œil nu sont presque toutes à moins de quelques milliers d’années-lumière.',
    'Il fait plus froid sur Uranus (−224 °C) que sur Neptune, pourtant plus loin du Soleil.',
    'La lumière de la Lune met 1,3 seconde pour nous parvenir.',
    'Le fer de ton sang et le calcium de tes os ont été fabriqués dans des étoiles.',
    'Sur Titan, il pleut du méthane liquide.',
    'L’étoile Polaire ne sera plus la polaire dans quelques milliers d’années : vers l’an 14 000, ce sera Véga.',
    'Le jour s’allonge d’environ 1,7 milliseconde par siècle, freiné par les marées.',
    'Il y a probablement plus de planètes que d’étoiles dans la Voie lactée.',
    'Si le Soleil était une orange à Paris, l’étoile la plus proche serait une cerise à Moscou.',
    'Le télescope James Webb est si sensible qu’il pourrait détecter la chaleur d’un bourdon à la distance de la Lune.',
    'Les éclipses totales de Soleil n’existent que parce que le Soleil est 400 fois plus grand que la Lune et 400 fois plus loin.',
    'En 1054, une supernova a été visible en plein jour pendant 23 jours. Son reste est la nébuleuse du Crabe.',
    'Le premier animal à faire le tour de la Terre en orbite était une chienne, Laïka, en 1957.',
    'Voyager 1 envoie ses données avec un émetteur d’environ 22 watts, moins qu’une ampoule de frigo.',
    'Le ciel est bleu parce que l’atmosphère diffuse davantage la lumière bleue ; sur Mars, les couchers de Soleil sont bleus.',
    'Dans environ 4 milliards d’années, Andromède et la Voie lactée pourraient fusionner en une seule galaxie elliptique.'
  ];

  // Défis d'observation (cochés et sauvegardés localement)
  const defis = [
    { id: 'polaire', niveau: 'Débutant', titre: 'Trouver l’étoile Polaire', quand: 'Toute l’année', texte: 'Repère la Grande Ourse et prolonge le bord de la casserole. Vérifie avec une boussole : tu as trouvé le nord !', ciel: 'Polaris' },
    { id: 'lune-cratere', niveau: 'Débutant', titre: 'Les cratères au terminateur', quand: 'Autour du premier quartier', texte: 'Aux jumelles, suis la ligne entre le jour et la nuit sur la Lune : les cratères y sont en relief.', ciel: 'Lune' },
    { id: 'iss', niveau: 'Débutant', titre: 'Voir passer la Station spatiale', quand: 'Après le coucher du Soleil', texte: 'Un point très brillant, régulier, qui traverse le ciel en 3 à 6 minutes sans clignoter. Les horaires de passage sont publiés par la NASA (« Spot the Station »).' },
    { id: 'pleiades', niveau: 'Débutant', titre: 'Compter les Pléiades', quand: 'D’octobre à mars', texte: 'Combien d’étoiles vois-tu à l’œil nu dans ce petit amas ? 6 c’est bien, 9 c’est une vue d’aigle. Puis regarde aux jumelles : des dizaines !', ciel: 'Pleiades' },
    { id: 'triangle', niveau: 'Débutant', titre: 'Le Triangle d’été', quand: 'De juin à octobre', texte: 'Relie Véga, Deneb et Altaïr : trois étoiles brillantes qui forment un grand triangle au-dessus de ta tête.', ciel: 'Vega' },
    { id: 'mizar', niveau: 'Débutant', titre: 'Le test de vue des Romains', quand: 'Toute l’année', texte: 'Au milieu du manche de la Grande Ourse, Mizar a une petite voisine, Alcor. Les vois-tu séparées à l’œil nu ?', ciel: 'Mizar' },
    { id: 'jupiter-lunes', niveau: 'Intermédiaire', titre: 'Les lunes de Galilée', quand: 'Quand Jupiter est visible', texte: 'Aux jumelles bien calées, trouve 2 à 4 petits points alignés près de Jupiter : Io, Europe, Ganymède et Callisto. Reviens le lendemain : ils ont bougé !', ciel: 'Jupiter' },
    { id: 'andromede', niveau: 'Intermédiaire', titre: 'Voir une autre galaxie', quand: 'D’août à janvier, sans Lune', texte: 'Loin des villes, cherche une petite tache floue allongée près de Cassiopée et Pégase : la galaxie d’Andromède, à 2,5 millions d’années-lumière.', ciel: 'M31' },
    { id: 'orion', niveau: 'Intermédiaire', titre: 'La pouponnière d’Orion', quand: 'De novembre à mars', texte: 'Sous la ceinture d’Orion, l’épée contient une tache brumeuse : la nébuleuse M42, où naissent des étoiles. Superbe aux jumelles.', ciel: 'M42' },
    { id: 'voie-lactee', niveau: 'Intermédiaire', titre: 'Voir la Voie lactée', quand: 'De juin à septembre, sans Lune', texte: 'Dans un vrai ciel noir, la bande laiteuse traverse le ciel du Cygne au Sagittaire. Repère la grande faille sombre au milieu.' },
    { id: 'perseides', niveau: 'Intermédiaire', titre: 'Compter les étoiles filantes', quand: 'Nuit du 12 au 13 août ou du 13 au 14 décembre', texte: 'Allongé, compte pendant une heure. Plus de 30, c’est une belle nuit ; sous un ciel parfait, on peut dépasser 60.' },
    { id: 'mercure', niveau: 'Intermédiaire', titre: 'Attraper Mercure', quand: 'Aux plus grandes élongations (voir le calendrier)', texte: 'Copernic, dit-on, ne l’a jamais vue ! Cherche-la bas sur l’horizon, juste après le coucher ou avant le lever du Soleil.', ciel: 'Mercure' },
    { id: 'saturne', niveau: 'Avancé', titre: 'Les anneaux de Saturne', quand: 'Quand Saturne est visible', texte: 'Un petit télescope grossissant 40 fois ou plus suffit pour voir les anneaux. Un spectacle qu’on n’oublie jamais.', ciel: 'Saturne' },
    { id: 'albireo', niveau: 'Avancé', titre: 'Albireo, l’étoile bicolore', quand: 'De juin à novembre', texte: 'Au télescope, la tête du Cygne se dédouble en une étoile dorée et une étoile bleue. Le plus beau contraste du ciel.', ciel: 'Albireo' },
    { id: 'm13', niveau: 'Avancé', titre: 'Le grand amas d’Hercule', quand: 'De mai à septembre', texte: 'Au télescope, une boule de centaines de milliers d’étoiles vieilles de plus de 11 milliards d’années.', ciel: 'M13' },
    { id: 'photo', niveau: 'Avancé', titre: 'Photographier la Lune', quand: 'N’importe quelle soirée de Lune', texte: 'Colle ton smartphone à l’oculaire de jumelles ou d’un télescope, baisse l’exposition et déclenche. Bravo, tu fais de l’astrophotographie !' }
  ];

  // Pluies d'étoiles filantes (dates du maximum, taux horaire zénithal, comète ou astéroïde parent)
  const essaims = [
    ['Quadrantides', '3-4 janvier', 110, 'Bouvier', 'astéroïde 2003 EH1'], ['Lyrides', '22 avril', 18, 'Lyre', 'comète Thatcher'],
    ['Êta Aquarides', '5-6 mai', 50, 'Verseau', 'comète de Halley'], ['Delta Aquarides', '30 juillet', 25, 'Verseau', 'comète 96P/Machholz'],
    ['Perséides', '12-13 août', 100, 'Persée', 'comète Swift-Tuttle'], ['Draconides', '8 octobre', 10, 'Dragon', 'comète Giacobini-Zinner'],
    ['Orionides', '21 octobre', 20, 'Orion', 'comète de Halley'], ['Taurides', 'début novembre', 5, 'Taureau', 'comète Encke (beaux bolides)'],
    ['Léonides', '17 novembre', 15, 'Lion', 'comète Tempel-Tuttle'], ['Géminides', '13-14 décembre', 150, 'Gémeaux', 'astéroïde Phaéton'],
    ['Ursides', '22 décembre', 10, 'Petite Ourse', 'comète Tuttle']
  ];
  // Éclipses à venir (à confirmer sur le site de l'IMCCE pour les horaires locaux)
  const eclipses = [
    ['2027-02-20', 'Lune', 'pénombrale', 'Amériques, Europe, Afrique'], ['2027-08-02', 'Soleil', 'totale (jusqu’à 6 min 23 s)', 'sud de l’Espagne, Maroc, Algérie, Tunisie, Libye, Égypte (Louxor), Arabie ; partielle en France'],
    ['2028-01-12', 'Lune', 'partielle', 'Amériques, Europe, Afrique'], ['2028-01-26', 'Soleil', 'annulaire', 'Amérique du Sud, Portugal et Espagne au coucher du Soleil'],
    ['2028-07-06', 'Lune', 'partielle', 'Europe, Afrique, Asie, Australie'], ['2028-07-22', 'Soleil', 'totale', 'Australie (Sydney), Nouvelle-Zélande'],
    ['2028-12-31', 'Lune', 'totale', 'Europe, Afrique, Asie, Australie'], ['2029-06-26', 'Lune', 'totale (près de 1 h 40)', 'Amériques, ouest de l’Europe et de l’Afrique'],
    ['2029-12-20', 'Lune', 'totale', 'Amériques, Europe, Afrique, Asie'], ['2030-06-01', 'Soleil', 'annulaire', 'Algérie, Tunisie, Grèce, Turquie, Russie, Japon'],
    ['2030-11-25', 'Soleil', 'totale', 'Namibie, Botswana, Afrique du Sud, Australie']
  ];

  // --- Recherche dans la base (utilisée par Stella et l'encyclopédie) ---
  const MOTS_VIDES = new Set('le la les un une des de du d l et ou a au aux en dans sur pour par avec sans est sont c ce cet cette ces qui que quoi quel quelle quels quelles comment pourquoi combien quand ou je tu il elle on nous vous ils me te se mon ma mes ton ta tes son sa ses y t moi toi peux peut veux voudrais dis dit savoir connais explique parle raconte faire fait chose choses bien tres plus moins quelque est-ce ca cela the of what is are'.split(' '));
  const normaliser = s => sansAccents(s).replace(/[^a-z0-9*\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  const racine = m => m.length > 4 ? m.replace(/(es|s|x)$/, '') : m;
  const index = fiches.map(f => ({ f, mots: f.mots.map(normaliser), titre: normaliser(f.titre), texte: normaliser(f.html.replace(/<[^>]+>/g, ' ')) }));

  function rechercher(question, max = 3) {
    const q = normaliser(question);
    const mots = q.split(' ').filter(m => m.length > 1 && !MOTS_VIDES.has(m)).map(racine);
    if (!mots.length) return [];
    const res = index.map(e => {
      let score = 0;
      for (const cle of e.mots) if (q.includes(cle)) score += 6 + cle.split(' ').length * 2;
      for (const m of mots) {
        if (m.length < 3) continue;
        if (e.mots.some(c => c.split(' ').some(w => racine(w) === m))) score += 4;
        else if (e.mots.some(c => c.includes(m))) score += 2;
        if (e.titre.split(' ').some(w => racine(w) === m)) score += 3;
        const n = e.texte.split(m).length - 1; score += Math.min(3, n) * 0.6;
      }
      return { f: e.f, score };
    }).filter(r => r.score >= 3).sort((a, b) => b.score - a.score);
    return res.slice(0, max);
  }
  const trouverFiche = cle => { if (!cle) return null; const n = normaliser(String(cle)); return fiches.find(f => f.id === n || normaliser(f.titre).replace(/^(le|la|l) /, '') === n || f.mots.some(m => normaliser(m) === n)) || null; };
  const fiche = id => fiches.find(f => f.id === id);

  return { planetes, fiches, decouvertes, quiz, faits, defis, essaims, eclipses, rechercher, trouverFiche, fiche, normaliser };
})();
