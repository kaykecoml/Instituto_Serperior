import { powerToDamage, accuracyToRPG, ppToRPG } from "./utils.js";

const PAGE_SIZE = 30;
const DETAIL_CONCURRENCY = 8;

const typeColors = {
  grass: "#78c850", fire: "#f08030", water: "#6890f0", electric: "#f8d030",
  psychic: "#f85888", dark: "#705848", dragon: "#7038f8", fairy: "#ee99ac",
  steel: "#b8b8d0", ghost: "#705898", ice: "#98d8d8", fighting: "#c03028",
  ground: "#e0c068", rock: "#b8a038", poison: "#a040a0", flying: "#a890f0",
  bug: "#a8b820", normal: "#a8a878", stellar: "#7fd1ff"
};

const typeBlockIcon = {
  normal: "normal.png", fire: "fire.png", water: "water.png", electric: "electric.png",
  grass: "grass.png", ice: "ice.png", fighting: "fighting.png", poison: "poison.png",
  ground: "ground.png", flying: "flying.png", psychic: "psychic.png", bug: "bug Type.png",
  rock: "rock.png", ghost: "ghost.png", dragon: "dragon.png", dark: "dark.png",
  steel: "Steel.png", fairy: "fairy.png", stellar: "stellar.png"
};

const zCrystalByType = {
  normal: "normalium z.png", fire: "firium z.png", water: "waterium z.png", electric: "electrium z.png",
  grass: "grassium z.png", ice: "icium z.png", fighting: "fightinium z.png", poison: "poisonium z.png",
  ground: "groundium z.png", flying: "flyinium z.png", psychic: "psychium z.png", bug: "buginium z.png",
  rock: "rockium z.png", ghost: "ghostium z.png", dragon: "dragonium z.png", dark: "darkinium z.png",
  steel: "steelium z.png", fairy: "fairium z.png", stellar: "stellarium z.png"
};

const state = {
  query: "",
  sort: "alpha",
  index: 0,
  entries: [],
  filtered: [],
  detailCache: new Map(),
  queued: new Set(),
  activeRequests: 0,
  currentMove: null,
  descMode: "basic",
  learnersMode: "level",
  pokemonSpriteCache: new Map(),
};

const movesEl = document.getElementById("moves");
const searchInput = document.getElementById("moveSearchInput");
const sortSelect = document.getElementById("moveSortSelect");

const moveSheetOverlay = document.getElementById("moveSheetOverlay");
const moveSheet = document.getElementById("moveSheet");
const moveSheetHeader = document.getElementById("moveSheetHeader");
const moveSheetTitle = document.getElementById("moveSheetTitle");
const moveSheetTypeIcon = document.getElementById("moveSheetTypeIcon");
const moveSheetCategoryIcon = document.getElementById("moveSheetCategoryIcon");
const moveSheetType = document.getElementById("moveSheetType");
const moveSheetCategory = document.getElementById("moveSheetCategory");
const moveSheetPower = document.getElementById("moveSheetPower");
const moveSheetPp = document.getElementById("moveSheetPp");
const moveSheetAcc = document.getElementById("moveSheetAcc");
const moveSheetPriority = document.getElementById("moveSheetPriority");
const moveSheetDescription = document.getElementById("moveSheetDescription");
const moveDescBasicBtn = document.getElementById("moveDescBasicBtn");
const moveDescFullBtn = document.getElementById("moveDescFullBtn");
const copyMoveBtn = document.getElementById("copyMoveBtn");
const showLearnersBtn = document.getElementById("showLearnersBtn");

const learnersOverlay = document.getElementById("learnersOverlay");
const learnersList = document.getElementById("learnersList");
const learnByLevelBtn = document.getElementById("learnByLevelBtn");
const learnByOtherBtn = document.getElementById("learnByOtherBtn");

