import { HABITATS } from "./habitats.js";
import { powerToDamage, accuracyToRPG, ppToRPG } from "./utils.js";
import { abilitiesData } from "./abilities.js";
const moveCache = new Map();
let statsChart = null;
let contestChart = null;
let damageToken = 0;
let currentPokemonData = null;
let currentMovesData = null;
const translationCache = {};

const RPG_VERSION_PRIORITY = [
  "scarlet-violet",
  "sword-shield",
  "ultra-sun-ultra-moon",
  "sun-moon",
  "omega-ruby-alpha-sapphire",
  "x-y",
  "black-2-white-2",
  "black-white",
];

const EXCLUDED_VERSION_GROUPS = ["legends-za"];

const INT_LABELS = [
  "Instintivo",
  "Consciente",
  "Racional",
  "Estrategista",
  "Gênio",
];
const STR_LABELS = [
  "Frágil",
  "Subdesenvolvida",
  "Robusta",
  "Poderosa",
  "Titânica",
];
const MOV_LABELS = ["Estático", "Lento", "Ágil", "Atlético", "Veloz"];

let moveRenderToken = 0;

function convertStat(value) {
  const base = Math.floor(value / 10);
  return value % 10 >= 9 ? base + 1 : base;
}

function half(v) {
  return Math.floor(v / 2);
}

function getInitialPokemonId() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return 1;

  const num = Number(id);
  if (isNaN(num) || num < 1) return 1;

  return num;
}

let currentId = getInitialPokemonId();

const nameInput = document.getElementById("dexSearchInput");
const dexInput = document.getElementById("dexNumberInput");
const btn = document.getElementById("dexSearchBtn");
const preview = document.getElementById("search-preview");

async function init() {
  const id = getInitialPokemonId();
  await loadPokemonById(id);
}

init();
let isLegendary = false;
let basePokemon = null;

function loadPokemon(p) {
  const statsRaw = {};
  p.stats.forEach((s) => (statsRaw[s.stat.name] = s.base_stat));

  const dex = p.id;
  basePokemon = p;
  document.getElementById("dex").textContent =
    `#${String(dex).padStart(3, "0")}`;

  document.getElementById("name").textContent =
    p.name.charAt(0).toUpperCase() + p.name.slice(1);

  document.getElementById("official-art").src =
    p.sprites.other["official-artwork"].front_default;

  document.getElementById("size").textContent =
    `${p.height / 10} m • ${p.weight / 10} kg`;

  fetch(p.species.url)
    .then((res) => res.json())
    .then((species) => {
      isLegendary = species.is_legendary;
      renderForms(species.varieties, p.name);
      renderEggGroups(species.egg_groups);

      applyPokemonData(p);
    });
}

function buildPokemonData(p, species) {
  const statsRaw = {};
  p.stats.forEach((s) => (statsRaw[s.stat.name] = s.base_stat));

  const female = species.gender_rate === -1 ? null : species.gender_rate * 12.5;

  const male = species.gender_rate === -1 ? null : 100 - female;

  const isFinalStage =
    species.evolves_from_species !== null &&
    species.evolution_chain &&
    !species.evolution_chain.url.includes("evolves_to");

  return {
    id: p.id,
    name: p.name,
    height: p.height / 10,
    weight: p.weight / 10,

    types: p.types.map((t) => t.type.name),
    eggGroups: species.egg_groups.map((g) => g.name),

    gender: {
      male,
      female,
      genderless: species.gender_rate === -1,
    },

    abilities: p.abilities.map((a) =>
      a.is_hidden ? `${a.ability.name} (Oculta)` : a.ability.name,
    ),

    habitats: HABITATS.filter((h) =>
      h.pokedex.map(Number).includes(Number(p.id)),
    ).map((h) => h.nome),

    isLegendary: species.is_legendary,

    isSingleStage: false,
    isFinalStage: false,

    stats: {
      hp: convertStat(statsRaw.hp),
      atk: convertStat(statsRaw.attack),
      def: convertStat(statsRaw.defense),
      spAtk: convertStat(statsRaw["special-attack"]),
      spDef: convertStat(statsRaw["special-defense"]),
      speed: convertStat(statsRaw.speed),
    },
  };
}

function renderGender(species) {
  const genderEl = document.getElementById("gender");

  if (species.gender_rate === -1) {
    genderEl.innerHTML = `
      <div class="gender-text">
        <span>Sem gênero</span>
      </div>
    `;
    return;
  }

  const female = species.gender_rate * 12.5;
  const male = 100 - female;

  genderEl.innerHTML = `
    <div class="gender-bar">
      <div class="male" style="width:${male}%"></div>
      <div class="female" style="width:${female}%"></div>
    </div>
    <div class="gender-text">
      <span class="male-text">${male}% ♂</span>
      <span class="female-text">${female}% ♀</span>
    </div>
  `;
}

function renderEggGroups(groups) {
  const eggEl = document.getElementById("egg-group");
  eggEl.textContent = groups.join(" | ");
}

