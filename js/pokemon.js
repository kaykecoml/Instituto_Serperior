import { HABITATS } from "./habitats.js";
const BASE_PATH = window.location.hostname.includes("github.io")
  ? "/Instituto_Serperior"
  : "";

const PAGE_SIZE = 24;
let index = 0;

let pokemons = [];
let filtered = [];

async function loadPokemons() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
  const data = await res.json();

  pokemons = data.results.map((p, i) => ({
    dex: i + 1,
    name: capitalize(p.name),
    url: p.url,
    generation: getGeneration(i + 1),
    types: null, // carregaremos sob demanda
  }));

  filtered = [...pokemons];
  render(true);
}

async function loadTypes(pokemon, cardElement) {
  if (!pokemon.types) {
    const res = await fetch(pokemon.url);
    const data = await res.json();
    pokemon.types = data.types.map((t) => t.type.name);
    applyTypeColor(cardElement, pokemon.types);
  }

  const typesContainer = cardElement.querySelector(".types");
  typesContainer.innerHTML = renderTypes(pokemon.types);
}

function loadHabitats() {
  const container = document.getElementById("filter-habitats");

  HABITATS.forEach((h) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${h.id}">
      ${h.nome}
    `;
    container.appendChild(label);
  });
}

async function preloadAllTypes() {
  const promises = pokemons.map(async (p) => {
    if (!p.types) {
      const res = await fetch(p.url);
      const data = await res.json();
      p.types = data.types.map((t) => t.type.name);
    }
  });

  await Promise.all(promises);
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
    loadTypes(p, card);
  });

  document.querySelectorAll(".load-more").forEach((b) => b.remove());

  if (index < filtered.length) {
    list.insertAdjacentHTML(
      "beforeend",
      `
      <button class="load-more">
        Carregar mais Pokémon
      </button>
    `,
    );

    list.querySelector(".load-more").addEventListener("click", (e) => {
      e.stopPropagation();
      render(false);
    });
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
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (isMobile) {
    return types
      .map(
        (t) =>
          `<span class="type-pill type-pill-${t}">${t.toUpperCase()}</span>`,
      )
      .join("");
  }

  return types
    .map(
      (t) =>
        `<img class="type-icon"
          src="assets/types/${t}.png"
          alt="${t}"
          loading="lazy">`,
    )
    .join("");
}

function createCard(p) {
  return `
    <div class="pokemon-card">
      <div class="image-box">
        <img class="official-art"
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.dex}.png"
          loading="lazy"
          alt="${p.name}">
      </div>

      <div class="info">
        <div class="name">
          #${String(p.dex).padStart(3, "0")} ${p.name}
        </div>
        <div class="types"></div>
      </div>
    </div>
  `;
}

function applyTypeColor(card, types) {
  const primary = types[0];

  const colors = {
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

  if (!colors[primary]) return;

  const [rgb, background] = colors[primary];

  card.style.borderColor = `rgba(${rgb}, 0.55)`;
  card.style.background = background;
  card.style.setProperty("--type-border-soft", `rgba(${rgb}, 0.45)`);
}

function searchPokemon(text) {
  const value = text.trim().toLowerCase();

  if (!value) {
    filtered = [...pokemons];
    render(true);
    return;
  }

  // Se for número → navegar direto
  if (!isNaN(value)) {
    const id = Number(value);
    if (id >= 1 && id <= 1025) {
      window.location.href = `pokemon-view.html?id=${id}`;
      return;
    }
  }

  // Se nome exato → navegar
  const exact = pokemons.find((p) => p.name.toLowerCase() === value);

  if (exact) {
    window.location.href = `pokemon-view.html?id=${exact.dex}`;
    return;
  }

  // Caso contrário → filtrar normalmente
  filtered = pokemons.filter((p) => p.name.toLowerCase().includes(value));

  render(true);
}

function openFilters() {
  document.getElementById("filter-modal").classList.remove("hidden");
}

function closeFilters() {
  document.getElementById("filter-modal").classList.add("hidden");
}

async function applyFilters() {
  await preloadAllTypes();

  const types = [
    ...document.querySelectorAll(".filter-types input:checked"),
  ].map((i) => i.value);

  const gens = [...document.querySelectorAll(".filter-gens input:checked")].map(
    (i) => Number(i.value),
  );

  const habitats = [
    ...document.querySelectorAll(".filter-habitats input:checked"),
  ].map((i) => i.value);

  filtered = pokemons.filter((p) => {
    const matchType =
      types.length === 0 || p.types.some((t) => types.includes(t));

    const matchGen = gens.length === 0 || gens.includes(p.generation);

    const matchHabitat =
      habitats.length === 0 ||
      HABITATS.filter((h) => habitats.includes(h.id)).some((h) =>
        h.pokedex.includes(p.dex),
      );

    return matchType && matchGen && matchHabitat;
  });

  render(true);
  closeFilters();
}

/* filtro por geração */
function filterByGen(gen) {
  filtered = gen ? pokemons.filter((p) => p.generation == gen) : [...pokemons];
  render(true);
}

/* filtro por tipo */
function filterByType(select) {
  const selected = [...select.selectedOptions].map((o) => o.value);

  if (!selected.length) {
    filtered = [...pokemons];
  } else {
    filtered = pokemons.filter((p) =>
      selected.every((t) => p.types.includes(t)),
    );
  }

  render(true);
}

function goToPokemon(dex) {
  const id = Number(dex);

  if (!id || id < 1 || id > 1025) return;

  window.location.href = `pokemon-view.html?id=${id}`;
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
  loadHabitats();
  applyResponsiveView();
  loadPokemons();
  window.addEventListener("resize", applyResponsiveView);

  // Pesquisa por nome
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchPokemon(e.target.value);
  });

  // Pesquisa por número
  document.getElementById("dexInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      goToPokemon(e.target.value);
    }
  });

  // Botões
  document
    .getElementById("openFiltersBtn")
    .addEventListener("click", openFilters);

  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", applyFilters);

  document
    .getElementById("closeFiltersBtn")
    .addEventListener("click", closeFilters);
});