function normalizeMoveName(name = "") {
  return name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function parsePokemonIdFromUrl(url = "") {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

async function translateToPortuguese(text = "") {
  if (!text) return "Sem descrição disponível.";
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(text)}`);
    if (!response.ok) throw new Error("Falha na tradução");
    const data = await response.json();
    return data[0].map((chunk) => chunk[0]).join("");
  } catch {
    return text;
  }
}

function pickEntry(entries = [], lang = "pt-br") {
  return entries.find((entry) => entry.language.name === lang);
}

function isZMove(raw) {
  return raw.name.includes("--") || raw.name.endsWith("-z") || raw.id >= 622 && raw.id <= 658;
}

function getZIcon(move) {
  const byType = zCrystalByType[move.type];
  if (!byType) return null;
  return `assets/zmove/${byType}`;
}

function typeIconPath(type) {
  return `assets/types block/${typeBlockIcon[type] || "normal.png"}`;
}

async function fetchMoveList() {
  const res = await fetch("https://pokeapi.co/api/v2/move?limit=10000");
  const data = await res.json();
  state.entries = data.results.map((entry, index) => ({
    id: index + 1,
    name_en: entry.name,
    url: entry.url,
  }));
}

async function fetchMoveDetail(entry) {
  if (state.detailCache.has(entry.name_en)) return state.detailCache.get(entry.name_en);
  const res = await fetch(entry.url);
  const raw = await res.json();
  const ptName = pickEntry(raw.names, "pt-br")?.name || normalizeMoveName(raw.name);
  const flavorPt = pickEntry(raw.flavor_text_entries, "pt-br")?.flavor_text;
  const flavorEn = pickEntry(raw.flavor_text_entries, "en")?.flavor_text || "Sem descrição disponível.";
  const effectPt = pickEntry(raw.effect_entries, "pt-br")?.effect;
  const effectEn = pickEntry(raw.effect_entries, "en")?.effect || "Sem descrição mecânica disponível.";

  const model = {
    id: raw.id,
    name_en: raw.name,
    name_pt: ptName,
    type: raw.type.name,
    type_pt: raw.type.name,
    category: raw.damage_class.name,
    power: raw.power,
    accuracy: raw.accuracy,
    pp: raw.pp,
    priority: raw.priority,
    description_basic: (flavorPt || await translateToPortuguese(flavorEn)).replace(/\s+/g, " "),
    description_full: (effectPt || await translateToPortuguese(effectEn.replace(/\$effect_chance/g, raw.effect_chance ?? ""))).replace(/\s+/g, " "),
    tm: raw.machines?.length ? `TM${String(raw.id).padStart(3, "0")}` : "—",
    is_z_move: isZMove(raw),
    z_icon: getZIcon(raw),
    learned_by_pokemon: (raw.learned_by_pokemon || []).map((p) => ({
      name: normalizeMoveName(p.name),
      id: parsePokemonIdFromUrl(p.url),
      url: p.url,
    })),
    learned_modes: raw.learned_by_pokemon?.map((pokemon) => {
      const info = raw.learned_by_pokemon.find((p) => p.name === pokemon.name);
      return info;
    }) || [],
    version_group_details: raw.learned_by_pokemon || [],
  };

  state.detailCache.set(entry.name_en, model);
  return model;
}

async function fetchPokemonSprite(pokemonId) {
  if (!pokemonId) return "";
  if (state.pokemonSpriteCache.has(pokemonId)) return state.pokemonSpriteCache.get(pokemonId);
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    const data = await res.json();
    const sprite = data.sprites?.front_default || data.sprites?.other?.showdown?.front_default || "";
    state.pokemonSpriteCache.set(pokemonId, sprite);
    return sprite;
  } catch {
    return "";
  }
}

function queueFetch(entry) {
  if (state.detailCache.has(entry.name_en) || state.queued.has(entry.name_en)) return;
  state.queued.add(entry.name_en);

  const execute = async () => {
    while (state.activeRequests >= DETAIL_CONCURRENCY) {
      await new Promise((r) => setTimeout(r, 30));
    }
    state.activeRequests += 1;
    try {
      await fetchMoveDetail(entry);
      refreshMoveCard(entry.name_en);
    } finally {
      state.activeRequests -= 1;
      state.queued.delete(entry.name_en);
    }
  };

  void execute();
}

function applyFiltersAndSort() {
  const query = state.query.trim().toLowerCase();
  state.filtered = state.entries.filter((m) => {
    const detail = state.detailCache.get(m.name_en);
    const namePt = detail?.name_pt || "";
    return m.name_en.includes(query) || namePt.toLowerCase().includes(query);
  });

  const sorter = {
    alpha: (a, b) => a.name_en.localeCompare(b.name_en),
    power: (a, b) => ((state.detailCache.get(b.name_en)?.power || 0) - (state.detailCache.get(a.name_en)?.power || 0)),
    tm: (a, b) => (state.detailCache.get(a.name_en)?.tm || "ZZZ").localeCompare(state.detailCache.get(b.name_en)?.tm || "ZZZ"),
    type: (a, b) => (state.detailCache.get(a.name_en)?.type || "zzz").localeCompare(state.detailCache.get(b.name_en)?.type || "zzz"),
    category: (a, b) => (state.detailCache.get(a.name_en)?.category || "zzz").localeCompare(state.detailCache.get(b.name_en)?.category || "zzz"),
  };
  state.filtered.sort(sorter[state.sort]);
}

function createMoveCard(entry) {
  const detail = state.detailCache.get(entry.name_en);
  const name = detail?.name_pt || normalizeMoveName(entry.name_en);
  const type = detail?.type || "normal";
  const color = typeColors[type] || "#a8a878";
  const zIcon = detail?.is_z_move && detail?.z_icon;

  return `
    <button class="move-card" style="border-color:${color}" data-move-name="${entry.name_en}" type="button">
      <div class="move-header" style="background:${color}">
        <span class="move-tm-slot">${zIcon ? `<img class="z-icon" src="${zIcon}" alt="Z Move">` : (detail?.tm || "—")}</span>
        <span class="move-name">${name}</span>
        <img class="cat-icon" src="assets/icons/${detail?.category || "status"}.png" alt="categoria">
      </div>
      <div class="move-info">
        <img src="${typeIconPath(type)}" width="34" alt="${type}">
        <span>${detail?.type_pt?.toUpperCase() || "CARREGANDO"}</span>
      </div>
    </button>
  `;
}

function refreshMoveCard(moveName) {
  const card = document.querySelector(`[data-move-name="${moveName}"]`);
  if (!card) return;
  const entry = state.entries.find((item) => item.name_en === moveName);
  if (!entry) return;
  card.outerHTML = createMoveCard(entry);
}

function render(reset = true) {
  if (reset) {
    movesEl.innerHTML = "";
    state.index = 0;
  }

  applyFiltersAndSort();
  const nextSlice = state.filtered.slice(state.index, state.index + PAGE_SIZE);
  state.index += PAGE_SIZE;

  nextSlice.forEach((entry) => {
    movesEl.insertAdjacentHTML("beforeend", createMoveCard(entry));
    queueFetch(entry);
  });

  const oldLoadMore = movesEl.querySelector(".load-more");
  if (oldLoadMore) oldLoadMore.remove();

  if (state.index < state.filtered.length) {
    movesEl.insertAdjacentHTML("beforeend", '<button class="load-more" type="button">Carregar mais golpes</button>');
  }
}

function renderDescription() {
  if (!state.currentMove) return;
  moveDescBasicBtn.classList.toggle("active", state.descMode === "basic");
  moveDescFullBtn.classList.toggle("active", state.descMode === "full");
  moveSheetDescription.textContent = state.descMode === "basic"
    ? state.currentMove.description_basic
    : state.currentMove.description_full;
}

function buildCopyText(move) {
  return `◄「${move.tm || "—"}」〔${move.name_pt}〕|『${move.type_pt}』|『${move.category}』|【${move.power ? powerToDamage(move.power) : "—"}】|【${accuracyToRPG(move.accuracy || 0)}】|【${ppToRPG(move.pp || 0)}】|【${move.priority > 0 ? `+${move.priority}` : move.priority}】\n╔═════════╡✠╞═════════╗\n${move.description_full}\n╚═════════╡✠╞═════════╝`;
}

function openMoveSheet(move) {
  if (!moveSheetOverlay) return;
  state.currentMove = move;
  state.descMode = "basic";
  const type = move.type || "normal";
  const color = typeColors[type] || "#a8a878";
  const isStatus = move.category === "status";

  moveSheetHeader.style.background = color;
  moveSheet.style.borderColor = color;
  moveSheetTitle.textContent = move.name_pt;
  moveSheetTypeIcon.src = typeIconPath(type);
  moveSheetCategoryIcon.src = `assets/icons/${move.category}.png`;
  moveSheetType.textContent = move.type_pt.toUpperCase();
  moveSheetCategory.textContent = move.category.toUpperCase();
  moveSheetPower.textContent = `${isStatus ? "Dados" : "Dano"}: ${isStatus ? "—" : powerToDamage(move.power)}`;
  moveSheetPp.textContent = `PP: ${ppToRPG(move.pp || 0)}`;
  moveSheetAcc.textContent = `ACC: ${accuracyToRPG(move.accuracy || 0)}`;
  moveSheetPriority.textContent = `Prioridade: ${move.priority > 0 ? `+${move.priority}` : move.priority}`;
  renderDescription();

  moveSheetOverlay.hidden = false;
  requestAnimationFrame(() => moveSheetOverlay.classList.add("open"));
  document.body.classList.add("move-sheet-open");
}

function closeMoveSheet() {
  if (!moveSheetOverlay || moveSheetOverlay.hidden) return;
  moveSheetOverlay.classList.remove("open");
  document.body.classList.remove("move-sheet-open");
  setTimeout(() => { moveSheetOverlay.hidden = true; }, 200);
}

async function renderLearners() {
  if (!state.currentMove) return;
  learnersList.innerHTML = "<p>Carregando...</p>";

  const baseLearners = state.currentMove.learned_by_pokemon || [];
  const rows = await Promise.all(baseLearners.slice(0, 120).map(async (pokemon) => {
    const pid = pokemon.id;
    let hasLevel = false;
    let hasOther = false;
    try {
      const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pid}`);
      const pokeRaw = await pokeRes.json();
      const moveEntry = (pokeRaw.moves || []).find((m) => m.move.name === state.currentMove.name_en);
      const versions = moveEntry?.version_group_details || [];
      hasLevel = versions.some((v) => v.move_learn_method.name === "level-up");
      hasOther = versions.some((v) => v.move_learn_method.name !== "level-up");
    } catch {
      hasOther = true;
    }
    const sprite = await fetchPokemonSprite(pid);
    return { id: pid, name: pokemon.name, sprite, hasLevel, hasOther };
  }));

  const filtered = rows.filter((row) => state.learnersMode === "level" ? row.hasLevel : row.hasOther);
  learnersList.innerHTML = filtered.length
    ? filtered.map((row) => `
      <button class="learner-card" data-pokemon-id="${row.id}" type="button">
        <img src="${row.sprite}" alt="${row.name}">
        <span>${row.name}</span>
      </button>
    `).join("")
    : "<p>Nenhum Pokémon encontrado para este método.</p>";
}