function renderAbilities(abilitiesFromAPI) {
  const container = document.getElementById("abilitiesContainer");
  container.innerHTML = "";

  abilitiesFromAPI.forEach((a) => {
    const abilityKey = a.ability.name;
    const abilityInfo = abilitiesData[abilityKey];
    if (!abilityInfo) return;

    const div = document.createElement("div");
    div.classList.add("ability-item");

    if (a.is_hidden) {
      div.classList.add("hidden-ability");
    }

    div.innerHTML = `
      ◄ ${abilityInfo.name} = ${abilityInfo.ptName}
      ${a.is_hidden ? " (Oculta)" : ""}
      <div class="ability-details">
        『Ativação』-【${abilityInfo.activation}】<br>
        『Efeito』-【${abilityInfo.effect}】
      </div>
    `;

    div.addEventListener("click", () => {
      document.querySelectorAll(".ability-item").forEach((el) => {
        if (el !== div) el.classList.remove("active");
      });

      div.classList.toggle("active");
    });

    container.appendChild(div);
  });
}

async function renderMoves(moves) {
  let processedMoves = [];

  const token = ++moveRenderToken;

  const levelTbody = document.getElementById("level-moves");
  const otherTbody = document.getElementById("other-moves");

  levelTbody.innerHTML = "";
  otherTbody.innerHTML = "";

  const usedMoves = new Set();
  const levelMoves = [];

  const moveDataList = await Promise.all(
    moves.map((m) =>
      getMoveDetails(m.move.url).then((details) => ({
        details,
        version: getBestVersionGroup(m.version_group_details),
      })),
    ),
  );

  processedMoves = [];
  if (token !== moveRenderToken) return;

  for (const { details, version } of moveDataList) {
    if (!version) continue;
    if (usedMoves.has(details.name)) continue;
    usedMoves.add(details.name);

    const power = powerToDamage(details.power);
    const acc = accuracyToRPG(details.accuracy || 100);
    const pp = ppToRPG(details.pp || 0);

    const typeIcon = `<img src="assets/types/${details.type.name}.png">`;
    const categoryIcon = getCategoryIcon(details.damage_class.name);

    processedMoves.push({
      name: details.name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      type: details.type.name,
      power,
      accuracy: acc,
      pp,
      priority: details.priority,
      method: version.move_learn_method.name,
      level: version.level_learned_at,
    });

    if (version.move_learn_method.name === "level-up") {
      levelMoves.push({
        level: version.level_learned_at,
        details,
        typeIcon,
        categoryIcon,
        power,
        acc,
        pp,
      });
    } else {
      addRow(
        otherTbody,
        version.move_learn_method.name.toUpperCase(),
        details,
        typeIcon,
        categoryIcon,
        power,
        acc,
        pp,
      );
    }
  }

  if (token !== moveRenderToken) return;

  levelMoves
    .sort((a, b) => a.level - b.level)
    .forEach((m) =>
      addRow(
        levelTbody,
        m.level,
        m.details,
        m.typeIcon,
        m.categoryIcon,
        m.power,
        m.acc,
        m.pp,
      ),
    );
  currentMovesData = processedMoves;
}

function updateSearchPreview() {
  if (!pokemonIndex || pokemonIndex.length === 0) return;

  const query = nameInput.value.trim().toLowerCase() || dexInput.value.trim();

  preview.innerHTML = "";
  if (!query) return;

  const found = findClosestPokemon(query);
  if (!found) return;

  const card = document.createElement("div");
  card.className = "preview-card";

  const img = document.createElement("img");
  img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${found.id}.png`;

  const name = document.createElement("span");
  name.textContent =
    `#${String(found.id).padStart(3, "0")} ` +
    found.name.charAt(0).toUpperCase() +
    found.name.slice(1);

  card.appendChild(img);
  card.appendChild(name);

  card.onclick = () => {
    preview.innerHTML = "";
    nameInput.value = "";
    dexInput.value = "";

    loadPokemonById(found.id); // 🔥 AQUI é o segredo
  };

  preview.appendChild(card);
}

async function getMoveDetails(url) {
  if (moveCache.has(url)) {
    return moveCache.get(url);
  }

  const data = await fetch(url).then((r) => r.json());
  moveCache.set(url, data);
  return data;
}

const bulbapediaCache = {};
const speciesDexCache = {};

async function fetchJsonWithRetry(url, retries = 2) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

function getBulbapediaPageCandidates(pokemonName) {
  const cleanedName = pokemonName.trim().toLowerCase();
  const baseName = cleanedName.split("-")[0];

  const candidates = [cleanedName, baseName].filter(Boolean).map((name) =>
    name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("_"),
  );

  return [...new Set(candidates)];
}

async function fetchBulbapediaBiology(pokemonName) {
  if (bulbapediaCache[pokemonName]) {
    return bulbapediaCache[pokemonName];
  }

  try {
    const pageCandidates = getBulbapediaPageCandidates(pokemonName);
    let pageName = null;
    let sections = null;

    for (const candidate of pageCandidates) {
      const sectionsData = await fetchJsonWithRetry(
        `https://bulbapedia.bulbagarden.net/w/api.php?action=parse&page=${encodeURIComponent(candidate)}_(Pok%C3%A9mon)&prop=sections&format=json&origin=*`,
      );

      if (sectionsData.parse?.sections?.length) {
        pageName = `${candidate}_(Pok%C3%A9mon)`;
        sections = sectionsData.parse.sections;
        break;
      }
    }

    if (!sections || !pageName) {
      return null;
    }
    const biologySection = sections.find((s) => {
      const normalizedLine = s.line.toLowerCase();
      return (
        normalizedLine.includes("biology") || normalizedLine.includes("biologia")
      );
    });

    if (!biologySection) {
      return null;
    }

    const sectionData = await fetchJsonWithRetry(
      `https://bulbapedia.bulbagarden.net/w/api.php?action=parse&page=${encodeURIComponent(pageName)}&prop=text&section=${biologySection.index}&format=json&origin=*`,
    );

    if (!sectionData.parse?.text) {
      return null;
    }

    const html = sectionData.parse.text["*"];

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    /* REMOVE LIXO VISUAL */
    tempDiv
      .querySelectorAll("table, sup, .reference, .thumb, .gallery")
      .forEach((e) => e.remove());

    /* PEGAR TODOS OS PARÁGRAFOS REAIS */
    const paragraphs = [...tempDiv.querySelectorAll("p")]
      .map((p) => p.textContent.trim())
      .filter(
        (t) =>
          t.length > 80 && // evita lixo pequeno
          !t.toLowerCase().includes("this pokémon"), // evita frases repetitivas pequenas
      );

    if (paragraphs.length === 0) {
      return null;
    }

    let finalText = paragraphs.join("\n\n");

    finalText = await translateToPortuguese(finalText);

    bulbapediaCache[pokemonName] = finalText;

    return finalText;
  } catch (err) {
    console.error("Erro Bulbapedia:", err);
    return null;
  }
}

