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

const state = {
  query: "",
  sort: "alpha",
  index: 0,
  entries: [],
  filtered: [],
  detailCache: new Map(),
  queued: new Set(),
  activeRequests: 0,
};

const movesEl = document.getElementById("moves");
const searchInput = document.getElementById("moveSearchInput");
const sortSelect = document.getElementById("moveSortSelect");

const moveSheetOverlay = document.getElementById("moveSheetOverlay");
const moveSheetTitle = document.getElementById("moveSheetTitle");
const moveSheetTypeIcon = document.getElementById("moveSheetTypeIcon");
const moveSheetCategoryIcon = document.getElementById("moveSheetCategoryIcon");
const moveSheetType = document.getElementById("moveSheetType");
const moveSheetCategory = document.getElementById("moveSheetCategory");
const moveSheetPower = document.getElementById("moveSheetPower");
const moveSheetPp = document.getElementById("moveSheetPp");
const moveSheetAcc = document.getElementById("moveSheetAcc");
const moveSheetDescription = document.getElementById("moveSheetDescription");

function normalizeMoveName(name = "") {
  return name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
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
  const ptName = raw.names.find((n) => n.language.name === "pt-BR")?.name || normalizeMoveName(raw.name);
  const ptFlavor = raw.flavor_text_entries.find((f) => f.language.name === "pt-BR")?.flavor_text
    || raw.flavor_text_entries.find((f) => f.language.name === "en")?.flavor_text
    || "Sem descrição disponível.";

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
    description_pt: ptFlavor.replace(/\s+/g, " "),
    tm: raw.machines?.length ? `TM${String(raw.id).padStart(3, "0")}` : "—",
  };

  state.detailCache.set(entry.name_en, model);
  return model;
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

function renderMoveDetails(m) {
  const isStatus = m.category === "status";
  return `
    <div class="move-stats">
      <span>⚔ ${isStatus ? "—" : powerToDamage(m.power)}</span>
      <span>🎯 ${accuracyToRPG(m.accuracy || 0)}</span>
      <span>⏳ ${ppToRPG(m.pp || 0)}</span>
    </div>
    <p class="desc">${m.description_pt}</p>
  `;
}

function createMoveCard(entry) {
  const detail = state.detailCache.get(entry.name_en);
  const name = detail ? normalizeMoveName(detail.name_en) : normalizeMoveName(entry.name_en);
  const type = detail?.type || "normal";
  const color = typeColors[type] || "#a8a878";

  return `
    <button class="move-card" data-move-name="${entry.name_en}" type="button">
      <div class="move-header">
        <span class="type-dot" style="background:${color}"></span>
        <span class="move-name" style="color:${color}">${detail?.tm || "—"} ${name} <small>[${detail?.name_pt || "Carregando"}]</small></span>
        <img class="cat-icon" src="assets/icons/${detail?.category || "status"}.png" alt="categoria">
      </div>
      <div class="move-info">
        <img src="assets/types/${type}.png" width="28" alt="${type}">
        <span style="color:${color}">${detail?.type_pt?.toUpperCase() || "CARREGANDO"}</span>
      </div>
      <div class="move-details">${detail ? renderMoveDetails(detail) : '<p class="desc">Carregando dados do golpe...</p>'}</div>
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

function openMoveSheet(move) {
  if (!moveSheetOverlay) return;
  const type = move.type || "normal";
  const isStatus = move.category === "status";

  moveSheetTitle.textContent = `${move.tm || "—"} ${normalizeMoveName(move.name_en)}`;
  moveSheetTypeIcon.src = `assets/types/${type}.png`;
  moveSheetCategoryIcon.src = `assets/icons/${move.category}.png`;
  moveSheetType.textContent = move.type_pt.toUpperCase();
  moveSheetCategory.textContent = move.category.toUpperCase();
  moveSheetPower.textContent = `${isStatus ? "Dados" : "Dano"}: ${isStatus ? "—" : powerToDamage(move.power)}`;
  moveSheetPp.textContent = `PP: ${ppToRPG(move.pp || 0)}`;
  moveSheetAcc.textContent = `ACC: ${accuracyToRPG(move.accuracy || 0)}`;
  moveSheetDescription.textContent = move.description_pt;

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
    state.query = e.target.value;
    render(true);
  });

  sortSelect.addEventListener("change", (e) => {
    state.sort = e.target.value;
    render(true);
  });

  movesEl.addEventListener("click", (event) => {
    const loadBtn = event.target.closest(".load-more");
    if (loadBtn) {
      render(false);
      return;
    }

    const card = event.target.closest(".move-card");
    if (!card) return;
    const move = state.detailCache.get(card.dataset.moveName);
    if (!move) return;

    if (window.matchMedia("(max-width: 768px)").matches) {
      openMoveSheet(move);
      return;
    }

    card.classList.toggle("open");
  });

  moveSheetOverlay?.addEventListener("click", (event) => {
    if (event.target === moveSheetOverlay || event.target.hasAttribute("data-close-move-sheet")) {
      closeMoveSheet();
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