function openLearnersSheet() {
  learnersOverlay.hidden = false;
  requestAnimationFrame(() => learnersOverlay.classList.add("open"));
  renderLearners();
}

function closeLearnersSheet() {
  learnersOverlay.classList.remove("open");
  setTimeout(() => { learnersOverlay.hidden = true; }, 200);
}

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

function setupSideMenu() {
  const btn = document.getElementById("logoMenuBtn");
  const menu = document.getElementById("sideMenu");
  const backdrop = document.getElementById("sideMenuBackdrop");
  if (!btn || !menu || !backdrop) return;

  const close = () => {
    menu.classList.remove("open");
    backdrop.classList.add("hidden");
    menu.setAttribute("aria-hidden", "true");
  };

  btn.addEventListener("click", () => {
    menu.classList.add("open");
    backdrop.classList.remove("hidden");
    menu.setAttribute("aria-hidden", "false");
  });

  backdrop.addEventListener("click", close);
}

function setupEvents() {
  searchInput.addEventListener("input", (e) => {
    state.query = e.target.value.toLowerCase();
    render(true);
  });

  sortSelect.addEventListener("change", (e) => {
    state.sort = e.target.value;
    render(true);
  });

  movesEl.addEventListener("click", async (event) => {
    const loadBtn = event.target.closest(".load-more");
    if (loadBtn) {
      render(false);
      return;
    }

    const card = event.target.closest(".move-card");
    if (!card) return;
    const move = state.detailCache.get(card.dataset.moveName) || await fetchMoveDetail(state.entries.find((it) => it.name_en === card.dataset.moveName));
    if (!move) return;
    openMoveSheet(move);
  });

  moveDescBasicBtn?.addEventListener("click", () => {
    state.descMode = "basic";
    renderDescription();
  });

  moveDescFullBtn?.addEventListener("click", () => {
    state.descMode = "full";
    renderDescription();
  });

  copyMoveBtn?.addEventListener("click", async () => {
    if (!state.currentMove) return;
    await navigator.clipboard.writeText(buildCopyText(state.currentMove));
    copyMoveBtn.textContent = "Copiado!";
    setTimeout(() => { copyMoveBtn.textContent = "Copiar golpe"; }, 1200);
  });

  showLearnersBtn?.addEventListener("click", openLearnersSheet);

  learnByLevelBtn?.addEventListener("click", () => {
    state.learnersMode = "level";
    learnByLevelBtn.classList.add("active");
    learnByOtherBtn.classList.remove("active");
    renderLearners();
  });

  learnByOtherBtn?.addEventListener("click", () => {
    state.learnersMode = "other";
    learnByOtherBtn.classList.add("active");
    learnByLevelBtn.classList.remove("active");
    renderLearners();
  });

  learnersList?.addEventListener("click", (event) => {
    const card = event.target.closest(".learner-card");
    if (!card) return;
    window.location.href = `pokemon-view.html?id=${card.dataset.pokemonId}`;
  });

  moveSheetOverlay?.addEventListener("click", (event) => {
    if (event.target === moveSheetOverlay || event.target.hasAttribute("data-close-move-sheet")) {
      closeMoveSheet();
    }
  });

  learnersOverlay?.addEventListener("click", (event) => {
    if (event.target === learnersOverlay || event.target.hasAttribute("data-close-learners")) {
      closeLearnersSheet();
    }
  });
}

async function init() {
  setupSiteTitleAnimation();
  setupSideMenu();
  setupEvents();
  await fetchMoveList();
  render(true);
}

init();
