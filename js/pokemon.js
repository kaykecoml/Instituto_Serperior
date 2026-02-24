import { HABITATS } from "./habitats.js";

const PAGE_SIZE = 24;
const MAX_POKEMON_ID = 1025;
const FAVORITES_KEY = "favoritePokemons";
let index = 0;
let pokemons = [];
let filtered = [];
let pokemonIndex = [];
let favorites = new Set();
const pokemonDataCache = new Map();
const typePokemonIdsCache = new Map();
const habitatPokemonMap = new Map(HABITATS.map((h) => [h.id, new Set(h.pokedex)]));
const favoritesMode = window.location.pathname.endsWith("favoritos.html");

const TYPE_OPTIONS = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

const TYPE_ICON_PATHS = {
  bug: "assets/types block/bug Type.png",
  steel: "assets/types block/Steel.png",
};

const TYPE_COLORS = {
  grass: ["120,200,80", "rgba(120,200,80,0.16)"],
  fire: ["240,120,40", "rgba(240,120,40,0.16)"],
  water: ["100,150,240", "rgba(100,150,240,0.16)"],
  electric: ["248,208,48", "rgba(248,208,48,0.16)"],
  psychic: ["248,88,136", "rgba(248,88,136,0.16)"],
  dark: ["112,88,72", "rgba(112,88,72,0.16)"],
  dragon: ["112,56,248", "rgba(112,56,248,0.16)"],
  fairy: ["238,153,172", "rgba(238,153,172,0.16)"],
  steel: ["184,184,208", "rgba(184,184,208,0.16)"],
  ghost: ["112,88,152", "rgba(112,88,152,0.16)"],
  ice: ["152,216,216", "rgba(152,216,216,0.16)"],
  fighting: ["192,48,40", "rgba(192,48,40,0.16)"],
  ground: ["224,192,104", "rgba(224,192,104,0.16)"],
  rock: ["184,160,56", "rgba(184,160,56,0.16)"],
  poison: ["160,64,160", "rgba(160,64,160,0.16)"],
  flying: ["168,144,240", "rgba(168,144,240,0.16)"],
  bug: ["168,184,32", "rgba(168,184,32,0.16)"],
  normal: ["168,168,120", "rgba(168,168,120,0.16)"],
};

function getTypeIconPath(type) {
  return TYPE_ICON_PATHS[type] || `assets/types block/${type}.png`;
}

function loadFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    favorites = new Set(stored.filter((id) => Number.isInteger(id)));
  } catch {
    favorites = new Set();
  }
}

function persistFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

async function getPokemonData(pokemon) {
  if (pokemonDataCache.has(pokemon.url)) return pokemonDataCache.get(pokemon.url);
  const data = await fetch(pokemon.url).then((res) => res.json());
  pokemonDataCache.set(pokemon.url, data);
  return data;
}

async function getIdsByType(type) {
  if (typePokemonIdsCache.has(type)) return typePokemonIdsCache.get(type);
  const typeData = await fetch(`https://pokeapi.co/api/v2/type/${type}`).then((res) => res.json());
  const ids = new Set(
    typeData.pokemon
      .map((entry) => Number(entry.pokemon.url.split("/").filter(Boolean).pop()))
      .filter((id) => Number.isInteger(id) && id <= MAX_POKEMON_ID),
  );
  typePokemonIdsCache.set(type, ids);
  return ids;
}

async function loadPokemons() {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON_ID}`);
  const data = await res.json();

  pokemons = data.results.map((p, i) => ({
    dex: i + 1,
    name: capitalize(p.name),
    url: p.url,
    generation: getGeneration(i + 1),
    types: null,
  }));

  pokemonIndex = pokemons.map((p) => ({ id: p.dex, name: p.name.toLowerCase() }));
  filtered = favoritesMode ? pokemons.filter((p) => favorites.has(p.dex)) : [...pokemons];
  render(true);
}

function renderFilterTypes() {
  const container = document.getElementById("filter-types");
  container.innerHTML = TYPE_OPTIONS.map((type) => `
    <label data-type="${type}">
      <input type="checkbox" value="${type}">
      <img src="${getTypeIconPath(type)}" alt="${type}">
    </label>
  `).join("");

  container.querySelectorAll("label").forEach((label) => {
    const input = label.querySelector("input");
    input.addEventListener("change", () => {
      label.classList.toggle("is-selected", input.checked);
    });
  });
}

function loadHabitats() {
  const container = document.getElementById("filter-habitats");
  HABITATS.forEach((h) => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${h.id}"> ${h.nome}`;
    container.appendChild(label);
  });
}