function normalizeDexText(text) {
  return text
    .replace(/[\n\f\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPreferredFlavorEntry(entries, language) {
  const byLanguage = entries.filter((entry) => entry.language.name === language);

  if (byLanguage.length === 0) {
    return null;
  }

  const versionOrder = [
    "scarlet",
    "violet",
    "sword",
    "shield",
    "sun",
    "moon",
    "ultra-sun",
    "ultra-moon",
  ];

  for (const version of versionOrder) {
    const match = byLanguage.find((entry) => entry.version.name === version);
    if (match) return match;
  }

  return byLanguage[byLanguage.length - 1];
}

async function getDexEntryFromSpecies(species) {
  const cacheKey = species.id || species.name;

  if (speciesDexCache[cacheKey]) {
    return speciesDexCache[cacheKey];
  }

  const ptEntry = getPreferredFlavorEntry(species.flavor_text_entries, "pt-BR");
  if (ptEntry?.flavor_text) {
    const text = normalizeDexText(ptEntry.flavor_text);
    speciesDexCache[cacheKey] = text;
    return text;
  }

  const enEntry = getPreferredFlavorEntry(species.flavor_text_entries, "en");
  if (!enEntry?.flavor_text) {
    return null;
  }

  const translated = await translateToPortuguese(normalizeDexText(enEntry.flavor_text));
  speciesDexCache[cacheKey] = translated;

  return translated;
}

async function getDexEntryText(pokemon, species) {
  const bulbapediaText = await fetchBulbapediaBiology(pokemon.name);
  if (bulbapediaText) {
    return bulbapediaText;
  }

  const speciesText = await getDexEntryFromSpecies(species);
  if (speciesText) {
    return speciesText;
  }

  return "Descrição da dex não encontrada.";
}

async function loadPokemonById(idOrName) {
  currentId = idOrName;

  const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
  const pokemon = await pokeRes.json();

  loadPokemon(pokemon);

  history.pushState(null, "", `?id=${pokemon.id}`);
}

function renderForms(varieties, baseName) {
  const container = document.getElementById("form-buttons");
  container.innerHTML = "";

  // BOTÃO BASE (apenas 1 vez)
  const baseBtn = document.createElement("button");
  baseBtn.textContent = "Base";
  baseBtn.className = "form-base-btn";
  baseBtn.onclick = () => applyPokemonData(basePokemon);
  container.appendChild(baseBtn);

  varieties.forEach((v) => {
    const name = v.pokemon.name;

    // ignora forma base
    if (name === baseName) return;

    // MEGA
    if (name.includes("mega")) {
      const img = document.createElement("img");
      img.src = "assets/mega.png";
      img.className = "form-btn";
      img.title = "Mega Evolução";
      img.onclick = () => loadForm(name);
      container.appendChild(img);
      return;
    }

    // GIGANTAMAX
    if (name.includes("gmax")) {
      const img = document.createElement("img");
      img.src = "assets/gigantamax.png";
      img.className = "form-btn";
      img.title = "Gigantamax";
      img.onclick = () => loadForm(name);
      container.appendChild(img);
      return;
    }

    // FORMAS REGIONAIS / OUTRAS
    const btn = document.createElement("button");
    btn.textContent = name.replace(baseName + "-", "");
    btn.className = "tab-btn";
    btn.onclick = () => loadForm(name);
    container.appendChild(btn);
  });
}

function loadForm(name) {
  fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
    .then((res) => res.json())
    .then((pokemon) => {
      if (!pokemon.moves || pokemon.moves.length === 0) {
        pokemon.moves = basePokemon?.moves || [];
      }
      applyPokemonData(pokemon);
    });
}

async function applyPokemonData(p) {
  const dexEntry = document.getElementById("dex-entry");

  dexEntry.textContent = "Carregando entrada da dex...";

  document.getElementById("dexContent").classList.remove("open");
  const dexToggleButton = document.getElementById("dexToggleBtn");
  dexToggleButton.classList.remove("active");
  dexToggleButton.textContent = "▸ ENTRADA DA DEX";

  const species = await fetch(p.species.url).then((res) => res.json());
  const dexText = await getDexEntryText(p, species);

  dexEntry.classList.remove("expanded");
  dexEntry.textContent = dexText;

  const pokemonData = buildPokemonData(p, species);

  const chainData = await fetch(species.evolution_chain.url).then((r) =>
    r.json(),
  );

  function findNode(name, node) {
    if (node.species.name === name) return node;

    for (const next of node.evolves_to) {
      const found = findNode(name, next);
      if (found) return found;
    }
    return null;
  }

  let node = findNode(p.name, chainData.chain);

  if (!node && p.name.includes("-")) {
    const baseName = p.name.split("-")[0];
    node = findNode(baseName, chainData.chain);
  }

  if (!node) {
    pokemonData.isFinalStage = false;
    pokemonData.isSingleStage = false;
  } else {
    pokemonData.isFinalStage = node.evolves_to.length === 0;
    pokemonData.isSingleStage =
      chainData.chain.species.name === node.species.name &&
      chainData.chain.evolves_to.length === 0;
  }

  currentPokemonData = pokemonData;

  renderEggGroups(pokemonData.eggGroups);
  renderGender(species);
  renderCapacities(pokemonData);

  document.getElementById("official-art").src =
    p.sprites.other["official-artwork"].front_default ||
    p.sprites.front_default;

  const types = p.types.map((t) => t.type.name);
  document.getElementById("types").innerHTML = types
    .map((t) => `<img src="assets/types/${t}.png">`)
    .join("");

  renderStats({
    hp: pokemonData.stats.hp,
    attack: pokemonData.stats.atk,
    defense: pokemonData.stats.def,
    spAttack: pokemonData.stats.spAtk,
    spDefense: pokemonData.stats.spDef,
    speed: pokemonData.stats.speed,
  });

  renderContest({
    hp: pokemonData.stats.hp,
    attack: pokemonData.stats.atk,
    defense: pokemonData.stats.def,
    spAttack: pokemonData.stats.spAtk,
    spDefense: pokemonData.stats.spDef,
    speed: pokemonData.stats.speed,
  });
  renderDamageRelations(types);
  renderAbilities(p.abilities);
  renderHabitats(p.id);
  renderMoves(p.moves);
  renderEvolutionChain(basePokemon.species.url);

  document.getElementById("name").textContent =
    p.name.charAt(0).toUpperCase() + p.name.slice(1);

  document.getElementById("dex").textContent =
    `#${String(p.id).padStart(3, "0")}`;

  document.getElementById("size").textContent =
    `${p.height / 10} m • ${p.weight / 10} kg`;
}

function getCategoryIcon(damageClass) {
  return `<img src="assets/icons/${damageClass}.png" class="status-icon">`;
}

function addRow(tbody, col1, move, typeIcon, categoryIcon, dmg, acc, pp) {
  const isStatus = move.damage_class.name === "status";

  // Linha principal
  const tr = document.createElement("tr");
  tr.style.cursor = "pointer";

  tr.innerHTML = `
    <td>${col1}</td>
    <td>${move.name.replace("-", " ")}</td>
    <td>${typeIcon}</td>
    <td>${categoryIcon}</td>
    <td>${isStatus ? "—" : dmg}</td>
    <td>${acc}</td>
    <td>${pp}</td>
  `;

  // Linha da descrição
  const descRow = document.createElement("tr");
  descRow.classList.add("move-description-row");

  const descCell = document.createElement("td");
  descCell.colSpan = 7; // número total de colunas da tabela
  descCell.classList.add("move-description-cell");

  // pegar descrição
  const effectEntry = move.effect_entries.find((e) => e.language.name === "en");

  let description = effectEntry
    ? effectEntry.effect.replace(/\$effect_chance/g, move.effect_chance ?? "")
    : "Sem descrição disponível.";

  let priorityText = "";

  if (move.priority && move.priority !== 0) {
    priorityText = `\n\nPrioridade: ${move.priority > 0 ? "+" : ""}${move.priority}`;
  }

  descCell.textContent = getMoveDescription(move);

  descRow.appendChild(descCell);

  tr.addEventListener("click", async () => {
    const isOpen = descRow.style.display === "table-row";

    document
      .querySelectorAll(".move-description-row")
      .forEach((row) => (row.style.display = "none"));

    document
      .querySelectorAll(".move-expanded")
      .forEach((row) => row.classList.remove("move-expanded"));

    if (!isOpen) {
      descCell.textContent = "Traduzindo...";
      descRow.style.display = "table-row";
      tr.classList.add("move-expanded");

      descCell.textContent = await getMoveDescription(move);
    }
  });

  tbody.appendChild(tr);
  tbody.appendChild(descRow);
}

function renderDamageRelations(types) {
  const token = ++damageToken;

  const relations = {};

  fetch(`https://pokeapi.co/api/v2/type/${types[0]}`)
    .then((res) => res.json())
    .then((type1) => {
      if (token !== damageToken) return;

      function apply(rel, mult) {
        rel.forEach((t) => {
          relations[t.name] = (relations[t.name] || 1) * mult;
        });
      }

      apply(type1.damage_relations.double_damage_from, 2);
      apply(type1.damage_relations.half_damage_from, 0.5);
      apply(type1.damage_relations.no_damage_from, 0);

      if (types[1]) {
        fetch(`https://pokeapi.co/api/v2/type/${types[1]}`)
          .then((res) => res.json())
          .then((type2) => {
            if (token !== damageToken) return;

            apply(type2.damage_relations.double_damage_from, 2);
            apply(type2.damage_relations.half_damage_from, 0.5);
            apply(type2.damage_relations.no_damage_from, 0);

            renderRelations(relations);
          });
      } else {
        renderRelations(relations);
      }
    });
}

function renderHabitats(pokedexNumber) {
  const list = document.getElementById("habitat-list");
  list.innerHTML = "";

  const habitatsEncontrados = HABITATS.filter((habitat) =>
    habitat.pokedex.map(Number).includes(Number(pokedexNumber)),
  );

  if (habitatsEncontrados.length === 0) {
    return; // não mostra nada
  }

  habitatsEncontrados.forEach((habitat) => {
    const li = document.createElement("li");
    li.className = "habitat-item";
    li.textContent = habitat.nome;
    list.appendChild(li);
  });
}

function generatePokemonSheet(data) {
  let habilidadesTexto = "";

  const tipos = data.types.join(" | ");
  const habitats = data.habitats?.join(" | ") || "Desconhecido";
  const intVal = calcIntelligence(data);
  const strVal = calcStrength(data);
  const movVal = calcMovement(data);

  data.abilities.forEach((name) => {
    const cleanName = name.replace(" (Oculta)", "").toLowerCase();
    const abilityInfo = abilitiesData[cleanName];

    if (!abilityInfo) return;

    const isHidden = name.includes("(Oculta)");

    habilidadesTexto += `
✠
『${abilityInfo.ptName}${isHidden ? " (Oculta)" : ""}』
『Ativação』-【${abilityInfo.activation}】
『Efeito』 -【${abilityInfo.effect}】
`;
  });

  return `
FICHA POKEMON

╔═════════╡✠╞═════════╗
◄ RECONHECIMENTO
『.Raça..』-【${data.name.toUpperCase()}】
『.N.Dex.』-【#${data.id}】
『.Tipos.』-【${tipos}】
╞═════════╡✠╞═════════╡
◄ INFORMAÇÕES GERAIS
『.Tamanho.』-【${data.height} m】
『.Peso....』-【${data.weight} kg】
${
  data.gender.genderless
    ? "『.Gênero..』-【Sem gênero】"
    : `『.Gênero..』-【${data.gender.male}% masculino | ${data.gender.female}% feminino】`
}
『.Grupo de ovo.』-【${data.eggGroups.join(" | ")}】
『.Habitat......』-【${habitats}】
.
╞═════════╡✠╞═════════╡
◄ HABILIDADES
${habilidadesTexto}
╞═════════╡✠╞═════════╡
◄ CAPACIDADES
『.Inteligência.』-【${intVal} - ${INT_LABELS[intVal]}】
『.Força........』-【${strVal} - ${STR_LABELS[strVal]}】
『.Deslocamento.』-【${movVal} - ${MOV_LABELS[movVal]}】
╞═════════╡✠╞═════════╡
◄ STATUS BASE
『Saúde』-【${data.stats.hp}】
『Atk』-【${data.stats.atk}】
『Def』-【${data.stats.def}】
『Sp.Atk』-【${data.stats.spAtk}】
『Sp.Def』-【${data.stats.spDef}】
『Spd』-【${data.stats.speed}】
╚═════════╡✠╞═════════╝
`;
}

function generateMovesSheet(moves) {
  let levelMovesArr = [];
  let tmMoves = [];
  let tutorMoves = [];
  let eggMoves = [];

  moves.forEach((move) => {
    const power = move.power ?? "-";
    const accuracy = move.accuracy ?? "-";
    const pp = move.pp ?? "-";
    const priority = move.priority ?? 0;

    if (move.method === "level-up") {
      levelMovesArr.push({
        level: move.level ?? 0,
        text: `「${move.level ?? "-"}」〔${move.name}〕|『${move.type}』|【${power}】|【${accuracy}】|【${pp}】|【${priority}】`,
      });
    } else if (move.method === "machine") {
      tmMoves.push(move.name);
    } else if (move.method === "tutor") {
      tutorMoves.push(move.name);
    } else if (move.method === "egg") {
      eggMoves.push(move.name);
    }
  });

  levelMovesArr.sort((a, b) => a.level - b.level);

  const levelMoves = levelMovesArr.map((m) => m.text).join("\n");

  return `
FICHA DE GOLPES
╔═════════╡✠╞═════════╗
◄ GOLPES [Level]
${levelMoves || "Nenhum"}
╞═════════╡✠╞═════════╡
◄ GOLPES [TM/Tutor/Egg]

TM
「Aprendido por TM」-〔${tmMoves.join(" | ") || "Nenhum"}〕

Tutor
「Aprendido por Tutor」-〔${tutorMoves.join(" | ") || "Nenhum"}〕

Egg
「Aprendido por Egg」-〔${eggMoves.join(" | ") || "Nenhum"}〕
╚═════════╡✠╞═════════╝
`;
}

document.getElementById("copyPokemonBtn").addEventListener("click", () => {
  if (!currentPokemonData) return;

  const text = generatePokemonSheet(currentPokemonData);

  navigator.clipboard.writeText(text).then(() => showCopyToast());
});

document.getElementById("copyMovesBtn").addEventListener("click", () => {
  if (!currentMovesData) return;

  const text = generateMovesSheet(currentMovesData);

  navigator.clipboard.writeText(text).then(() => showCopyToast());
});

function showCopyToast() {
  const toast = document.getElementById("copyToast");

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function renderRelations(rel) {
  document.getElementById("weaknesses").innerHTML = "";
  document.getElementById("resistances").innerHTML = "";
  document.getElementById("immunities").innerHTML = "";
  const weak = [];
  const resist = [];
  const immune = [];

  Object.entries(rel).forEach(([type, value]) => {
    if (value === 1) return;

    if (value === 0) immune.push(type);
    else if (value > 1) weak.push({ type, value });
    else if (value < 1) resist.push({ type, value });
  });

  document.getElementById("weaknesses").innerHTML = weak
    .map(
      (w) =>
        `<img src="assets/types/${w.type}.png"
       class="${w.value >= 4 ? "x4-weak" : ""}">`,
    )
    .join("");

  document.getElementById("resistances").innerHTML = resist
    .map(
      (r) =>
        `<img src="assets/types/${r.type}.png"
       class="${r.value <= 0.25 ? "x4-resist" : ""}">`,
    )
    .join("");

  document.getElementById("immunities").innerHTML = immune
    .map((t) => `<img src="assets/types/${t}.png">`)
    .join("");
}

async function getMoveDescription(move) {
  let entry = move.effect_entries.find((e) => e.language.name === "pt-br");

  let text;

  if (entry) {
    text = entry.effect;
  } else {
    entry = move.effect_entries.find((e) => e.language.name === "en");

    if (!entry) return "Descrição não disponível.";

    text = entry.effect.replace(/\$effect_chance/g, move.effect_chance ?? "");

    text = await translateToPortuguese(text);
  }

  // prioridade
  if (move.priority && move.priority !== 0) {
    text += `\n\nPrioridade: ${move.priority > 0 ? "+" : ""}${move.priority}`;
  }

  return text;
}

async function translateToPortuguese(text) {
  if (!text) return "";

  if (translationCache[text]) {
    return translationCache[text];
  }

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(text)}`,
    );

    if (!response.ok) throw new Error("Erro na API");

    const data = await response.json();

    const translated = data[0].map((t) => t[0]).join("");

    translationCache[text] = translated;

    return translated;
  } catch (error) {
    console.error("Erro na tradução:", error);
    return text; // fallback seguro
  }
}

function renderCapacities(pokemon) {
  const intVal = calcIntelligence(pokemon);
  const strVal = calcStrength(pokemon);
  const movVal = calcMovement(pokemon);

  document.getElementById("cap-int").textContent = intVal;
  document.getElementById("cap-int-label").textContent = INT_LABELS[intVal];

  document.getElementById("cap-str").textContent = strVal;
  document.getElementById("cap-str-label").textContent = STR_LABELS[strVal];

  document.getElementById("cap-mov").textContent = movVal;
  document.getElementById("cap-mov-label").textContent = MOV_LABELS[movVal];
}

function calcIntelligence(pokemon) {
  let value = 0;

  // Tipos (somam)
  value += sumFromList(pokemon.types, {
    psychic: 2,
    fighting: 1,
    ghost: 1,
    fairy: 1,
    dark: 1,
    bug: -1,
    rock: -1,
    ground: -1,
    ice: -1,
    normal: -1,
  });

  // Egg Groups (somam)
  value += sumFromList(pokemon.eggGroups, {
    humanshape: 1,
    amorphous: 1,
    mineral: 1,
    "no-eggs": 1,
    grass: -1,
    water2: -1,
    water3: -1,
    bug: -1,
    monster: -1,
  });

  // Sp. Atk
  if (pokemon.stats.spAtk <= 2) value -= 1;
  else if (pokemon.stats.spAtk >= 10) value += 1;

  // Lendário
  if (pokemon.isLegendary) value += 1;

  // Estágio único ou final
  if (pokemon.isFinalStage || pokemon.isSingleStage) value += 1;

  return clampCapacity(value);
}

function calcStrength(pokemon) {
  let value = 0;

  // Tipos
  value += sumFromList(pokemon.types, {
    fighting: 1,
    ice: 1,
    rock: 1,
    steel: 1,
    dragon: 1,
    fairy: -1,
    bug: -1,
    ghost: -1,
  });

  // Egg Groups
  value += sumFromList(pokemon.eggGroups, {
    monster: 1,
    dragon: 1,
    mineral: 1,
    "no-eggs": 1,
    humanshape: 1,
    amorphous: -1,
    bug: -1,
    grass: -1,
  });

  // Atk
  if (pokemon.stats.atk <= 2) value -= 1;
  else if (pokemon.stats.atk >= 10) value += 1;

  // Peso
  if (pokemon.weight >= 80) value += 1;
  if (pokemon.weight <= 20) value -= 1;

  // Lendário
  if (pokemon.isLegendary) value += 1;

  // Estágio único ou final
  if (pokemon.isFinalStage || pokemon.isSingleStage) value += 1;

  return clampCapacity(value);
}

function calcMovement(pokemon) {
  let value = 1;

  // Tipos
  value += sumFromList(pokemon.types, {
    electric: 2,
    fire: 1,
    dragon: 1,
    flying: 1,
    bug: 1,
    fighting: 1,
    rock: -1,
    ice: -1,
    steel: -1,
  });

  // Egg Groups
  value += sumFromList(pokemon.eggGroups, {
    field: 1,
    dragon: 1,
    flying: 1,
    humanshape: 1,
    "no-eggs": 1,
    monster: -1,
    ditto: -1,
    mineral: -1,
  });

  // Speed
  if (pokemon.stats.speed <= 5) value -= 1;
  else if (pokemon.stats.speed >= 10) value += 1;

  // Lendário
  if (pokemon.isLegendary) value += 1;

  // Estágio único ou final
  if (pokemon.isFinalStage || pokemon.isSingleStage) value += 1;

  return clampCapacity(value);
}

function sumFromList(list = [], rules) {
  let total = 0;
  for (const item of list) {
    if (rules[item] !== undefined) {
      total += rules[item];
    }
  }
  return total;
}

function clampCapacity(value) {
  return Math.max(0, Math.min(4, value));
}

function goPrev() {
  if (currentId > 1) {
    loadPokemonById(currentId - 1);
  }
}

function goNext() {
  loadPokemonById(Number(currentId) + 1);
}

function goToDex(n) {
  if (n < 1) return;
  window.location.href = `pokemon-view.html?id=${n}`;
}

function playCry() {
  new Audio(
    `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${currentId}.ogg`,
  ).play();
}

function contestValue(rpgStat) {
  return Math.floor(rpgStat / 10);
}

function renderTypeRow(containerId, title, types, mode) {
  if (!types || Object.keys(types).length === 0) return;

  const container = document.getElementById(containerId);
  container.innerHTML = `<strong>${title}</strong>`;

  const row = document.createElement("div");
  row.className = "type-row";

  Object.entries(types).forEach(([type, value]) => {
    const span = document.createElement("span");
    span.className = `type ${type}`;

    span.textContent =
      mode === "weak"
        ? `${type} x${value}`
        : mode === "resist"
          ? `${type} x${value}`
          : type;

    if (value === 4 && mode === "weak") {
      span.classList.add("x4-weak");
    }

    if (value === 0.25 && mode === "resist") {
      span.classList.add("x4-resist");
    }

    row.appendChild(span);
  });
  container.innerHTML = `<strong>${title}</strong>`;
  container.appendChild(row);
}

function goToPokemon() {
  const name = nameInput.value.trim().toLowerCase();
  const dex = dexInput.value.trim();

  if (dex) {
    loadPokemonById(dex);
  } else if (name) {
    loadPokemonById(name);
  }

  preview.innerHTML = "";
}

btn.addEventListener("click", goToPokemon);

[nameInput, dexInput].forEach((input) =>
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") goToPokemon();
  }),
);

function getBestVersionGroup(details) {
  // remove versões excluídas (Z-A)
  const valid = details.filter(
    (v) => !EXCLUDED_VERSION_GROUPS.includes(v.version_group.name),
  );

  if (valid.length === 0) return null;

  // tenta achar pela prioridade
  for (const version of RPG_VERSION_PRIORITY) {
    const found = valid.find((v) => v.version_group.name === version);
    if (found) return found;
  }

  // fallback final (última disponível válida)
  return valid.at(-1);
}

function add(name, val) {
  const li = document.createElement("li");
  li.innerHTML = `<span>${name}</span><strong>${val}</strong>`;
  list.appendChild(li);
}

let pokemonIndex = [];

async function loadPokemonIndex() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data = await res.json();
  pokemonIndex = data.results.map((p, i) => ({
    name: p.name,
    id: i + 1,
  }));
}

loadPokemonIndex();

function findClosestPokemon(query) {
  query = query.toLowerCase();

  return pokemonIndex.find(
    (p) => p.name.startsWith(query) || String(p.id).startsWith(query),
  );
}

async function renderEvolutionChain(speciesUrl) {
  const species = await fetch(speciesUrl).then((r) => r.json());
  const chainUrl = species.evolution_chain.url;
  const chainData = await fetch(chainUrl).then((r) => r.json());

  const container = document.getElementById("evolution-chain");
  container.innerHTML = "";

  function traverse(node) {
    return {
      name: node.species.name,
      details: node.evolution_details?.[0] || null,
      evolvesTo: node.evolves_to.map(traverse),
    };
  }

  const chain = traverse(chainData.chain);
  await renderChainNode(chain, container);
}

document.querySelectorAll(".nav-zone").forEach((zone) => {
  zone.addEventListener("click", () => {
    const dir = zone.dataset.nav;
    if (dir === "prev") goPrev();
    if (dir === "next") goNext();
  });
});

async function renderChainNode(node, container) {
  const wrapper = document.createElement("div");
  wrapper.className = "evo-node";

  const img = document.createElement("img");
  img.width = 80;
  img.height = 80;
  img.alt = node.name;

  try {
    const poke = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${node.name}`,
    ).then((r) => r.json());

    img.src =
      poke.sprites.other["official-artwork"].front_default ||
      poke.sprites.front_default;
  } catch {
    img.src = "assets/unknown.png"; // fallback opcional
  }

  wrapper.appendChild(img);
  container.appendChild(wrapper);

  for (const next of node.evolvesTo) {
    const arrow = document.createElement("div");
    arrow.className = "evo-arrow";
    arrow.textContent = evolutionText(next.details);
    container.appendChild(arrow);

    await renderChainNode(next, container);
  }
}

function evolutionText(details) {
  if (!details) return "";

  if (details.min_level) return `Nv. ${details.min_level}`;

  if (details.trigger.name === "trade") return "Troca";

  if (details.item) return `Item: ${details.item.name.replace("-", " ")}`;

  if (details.min_happiness) return "Amizade";

  return "Evolui";
}

function getIdFromName(name) {
  // funciona porque sprites seguem a ordem da dex
  // alternativa: cachear fetch de /pokemon/{name}
  return name;
}

function renderStats(rpgStats) {
  if (statsChart) statsChart.destroy();
  document.getElementById("stat-hp").textContent = rpgStats.hp;
  document.getElementById("stat-atk").textContent = rpgStats.attack;
  document.getElementById("stat-def").textContent = rpgStats.defense;
  document.getElementById("stat-spatk").textContent = rpgStats.spAttack;
  document.getElementById("stat-spdef").textContent = rpgStats.spDefense;
  document.getElementById("stat-spd").textContent = rpgStats.speed;

  statsChart = new Chart(document.getElementById("statsRadar"), {
    type: "radar",
    data: {
      labels: ["HP", "ATK", "DEF", "Sp.ATK", "Sp.DEF", "SPD"],
      datasets: [
        {
          data: [
            rpgStats.hp,
            rpgStats.attack,
            rpgStats.defense,
            rpgStats.spAttack,
            rpgStats.spDefense,
            rpgStats.speed,
          ],
          backgroundColor: "rgba(123, 220, 101, 0.2)",
          borderColor: "#7bdc65",
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      layout: { padding: 20 },
      scales: {
        r: {
          ticks: { display: false },
          grid: { color: "#2f6b44" },
          angleLines: { color: "#2f6b44" },
          pointLabels: {
            padding: 10,
            font: { size: 11 },
            color: "#eaffea",
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}

function renderContest(rpgStats) {
  if (contestChart) contestChart.destroy();

  const contest = {
    beauty: contestValue(rpgStats.spAttack),
    cute: contestValue(rpgStats.speed),
    style: contestValue(rpgStats.attack),
    smart: contestValue(rpgStats.spDefense),
    tough: contestValue(rpgStats.defense),
  };

  document.getElementById("contest-beauty").textContent = contest.beauty;
  document.getElementById("contest-cute").textContent = contest.cute;
  document.getElementById("contest-style").textContent = contest.style;
  document.getElementById("contest-smart").textContent = contest.smart;
  document.getElementById("contest-tough").textContent = contest.tough;

  renderContestRadar(contest);
}

function renderContestRadar(contest) {
  if (contestChart) contestChart.destroy();
  contestChart = new Chart(document.getElementById("contestRadar"), {
    type: "radar",
    data: {
      labels: ["Beleza", "Fofura", "Estilo", "Inteligência", "Vigor"],
      datasets: [
        {
          data: Object.values(contest),
          backgroundColor: "rgba(255, 105, 180, 0.35)",
          borderColor: "#ff69b4",
          borderWidth: 3,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      layout: { padding: 20 },
      scales: {
        r: {
          min: 0,
          max: 3,
          ticks: { display: false },
          grid: { color: "#2f6b44" },
          angleLines: { color: "#2f6b44" },
          pointLabels: {
            padding: 10,
            font: { size: 11 },
            color: "#eaffea",
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  });
}

function openTab(e, tab) {
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));

  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));

  document.getElementById(`${tab}-tab`).classList.add("active");
  e.currentTarget.classList.add("active");
}

document.querySelectorAll(".stats-panel .tab-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const tab = btn.dataset.tab;

    document
      .querySelectorAll(".stats-panel .tab-content")
      .forEach((t) => t.classList.remove("active"));

    document
      .querySelectorAll(".stats-panel .tab-btn")
      .forEach((b) => b.classList.remove("active"));

    document.getElementById(`${tab}-tab`).classList.add("active");
    btn.classList.add("active");
  });
});

const dexBtn = document.getElementById("dexToggleBtn");
const dexContent = document.getElementById("dexContent");

function toggleDexEntry() {
  document
    .querySelectorAll(".dex-toggle")
    .forEach((el) => el.classList.remove("active"));

  const isOpen = dexContent.classList.toggle("open");

  if (isOpen) {
    dexBtn.classList.add("active");
    dexBtn.innerHTML = "◄ ENTRADA DA DEX";
  } else {
    dexBtn.classList.remove("active");
    dexBtn.innerHTML = "▸ ENTRADA DA DEX";
  }
}

dexBtn.addEventListener("click", toggleDexEntry);
dexBtn.addEventListener(
  "touchend",
  (event) => {
    event.preventDefault();
    toggleDexEntry();
  },
  { passive: false },
);

const otherBtn = document.querySelector('[data-movetab="other"]');
const otherTab = document.getElementById("other-tab");

otherBtn?.addEventListener("click", () => {
  otherTab.classList.toggle("active");
  otherBtn.classList.toggle("active");
});

document.getElementById("copyDexBtn").addEventListener("click", () => {
  const name = document.getElementById("name").textContent;
  const dex = document.getElementById("dex").textContent;
  const text = document.getElementById("dex-entry").textContent;

  if (!text || text === "Carregando biologia...") return;

  const formatted = `
◄ 『${name}』【${dex}】
╔═════════╡✠╞═════════╗
${text}

╚═════════╡✠╞═════════╝
`;

  navigator.clipboard.writeText(formatted).then(() => showCopyToast());
});

/* ===== BOTÃO DE CHORO ===== */
document.querySelector(".cry-btn")?.addEventListener("click", playCry);

/* ===== NAVEGAÇÃO ===== */
document.querySelector(".nav-btn.left")?.addEventListener("click", goPrev);

document.querySelector(".nav-btn.right")?.addEventListener("click", goNext);

document.addEventListener("DOMContentLoaded", () => {
  [nameInput, dexInput].forEach((input) =>
    input.addEventListener("input", updateSearchPreview),
  );

  document.querySelectorAll(".move-tab-buttons .tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.movetab;

      document
        .querySelectorAll("#level-tab, #other-tab")
        .forEach((t) => t.classList.remove("active"));

      document
        .querySelectorAll(".move-tab-buttons .tab-btn")
        .forEach((b) => b.classList.remove("active"));

      document.getElementById(`${tab}-tab`)?.classList.add("active");
      btn.classList.add("active");
    });
  });
});
