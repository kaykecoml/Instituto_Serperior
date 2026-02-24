import { HABITATS } from "./habitats.js";
import { powerToDamage, accuracyToRPG, ppToRPG } from "./utils.js";
import { abilitiesData } from "./abilities.js";
const moveCache = new Map();
const pokemonSpriteCache = new Map();
const itemSpriteCache = new Map();
const speciesVarietyCache = new Map();
const pokemonDataCache = new Map();
const evolutionChainCache = new Map();
let statsChart = null;
let contestChart = null;
let damageToken = 0;
let currentPokemonData = null;
let currentMovesData = null;
const translationCache = {};
const SPECIES_DESCRIPTION_LANG_PRIORITY = ["pt-BR", "pt", "en"];
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
const EXCLUDED_DESCRIPTION_VERSION_GROUPS = ["legends-arceus", "legends-za"];
const TYPE_COLORS = {
  normal: "#a8a878",
  fire: "#f08030",
  water: "#6890f0",
  electric: "#f8d030",
  grass: "#78c850",
  ice: "#98d8d8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#ee99ac",
};
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
let pokemonRenderToken = 0;
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
const MAX_POKEMON_ID = 1025;
let currentDisplayedPokemon = null;
let currentBaseDexId = currentId;
let isShinyActive = false;
let isPokemonLoading = false;
const nameInput = document.getElementById("dexSearchInput");
const dexInput = document.getElementById("dexNumberInput");
const btn = document.getElementById("dexSearchBtn");
const preview = document.getElementById("search-preview");
const isMobileViewport = window.matchMedia("(max-width: 1024px)");
const moveSheetOverlay = document.getElementById("moveSheetOverlay");
const moveSheetTitle = document.getElementById("moveSheetTitle");
const moveSheetHeader = document.getElementById("moveSheetHeader");
const moveSheetPriority = document.getElementById("moveSheetPriority");
const moveSheetTypeIcon = document.getElementById("moveSheetTypeIcon");
const moveSheetCategoryIcon = document.getElementById("moveSheetCategoryIcon");
const moveSheetType = document.getElementById("moveSheetType");
const moveSheetCategory = document.getElementById("moveSheetCategory");
const moveSheetPower = document.getElementById("moveSheetPower");
const moveSheetPp = document.getElementById("moveSheetPp");
const moveSheetAcc = document.getElementById("moveSheetAcc");
const moveSheetDescription = document.getElementById("moveSheetDescription");
const moveSheetEffect = document.getElementById("moveSheetEffect");
function formatPokemonName(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
function getArtworkSprite(pokemon, shiny = false) {
  const official = pokemon?.sprites?.other?.["official-artwork"];
  if (shiny) {
    return (
      official?.front_shiny ||
      pokemon?.sprites?.other?.home?.front_shiny ||
      pokemon?.sprites?.front_shiny ||
      official?.front_default ||
      pokemon?.sprites?.other?.home?.front_default ||
      pokemon?.sprites?.front_default ||
      ""
    );
  }
  return (
    official?.front_default ||
    pokemon?.sprites?.other?.home?.front_default ||
    pokemon?.sprites?.front_default ||
    ""
  );
}
function updateArtworkImage() {
  const artEl = document.getElementById("official-art");
  if (!currentDisplayedPokemon || !artEl) return;
  artEl.src = getArtworkSprite(currentDisplayedPokemon, isShinyActive);
}
function formatDexNumber(id) {
  return `#${String(id).padStart(4, "0")}`;
}
function getAdjacentPokemonIds() {
  const prev = currentId > 1 ? currentId - 1 : MAX_POKEMON_ID;
  const next = currentId < MAX_POKEMON_ID ? currentId + 1 : 1;
  return { prev, next };
}
function updateDexNavigationLabels() {
  const { prev, next } = getAdjacentPokemonIds();
  const mobilePrevEl = document.getElementById("mobile-prev-dex");
  const mobileNextEl = document.getElementById("mobile-next-dex");
  const desktopPrevEl = document.getElementById("desktop-prev-dex");
  const desktopNextEl = document.getElementById("desktop-next-dex");
  if (mobilePrevEl) mobilePrevEl.textContent = formatDexNumber(prev);
  if (mobileNextEl) mobileNextEl.textContent = formatDexNumber(next);
  if (desktopPrevEl) desktopPrevEl.textContent = formatDexNumber(prev);
  if (desktopNextEl) desktopNextEl.textContent = formatDexNumber(next);
}
async function prefetchAdjacentPokemon() {
  const { prev, next } = getAdjacentPokemonIds();
  await Promise.allSettled([getPokemonData(prev), getPokemonData(next)]);
}
async function init() {
  const id = getInitialPokemonId();
  await loadPokemonById(id);
}
init();
let isLegendary = false;
let basePokemon = null;
function loadPokemon(p) {
  basePokemon = p;
  currentBaseDexId = p.id;
  currentId = p.id;
  isShinyActive = false;
  updateDexNavigationLabels();
  void prefetchAdjacentPokemon();
  document.getElementById("dex").textContent = `#${String(p.id).padStart(3, "0")}`;
  document.getElementById("name").textContent = formatPokemonName(p.name);
  currentDisplayedPokemon = p;
  updateArtworkImage();
  document.getElementById("size").textContent = `${p.height / 10} m • ${p.weight / 10} kg`;
  fetch(p.species.url)
    .then((res) => res.json())
    .then((species) => {
      isLegendary = species.is_legendary;
      renderForms(species.varieties, p.name);
      renderEggGroups(species.egg_groups);
      applyPokemonData(p, p.id);
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
  const candidates = pokemonIndex
    .filter(
      (p) =>
        p.name.startsWith(query) ||
        p.name.includes(query) ||
        String(p.id).startsWith(query),
    )
    .slice(0, 6);
  if (candidates.length === 0) return;
  const list = document.createElement("div");
  list.className = "preview-list";
  candidates.forEach((found) => {
    const card = document.createElement("button");
    card.className = "preview-card";
    card.type = "button";
    const img = document.createElement("img");
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${found.id}.png`;
    img.alt = found.name;
    const name = document.createElement("span");
    name.textContent = `${formatDexNumber(found.id)} ${formatPokemonName(found.name)}`;
    card.appendChild(img);
    card.appendChild(name);
    card.onclick = () => {
      preview.innerHTML = "";
      nameInput.value = "";
      dexInput.value = "";
      loadPokemonById(found.id);
    };
    list.appendChild(card);
  });
  preview.appendChild(list);
}
async function getMoveDetails(url) {
  if (moveCache.has(url)) {
    return moveCache.get(url);
  }
  const data = await fetch(url).then((r) => r.json());
  moveCache.set(url, data);
  return data;
}
const speciesDescriptionCache = new Map();
function normalizeDexEntryText(text) {
  return (text || "").replace(/[\n\f\r\t]+/g, " ").replace(/\s+/g, " ").trim();
}
function pickBestFlavorEntry(entries = []) {
  const sortedByPriority = [...entries].sort((a, b) => {
    const aPriority = SPECIES_DESCRIPTION_LANG_PRIORITY.indexOf(a.language.name);
    const bPriority = SPECIES_DESCRIPTION_LANG_PRIORITY.indexOf(b.language.name);
    const normalizedA = aPriority === -1 ? Number.MAX_SAFE_INTEGER : aPriority;
    const normalizedB = bPriority === -1 ? Number.MAX_SAFE_INTEGER : bPriority;
    return normalizedA - normalizedB;
  });
  for (const entry of sortedByPriority) {
    const normalizedText = normalizeDexEntryText(entry.flavor_text);
    if (normalizedText.length >= 20) {
      return { text: normalizedText, language: entry.language.name };
    }
  }
  return null;
}
async function getDexEntryText(pokemon, species = null) {
  const speciesData = species || (await getSpeciesData(pokemon.species.url));
  if (speciesDescriptionCache.has(speciesData.id)) {
    return speciesDescriptionCache.get(speciesData.id);
  }
  const selectedEntry = pickBestFlavorEntry(speciesData.flavor_text_entries || []);
  if (!selectedEntry) {
    return "Descrição da Pokédex indisponível no momento.";
  }
  let description = selectedEntry.text;
  if (!selectedEntry.language.startsWith("pt")) {
    description = await translateToPortuguese(description);
  }
  speciesDescriptionCache.set(speciesData.id, description);
  return description;
}
async function loadPokemonById(idOrName) {
  if (isPokemonLoading) return;
  isPokemonLoading = true;
  try {
    const pokemon = await getPokemonData(idOrName);
    loadPokemon(pokemon);
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.pushState(null, "", `?id=${pokemon.id}`);
  } finally {
    isPokemonLoading = false;
  }
}
async function getPokemonData(idOrName) {
  const key = String(idOrName).toLowerCase();
  if (pokemonDataCache.has(key)) {
    return pokemonDataCache.get(key);
  }
  const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`).then((r) =>
    r.json(),
  );
  pokemonDataCache.set(String(pokemon.id), pokemon);
  pokemonDataCache.set(pokemon.name, pokemon);
  return pokemon;
}
function setActiveFormButton(formName) {
  document.querySelectorAll("#form-buttons [data-form-name]").forEach((el) => {
    el.classList.toggle("active", el.dataset.formName === formName);
  });
}
function setFormButtonsBusy(isBusy) {
  const container = document.getElementById("form-buttons");
  container.classList.toggle("is-loading", isBusy);
  container.querySelectorAll("button, img").forEach((el) => {
    if (el.tagName.toLowerCase() === "button") {
      el.disabled = isBusy;
    }
    el.classList.toggle("is-disabled", isBusy);
  });
}
function prefetchForms(varieties) {
  const names = varieties
    .map((v) => v.pokemon.name)
    .filter((name) => name && name !== basePokemon?.name);
  Promise.allSettled(names.map((name) => getPokemonData(name)));
}
function renderForms(varieties, baseName) {
  const container = document.getElementById("form-buttons");
  container.innerHTML = "";
  const baseBtn = document.createElement("button");
  baseBtn.textContent = "Base";
  baseBtn.className = "form-base-btn";
  baseBtn.dataset.formName = baseName;
  baseBtn.onclick = () => {
    isShinyActive = false;
    void loadForm(baseName);
  };
  container.appendChild(baseBtn);
  varieties.forEach((v) => {
    const name = v.pokemon.name;
    if (name === baseName) return;
    if (name.includes("mega")) {
      const img = document.createElement("img");
      if (name.includes("mega-x")) {
        img.src = "assets/forms/megax.png";
      } else if (name.includes("mega-y")) {
        img.src = "assets/forms/megay.png";
      } else if (name.includes("mega-z")) {
        img.src = "assets/forms/megaz.png";
      } else {
        img.src = "assets/forms/mega.png";
      }
      img.className = "form-btn";
      img.title = "Mega Evolução";
      img.dataset.formName = name;
      img.onclick = () => void loadForm(name);
      container.appendChild(img);
      return;
    }
    if (name.includes("gmax")) {
      const img = document.createElement("img");
      img.src = "assets/gigantamax.png";
      img.className = "form-btn";
      img.title = "Gigantamax";
      img.dataset.formName = name;
      img.onclick = () => void loadForm(name);
      container.appendChild(img);
      return;
    }
    const btn = document.createElement("button");
    btn.textContent = name.replace(baseName + "-", "");
    btn.className = "tab-btn";
    btn.dataset.formName = name;
    btn.onclick = () => void loadForm(name);
    container.appendChild(btn);
  });
  setActiveFormButton(currentDisplayedPokemon?.name || baseName);
  prefetchForms(varieties);
}
async function loadForm(name) {
  if (!name || (currentDisplayedPokemon?.name === name && !isShinyActive)) return;
  setFormButtonsBusy(true);
  setActiveFormButton(name);
  try {
    const pokemon = await getPokemonData(name);
    if (!pokemon.moves || pokemon.moves.length === 0) {
      pokemon.moves = basePokemon?.moves || [];
    }
    isShinyActive = false;
    await applyPokemonData(pokemon, currentBaseDexId);
  } finally {
    setFormButtonsBusy(false);
  }
}
async function applyPokemonData(p, displayDexId = currentBaseDexId) {
  const renderToken = ++pokemonRenderToken;
  const dexEntry = document.getElementById("dex-entry");
  const artFrame = document.querySelector(".art-frame");
  if (artFrame) {
    artFrame.classList.add("is-transitioning");
  }
  dexEntry.textContent = "Carregando entrada da dex...";
  document.getElementById("dexContent").classList.remove("open");
  const dexToggleButton = document.getElementById("dexToggleBtn");
  dexToggleButton.classList.remove("active");
  dexToggleButton.textContent = "▸ ENTRADA DA DEX";
  const species = await getSpeciesData(p.species.url);
  if (renderToken !== pokemonRenderToken) {
    if (artFrame) artFrame.classList.remove("is-transitioning");
    return;
  }
  applySpecialTheme(species);
  const dexText = await getDexEntryText(p, species);
  if (renderToken !== pokemonRenderToken) {
    if (artFrame) artFrame.classList.remove("is-transitioning");
    return;
  }
  dexEntry.classList.remove("expanded");
  dexEntry.textContent = dexText;
  const pokemonData = buildPokemonData(p, species);
  pokemonData.id = displayDexId;
  const chainData = await getEvolutionChainData(species.evolution_chain.url);
  if (renderToken !== pokemonRenderToken) {
    if (artFrame) artFrame.classList.remove("is-transitioning");
    return;
  }
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
  currentDisplayedPokemon = p;
  setActiveFormButton(p.name);
  updateArtworkImage();
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
  renderHabitats(displayDexId);
  renderMoves(p.moves);
  renderEvolutionChain(chainData);
  document.getElementById("name").textContent = formatPokemonName(p.name);
  document.getElementById("dex").textContent =
    `#${String(displayDexId).padStart(3, "0")}`;
  document.getElementById("size").textContent =
    `${p.height / 10} m • ${p.weight / 10} kg`;
  if (artFrame) {
    requestAnimationFrame(() => {
      artFrame.classList.remove("is-transitioning");
    });
  }
}
function getCategoryIcon(damageClass) {
  return `<img src="assets/icons/${damageClass}.png" class="status-icon">`;
}
function getMoveZIconPath(moveName) {
  return `assets/zmove/${moveName}.png`;
}
function getTypeBlockIconPath(typeName) {
  return `assets/types block/${typeName}.png`;
}
function normalizeMoveName(moveName) {
  return moveName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
function buildMoveNameCell(move) {
  const wrapper = document.createElement("div");
  wrapper.className = "move-name-cell";
  const nameSpan = document.createElement("span");
  nameSpan.textContent = normalizeMoveName(move.name);
  wrapper.appendChild(nameSpan);
  const zIcon = document.createElement("img");
  zIcon.className = "zmove-icon";
  zIcon.alt = `Z-Move ${normalizeMoveName(move.name)}`;
  zIcon.src = getMoveZIconPath(move.name);
  zIcon.addEventListener("error", () => {
    zIcon.remove();
  });
  wrapper.appendChild(zIcon);
  return wrapper;
}
function openMoveSheet(move, dmg, acc, pp, isStatus) {
  if (!moveSheetOverlay) return;
  const typeColor = TYPE_COLORS[move.type.name] || "#7bdc65";
  moveSheetTitle.textContent = normalizeMoveName(move.name);
  if (moveSheetHeader) {
    moveSheetHeader.style.background = typeColor;
  }
  moveSheetPriority.textContent = `Prioridade ${move.priority > 0 ? "+" : ""}${move.priority || 0}`;
  moveSheetType.textContent = move.type.name.toUpperCase();
  moveSheetCategory.textContent = move.damage_class.name.toUpperCase();
  if (moveSheetTypeIcon) {
    moveSheetTypeIcon.src = getTypeBlockIconPath(move.type.name);
    moveSheetTypeIcon.onerror = () => {
      moveSheetTypeIcon.src = `assets/types/${move.type.name}.png`;
      moveSheetTypeIcon.onerror = null;
    };
  }
  if (moveSheetCategoryIcon) {
    moveSheetCategoryIcon.src = `assets/icons/${move.damage_class.name}.png`;
  }
  moveSheetPower.textContent = `${isStatus ? "Dados" : "Dano"}: ${isStatus ? "—" : dmg}`;
  moveSheetPp.textContent = `PP: ${pp}`;
  moveSheetAcc.textContent = `ACC: ${acc}`;
  if (moveSheetDescription) {
    moveSheetDescription.textContent = "Carregando descrição...";
  }
  if (moveSheetEffect) {
    moveSheetEffect.textContent = "Carregando detalhes mecânicos...";
  }
  setMoveSheetTab("flavor");
  document.body.classList.add("move-sheet-open");
  moveSheetOverlay.hidden = false;
  requestAnimationFrame(() => moveSheetOverlay.classList.add("open"));
  getMoveDescription(move).then((description) => {
    if (!moveSheetOverlay.hidden && moveSheetDescription) {
      moveSheetDescription.textContent = description;
    }
  });
  getMoveMechanicalDescription(move).then((effectDescription) => {
    if (!moveSheetOverlay.hidden && moveSheetEffect) {
      moveSheetEffect.textContent = effectDescription;
    }
  });
}
function setMoveSheetTab(tabName) {
  document.querySelectorAll("[data-move-sheet-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.moveSheetTab === tabName);
  });
  document.querySelectorAll("[data-move-sheet-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.moveSheetPanel === tabName);
  });
}

function closeMoveSheet() {
  if (!moveSheetOverlay || moveSheetOverlay.hidden) return;
  moveSheetOverlay.classList.remove("open");
  document.body.classList.remove("move-sheet-open");
  setTimeout(() => {
    moveSheetOverlay.hidden = true;
  }, 180);
}
function addRow(tbody, col1, move, typeIcon, categoryIcon, dmg, acc, pp) {
  const isStatus = move.damage_class.name === "status";
  // Linha principal
  const tr = document.createElement("tr");
  tr.style.cursor = "pointer";
  const methodCell = document.createElement("td");
  methodCell.textContent = col1;
  const nameCell = document.createElement("td");
  nameCell.appendChild(buildMoveNameCell(move));
  const typeCell = document.createElement("td");
  typeCell.innerHTML = typeIcon;
  const categoryCell = document.createElement("td");
  categoryCell.innerHTML = categoryIcon;
  const damageCell = document.createElement("td");
  damageCell.textContent = isStatus ? "—" : dmg;
  const accCell = document.createElement("td");
  accCell.textContent = acc;
  const ppCell = document.createElement("td");
  ppCell.textContent = pp;
  tr.append(
    methodCell,
    nameCell,
    typeCell,
    categoryCell,
    damageCell,
    accCell,
    ppCell,
  );
  // Linha da descrição
  const descRow = document.createElement("tr");
  descRow.classList.add("move-description-row");
  const descCell = document.createElement("td");
  descCell.colSpan = 7; // número total de colunas da tabela
  descCell.classList.add("move-description-cell");
  descCell.textContent = getMoveDescription(move);
  descRow.appendChild(descCell);
  tr.addEventListener("click", async () => {
    if (isMobileViewport.matches) {
      openMoveSheet(move, dmg, acc, pp, isStatus);
      return;
    }
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
if (moveSheetOverlay) {
  moveSheetOverlay.addEventListener("click", (event) => {
    if (event.target === moveSheetOverlay) {
      closeMoveSheet();
    }
  });
}
document.querySelectorAll("[data-move-sheet-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    setMoveSheetTab(button.dataset.moveSheetTab || "flavor");
  });
});
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
  const flavorEntries = move.flavor_text_entries || [];
  const flavorCandidates = flavorEntries.filter(
    (entry) => entry.language.name === "pt-br" || entry.language.name === "en",
  );
  const nonExcludedFlavor = flavorCandidates.find(
    (entry) =>
      !EXCLUDED_DESCRIPTION_VERSION_GROUPS.includes(entry.version_group.name),
  );
  const selectedFlavor = nonExcludedFlavor || flavorCandidates[0];
  let text;
  if (selectedFlavor) {
    const sanitizedText = selectedFlavor.flavor_text.replace(/[\n\f]/g, " ");
    text =
      selectedFlavor.language.name === "pt-br"
        ? sanitizedText
        : await translateToPortuguese(sanitizedText);
  } else {
    let entry = move.effect_entries.find((e) => e.language.name === "pt-br");
    if (entry) {
      text = entry.short_effect || entry.effect;
    } else {
      entry = move.effect_entries.find((e) => e.language.name === "en");
      if (!entry) return "Descrição não disponível.";
      text = (entry.short_effect || entry.effect).replace(
        /\$effect_chance/g,
        move.effect_chance ?? "",
      );
      text = await translateToPortuguese(text);
    }
  }
  if (move.priority && move.priority !== 0) {
    text += `\n\nPrioridade: ${move.priority > 0 ? "+" : ""}${move.priority}`;
  }
  return text;
}
async function getMoveMechanicalDescription(move) {
  const effects = move.effect_entries || [];
  let entry = effects.find((e) => e.language.name === "pt-br");
  let text = "";
  if (entry) {
    text = entry.effect || entry.short_effect || "";
  } else {
    const english = effects.find((e) => e.language.name === "en");
    if (!english) return "Detalhes mecânicos não disponíveis.";
    text = (english.effect || english.short_effect || "").replace(
      /\$effect_chance/g,
      move.effect_chance ?? "",
    );
    text = await translateToPortuguese(text);
  }
  if (!text) return "Detalhes mecânicos não disponíveis.";
  if (move.effect_chance !== null && move.effect_chance !== undefined) {
    text += `\n\nChance de efeito secundário: ${move.effect_chance}%`;
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
  const { prev } = getAdjacentPokemonIds();
  loadPokemonById(prev);
}
function goNext() {
  const { next } = getAdjacentPokemonIds();
  loadPokemonById(next);
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
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON_ID}`);
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
  let chainData = speciesUrl;
  if (typeof speciesUrl === "string") {
    const species = await getSpeciesData(speciesUrl);
    chainData = await getEvolutionChainData(species.evolution_chain.url);
  }
  const container = document.getElementById("evolution-chain");
  container.innerHTML = "";
  async function traverse(node) {
    const speciesData = await getSpeciesData(node.species.url);
    return {
      name: node.species.name,
      speciesName: speciesData.name,
      details: node.evolution_details?.[0] || null,
      evolvesTo: await Promise.all(node.evolves_to.map(traverse)),
      megaForms: extractMegaForms(speciesData),
    };
  }
  const chain = await traverse(chainData.chain);
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
  if (node.name === "eevee" && node.evolvesTo.length >= 6) {
    await renderEeveeLayout(node, container);
    return;
  }
  const wrapper = await createEvolutionNode(node.name);
  container.appendChild(wrapper);
  if (node.evolvesTo.length > 1) {
    const branchRow = document.createElement("div");
    branchRow.className = "evo-branch-row";
    for (const next of node.evolvesTo) {
      const branchColumn = document.createElement("div");
      branchColumn.className = "evo-branch-column";
      branchColumn.appendChild(await createEvolutionTransition(next.details));
      await renderChainNode(next, branchColumn);
      branchRow.appendChild(branchColumn);
    }
    container.appendChild(branchRow);
  } else {
    for (const next of node.evolvesTo) {
      container.appendChild(await createEvolutionTransition(next.details));
      await renderChainNode(next, container);
    }
  }
  if (node.megaForms.length > 0) {
    container.appendChild(await createMegaBranch(node.megaForms));
  }
}
async function renderEeveeLayout(node, container) {
  const eeveeLayout = document.createElement("div");
  eeveeLayout.className = "eevee-evolution-layout";
  const eeveeBase = document.createElement("div");
  eeveeBase.className = "eevee-base";
  eeveeBase.appendChild(await createEvolutionNode(node.name));
  eeveeLayout.appendChild(eeveeBase);
  const eeveeBranches = document.createElement("div");
  eeveeBranches.className = "eevee-branches";
  for (const next of node.evolvesTo) {
    const orb = document.createElement("div");
    orb.className = "eevee-orbit-item";
    const transition = await createEvolutionTransition(next.details);
    const evolvedNode = await createEvolutionNode(next.name);
    orb.appendChild(transition);
    orb.appendChild(evolvedNode);
    eeveeBranches.appendChild(orb);
  }
  eeveeLayout.appendChild(eeveeBranches);
  container.appendChild(eeveeLayout);
}
function applySpecialTheme(species) {
  const pokemonView = document.querySelector(".pokemon-view");
  if (!pokemonView) return;
  const isSpecial = species.is_legendary || species.is_mythical;
  pokemonView.classList.toggle("is-mystic", isSpecial);
}
async function getPokemonSprite(name) {
  if (pokemonSpriteCache.has(name)) return pokemonSpriteCache.get(name);
  try {
    const poke = await getPokemonData(name);
    const sprite =
      poke.sprites.other["official-artwork"].front_default ||
      poke.sprites.front_default ||
      "assets/unknown.png";
    pokemonSpriteCache.set(name, sprite);
    return sprite;
  } catch {
    return "assets/unknown.png";
  }
}
async function getSpeciesData(url) {
  if (speciesVarietyCache.has(url)) return speciesVarietyCache.get(url);
  const speciesData = await fetch(url).then((r) => r.json());
  speciesVarietyCache.set(url, speciesData);
  return speciesData;
}
async function getEvolutionChainData(url) {
  if (evolutionChainCache.has(url)) return evolutionChainCache.get(url);
  const chainData = await fetch(url).then((r) => r.json());
  evolutionChainCache.set(url, chainData);
  return chainData;
}
function extractMegaForms(speciesData) {
  return speciesData.varieties
    .map((v) => v.pokemon.name)
    .filter((name) => name.includes("-mega"))
    .map((name) => {
      const suffix = name.replace(`${speciesData.name}-mega`, "").replace("-", "");
      const label = suffix ? `Mega ${suffix.toUpperCase()}` : "Mega";
      const stoneName = suffix
        ? `${speciesData.name}ite-${suffix}`
        : `${speciesData.name}ite`;
      return {
        pokemonName: name,
        label,
        stoneName,
      };
    });
}
async function createEvolutionNode(name, subtitle = "") {
  const wrapper = document.createElement("div");
  wrapper.className = "evo-node";
  const isMega = name.includes("-mega");
  if (!isMega) {
    wrapper.classList.add("is-clickable");
    wrapper.title = "Abrir Pokémon";
    wrapper.addEventListener("click", () => loadPokemonById(name));
    wrapper.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        loadPokemonById(name);
      }
    });
    wrapper.tabIndex = 0;
    wrapper.setAttribute("role", "button");
  }
  const img = document.createElement("img");
  img.width = 96;
  img.height = 96;
  img.alt = name;
  img.src = await getPokemonSprite(name);
  const nameTag = document.createElement("span");
  nameTag.className = "evo-name";
  nameTag.textContent = formatPokemonName(name);
  wrapper.appendChild(img);
  wrapper.appendChild(nameTag);
  if (subtitle) {
    const subLabel = document.createElement("span");
    subLabel.className = "evo-subtitle";
    subLabel.textContent = subtitle;
    wrapper.appendChild(subLabel);
  }
  return wrapper;
}
async function createEvolutionTransition(details, override = {}) {
  const transition = document.createElement("div");
  transition.className = "evo-transition";
  const requirement = document.createElement("div");
  requirement.className = "evo-requirement";
  const requirementData = getEvolutionRequirement(details, override);
  const itemImg = document.createElement("img");
  itemImg.className = "evo-item";
  itemImg.alt = requirementData.itemName;
  itemImg.src = await getEvolutionItemImage(requirementData.itemName);
  requirement.appendChild(itemImg);
  if (requirementData.text) {
    const text = document.createElement("span");
    text.className = "evo-requirement-text";
    text.textContent = requirementData.text;
    requirement.appendChild(text);
  }
  const chevron = document.createElement("div");
  chevron.className = "evo-chevron";
  transition.appendChild(requirement);
  transition.appendChild(chevron);
  return transition;
}
function getEvolutionRequirement(details, override = {}) {
  if (override.itemName) {
    return {
      itemName: override.itemName,
      text: override.text || "",
    };
  }
  if (!details) {
    return {
      itemName: "rare_candy",
      text: "",
    };
  }
  if (details.trigger?.name === "trade") {
    if (details.held_item?.name) {
      return {
        itemName: details.held_item.name,
        text: `Troca (${formatPokemonName(details.held_item.name)})`,
      };
    }
    return {
      itemName: "trade",
      text: "Troca",
    };
  }
  if (details.min_happiness) {
    return {
      itemName: "friend",
      text: "Amizade",
    };
  }
  if (details.item?.name) {
    return {
      itemName: details.item.name,
      text: formatPokemonName(details.item.name),
    };
  }
  if (details.min_level) {
    return {
      itemName: "rare_candy",
      text: `Nv. ${details.min_level}`,
    };
  }
  return {
    itemName: "rare_candy",
    text: "Evolui",
  };
}
async function getEvolutionItemImage(itemName) {
  const normalized = itemName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’.]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
  if (itemSpriteCache.has(normalized)) return itemSpriteCache.get(normalized);
  const localCandidates = [
    `assets/evolution items/${normalized}.png`,
    `assets/evolution items/${normalized.replace(/_/g, " ")}.png`,
    `assets/evolution items/${normalized.replace(/_/g, "-")}.png`,
    `assets/evolution items/${normalized
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())}.png`,
  ];
  if (normalized === "trade") {
    localCandidates.unshift("assets/evolution items/trade.png");
  }
  for (const candidatePath of localCandidates) {
    try {
      const localResponse = await fetch(encodeURI(candidatePath), { method: "HEAD" });
      if (localResponse.ok) {
        itemSpriteCache.set(normalized, candidatePath);
        return candidatePath;
      }
    } catch {
      // tenta próximo candidato
    }
  }
  if (normalized === "trade") {
    return "assets/evolution items/trade.png";
  }
  try {
    const itemData = await fetch(`https://pokeapi.co/api/v2/item/${normalized}`).then((r) =>
      r.json(),
    );
    const sprite = itemData.sprites.default || "assets/forms/mega.png";
    itemSpriteCache.set(normalized, sprite);
    return sprite;
  } catch {
    return "assets/forms/mega.png";
  }
}
async function createMegaBranch(megaForms) {
  const megaContainer = document.createElement("div");
  megaContainer.className = "mega-branch";
  if (megaForms.length === 1) {
    const mega = megaForms[0];
    megaContainer.appendChild(
      await createEvolutionTransition(null, {
        itemName: mega.stoneName,
        text: mega.label,
      }),
    );
    megaContainer.appendChild(await createEvolutionNode(mega.pokemonName, mega.label));
    return megaContainer;
  }
  const splitRow = document.createElement("div");
  splitRow.className = "mega-split-row";
  for (const mega of megaForms) {
    const path = document.createElement("div");
    path.className = "mega-path";
    path.appendChild(
      await createEvolutionTransition(null, {
        itemName: mega.stoneName,
        text: mega.label,
      }),
    );
    path.appendChild(await createEvolutionNode(mega.pokemonName, mega.label));
    splitRow.appendChild(path);
  }
  megaContainer.appendChild(splitRow);
  return megaContainer;
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
document.getElementById("toggleShinyBtn")?.addEventListener("click", () => {
  isShinyActive = !isShinyActive;
  updateArtworkImage();
});
document.querySelectorAll("[data-mobile-nav]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.mobileNav === "prev") goPrev();
    if (btn.dataset.mobileNav === "next") goNext();
  });
});
function setupSiteTitleAnimation() {
  const homeLink = document.querySelector(".site-home-link");
  if (!homeLink) return;
  homeLink.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    homeLink.classList.remove("expanding");
    void homeLink.offsetWidth;
    homeLink.classList.add("expanding");
    setTimeout(() => {
      window.location.href = homeLink.getAttribute("href") || "index.html";
    }, 360);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  setupSiteTitleAnimation();
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

  const quickButtons = document.querySelectorAll(".quick-nav-btn");
  quickButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.scrollTarget || "");
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      quickButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });
});