async function loadTypes(pokemon, cardElement) {
  if (!pokemon.types) {
    const data = await getPokemonData(pokemon);
    pokemon.types = data.types.map((t) => t.type.name);
  }
  applyTypeColor(cardElement, pokemon.types);
  const typesContainer = cardElement.querySelector(".types");
  typesContainer.innerHTML = renderTypes(pokemon.types);
}

function render(reset) {
  const list = document.getElementById("pokemon-list");
  applyResponsiveView();
  if (reset) {
    list.innerHTML = "";
    index = 0;
  }

  const slice = filtered.slice(index, index + PAGE_SIZE);
  index += PAGE_SIZE;

  slice.forEach((p) => {
    list.insertAdjacentHTML("beforeend", createCard(p));
    const card = list.lastElementChild;
    card.addEventListener("click", () => {
      window.location.href = `pokemon-view.html?id=${p.dex}`;
    });

    const favoriteBtn = card.querySelector(".favorite-btn");
    favoriteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavorite(p.dex, favoriteBtn);
    });

    loadTypes(p, card);
  });

  document.querySelectorAll(".load-more").forEach((b) => b.remove());
  if (index < filtered.length) {
    list.insertAdjacentHTML("beforeend", `<button class="load-more">Carregar mais Pokémon</button>`);
    list.querySelector(".load-more").addEventListener("click", (e) => {
      e.stopPropagation();
      render(false);
    });
  }
}

function toggleFavorite(dex, button) {
  if (favorites.has(dex)) {
    favorites.delete(dex);
  } else {
    favorites.add(dex);
  }
  persistFavorites();
  if (button) {
    button.querySelector("img").src = favorites.has(dex) ? "assets/favorit.png" : "assets/nofavorit.png";
  }

  if (favoritesMode) {
    filtered = filtered.filter((pokemon) => favorites.has(pokemon.dex));
    render(true);
  }
}

function applyResponsiveView() {
  const list = document.getElementById("pokemon-list");
  if (!list) return;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  list.classList.toggle("list", isMobile);
  list.classList.toggle("catalog", !isMobile);
}

function renderTypes(types) {
  return types.map((t) => `
    <span class="type-pill type-pill-${t}" style="--type-rgb:${TYPE_COLORS[t]?.[0] || "80,80,80"}">
      <img class="type-icon" src="${getTypeIconPath(t)}" alt="${t}" loading="lazy">${t.toUpperCase()}
    </span>`).join("");
}

function createCard(p) {
  const favoriteIcon = favorites.has(p.dex) ? "assets/favorit.png" : "assets/nofavorit.png";
  const dexNumber = `#${String(p.dex).padStart(3, "0")}`;
  return `<div class="pokemon-card"><button class="favorite-btn" aria-label="Favoritar ${p.name}" type="button"><img src="${favoriteIcon}" alt="Favorito"></button><div class="image-box"><img class="official-art" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.dex}.png" loading="lazy" alt="${p.name}"></div><div class="info"><div class="dex-number">${dexNumber}</div><div class="name">${p.name}</div><div class="types"></div></div></div>`;
}

function applyTypeColor(card, types) {
  const primary = types[0];
  if (!TYPE_COLORS[primary]) return;
  const [rgb, background] = TYPE_COLORS[primary];
  card.style.borderColor = `rgba(${rgb}, 0.55)`;
  card.style.background = background;
  card.style.setProperty("--type-border-soft", `rgba(${rgb}, 0.45)`);
}

function searchPokemon(text) {
  const value = text.trim().toLowerCase();
  const source = favoritesMode ? pokemons.filter((p) => favorites.has(p.dex)) : pokemons;
  if (!value) {
    filtered = [...source];
    render(true);
    return;
  }
  filtered = source.filter((p) => p.name.toLowerCase().includes(value) || String(p.dex).startsWith(value));
  render(true);
}

