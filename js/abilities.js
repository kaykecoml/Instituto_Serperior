export const abilitiesData = {
  overgrow: {
    name: "Overgrow",
    ptName: "Supercrescimento",
    activation: "Gatilho Constante: PV em um terço do máximo ou menos",
    effect: "Dobre o Bônus Elemental do pokémon para o Tipo Planta."
  },

  blaze: {
    name: "Blaze",
    ptName: "Chamas",
    activation: "Gatilho Constante: PV em um terço do máximo ou menos",
    effect: "Dobre o Bônus Elemental do pokémon para o Tipo Fogo."
  },

  torrent: {
    name: "Torrent",
    ptName: "Torrente",
    activation: "Gatilho Constante: PV em um terço do máximo ou menos",
    effect: "Dobre o Bônus Elemental do pokémon para o Tipo Água."
  },
  chlorophyll: {
    name: "Chlorophyll",
    ptName: "Clorofila",
    activation: "Horária",
    effect: "Desde que o Clima esteja Ensolarado, ativar Clorofila dobra o Atributo Velocidade do pokémon."
  },
  "water-absorb": {
    name: "Water Absorb",
    ptName: "Absorção de Água",
    activation: "Constante",
    effect: "Dano de Água cura este pokémon. Calcule o dano que seria sofrido como se a Defesa e a Defesa Especial do pokémon fosse zero, e cure metade do resultado do dano que seria sofrido."
  },
  "flash-fire": {
    name: "Flash Fire",
    ptName: "Absorção de Chamas",
    activation: "Constante",
    effect: "O pokémon é imune a dano de Fogo e à Congelamento. Se sofreria dano de Fogo por alguma razão, ele, em vez disso, adiciona metade de seu Bônus Elemental ao próximo Golpe de Fogo que usar."
  },
  "sap-sipper": {
    name: "Sap Sipper",
    ptName: "Absorção de Seiva",
    activation: "Constante",
    effect: "O pokémon é imune a dano de Planta. Uma vez por rodada, se sofreria dano de Planta por alguma razão, ele, em vez disso, ele eleva uma Fase de Ataque."
  },
  "volt-absorb": {
    name: "Volt Absorb",
    ptName: "Absorção de Voltagem",
    activation: "Constante",
    effect: "Dano Elétrico cura este pokémon. Calcule o dano que seria sofrido como se a Defesa e a Defesa Especial do pokémon fosse zero, e cure metade do resultado do dano que seria sofrido."
  },
  "cloud-nine": {
    name: "Cloud Nine",
    ptName: "Aclimatação",
    activation: "Horária",
    effect: "O clima se torna ameno se o pokémon com Aclimatação tiver Nível maior que o pokémon que causar a mudança climática."
  },
  adaptability: {
    name: "Adaptability",
    ptName: "Adaptabilidade",
    activation: "Constante",
    effect: "Dobre o Bônus Elemental do pokémon."
  },
  stall: {
    name: "Stall",
    ptName: "Adiamento",
    activation: "Constante",
    effect: "Este pokémon é sempre o último a agir em todas as rodadas, independente se qualquer Talento, Habilidade ou Golpe disser o contrário. A iniciativa deste pokémon só é relevante quando há mais de um pokémon com Adiamento."
  },
  aerilate: {
    name: "Aerilate",
    ptName: "Aeração",
    activation: "Constante",
    effect: "Os Golpes Normais do pokémon são agora do Tipo Voador e recebem o Bônus Elemental dobrado."
  },
  defiant: {
    name: "Defiant",
    ptName: "Agonista",
    activation: "Constante",
    effect: "Se o pokémon perder uma ou mais Fases por qualquer razão que não por seus próprios Golpes ou por suas próprias Habilidades, ele eleva duas Fases em Ataque para cada Fase que perder."
  },
  schooling: {
    name: "Schooling",
    ptName: "Agrupamento",
    activation: "Gatilho: estar em perigo",
    effect: "Ao assumir sua forma Completa, recupera todos os seus Pontos de Vida."
  },
  "long-reach": {
    name: "Long Reach",
    ptName: "Alcance Remoto",
    activation: "Constante",
    effect: "Este pokémon nunca precisa fazer contato com alvos para usar Golpes: quaisquer Golpes que antes eram Corpo a Corpo agora são À Distância de 10 metros."
  },
  receiver: {
    name: "Receiver",
    ptName: "Alquimia",
    activation: "Gatilho À Vontade: um aliado fica inconsciente",
    effect: "O pokémon pode substituir esta Habilidade pela Habilidade do aliado até o fim do encontro."
  },
  "toxic-boost": {
    name: "Toxic Boost",
    ptName: "Alucinógeno",
    activation: "Constante",
    effect: "Quando este pokémon recebe Veneno, eleve duas Fases do Ataque dele. Se ele for curado da Condição, ele perde as duas Fases do Ataque."
  },
  "wimp-out": {
    name: "Wimp Out",
    ptName: "Amarelar",
    activation: "Gatilho Constante: estar abaixo de metade dos PV máximos",
    effect: "O pokémon imediatamente começa a fugir, recebendo +20 a todos os seus Deslocamentos. Se o dono não convocar o pokémon de volta à pokébola em seu próximo turno, a Lealdade do pokémon será reduzida."
  },
  "parental-bond": {
    name: "Parental Bond",
    ptName: "Amor de Mãe",
    activation: "Gatilho À Vontade: usar um Golpe causador de dano (mas sem o Descritor Saraivada) e nenhum inimigo ter sido reduzido a zero Pontos de Vida ou menos por isso",
    effect: "O pokémon usa imediatamente o Golpe de novo contra o mesmo alvo, ou, se era uma Explosão, na mesma área. O segundo Golpe é representado pela filhota, por isso não aplica o Dano Basal, apenas o resto do dano."
  },
  analytic: {
    name: "Analytic",
    ptName: "Análise",
    activation: "Horária",
    effect: "Pelas próximas cinco rodadas, se o turno do pokémon vier imediatamente depois de um inimigo que for alvo dele, ele adiciona às rolagens de dano uma quantidade igual a seu Bônus Elemental."
  },
  "cursed-body": {
    name: "Cursed Body",
    ptName: "Anátema",
    activation: "Gatilho Horário: ser acertado por um Golpe",
    effect: "O Golpe é afetado pelos efeitos de Desabilitar automaticamente. Esta Habilidade só entra em vigor depois dos efeitos do Golpe que ativou o Gatilho, mas ela funciona mesmo que o pokémon Anátema fique inconsciente pelo Golpe sofrido."
  },
  anticipation: {
    name: "Anticipation",
    ptName: "Antecipação",
    activation: "Horária",
    effect: "Durante um encontro, você pode usar esta Habilidade em um oponente, que revelará se possui algum Golpe superefetivo contra você. Além disso, role 1d20. Se o resultado for 11 ou mais, o alvo revelará até 3 Golpes dele que são superefetivos contra você. Se o resultado for 16 ou mais, ele revelará até 5 Golpes dele que são superefetivos contra você e a Dificuldade de Acurácia destes cinco Golpes é aumentada em 1 quando são usados contra você."
  },
  "sand-tomb": {
    name: "Sand Tomb",
    ptName: "Arena de Areia",
    activation: "Diária",
    effect: "Uma grande parede de areia de 10 metros de altura cerca o encontro. O diâmetro da Arena de Areia pode ser escolhido, a um mínimo de 10 metros e um máximo de 40 metros. Deve haver solo suficiente a ser manipulado para que esta Habilidade seja usada. As paredes se unem em cima para formar o teto, de modo que é impossível deixar a área por cima. Caso destruídas, as paredes são restauradas instantaneamente. Se o pokémon ativador de Arena de Areia fica inconsciente ou é convocado de volta para a pokébola, a Arena de Areia se desmancha."
  },
  "sand-force": {
    name: "Sand Force",
    ptName: "Arenoso",
    activation: "Diária",
    effect: "Enquanto o clima for uma Tempestade de Areia, o pokémon pode ativar esta Habilidade, cujo efeito permanece até o fim do encontro. Arenoso torna o pokémon imune aos efeitos de Tempestades de Areia e o faz adicionar uma quantidade igual a seu Bônus Elemental às rolagens de dano de Golpes Metálicos, de Pedra e de Terra."
  },
  "battle-armor": {
    name: "Battle Armor",
    ptName: "Armadura",
    activation: "Constante",
    effect: "Imunidade a Críticos."
  },
  moxie: {
    name: "Moxie",
    ptName: "Arrogância",
    activation: "Gatilho Constante: este pokémon deixa outro pokémon inconsciente usando um Golpe",
    effect: "Eleve uma Fase de Ataque."
  },
  "gale-wings": {
    name: "Gale Wings",
    ptName: "Asas de Vendavais",
    activation: "Horária",
    effect: "O pokémon pode usar um Golpe Voador como uma Ação de Interrupção."
  },
  "rough-skin": {
    name: "Rough Skin",
    ptName: "Aspereza",
    activation: "Gatilho Constante: ser acertado por um Golpe Corpo a Corpo",
    effect: "O atacante perde um oitavo de seus PV máximos. Não aplique vulnerabilidades ou resistências nem Atributos a este dano."
  },
  "dark-aura": {
    name: "Dark Aura",
    ptName: "Aura de Trevas",
    activation: "Horária",
    effect: "Pelo resto do encontro, Golpes de Trevas adicionam às rolagens de dano uma quantidade igual ao dobro do Bônus Elemental do usuário do Golpe. Isso ocorre de maneira independente do Bônus Elemental do pokémon abranger ou não Golpes de Trevas e se acumula com o próprio Bônus Elemental se houver."
  },
  "fairy-aura": {
    name: "Fairy Aura",
    ptName: "Aura Feérica",
    activation: "Horária",
    effect: "Pelo resto do encontro, Golpes do Tipo Fada adicionam às rolagens de dano uma quantidade igual ao dobro do Bônus Elemental do usuário do Golpe. Isso ocorre de maneira independente do Bônus Elemental do pokémon abranger ou não Golpes do Tipo Fada e se acumula com o próprio Bônus Elemental se houver."
  },
  berserk: {
    name: "Berserk",
    ptName: "Barbárie",
    activation: "Gatilho Constante: os Pontos de Vida do pokémon são reduzidos abaixo da metade de seus PV máximos",
    effect: "Eleve duas Fases de Ataque Especial dele."
  },
  battery: {
    name: "Battery",
    ptName: "Bateria",
    activation: "Horária",
    effect: "Eleve uma Fase de Ataque Especial de todos os aliados adjacentes."
  },
 "mega-launcher": {
    name: "Mega Launcher",
    ptName: "Bazuca",
    activation: "Constante",
    effect: "Este pokémon adiciona uma quantidade igual ao dobro do Bônus Elemental dele às rolagens de dano dos seguintes Golpes: Aura Sphere, Water Pulse, Heal Pulse, Dragon Pulse, Origin Pulse, Dark Pulse. Isso ocorre de maneira independente do Bônus Elemental do pokémon abranger ou não aqueles Golpes."
  },

  "big-pecks": {
    name: "Big Pecks",
    ptName: "Bicudo",
    activation: "Constante",
    effect: "Imunidade a perda de Fases de Defesa."
  },

  frisk: {
    name: "Frisk",
    ptName: "Bisbilhoteiro",
    activation: "Horária",
    effect: "O alvo adjacente revela seu Item Mantido."
  },

  bulletproof: {
    name: "Bulletproof",
    ptName: "Blindagem",
    activation: "Constante",
    effect: "Imunidade aos seguintes Golpes: Barrage, Acid Spray, Beak Blast, Mud Bomb, Sludge Bomb, Seed Bomb, Magnet Bomb, Zap Cannon, Rock Blast, Weather Ball, Aura Sphere, Energy Ball, Ice Ball, Mist Ball, Shadow Ball, Electro Ball, Aura Sphere, Gyro Ball, Egg Bomb, Pollen Puff, Octazooka, Bullet Seed, Searing Shot."
  },

  "delta-stream": {
    name: "Delta Stream",
    ptName: "Bloqueio Celeste",
    activation: "Horária",
    effect: "O clima se torna ameno. Isso é sustentado indefinidamente enquanto for a vontade do pokémon."
  },

  "cheek-pouch": {
    name: "Cheek Pouch",
    ptName: "Bochechudo",
    activation: "Gatilho Horário: o pokémon come uma fruta",
    effect: "Além dos efeitos normais da fruta, o pokémon recupera 15 Pontos de Vida."
  },

  "water-bubble": {
    name: "Water Bubble",
    ptName: "Bolha d’Água",
    activation: "Gatilho Constante: sofrer dano de Fogo",
    effect: "Independente de vulnerabilidades e resistências, o pokémon é tratado como se possuísse uma resistência a dano de Fogo. Além disso, como um benefício Constante, o pokémon é imune a Queimaduras."
  },

  "rock-head": {
    name: "Rock Head",
    ptName: "Cabeça Dura",
    activation: "Constante",
    effect: "Este pokémon não perde nenhum Ponto de Vida por usar qualquer um dos seguintes Golpes: Head Charge, Wild Charge, Take Down, Double-Edge, Brave Bird, Head Smash, Volt Tackle, Wood Hammer, Submission."
  },

  soundproof: {
    name: "Soundproof",
    ptName: "Cacofonia",
    activation: "Constante",
    effect: "Imunidade a Golpes com o Descritor Som."
  },

  overcoat: {
    name: "Overcoat",
    ptName: "Carapaça",
    activation: "Constante",
    effect: "Imunidade a dano por efeitos climáticos e também aos seguintes Golpes: Spore, Cotton Spore, Stun Spore, Powder, Rage Powder, Sleep Powder, Poison Powder."
  },

  schooling: {
    name: "Schooling",
    ptName: "Cardume",
    activation: "Constante",
    effect: "Desde que o pokémon possua pelo menos Nível 20, esteja próximo a um grande corpo de água e possua pelo menos metade de seus Pontos de Vida máximo, ele assume sua forma para a forma de Cardume."
  },

  pickup: {
    name: "Pickup",
    ptName: "Catagem",
    activation: "Gatilho Horário: um encontro acaba",
    effect: "Role 1d20 e consulte a tabela: 01-05: Nenhum; 06-08: Item aleatório (X-items, Dire Hit, Guard Spec); 09-10: Berry; 11-12: Poké Bola; 13-16: Cura PV/Condição; 17: Pedra Evolução; 18: Vitamina; 19: Held Item; 20: TM."
  },

  forecast: {
    name: "Forecast",
    ptName: "Climatologia",
    activation: "Gatilho Constante: o clima mudar",
    effect: "O Tipo e a aparência do pokémon mudam de acordo com o Clima: Ameno (Normal), Chuvoso (Água), Ensolarado (Fogo), Granizo (Gelo)."
  },

  harvest: {
    name: "Harvest",
    ptName: "Colheita",
    activation: "Gatilho Constante: ao se alimentar de uma fruta",
    effect: "Jogue um dado. Se o resultado for par, o pokémon produz outra fruta exatamente da mesma variedade do item Mantido. Se for ímpar nada acontece. Em clima Ensolarado, o sucesso é automático."
  },

  "color-change": {
    name: "Color Change",
    ptName: "Coloração",
    activation: "Gatilho Constante: sofrer dano",
    effect: "O Tipo do pokémon muda para o Tipo do dano sofrido."
  },
comatose: {
    name: "Comatose",
    ptName: "Coma",
    activation: "Constante",
    effect: "O pokémon está sempre na Condição Sono, e pode agir como se não estivesse com esta Condição."
  },

  "friend-guard": {
    name: "Friend Guard",
    ptName: "Companheirismo",
    activation: "Diária",
    effect: "Pelo resto do encontro, quando um aliado adjacente ao pokémon sofreria dano por Golpes, o inimigo não adiciona nenhum Bônus Elemental à rolagem de dano."
  },

  competitive: {
    name: "Competitive",
    ptName: "Competição",
    activation: "Constante",
    effect: "Se o pokémon perder uma ou mais Fases por qualquer razão que não por seus próprios Golpes ou por suas próprias Habilidades, ele eleva duas Fases em Ataque Especial para cada Fase que perder."
  },

  "shell-armor": {
    name: "Shell Armor",
    ptName: "Concha",
    activation: "Constante",
    effect: "Imunidade a Críticos."
  },

  contrary: {
    name: "Contrary",
    ptName: "Contrário",
    activation: "Constante",
    effect: "O pokémon inverte elevações de Fases e perdas de Fases, de modo que todas as vezes que fosse perder uma Fase, ele eleva aquela Fase e todas as vezes que fosse elevar uma Fase ele a perde."
  },

  "sand-stream": {
    name: "Sand Stream",
    ptName: "Convocar Areia",
    activation: "Diária",
    effect: "Como uma Ação Livre, o pokémon usa o Golpe Sandstorm."
  },

  "snow-warning": {
    name: "Snow Warning",
    ptName: "Convocar Neve",
    activation: "Horária",
    effect: "Como uma Ação Livre, o pokémon usa o Golpe Hail."
  },

  "soul-heart": {
    name: "Soul-Heart",
    ptName: "Cor da Alma",
    activation: "Gatilho Constante",
    effect: "Quando alguém fica inconsciente a até 50 metros, o pokémon eleva uma Fase de Ataque Especial."
  },

  "delta-stream": {
    name: "Delta Stream",
    ptName: "Corrente Aérea",
    activation: "Ativação À Vontade",
    effect: "Como uma Ação Livre, o clima é automaticamente convertido a ameno. Enquanto o pokémon com Corrente Aérea estiver presente, qualquer tentativa de alterar o Clima automaticamente falha. Durante este mesmo tempo, qualquer rolagem de dano que seria superefetiva contra pokémons Voadores causará dano neutro."
  },

  corrosion: {
    name: "Corrosion",
    ptName: "Corrosão",
    activation: "Constante",
    effect: "Pokémons com Corrosão podem causar a Condição Veneno em pokémons Metálicos e Venenosos, que normalmente são imunes a serem envenenados."
  },

  rattled: {
    name: "Rattled",
    ptName: "Covardia",
    activation: "Gatilho Constante: sofrer dano de um dos seguintes Tipos: Fantasma, Inseto ou Noturno",
    effect: "Eleva uma Fase de Velocidade."
  },

  healer: {
    name: "Healer",
    ptName: "Cura",
    activation: "Horária",
    effect: "Restaura um alvo adjacente de todas as Condições que o afligirem."
  },

  dancer: {
    name: "Dancer",
    ptName: "Dança",
    activation: "Gatilho Horário: o pokémon está a até 10 metros de um pokémon que usa um Golpe com o Descritor Dança",
    effect: "O pokémon com Dança pode usar imediatamente o mesmo Golpe, escolhendo um novo alvo se for necessário escolher alvos para aquele Golpe."
  },

  defeatist: {
    name: "Defeatist",
    ptName: "Derrotável",
    activation: "Gatilho Constante: estar abaixo da metade dos PV máximos",
    effect: "Este pokémon tem suas Fases de Ataque e de Ataque Especial diretamente reduzidas a três Fases negativas. As Fases não podem ser elevadas acima disso a menos que ele recupere seus Pontos de Vida acima da metade dos PV máximos."
  },

  klutz: {
    name: "Klutz",
    ptName: "Desastrado",
    activation: "Constante",
    effect: "O pokémon Desastrado pode soltar itens Mantidos À Vontade como uma Ação Livre, mesmo que sob efeito de Condições, incluindo Sono. Ele pode também carregar um item Mantido ignorando os efeitos do item."
  },

  unaware: {
    name: "Unaware",
    ptName: "Desatenção",
    activation: "Constante",
    effect: "Quando este pokémon ataca ou é atacado, ignore todas as Fases positivas e negativas em vigor sobre todos os pokémons envolvidos, incluindo as próprias Fases do próprio pokémon Desatento."
  },

  scrappy: {
    name: "Scrappy",
    ptName: "Desgrenhado",
    activation: "Constante",
    effect: "Golpes que o pokémon use contra criaturas do Tipo Fantasma acertam automaticamente e ignoram resistências, imunidades e vulnerabilidades."
  },

  dazzling: {
    name: "Dazzling",
    ptName: "Deslumbrante",
    activation: "Constante",
    effect: "Impede o oponente de usar golpes com prioridade (Interrupção)."
  },
 "steam-engine": {
    name: "Steam Engine",
    ptName: "Desmanchar",
    activation: "Gatilho Horário: ser acertado por um Golpe de Água",
    effect: "Eleve três Fases de Velocidade."
  },

  "desolate-land": {
    name: "Desolate Land",
    ptName: "Desolação",
    activation: "Ativação À Vontade",
    effect: "Como uma Ação Livre, o pokémon usa o Golpe Sunny Day."
  },

  "berserk-gene": {
    name: "Berserk Gene",
    ptName: "Desprotegido",
    activation: "Gatilho Constante: ser reduzido à metade dos PV ou a menos que isso",
    effect: "Assume a forma Nuclear."
  },

  disguise: {
    name: "Disguise",
    ptName: "Disfarce",
    activation: "Gatilho Constante: o pokémon sofre dano por um Golpe pela primeira vez em um encontro",
    effect: "O pokémon não sofre o dano e nenhum outro efeito associado ao Golpe."
  },

  download: {
    name: "Download",
    ptName: "Download",
    activation: "Constante",
    effect: "Quando o pokémon com Download é alvo de um Golpe causador de dano, o atacante deve revelar qual Atributo é o menor Atributo dele entre a Defesa e a Defesa Especial. Quando o pokémon com Download ataca um inimigo, ele é considerado com uma Fase a mais em Ataque se a Defesa do alvo é menor que a Defesa Especial dele. Quando o pokémon com Download ataca um inimigo, ele é considerado com uma Fase a mais em Ataque Especial se a Defesa Especial do alvo é menor que a Defesa dele."
  },

  "storm-drain": {
    name: "Storm Drain",
    ptName: "Drenagem",
    activation: "Constante",
    effect: "O pokémon é imune a dano de Água. Se sofreria dano de Água por alguma razão, ele, em vez disso, eleva uma Fase de Ataque Especial. Além disso, se qualquer criatura a até 25 metros usar um Golpe À Distância de Água, este Golpe é redirecionado ao pokémon com Drenagem e o acertará automaticamente, ignorando os efeitos dos Golpes Mind Reader e Lock-On."
  },

  limber: {
    name: "Limber",
    ptName: "Elasticidade",
    activation: "Constante",
    effect: "Imunidade a Paralisia."
  },

  static: {
    name: "Static",
    ptName: "Eletricidade Estática",
    activation: "Gatilho Diário: ser acertado por um Golpe Corpo a Corpo",
    effect: "O atacante está Paralisado."
  },

  "electric-surge": {
    name: "Electric Surge",
    ptName: "Eletrogênese",
    activation: "Horária",
    effect: "Como uma Ação Livre, o pokémon usa o Golpe Electric Terrain."
  },

  pixilate: {
    name: "Pixilate",
    ptName: "Encantação",
    activation: "Constante",
    effect: "Os Golpes Normais do pokémon são agora do Tipo Fada e recebem o Bônus Elemental dobrado."
  },

  hustle: {
    name: "Hustle",
    ptName: "Conquista",
    activation: "Constante",
    effect: "O pokémon vive com uma Fase elevada de Ataque o tempo todo, contudo todos os Golpes Físicos dele têm suas Dificuldades de Acurácia aumentadas em 2."
  },

  "marvel-scale": {
    name: "Marvel Scale",
    ptName: "Escama Maravilhosa",
    activation: "Constante",
    effect: "Quando este pokémon recebe Congelamento, Paralisia, Queimadura, Sono ou Veneno, eleve duas Fases da Defesa Especial dele. Se ele for curado da Condição, ele perde as duas Fases da Defesa Especial."
  },

  "unown-scribe": {
    name: "Unown Scribe",
    ptName: "Escrita",
    activation: "Semanal",
    effect: "1d2 Unown aparecem. Eles não são hostis."
  },

  "shadow-shield": {
    name: "Shadow Shield",
    ptName: "Escudo Espectral",
    activation: "Gatilho Constante: sofrer dano quando antes estava com seus Pontos de Vida completos",
    effect: "Reduza o dano à metade depois da aplicação de vulnerabilidades e resistências e da aplicação de Defesa ou Defesa Especial."
  },

  "iron-barbs": {
    name: "Iron Barbs",
    ptName: "Espículas Metálicas",
    activation: "Gatilho Constante: ser acertado por um Golpe Corpo a Corpo",
    effect: "O atacante perde um oitavo de seus PV máximos. Não aplique vulnerabilidades ou resistências nem Atributos a este dano."
  },

  "poison-point": {
    name: "Poison Point",
    ptName: "Espículas Venenosas",
    activation: "Gatilho Diário: ser acertado por um Golpe Corpo a Corpo",
    effect: "O atacante é Envenenado."
  },

  "vital-spirit": {
    name: "Vital Spirit",
    ptName: "Espírito Vigoroso",
    activation: "Constante",
    effect: "Imunidade a Sono."
  },

  "effect-spore": {
    name: "Effect Spore",
    ptName: "Esporulação",
    activation: "Gatilho Constante: ser acertado por um Golpe Corpo a Corpo",
    effect: "Role 1d20 e aplique o resultado: 15-16 (Envenenado), 17-18 (Paralisado), 19-20 (Sono)."
  },

  "victory-star": {
    name: "Victory Star",
    ptName: "Estrela da Vitória",
    activation: "Constante",
    effect: "As Dificuldades de Acurácia de todos os aliados são reduzidas em 2."
  },
"speed-boost": {
    name: "Speed Boost",
    ptName: "Explosão de Velocidade",
    activation: "Horária",
    effect: "Até o fim do encontro, eleve uma Fase de Velocidade a cada rodada."
  },

  stench: {
    name: "Stench",
    ptName: "Fedor",
    activation: "Gatilho Constante: usar um Golpe causador de dano",
    effect: "Os alvos do Golpe ficam Atordoados se o resultado do Teste de Acurácia for 19 ou 20. Se o Golpe já possuía uma chance de Atordoar reduz o resultado mínimo necessário em 2."
  },

  steelworker: {
    name: "Steelworker",
    ptName: "Ferro Puro",
    activation: "Constante",
    effect: "Este pokémon adiciona uma quantidade igual ao dobro do Bônus Elemental dele às rolagens de dano de Golpes Metálicos. Isso ocorre de maneira independente do Bônus Elemental do pokémon abranger ou não aqueles Golpes."
  },

  filter: {
    name: "Filter",
    ptName: "Filtro",
    activation: "Gatilho Constante: ser acertado por um Golpe superefetivo",
    effect: "Reduza a quantidade de Pontos de Vida perdidos a três quartos da quantidade que seria perdida."
  },

  stamina: {
    name: "Stamina",
    ptName: "Firmeza",
    activation: "Gatilho Constante: ser acertado por um Golpe causador de dano",
    effect: "Eleve uma Fase de Defesa do pokémon após o dano ser sofrido."
  },

  "inner-focus": {
    name: "Inner Focus",
    ptName: "Foco Interior",
    activation: "Constante",
    effect: "Imunidade a Atordoamento."
  },

  "sheer-force": {
    name: "Sheer Force",
    ptName: "Força Bruta",
    activation: "Diária",
    effect: "Até o final do encontro, efeitos secundários de acurácia não se ativam. Em troca, o Golpe causa dano adicional igual ao dobro do Bônus Elemental do usuário."
  },

  neuroforce: {
    name: "Neuroforce",
    ptName: "Força Neural",
    activation: "Gatilho Constante: acertar um Golpe causador de dano superefetivo",
    effect: "+3d20 à rolagem de dano."
  },

  "flame-body": {
    name: "Flame Body",
    ptName: "Flamejante",
    activation: "Gatilho Diário: ser acertado por um Golpe Corpo a Corpo",
    effect: "O atacante está com Queimadura."
  },

  scrappy: {
    name: "Scrappy",
    ptName: "Fragmentado",
    activation: "Constante",
    effect: "Este pokémon ignora as imunidades do Tipo Fantasma contra dano Normal e Lutador."
  },

  sniper: {
    name: "Sniper",
    ptName: "Franco-Atirador",
    activation: "Gatilho Constante: causar um Crítico",
    effect: "Adicione um dado rolado de dano idêntico ao dado de dano usado para causar dano conforme descrito na rolagem do Golpe."
  },

  "weak-armor": {
    name: "Weak Armor",
    ptName: "Fraqueza",
    activation: "Gatilho À Vontade: ser acertado por um Golpe Físico",
    effect: "O pokémon pode voluntariamente perder uma Fase de Defesa para elevar uma Fase de Velocidade."
  },

  "anger-point": {
    name: "Anger Point",
    ptName: "Frenesi",
    activation: "Gatilho: quando o pokémon sofre um Crítico",
    effect: "Eleve seis Fases de Ataque."
  },

  "ice-body": {
    name: "Ice Body",
    ptName: "Friorento",
    activation: "Constante",
    effect: "Enquanto o clima estiver de Hail, este pokémon recupera 1/16 de seus PV máximos no início de cada rodada."
  },

  "grassy-guard": {
    name: "Grassy Guard",
    ptName: "Frondoso",
    activation: "Constante",
    effect: "Enquanto estiver em um terreno Gramado (Grassy Terrain), o pokémon eleva duas Fases da Defesa."
  },

  "run-away": {
    name: "Run Away",
    ptName: "Fuga",
    activation: "Constante",
    effect: "Imunidade aos efeitos de Prisões. O pokémon recebe +2 a todos os seus Deslocamentos e não pode ficar com Fase de Velocidade negativa."
  },

  "white-smoke": {
    name: "White Smoke",
    ptName: "Fumaça",
    activation: "Constante",
    effect: "As Fases deste pokémon não podem ser reduzidas."
  },
galvanize: {
    name: "Galvanize",
    ptName: "Galvanização",
    activation: "Constante",
    effect: "Os Golpes Normais do pokémon são agora do Tipo Elétrico e recebem o Bônus Elemental dobrado."
  },

  drizzle: {
    name: "Drizzle",
    ptName: "Garoa",
    activation: "Horária",
    effect: "Como uma Ação Livre, o pokémon usa o Golpe Rain Dance."
  },

  "tough-claws": {
    name: "Tough Claws",
    ptName: "Garras Duras",
    activation: "Gatilho Constante: acertar um Golpe Corpo a Corpo causador de dano",
    effect: "+15 à rolagem de dano."
  },

  pickpocket: {
    name: "Pickpocket",
    ptName: "Gatuno",
    activation: "Gatilho Diário: acertar um oponente que possui um item Mantido com um Golpe Corpo a Corpo",
    effect: "O pokémon obtém o item para si, desde que não possua nenhum item Mantido."
  },

  "thick-fat": {
    name: "Thick Fat",
    ptName: "Gordura",
    activation: "Gatilho Constante: sofrer dano de Fogo ou de Gelo",
    effect: "Independente de vulnerabilidades e resistências, o pokémon é tratado como se possuísse uma resistência a dano de Fogo e de Gelo."
  },

  "serene-grace": {
    name: "Serene Grace",
    ptName: "Graça Serena",
    activation: "Constante",
    effect: "Quando um Golpe tem algum efeito secundário de acurácia, reduza o número necessário em 3 para ter sucesso. Não afeta a margem de Crítico."
  },

  "no-guard": {
    name: "No Guard",
    ptName: "Guarda Baixa",
    activation: "Ativação À Vontade",
    effect: "Até o fim do encontro, todos os Golpes que o pokémon usar e todos os Golpe que ele receber acertarão automaticamente."
  },

  gluttony: {
    name: "Gluttony",
    ptName: "Gula",
    activation: "Constante",
    effect: "Quando o pokémon possui um item consumível como um item Mantido, ele imediatamente o come, e todos os efeitos do item são dobrados."
  },

  "grassy-surge": {
    name: "Grassy Surge",
    ptName: "Herbogênese",
    activation: "Horária",
    effect: "Como uma Ação Livre, o pokémon usa o Golpe Grassy Terrain."
  },

  hydration: {
    name: "Hydration",
    ptName: "Hidratação",
    activation: "Constante",
    effect: "Enquanto o clima estiver Chuvoso, o usuário é imune a Condições. Se o clima mudar para Chuvoso, é instantaneamente curado de Freeze, Paralysis, Burn, Sleep e Poison."
  },

  "hyper-cutter": {
    name: "Hyper Cutter",
    ptName: "Hipercorte",
    activation: "Constante",
    effect: "O pokémon não perde Fases de Ataque."
  },

  moody: {
    name: "Moody",
    ptName: "Humor Variável",
    activation: "Gatilho Constante: um encontro começa",
    effect: "Após 1d4+1 rodadas, role 1d10 para elevar 2 Fases de um Atributo aleatório e 1d10 para perder 1 Fase de um Atributo aleatório."
  },

  "illuminate-trap": {
    name: "Illuminate",
    ptName: "Identificação",
    activation: "Diária",
    effect: "O alvo adjacente está Preso. Ele ainda pode se deslocar, mas não para mais longe do que 20 metros do pokémon que usou Identificação."
  },

  illuminate: {
    name: "Illuminate",
    ptName: "Iluminação",
    activation: "Constante",
    effect: "Golpes que tenham este pokémon como alvo têm a Dificuldade de Acurácia aumentada em 2."
  },

  merciless: {
    name: "Merciless",
    ptName: "Impiedoso",
    activation: "Gatilho Constante: acertar um alvo Envenenado",
    effect: "O Golpe é um Crítico."
  },
reckless: {
    name: "Reckless",
    ptName: "Imprudência",
    activation: "Constante",
    effect: "Este pokémon adiciona uma quantidade igual ao dobro do Bônus Elemental dele às rolagens de dano dos seguintes Golpes: Head Charge, Wild Charge, Take Down, Double-Edge, Brave Bird, Head Smash, Volt Tackle, Wood Hammer, Submission, High Jump Kick, Jump Kick. Isso ocorre de maneira independente do Bônus Elemental do pokémon abranger ou não aqueles Golpes."
  },

  illusion: {
    name: "Illusion",
    ptName: "Ilusão",
    activation: "Ativação À Vontade",
    effect: "O pokémon pode desejar aparentar com qualquer coisa que ele queira: uma pedra, uma parede, uma pessoa específica ou um pokémon específico. A ilusão pode ser dissipada quando o pokémon quiser e ele pode já sair da pokébola com a Ilusão em vigor."
  },

  "magnet-pull": {
    name: "Magnet Pull",
    ptName: "Ímã",
    activation: "Horária",
    effect: "Um pokémon alvo do Tipo Metálico não poderá se deslocar para mais longe do que 20 metros do pokémon com Ímã. A critério do pokémon, ele pode impor que o pokémon Metálico alvo não possa se aproximar para mais perto do que 20 metros dele."
  },

  imposter: {
    name: "Imposter",
    ptName: "Impostor",
    activation: "Diária",
    effect: "Quando Ditto é enviado para fora da pokébola, ele pode usar Transform como uma Ação Livre, copiando Fases modificadas e uma das Habilidades do alvo aleatoriamente. Isso perdura até que o Ditto use Transform de novo."
  },

  steadfast: {
    name: "Steadfast",
    ptName: "Inabalável",
    activation: "Gatilho Constante: ser Atordoado",
    effect: "Eleva uma Fase de Velocidade."
  },

  infiltrator: {
    name: "Infiltrator",
    ptName: "Infiltração",
    activation: "Constante",
    effect: "O pokémon ignora Ameaças, Barreiras e Coberturas."
  },

  "flare-boost": {
    name: "Flare Boost",
    ptName: "Inflamável",
    activation: "Constante",
    effect: "Quando este pokémon recebe Queimadura, eleve duas Fases do Ataque Especial dele. Se ele for curado da Queimadura, ele perde as duas Fases do Ataque Especial."
  },

  insomnia: {
    name: "Insomnia",
    ptName: "Insônia",
    activation: "Constante",
    effect: "Imunidade a Sono."
  },

  intimidate: {
    name: "Intimidate",
    ptName: "Intimidar",
    activation: "Horária",
    effect: "Um alvo perde uma Fase de Ataque."
  },

  heatproof: {
    name: "Heatproof",
    ptName: "Isolamento Térmico",
    activation: "Constante",
    effect: "O pokémon sofre apenas metade do dano que sofreria por dano de Fogo."
  },

  justified: {
    name: "Justified",
    ptName: "Justiceiro",
    activation: "Gatilho Constante: sofrer dano de Trevas",
    effect: "Eleva uma Fase de Ataque."
  },

  "slow-start": {
    name: "Slow Start",
    ptName: "Lentidão",
    activation: "Gatilho Constante: um encontro começa",
    effect: "Pelas três primeiras rodadas, o Ataque e a Velocidade do pokémon são reduzidos à metade."
  },

  unburden: {
    name: "Unburden",
    ptName: "Leveza",
    activation: "Gatilho Constante: consumir um item Mantido",
    effect: "Eleve duas Fases de Velocidade."
  },

  levitate: {
    name: "Levitate",
    ptName: "Levitação",
    activation: "Constante",
    effect: "Imunidade a Golpes de Terra."
  },

  "skill-link": {
    name: "Skill Link",
    ptName: "Ligação",
    activation: "Gatilho Constante: usar um Golpe com o Descritor Saraivada",
    effect: "O Golpe pode ser usado pelo maior número de vezes possível, mesmo que haja falhas em acertar."
  },

  "quick-feet": {
    name: "Quick Feet",
    ptName: "Ligeiro",
    activation: "Constante",
    effect: "Quando este pokémon recebe Burn/Paralysis/Sleep/Poison, +2 Fases de Velocidade. Se a condição for Paralysis especificamente, ganha +4 Fases em vez de 2. Ao ser curado, perde os bônus."
  },
"liquid-ooze": {
    name: "Liquid Ooze",
    ptName: "Lodo",
    activation: "Gatilho Constante: sofrer dano por um golpe de drenagem",
    effect: "Após calcular a recuperação do atacante pelos golpes Absorb, Horn Leech, Giga Drain, Mega Drain, Leech Life, Leech Seed ou Drain Punch, ele sofre esta quantidade de dano em vez de recuperar PV."
  },

  fluffy: {
    name: "Fluffy",
    ptName: "Maciez",
    activation: "Gatilho Constante: sofrer dano Físico",
    effect: "O pokémon sofre apenas metade do dano, salvo o Tipo do dano for Fogo, caso em que o pokémon sofre o dobro do dano."
  },

  "early-bird": {
    name: "Early Bird",
    ptName: "Madrugar",
    activation: "Constante",
    effect: "Quando o pokémon faz Testes de Sono, o contador para acordar começa em 11, e não em 16. Ele é reduzido normalmente e atinge o mínimo no mesmo valor."
  },

  magician: {
    name: "Magician",
    ptName: "Mágica",
    activation: "Gatilho À Vontade: acertar um oponente que possui um item Mantido com um Golpe À Distância",
    effect: "O pokémon obtém o item para si, desde que não possua nenhum item Mantido."
  },

  plus: {
    name: "Plus",
    ptName: "Mais",
    activation: "Constante",
    effect: "Enquanto houver pelo menos um aliado com a Habilidade Minus a até 10 metros, todos os pokémons aliados com Plus e Minus até 10 metros elevam duas Fases de Ataque Especial."
  },

  "queenly-majesty": {
    name: "Queenly Majesty",
    ptName: "Majestade",
    activation: "Constante",
    effect: "Impede o oponente de usar golpes com prioridade (Interrupção)."
  },

  "strong-jaw": {
    name: "Strong Jaw",
    ptName: "Mandíbula",
    activation: "Constante",
    effect: "Este pokémon adiciona o seu Bônus Elemental às rolagens de dano dos seguintes Golpes: Hyper Fang, Crunch, Bite, Bug Bite e qualquer Golpe de Presa (Fang Moves)."
  },

  "sand-veil": {
    name: "Sand Veil",
    ptName: "Manto de Areia",
    activation: "Horária",
    effect: "Desde que o clima seja uma Sandstorm, o pokémon pode criar um bolsão de clima ameno ao seu redor. Qualquer Golpe contra um alvo dentro de um destes bolsões tem a Dificuldade de Acurácia aumentada em 2."
  },

  "snow-cloak": {
    name: "Snow Cloak",
    ptName: "Manto de Neve",
    activation: "Horária",
    effect: "Desde que o clima seja de Hail, o pokémon pode criar um bolsão de clima ameno ao seu redor. Qualquer Golpe contra um alvo dentro de um destes bolsões tem a Dificuldade de Acurácia aumentada em 2."
  },

  simple: {
    name: "Simple",
    ptName: "Mediocridade",
    activation: "Gatilho Constante: elevar uma ou mais Fases ou perder uma ou mais Fases",
    effect: "Dobre o número de Fases elevadas ou perdidas."
  },

  "honey-gather": {
    name: "Honey Gather",
    ptName: "Mel",
    activation: "Diária",
    effect: "O pokémon acha Honey se não estiver com item Mantido. Em encontros, o pokémon não errará os próximos três Golpes contra pokémons selvagens."
  },

  minus: {
    name: "Minus",
    ptName: "Menos",
    activation: "Constante",
    effect: "Enquanto houver pelo menos um aliado com a Habilidade Plus a até 10 metros, todos os pokémons aliados com Plus e Minus até 10 metros elevam duas Fases de Ataque Especial."
  },

  "immunity": {
    name: "Immunity",
    ptName: "Metabolização",
    activation: "Constante",
    effect: "Imunidade a Venenos."
  },

  "light-metal": {
    name: "Light Metal",
    ptName: "Metal Leve",
    activation: "Constante",
    effect: "Este pokémon é considerado mais leve em duas Categorias de Peso. Aumente os Deslocamentos dele em 3 e a Capacidade Salto em 1."
  },

  "heavy-metal": {
    name: "Heavy Metal",
    ptName: "Metal Pesado",
    activation: "Constante",
    effect: "Este pokémon é considerado mais pesado em duas Categorias de Peso. Ele não pode ser Empurrado."
  },

  "clear-body": {
    name: "Clear Body",
    ptName: "Metal Precioso",
    activation: "Constante",
    effect: "As Fases deste pokémon não podem ser reduzidas, salvo por Condições."
  },

  protean: {
    name: "Protean",
    ptName: "Metamorfose",
    activation: "Horária",
    effect: "Pelo resto do encontro, quando o pokémon usar um Golpe, ele imediatamente muda seu Tipo para o Tipo do Golpe usado antes de rolar o dano pelo Golpe."
  },

  "motor-drive": {
    name: "Motor Drive",
    ptName: "Motorização",
    activation: "Constante",
    effect: "O pokémon é imune a dano Elétrico. Se sofreria dano Elétrico por alguma razão, ele, em vez disso, ele eleva uma Fase de Velocidade."
  },
multiscale: {
    name: "Multiscale",
    ptName: "Múltiplas Escamas",
    activation: "Gatilho Constante: sofrer dano quando antes estava com seus Pontos de Vida completos",
    effect: "Reduza o dano à metade antes da aplicação de vulnerabilidades e resistências e antes da aplicação de Defesa ou Defesa Especial."
  },

  multitype: {
    name: "Multitype",
    ptName: "Multitipo",
    activation: "Ativação À Vontade",
    effect: "Arceus pode mudar seu Tipo a qualquer um dos Tipos elementais. Especial: A Habilidade Multitipo não pode ser copiada, trocada ou desativada de nenhuma forma."
  },

  mummy: {
    name: "Mummy",
    ptName: "Múmia",
    activation: "Gatilho Constante: ser acertado por um Golpe Corpo a Corpo",
    effect: "O atacante substitui uma das Habilidades dele por Múmia por 1d6+2 rodadas."
  },

  "misty-surge": {
    name: "Misty Surge",
    ptName: "Nebulogênese",
    activation: "Horária",
    effect: "Como uma Ação Livre, o pokémon usa o Golpe Misty Terrain."
  },

  normalize: {
    name: "Normalize",
    ptName: "Normalização",
    activation: "Ativação À Vontade",
    effect: "Até o fim do encontro, todos os Golpes do pokémon são considerados Normais."
  },

  oblivious: {
    name: "Oblivious",
    ptName: "Obtusidade",
    activation: "Constante",
    effect: "Imunidade à Paixão (Infatuation) e ao Golpe Taunt."
  },

  "primordial-sea": {
    name: "Primordial Sea",
    ptName: "Oceano Primitivo",
    activation: "Ativação À Vontade",
    effect: "Como uma Ação Livre, o pokémon usa o Golpe Rain Dance."
  },

  "tinted-lens": {
    name: "Tinted Lens",
    ptName: "Olhos Cromados",
    activation: "Gatilho Constante: este pokémon causa dano a um alvo que resiste àquele Tipo de dano",
    effect: "Dobre o dano causado."
  },

  "compound-eyes": {
    name: "Compound Eyes",
    ptName: "Olhos Compostos",
    activation: "Constante",
    effect: "O pokémon reduz todas as suas Dificuldades de Acurácia em 3."
  },

  "lightning-rod": {
    name: "Lightning Rod",
    ptName: "Pararraios",
    activation: "Constante",
    effect: "O pokémon é imune a dano Elétrico. Se sofreria dano Elétrico por alguma razão, ele, em vez disso, eleva uma Fase de Ataque Especial. Além disso, se qualquer outra criatura a até 25 metros usar um Golpe Elétrico À Distância, o Golpe é redirecionado ao pokémon com Pararraios e o acertará automaticamente, ignorando os efeitos dos Golpes Mind Reader e Lock-On."
  },

  gooey: {
    name: "Gooey",
    ptName: "Pegajoso",
    activation: "Gatilho Constante: ser acertado por um Golpe Corpo a Corpo",
    effect: "O atacante perde uma Fase de Velocidade."
  },

  "shield-dust-condition": {
    name: "Shield Dust",
    ptName: "Pele Perfeita",
    activation: "Gatilho Constante: ser acertado por um Golpe À Distância que inflige uma Condição ou algo semelhante (incluindo Disable)",
    effect: "Jogue um dado. Se o resultado for par, o pokémon ignora aquilo que seria infligido a ele."
  },

  "fur-coat": {
    name: "Fur Coat",
    ptName: "Peludo",
    activation: "Constante",
    effect: "O pokémon sofre apenas metade do dano por todos os Golpes Físicos."
  },

  "bad-dreams": {
    name: "Bad Dreams",
    ptName: "Pesadelos",
    activation: "Constante",
    effect: "Qualquer criaturas que esteja dormindo a até 30 metros do pokémon perde um oitavo de seus Pontos de Vida máximos no início de cada rodada."
  },

  "tangled-feet": {
    name: "Tangled Feet",
    ptName: "Pés Laçados",
    activation: "Gatilho Constante: ser acertado por um Golpe À Distância",
    effect: "Eleve uma Fase da Velocidade."
  },

  "huge-power": {
    name: "Huge Power",
    ptName: "Poder Gigantesco",
    activation: "Constante",
    effect: "O Atributo Basal de Ataque do pokémon é dobrado. Recalcule com Natureza e Vitaminas, mas não em outras modificações."
  },

  "pure-power": {
    name: "Pure Power",
    ptName: "Poder Puro",
    activation: "Constante",
    effect: "O Atributo Basal de Ataque do pokémon é dobrado. Recalcule com Natureza e Vitaminas, mas não em outras modificações."
  },

  "solar-power": {
    name: "Solar Power",
    ptName: "Poder Solar",
    activation: "Constante",
    effect: "Enquanto o clima estiver Ensolarado (Sunny), este pokémon recupera um oitavo de seus PV máximos no início de cada rodada e eleva duas Fases de Ataque Especial."
  },

  "shield-dust-secondary": {
    name: "Shield Dust",
    ptName: "Polvilhar",
    activation: "Gatilho Constante: ser acertado por um Golpe causador de dano",
    effect: "Este pokémon sofre apenas o dano do Golpe, sem nenhum outro efeito secundário ou associado."
  },
"stance-change": {
    name: "Stance Change",
    ptName: "Posturas",
    activation: "Constante",
    effect: "Sempre que usar um Golpe de dano, o Aegislash troca o valor de Ataque pela Defesa, e Ataque Especial pela Defesa Especial. Os valores permanecem assim até que ele use um Golpe com o Descritor Interceptação (King's Shield)."
  },

  "rain-dish": {
    name: "Rain Dish",
    ptName: "Prato de Chuva",
    activation: "Constante",
    effect: "Enquanto o clima estiver Chuvoso (Rainy), este pokémon recupera 1/16 de seus PV máximos no início de cada rodada."
  },

  triage: {
    name: "Triage",
    ptName: "Prazer",
    activation: "Constante",
    effect: "Adicione o Descritor Interrupção (Priority) a todos os Golpes conhecidos que curam Pontos de Vida ou Condições."
  },

  truant: {
    name: "Truant",
    ptName: "Preguiça",
    activation: "Gatilho Constante: tentar usar um Golpe ou tentar se deslocar",
    effect: "Role 1d20: 1-8 (O pokémon não age nesta rodada); 9-20 (O pokémon age normalmente)."
  },

  forewarn: {
    name: "Forewarn",
    ptName: "Premonição",
    activation: "Horária",
    effect: "O Golpe com maior Dano Basal do alvo é revelado (em caso de empate, todos são revelados). Golpes revelados por esta habilidade têm sua Dificuldade de Acurácia aumentada em 2 contra você."
  },

  "flower-gift": {
    name: "Flower Gift",
    ptName: "Presente das Flores",
    activation: "Horária",
    effect: "Sob clima Ensolarado (Sunny), o pokémon cria uma Explosão de 4 metros de raio. Ele e aliados na área elevam duas Fases de Defesa Especial e de Ataque."
  },

  pressure: {
    name: "Pressure",
    ptName: "Pressão",
    activation: "Diária",
    effect: "Anula efeitos que permitem usar Golpes mais frequentemente que o original. Golpes 'À Vontade' tornam-se 'Rodada Sim, Rodada Não'."
  },

  "prism-armor": {
    name: "Prism Armor",
    ptName: "Prisma",
    activation: "Gatilho Constante: ser acertado um Golpe superefetivo",
    effect: "Necrozma sofre dano neutro pelo Golpe, como se não fosse superefetivo."
  },

  "magic-guard": {
    name: "Magic Guard",
    ptName: "Proteção Mágica",
    activation: "Constante",
    effect: "Imunidade a qualquer perda de PV que não venha de rolagens de dano direto. Inclui climas, Condições, armadilhas, dano de recuo, Leech Seed, etc."
  },

  "leaf-guard": {
    name: "Leaf Guard",
    ptName: "Proteção Vegetal",
    activation: "Constante",
    effect: "Sob clima Ensolarado (Sunny), o usuário é imune a Condições. Se o clima mudar para Ensolarado, ele é curado instantaneamente de Congelamento, Paralisia, Queimadura, Sono e Veneno."
  },

  "psychic-surge": {
    name: "Psychic Surge",
    ptName: "Psicogênese",
    activation: "Horária",
    effect: "Como uma Ação Livre, o pokémon usa o Golpe Psychic Terrain."
  },

  "iron-fist": {
    name: "Iron Fist",
    ptName: "Punho de Ferro",
    activation: "Constante",
    effect: "Adiciona o dobro do Bônus Elemental às rolagens de dano de: Hammer Arm, Sky Uppercut, Mega Punch, Meteor Mash e qualquer Golpe que contenha 'Punch' (Soco) no nome."
  },

  "mold-breaker": {
    name: "Mold Breaker",
    ptName: "Quebra Moldes",
    activation: "Horária",
    effect: "As Habilidades do alvo são desativadas até o fim do encontro."
  },

  receiver: {
    name: "Receiver",
    ptName: "Receptor",
    activation: "Gatilho À Vontade: um aliado fica inconsciente",
    effect: "O pokémon pode substituir esta Habilidade pela Habilidade do aliado até o fim do encontro."
  },

  refresh: {
    name: "Refresh",
    ptName: "Recuperação",
    activation: "Horária",
    effect: "O pokémon é curado das seguintes Condições: Congelamento, Paralisia, Queimadura, Sono e Veneno."
  },

  "magic-bounce": {
    name: "Magic Bounce",
    ptName: "Reflexo Mágico",
    activation: "Gatilho Horário: ser atingido por um Golpe não causador de dano",
    effect: "O Golpe é refletido de volta ao atacante. É possível refletir a imposição de Ameaças (Hazards) que estejam sendo posicionadas a até 10 metros do pokémon."
  },

  refrigerate: {
    name: "Refrigerate",
    ptName: "Refrigeração",
    activation: "Constante",
    effect: "Os Golpes Normais do pokémon são agora do Tipo Gelo e recebem o Bônus Elemental dobrado."
  },

  regenerator: {
    name: "Regenerator",
    ptName: "Regeneração",
    activation: "Horária",
    effect: "O pokémon recupera um quarto de seus PV máximos."
  },

  aftermath: {
    name: "Aftermath",
    ptName: "Resquício",
    activation: "Gatilho Constante: quando o pokémon for reduzido a zero Pontos de Vida ou menos",
    effect: "Ocorre uma Explosão de cinco metros. Tudo dentro da área perde um quarto dos PV máximos, sem aplicar resistências, vulnerabilidades ou Atributos."
  },
 "dry-skin": {
    name: "Dry Skin",
    ptName: "Ressecado",
    activation: "Constante",
    effect: "Sol: Perde 1/8 PV. Chuva: Cura 1/8 PV. Fogo: Atacante ganha +1 Fase de Atk/Sp.Atk. Água: Imunidade e cura metade do dano que seria sofrido."
  },

  "magma-armor": {
    name: "Magma Armor",
    ptName: "Revestimento Magmático",
    activation: "Constante",
    effect: "Imunidade a Congelamento."
  },

  "own-tempo": {
    name: "Own Tempo",
    ptName: "Ritmo Próprio",
    activation: "Constante",
    effect: "Imunidade a Confusão."
  },

  rivalry: {
    name: "Rivalry",
    ptName: "Rivalidade",
    activation: "Gatilho Por Encontro: contra pokémon do mesmo sexo",
    effect: "Eleva duas Fases de Ataque."
  },

  sturdy: {
    name: "Sturdy",
    ptName: "Robustez",
    activation: "Constante",
    effect: "Imunidade aos Golpes: Horn Drill, Fissure, Guillotine, Sheer Cold. Se estiver com PV cheio e sofrer um golpe fatal, sobrevive com 1 PV."
  },

  "aura-break": {
    name: "Aura Break",
    ptName: "Rompimento de Aura",
    activation: "Constante",
    effect: "Inverte os efeitos de Dark Aura ou Fairy Aura, penalizando o dano em vez de beneficiar."
  },

  "emergency-exit": {
    name: "Emergency Exit",
    ptName: "Saída de Emergência",
    activation: "Gatilho Constante: estar abaixo de metade dos PV máximos",
    effect: "O pokémon foge imediatamente (+20 Deslocamento). Se não for recolhido no próximo turno, sua Lealdade é reduzida."
  },

  drought: {
    name: "Drought",
    ptName: "Seca",
    activation: "Horária",
    effect: "Como uma Ação Livre, o pokémon usa o Golpe Sunny Day."
  },

  "wonder-guard": {
    name: "Wonder Guard",
    ptName: "Sem Alma",
    activation: "Constante",
    effect: "Imunidade a dano não superefetivo. PV máximo é 1. Imune a aumento de Saúde. Não faz Testes de Morte. Não copia/troca (exceto Arceus)."
  },

  symbiosis: {
    name: "Symbiosis",
    ptName: "Simbiose",
    activation: "Ativação À Vontade",
    effect: "O pokémon dá seu item Mantido a um alvo adjacente, desde que este não possua um item Mantido."
  },

  synchronize: {
    name: "Synchronize",
    ptName: "Sincronizar",
    activation: "Gatilho Horário: um oponente impõe uma Condição ao pokémon",
    effect: "O oponente recebe a mesma Condição que ele causou (Freeze, Paralysis, Burn, Sleep ou Poison)."
  },

  "rks-system": {
    name: "RKS System",
    ptName: "Sistema",
    activation: "Ativação À Vontade",
    effect: "Como uma Ação Livre e desde que possua um Memory Disc como item Mantido, o pokémon pode mudar seu Tipo para o Tipo associado ao disco."
  },

  "solid-rock": {
    name: "Solid Rock",
    ptName: "Solidez",
    activation: "Constante",
    effect: "Este pokémon sofre metade do dano dos Golpes superefetivos."
  },

  "super-luck": {
    name: "Super Luck",
    ptName: "Sorte",
    activation: "Constante",
    effect: "Este pokémon reduz em dois pontos o valor mínimo necessário no Teste de Acurácia para um Crítico (Crítico em 18+)."
  },

  "surge-surfer": {
    name: "Surge Surfer",
    ptName: "Surfista",
    activation: "Diária",
    effect: "Desde que esteja em um Electric Terrain, eleve quatro Fases de Velocidade. Este aumento não aumenta a Evasão do pokémon."
  },

  technician: {
    name: "Technician",
    ptName: "Técnica",
    activation: "Gatilho À Vontade: usar Golpe com Dano Basal máximo abaixo de 30",
    effect: "+2d10 à rolagem de dano. Se o Golpe possui o Descritor Multi-Hit (Saraivada), aplique o dano extra apenas uma vez."
  },

  telepathy: {
    name: "Telepathy",
    ptName: "Telepatia",
    activation: "Gatilho À Vontade: ser alvo de um Golpe vindo de um aliado",
    effect: "O atacante avisa o pokémon telepaticamente, de modo que o pokémon telepata não sofre nenhum dos efeitos do Golpe se não quiser."
  },

  guts: {
    name: "Guts",
    ptName: "Tenacidade",
    activation: "Constante",
    effect: "Quando este pokémon recebe Freeze, Paralysis, Burn, Sleep ou Poison, eleve duas Fases do Ataque dele. Se curado, perde as Fases."
  },

  unnerve: {
    name: "Unnerve",
    ptName: "Tensão",
    activation: "Constante",
    effect: "Enquanto você tiver linha de visão a um inimigo em combate, este inimigo não poderá comer ou beber nada."
  },

  "cute-charm": {
    name: "Cute Charm",
    ptName: "Tentação",
    activation: "Gatilho Diário: um pokémon do sexo oposto ataca este pokémon",
    effect: "O atacante é afetado por Infatuation (Paixão)."
  },
teravolt: {
    name: "Teravolt",
    ptName: "Teravoltagem",
    activation: "Horária",
    effect: "As Habilidades do alvo são desativadas até o fim do encontro."
  },

  "poison-touch": {
    name: "Poison Touch",
    ptName: "Toque Tóxico",
    activation: "Constante",
    effect: "Os Golpes Físicos deste pokémon envenenam os alvos se o resultado do Teste de Acurácia for 15 ou mais. Se o golpe já envenenava com chance menor, use este valor."
  },

  "clear-body": {
    name: "Clear Body",
    ptName: "Transparência",
    activation: "Constante",
    effect: "As Fases deste pokémon não podem ser reduzidas, salvo por Condições."
  },

  prankster: {
    name: "Prankster",
    ptName: "Travessura",
    activation: "Diária",
    effect: "Pelo resto do encontro, qualquer Golpe não causador de dano que o pokémon conheça recebe o Descritor Priority (Interrupção). Não afeta golpes de nocaute direto."
  },

  "shed-skin": {
    name: "Shed Skin",
    ptName: "Troca de Pele",
    activation: "Horária",
    effect: "O pokémon se cura de Freeze, Paralysis, Burn, Sleep ou Poison."
  },

  turboblaze: {
    name: "Turboblaze",
    ptName: "Turbochama",
    activation: "Horária",
    effect: "As Habilidades do alvo são desativadas até o fim do encontro."
  },

  swarm: {
    name: "Swarm",
    ptName: "Enxame",
    activation: "Gatilho Constante: PV em um terço do máximo ou menos",
    effect: "Dobre o Bônus Elemental do pokémon para o Tipo Inseto."
  },

  "beast-boost": {
    name: "Beast Boost",
    ptName: "Ultrabesta",
    activation: "Gatilho Constante: deixar outro pokémon inconsciente",
    effect: "Eleve uma Fase do maior Atributo do pokémon (desconsiderando Saúde)."
  },

  damp: {
    name: "Damp",
    ptName: "Umidade",
    activation: "Constante",
    effect: "A Habilidade Aftermath e os Golpes Self-Destruct e Explosion não podem ser usados ou ativados a até 20 metros deste pokémon."
  },

  "poison-heal": {
    name: "Poison Heal",
    ptName: "Veneno Curador",
    activation: "Constante",
    effect: "Quando Envenenado, recupera 1/8 dos PV máximos por rodada em vez de perder PV. Não sofre redução de Fases pelos efeitos do Veneno."
  },

  "suction-cups": {
    name: "Suction Cups",
    ptName: "Ventosas",
    activation: "Constante",
    effect: "Imunidade a Empurrões e aos Golpes Gust e Roar."
  },

  trace: {
    name: "Trace",
    ptName: "Vestígio",
    activation: "Horária",
    effect: "O pokémon copia a Habilidade de um alvo a até 10 metros. Mantém a cópia até ficar inconsciente ou retornar para a pokébola."
  },

  "aromaVeil": {
    name: "Aroma Veil",
    ptName: "Véu Aromático",
    activation: "Constante",
    effect: "O pokémon e aliados adjacentes são imunes aos Golpes: Attract, Encore, Heal Block, Disable, Taunt e Torment."
  },

  "sweetVeil": {
    name: "Sweet Veil",
    ptName: "Véu Doce",
    activation: "Constante",
    effect: "O pokémon e seus aliados adjacentes são imunes a Sono (Sleep)."
  },

  "flowerVeil": {
    name: "Flower Veil",
    ptName: "Véu Florido",
    activation: "Constante",
    effect: "O pokémon e seus aliados do Tipo Planta são imunes a Confusão e Paixão (Infatuation) e não podem ter seus Atributos diminuídos."
  },

  stakeout: {
    name: "Stakeout",
    ptName: "Vigília",
    activation: "Gatilho Diário: usar um Golpe contra um alvo que acabou de sair da pokébola",
    effect: "O Golpe causa dano dobrado após vulnerabilidades e resistências."
  },

  "battle-bond": {
    name: "Battle Bond",
    ptName: "Vínculo Profundo",
    activation: "Diária",
    effect: "O pokémon pode ignorar a necessidade da Mega Stone para megaevoluir."
  },

  "keen-eye": {
    name: "Keen Eye",
    ptName: "Visão Aguçada",
    activation: "Constante",
    effect: "As Dificuldades de Acurácia deste pokémon não podem ser afetadas negativamente (a Evasão do oponente ainda se aplica)."
  },

  "innards-out": {
    name: "Innards Out",
    ptName: "Vísceras Extensíveis",
    activation: "Gatilho Constante: cair inconsciente por um Golpe Corpo a Corpo",
    effect: "Causa ao atacante dano igual aos PV que o pokémon possuía antes do golpe. Não aplica resistências ou vulnerabilidades."
  },

  "sticky-hold": {
    name: "Sticky Hold",
    ptName: "Viscosidade",
    activation: "Constante",
    effect: "Itens Mantidos não podem ser roubados, trocados, destruídos ou soltos."
  },

  "swift-swim": {
    name: "Swift Swim",
    ptName: "Velocidade na Água",
    activation: "Horária",
    effect: "Desde que o Clima esteja Chuvoso (Rain), ativar esta Habilidade eleva quatro Fases de Velocidade."
  },

  "slush-rush": {
    name: "Slush Rush",
    ptName: "Velocidade na Neve",
    activation: "Diária",
    effect: "Sob Granizo (Hail), eleve quatro Fases de Velocidade e ganhe imunidade ao dano do clima até o fim do encontro. Este aumento não afeta a Evasão."
  },

  "sand-rush": {
    name: "Sand Rush",
    ptName: "Velocidade na Terra",
    activation: "Diária",
    effect: "Desde que o Clima esteja de Sandstorm, ativar esta Habilidade eleva quatro Fases de Velocidade e torna o pokémon imune ao dano pela Tempestade de Areia."
  },
"liquid-voice": {
    name: "Liquid Voice",
    ptName: "Voz Líquida",
    activation: "Constante",
    effect: "Quando usar um Golpe com o Descritor Som (Sound-based), o Tipo do Golpe é mudado para Água."
  },

  "zenMode": {
    name: "Zen Mode",
    ptName: "Zen",
    activation: "Constante",
    effect: "Darmanitan possui dois conjuntos de Atributos Basais. Com menos de metade dos PV, pode usar uma Ação Livre para assumir a Forma Zen (Tipo Fogo/Psíquico). Alterações de Fases afetam ambas as formas."
  },

  protosynthesis: {
    name: "Protosynthesis",
    ptName: "Protossíntese",
    activation: "Gatilho Constante: Clima Ensolarado ou item Booster Energy",
    effect: "Eleva em uma Fase o Atributo mais alto do pokémon (exceto Saúde). Se o atributo mais alto for Velocidade, eleva duas Fases em vez de uma."
  },

  "quark-drive": {
    name: "Quark Drive",
    ptName: "Carga de Quarks",
    activation: "Gatilho Constante: Campo Elétrico ou item Booster Energy",
    effect: "Eleva em uma Fase o Atributo mais alto do pokémon (exceto Saúde). Se o atributo mais alto for Velocidade, eleva duas Fases em vez de uma."
  },

  "good-as-gold": {
    name: "Good as Gold",
    ptName: "Corpo de Ouro",
    activation: "Constante",
    effect: "Este pokémon é imune a todos os Golpes de Status (não causadores de dano) usados por oponentes."
  },

  electromorphosis: {
    name: "Electromorphosis",
    ptName: "Eletromorfose",
    activation: "Gatilho Constante: sofrer dano por um Golpe",
    effect: "O pokémon entra no estado 'Carregado'. O próximo Golpe Elétrico que ele usar terá seu Dano Basal dobrado."
  },

  "thermal-exchange": {
    name: "Thermal Exchange",
    ptName: "Troca Térmica",
    activation: "Constante",
    effect: "Imunidade a Queimaduras. Além disso, sempre que este pokémon for atingido por um Golpe de Fogo, eleva uma Fase de Ataque."
  },

  "purifying-salt": {
    name: "Purifying Salt",
    ptName: "Sal Purificador",
    activation: "Constante",
    effect: "O pokémon é imune a todas as Condições de Status. Além disso, ele recebe apenas metade do dano de Golpes do Tipo Fantasma."
  },

  "toxic-debris": {
    name: "Toxic Debris",
    ptName: "Detritos Tóxicos",
    activation: "Gatilho Constante: ser atingido por um Golpe Físico",
    effect: "Espalha uma camada de Toxic Spikes (Espículas Venenosas) no campo do oponente."
  },

  "minds-eye": {
    name: "Mind's Eye",
    ptName: "Olho da Mente",
    activation: "Constante",
    effect: "O pokémon pode acertar Tipos Fantasma com Golpes Normal e Lutador. Além disso, sua Acurácia não pode ser reduzida e ele ignora a Evasão do alvo."
  },

  "zero-to-hero": {
    name: "Zero to Hero",
    ptName: "Punho com Punho",
    activation: "Gatilho À Vontade: retornar para a pokébola",
    effect: "Ao ser enviado de volta para a batalha no mesmo encontro, o pokémon assume sua 'Forma Herói', alterando permanentemente seus Atributos Basais até o fim da luta."
  },

  "wind-power": {
    name: "Wind Power",
    ptName: "Energia Eólica",
    activation: "Gatilho Constante: ser atingido por um Golpe de Vento",
    effect: "O pokémon entra no estado 'Carregado'. O próximo Golpe Elétrico que ele usar terá seu Dano Basal dobrado."
  },

  commander: {
    name: "Commander",
    ptName: "Comando",
    activation: "Gatilho Constante: entrar em batalha ao lado de um Dondozo",
    effect: "O pokémon entra na boca do aliado Dondozo. Enquanto lá estiver, o Tatsugiri não pode ser alvo nem agir, mas o Dondozo eleva duas Fases em todos os Atributos (exceto Saúde)."
  },

  "guard-dog": {
    name: "Guard Dog",
    ptName: "Cão de Guarda",
    activation: "Constante",
    effect: "Imunidade à habilidade Intimidate. Se intimidado, eleva uma Fase de Ataque em vez de perder. Não pode ser forçado a sair de campo por golpes como Roar."
  },

  "sword-of-ruin": {
    name: "Sword of Ruin",
    ptName: "Espada da Ruína",
    activation: "Constante",
    effect: "Reduz em 25% a Defesa (Espada) de todos os outros pokémons em campo. O usuário é imune a esse efeito."
  },

  "beads-of-ruin": {
    name: "Beads of Ruin",
    ptName: "Contas da Ruína",
    activation: "Constante",
    effect: "Reduz em 25% a Defesa Especial de todos os outros pokémons em campo. O usuário é imune a esse efeito."
  }
};