function goToPokemonBySearch() {
  const nameValue = document.getElementById("searchInput").value.trim().toLowerCase();
  const dexValue = document.getElementById("dexInput").value.trim();
  const query = nameValue || dexValue;
  if (!query) return;

  if (!Number.isNaN(Number(query))) {
    const id = Number(query);
    const allowed = !favoritesMode || favorites.has(id);
    if (id >= 1 && id <= MAX_POKEMON_ID && allowed) {
      window.location.href = `pokemon-view.html?id=${id}`;
      return;
    }
  }

  const found = pokemons.find((p) => p.name.toLowerCase() === query && (!favoritesMode || favorites.has(p.dex)));
  if (found) window.location.href = `pokemon-view.html?id=${found.dex}`;
}

function updateSearchPreview() {
  const nameInput = document.getElementById("searchInput");
  const dexInput = document.getElementById("dexInput");
  const preview = document.getElementById("search-preview");
  const query = nameInput.value.trim().toLowerCase() || dexInput.value.trim();
  preview.innerHTML = "";
  if (!query) return;

  const candidates = pokemonIndex
    .filter((p) => (!favoritesMode || favorites.has(p.id)) && (p.name.includes(query) || String(p.id).startsWith(query)))
    .slice(0, 6);
  if (!candidates.length) return;

  const list = document.createElement("div");
  list.className = "preview-list";
  candidates.forEach((found) => {
    const card = document.createElement("button");
    card.className = "preview-card";
    card.type = "button";
    card.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${found.id}.png" alt="${found.name}"><span>#${String(found.id).padStart(4, "0")} ${capitalize(found.name)}</span>`;
    card.onclick = () => {
      window.location.href = `pokemon-view.html?id=${found.id}`;
    };
    list.appendChild(card);
  });
  preview.appendChild(list);
}

function openFilters() {
  document.getElementById("filter-modal").classList.remove("hidden");
}

function closeFilters() {
  document.getElementById("filter-modal").classList.add("hidden");
}

async function applyFilters() {
  const types = [...document.querySelectorAll(".filter-types input:checked")].map((i) => i.value);
  const gens = [...document.querySelectorAll(".filter-gens input:checked")].map((i) => Number(i.value));
  const habitats = [...document.querySelectorAll(".filter-habitats input:checked")].map((i) => i.value);
  const baseList = favoritesMode ? pokemons.filter((p) => favorites.has(p.dex)) : pokemons;

  let typeAllowedIds = null;
  if (types.length) {
    const sets = await Promise.all(types.map((type) => getIdsByType(type)));
    typeAllowedIds = new Set();
    sets.forEach((set) => set.forEach((id) => typeAllowedIds.add(id)));
  }

  const habitatAllowedIds = habitats.length
    ? new Set(habitats.flatMap((habitatId) => [...(habitatPokemonMap.get(habitatId) || [])]))
    : null;

  filtered = baseList.filter((p) => {
    const matchType = !typeAllowedIds || typeAllowedIds.has(p.dex);
    const matchGen = gens.length === 0 || gens.includes(p.generation);
    const matchHabitat = !habitatAllowedIds || habitatAllowedIds.has(p.dex);
    return matchType && matchGen && matchHabitat;
  });

  render(true);
  closeFilters();
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

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getGeneration(dex) {
  if (dex <= 151) return 1;
  if (dex <= 251) return 2;
  if (dex <= 386) return 3;
  if (dex <= 493) return 4;
  if (dex <= 649) return 5;
  if (dex <= 721) return 6;
  if (dex <= 809) return 7;
  if (dex <= 905) return 8;
  return 9;
}

document.addEventListener("DOMContentLoaded", () => {
  loadFavorites();
  setupSiteTitleAnimation();
  setupSideMenu();
  renderFilterTypes();
  loadHabitats();
  applyResponsiveView();
  loadPokemons();
  window.addEventListener("resize", applyResponsiveView);

  const pageTitle = document.querySelector(".section-home-link");
  if (favoritesMode && pageTitle) {
    pageTitle.textContent = "Favoritos";
  }

  const nameInput = document.getElementById("searchInput");
  const dexInput = document.getElementById("dexInput");
  nameInput.addEventListener("input", (e) => {
    searchPokemon(e.target.value);
    updateSearchPreview();
  });
  dexInput.addEventListener("input", updateSearchPreview);
  dexInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") goToPokemonBySearch();
  });
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") goToPokemonBySearch();
  });

  document.getElementById("searchBtn").addEventListener("click", goToPokemonBySearch);
  document.getElementById("openFiltersBtn").addEventListener("click", openFilters);
  document.getElementById("applyFiltersBtn").addEventListener("click", applyFilters);
  document.getElementById("closeFiltersBtn").addEventListener("click", closeFilters);
});
