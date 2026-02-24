import { powerToDamage } from "./utils.js";

const VERSION_PRIORITY = ["scarlet-violet", "sword-shield", "ultra-sun-ultra-moon", "sun-moon"];
const NATURES = [
  ["Hardy", null, null],["Lonely", "atk", "def"],["Brave", "atk", "spd"],["Adamant", "atk", "spatk"],["Naughty", "atk", "spdef"],
  ["Bold", "def", "atk"],["Docile", null, null],["Relaxed", "def", "spd"],["Impish", "def", "spatk"],["Lax", "def", "spdef"],
  ["Timid", "spd", "atk"],["Hasty", "spd", "def"],["Serious", null, null],["Jolly", "spd", "spatk"],["Naive", "spd", "spdef"],
  ["Modest", "spatk", "atk"],["Mild", "spatk", "def"],["Quiet", "spatk", "spd"],["Bashful", null, null],["Rash", "spatk", "spdef"],
  ["Calm", "spdef", "atk"],["Gentle", "spdef", "def"],["Sassy", "spdef", "spd"],["Careful", "spdef", "spatk"],["Quirky", null, null],
].map(([name, plus, minus]) => ({ name, plus, minus }));
const STAT_KEYS = ["hp", "atk", "def", "spatk", "spdef", "spd"];
const STAT_LABELS = { hp: "Saúde", atk: "Ataque", def: "Defesa", spatk: "Ataque Esp.", spdef: "Defesa Esp.", spd: "Velocidade" };

const state = {
  mode: "wild",
  pokemonIndex: [],
  pokemon: null,
  species: null,
  levelMoves: [],
  tmMoves: [],
  selectedLevelMoves: [],
  selectedTmMoves: [],
  moveCache: new Map(),
};

const $ = (id) => document.getElementById(id);

function convertStat(value) {
  const base = Math.floor(value / 10);
  return value % 10 >= 9 ? base + 1 : base;
}
function formatName(name) {
  return name.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}
function notify(msg) { alert(msg); }

function setupMenu() {
  const btn = $("logoMenuBtn");
  const menu = $("sideMenu");
  const backdrop = $("sideMenuBackdrop");
  btn?.addEventListener("click", () => { menu?.classList.add("open"); backdrop?.classList.remove("hidden"); menu?.setAttribute("aria-hidden", "false"); });
  backdrop?.addEventListener("click", () => { menu?.classList.remove("open"); backdrop?.classList.add("hidden"); menu?.setAttribute("aria-hidden", "true"); });
}

async function fetchPokemonIndex() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025").then((r) => r.json());
  state.pokemonIndex = response.results.map((p, idx) => ({ id: idx + 1, name: p.name }));
}

function setupModes() {
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.mode = btn.dataset.mode;
      document.querySelectorAll(".mode-btn").forEach((el) => el.classList.toggle("active", el === btn));
      document.querySelectorAll(".mode-only").forEach((el) => { el.hidden = el.dataset.modeOnly !== state.mode; });
      renderSheet();
    });
  });
  document.querySelector('.mode-btn[data-mode="wild"]').click();
}

function setupSearch() {
  const input = $("speciesSearch");
  input.addEventListener("input", updatePreview);
  $("speciesSearchBtn").addEventListener("click", async () => {
    const query = input.value.trim().toLowerCase();
    if (!query) return;
    await loadSpecies(query);
  });
}

function updatePreview() {
  const q = $("speciesSearch").value.trim().toLowerCase();
  const preview = $("speciesPreview");
  preview.innerHTML = "";
  if (!q) return;
  const list = state.pokemonIndex.filter((p) => p.name.includes(q) || String(p.id).startsWith(q)).slice(0, 8);
  list.forEach((p) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preview-item";
    btn.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png" alt="${p.name}"><span>#${String(p.id).padStart(4, "0")} ${formatName(p.name)}</span>`;
    btn.addEventListener("click", () => loadSpecies(String(p.id)));
    preview.appendChild(btn);
  });
}

function pickVersion(details) {
  return [...details].sort((a, b) => VERSION_PRIORITY.indexOf(a.version_group.name) - VERSION_PRIORITY.indexOf(b.version_group.name))[0];
}

async function getMove(url) {
  if (state.moveCache.has(url)) return state.moveCache.get(url);
  const data = await fetch(url).then((r) => r.json());
  state.moveCache.set(url, data);
  return data;
}

async function loadSpecies(idOrName) {
  const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`).then((r) => r.json());
  const species = await fetch(pokemon.species.url).then((r) => r.json());
  state.pokemon = pokemon;
  state.species = species;
  state.selectedLevelMoves = [];
  state.selectedTmMoves = [];
  $("sheetEmpty").hidden = true;
  $("sheetContent").hidden = false;
  $("basicControls").hidden = false;
  $("movesSection").hidden = false;
  fillBasics();
  await buildMovePools();
  renderMoveOptions();
  renderSelectedMoves();
  renderSheet();
}

function fillBasics() {
  const gender = $("genderSelect");
  gender.innerHTML = "";
  if (state.species.gender_rate === -1) {
    gender.innerHTML = '<option value="genderless">Sem gênero</option>';
  } else {
    gender.innerHTML = '<option value="male">Masculino</option><option value="female">Feminino</option>';
  }
  const abilities = state.pokemon.abilities.map((a) => formatName(a.ability.name));
  $("ability1").innerHTML = abilities.map((a) => `<option>${a}</option>`).join("");
  $("ability2").innerHTML = abilities.map((a) => `<option>${a}</option>`).join("");
  const natures = NATURES.map((n) => `<option value="${n.name}">${n.name}</option>`).join("");
  $("natureSelect").innerHTML = natures;
  ["levelInput", "natureSelect", "ability1", "ability2", "genderSelect", "shinyToggle", "nicknameInput", "loyaltyInput"].forEach((id) => {
    const el = $(id); if (!el) return; el.oninput = () => renderSheet(); el.onchange = () => renderSheet();
  });
  const alpha = $("alphaToggle");
  if (alpha) {
    alpha.onchange = async () => {
      if (alpha.checked) applyAlphaMoveRule();
      await renderSelectedMoves();
      renderSheet();
    };
  }
  enforceAbilityRule();
  $("levelInput").addEventListener("input", async () => {
    enforceAbilityRule();
    renderMoveOptions();
    if ($("alphaToggle")?.checked) applyAlphaMoveRule();
    await renderSelectedMoves();
    renderSheet();
  });
}

function enforceAbilityRule() {
  const level = Number($("levelInput").value || 1);
  const wrap = $("ability2Wrap");
  wrap.hidden = level < 40;
}

async function buildMovePools() {
  state.levelMoves = [];
  state.tmMoves = [];
  for (const mv of state.pokemon.moves) {
    const version = pickVersion(mv.version_group_details);
    if (!version) continue;
    const method = version.move_learn_method.name;
    const entry = { name: mv.move.name, url: mv.move.url, level: version.level_learned_at, method };
    if (method === "level-up") state.levelMoves.push(entry);
    if (["machine", "tutor", "egg"].includes(method)) state.tmMoves.push(entry);
  }
  state.levelMoves.sort((a, b) => a.level - b.level);
}

function renderMoveOptions() {
  const level = Number($("levelInput").value || 1);
  const levelOptions = state.levelMoves.filter((m) => m.level <= level);
  $("levelMoveSelect").innerHTML = levelOptions.map((m) => `<option value="${m.name}">${formatName(m.name)} (Nv ${m.level})</option>`).join("");
  $("tmMoveSelect").innerHTML = state.tmMoves.map((m) => `<option value="${m.name}">${formatName(m.name)} (${m.method.toUpperCase()})</option>`).join("");
}

function setupMoveActions() {
  $("addLevelMoveBtn").addEventListener("click", () => addMove("level"));
  $("addTmMoveBtn").addEventListener("click", () => addMove("tm"));
}

function addMove(type) {
  const select = type === "level" ? $("levelMoveSelect") : $("tmMoveSelect");
  const target = type === "level" ? state.selectedLevelMoves : state.selectedTmMoves;
  if (!select.value) return;
  if (target.includes(select.value)) return;
  if (target.length >= 4) return notify("Limite de 4 golpes nesse grupo.");
  target.push(select.value);
  if (state.mode === "wild" && $("alphaToggle").checked) applyAlphaMoveRule();
  renderSelectedMoves();
}

function applyAlphaMoveRule() {
  const level = Number($("levelInput").value || 1);
  const available = state.levelMoves.filter((m) => m.level <= level);
  if (!available.length) return;
  const alphaMove = available[available.length - 1].name;
  if (state.selectedLevelMoves.includes(alphaMove)) return;
  if (state.selectedLevelMoves.length < 4) state.selectedLevelMoves.push(alphaMove);
  else state.selectedLevelMoves[3] = alphaMove;
}

async function renderSelectedMoves() {
  const all = [...state.selectedLevelMoves, ...state.selectedTmMoves];
  const pokeTypes = state.pokemon?.types.map((t) => t.type.name) || [];
  const level = Number($("levelInput").value || 1);
  const stabBonus = Math.floor(level / 5);

  const renderList = async (containerId, moves) => {
    const ul = $(containerId);
    ul.innerHTML = "";
    for (const name of moves) {
      const entry = state.levelMoves.find((m) => m.name === name) || state.tmMoves.find((m) => m.name === name);
      const li = document.createElement("li");
      const remove = document.createElement("button");
      remove.textContent = "Remover";
      remove.type = "button";
      remove.addEventListener("click", () => {
        const target = containerId === "levelMoveSlots" ? state.selectedLevelMoves : state.selectedTmMoves;
        target.splice(target.indexOf(name), 1);
        renderSelectedMoves();
      });
      const moveData = entry ? await getMove(entry.url) : null;
      const isStatus = !moveData?.power;
      const baseDamage = powerToDamage(moveData?.power);
      const stab = moveData && pokeTypes.includes(moveData.type.name) && !isStatus;
      const damageText = isStatus ? "—" : stab ? `${baseDamage} + ${stabBonus}` : baseDamage;
      li.innerHTML = `<strong>${formatName(name)}</strong> • ${entry?.method || "level-up"} • Dano: ${damageText}`;
      li.appendChild(remove);
      ul.appendChild(li);
    }
  };

  await renderList("levelMoveSlots", state.selectedLevelMoves);
  await renderList("tmMoveSlots", state.selectedTmMoves);

  const output = $("selectedMovesOutput");
  output.innerHTML = "";
  for (const moveName of all) {
    const li = document.createElement("li");
    li.textContent = formatName(moveName);
    output.appendChild(li);
  }
}

function getNature() {
  const name = $("natureSelect").value;
  return NATURES.find((n) => n.name === name) || NATURES[0];
}

function getBaseStats() {
  const raw = {};
  state.pokemon.stats.forEach((s) => {
    if (s.stat.name === "special-attack") raw.spatk = convertStat(s.base_stat);
    else if (s.stat.name === "special-defense") raw.spdef = convertStat(s.base_stat);
    else if (s.stat.name === "speed") raw.spd = convertStat(s.base_stat);
    else if (s.stat.name === "attack") raw.atk = convertStat(s.base_stat);
    else if (s.stat.name === "defense") raw.def = convertStat(s.base_stat);
    else if (s.stat.name === "hp") raw.hp = convertStat(s.base_stat);
  });
  return raw;
}

function autoDistribute(base, points) {
  const gains = Object.fromEntries(STAT_KEYS.map((k) => [k, 0]));
  const ranking = [...STAT_KEYS].sort((a, b) => base[b] - base[a] || STAT_KEYS.indexOf(a) - STAT_KEYS.indexOf(b));
  for (let i = 0; i < points; i++) gains[ranking[i % ranking.length]] += 1;
  return gains;
}

function getAllocatedStats(base) {
  const points = Number($("levelInput").value || 1);
  const gains = Object.fromEntries(STAT_KEYS.map((k) => [k, 0]));
  if (state.mode === "wild" || state.mode === "quick") {
    Object.assign(gains, autoDistribute(base, points));
  }
  if (state.mode === "trained") {
    STAT_KEYS.forEach((k) => {
      gains[k] = Number($(`alloc-${k}`)?.value || 0);
    });
  }
  if (state.mode === "wild" && $("alphaToggle").checked) {
    const top = [...STAT_KEYS].sort((a, b) => base[b] - base[a] || STAT_KEYS.indexOf(a) - STAT_KEYS.indexOf(b)).slice(0, 2);
    gains[top[0]] += 5;
    gains[top[1]] += 5;
  }
  return { gains, points };
}

function ensureTrainedInputs(base, points) {
  const list = $("levelStatsList");
  if (state.mode !== "trained") return;
  if (list.querySelector("input")) return;
  list.innerHTML = "";
  STAT_KEYS.forEach((k) => {
    const li = document.createElement("li");
    li.innerHTML = `${STAT_LABELS[k]}: <input id="alloc-${k}" type="number" min="0" max="${points}" value="0">`;
    list.appendChild(li);
  });
  list.querySelectorAll("input").forEach((inp) => inp.addEventListener("input", renderSheet));
}

function renderSheet() {
  if (!state.pokemon) return;
  const base = getBaseStats();
  const points = Number($("levelInput").value || 1);
  ensureTrainedInputs(base, points);
  const { gains } = getAllocatedStats(base);
  const nature = getNature();

  const finalStats = Object.fromEntries(STAT_KEYS.map((k) => [k, base[k] + gains[k]]));
  if (nature.plus) finalStats[nature.plus] += 2;
  if (nature.minus) finalStats[nature.minus] -= 2;

  $("sheetSprite").src = $("shinyToggle").checked
    ? (state.pokemon.sprites.other["official-artwork"].front_shiny || state.pokemon.sprites.front_shiny)
    : (state.pokemon.sprites.other["official-artwork"].front_default || state.pokemon.sprites.front_default);
  $("sheetName").textContent = (state.mode === "trained" && $("nicknameInput").value.trim())
    ? `${$("nicknameInput").value.trim()} (${formatName(state.pokemon.name)})`
    : formatName(state.pokemon.name);
  $("sheetMeta").textContent = `Nv ${points} • ${$("genderSelect").value} • Nature: ${nature.name}`;
  $("sheetModeLabel").textContent = `Modo: ${state.mode === "wild" ? "Selvagem" : state.mode === "trained" ? "Adestrado" : "Geração Rápida"}`;

  const baseList = $("baseStatsList");
  const gainsList = $("levelStatsList");
  const finalList = $("finalStatsList");

  baseList.innerHTML = "";
  if (state.mode !== "trained") gainsList.innerHTML = "";
  finalList.innerHTML = "";

  STAT_KEYS.forEach((k) => {
    baseList.innerHTML += `<li>${STAT_LABELS[k]}: <strong>${base[k]}</strong></li>`;
    if (state.mode !== "trained") gainsList.innerHTML += `<li>${STAT_LABELS[k]}: +${gains[k]}</li>`;
    const natureClass = nature.plus === k ? "stat-positive" : nature.minus === k ? "stat-negative" : "";
    finalList.innerHTML += `<li class="${natureClass}">${STAT_LABELS[k]}: <strong>${finalStats[k]}</strong></li>`;
  });

  const hpStat = finalStats.hp;
  const hp1 = (hpStat + points) * 4;
  const hp2 = points + hpStat * 3;
  $("hp1Text").textContent = `${hp1} / ${hp1}`;
  $("hp2Text").textContent = `${hp2} / ${hp2}`;
}

function setupQuickGeneration() {
  $("quickGenerateBtn").addEventListener("click", async () => {
    if (!state.pokemonIndex.length) return;
    const random = state.pokemonIndex[Math.floor(Math.random() * state.pokemonIndex.length)];
    await loadSpecies(String(random.id));
    $("levelInput").value = Math.floor(Math.random() * 100) + 1;
    $("natureSelect").value = NATURES[Math.floor(Math.random() * NATURES.length)].name;
    renderMoveOptions();
    state.selectedLevelMoves = state.levelMoves.filter((m) => m.level <= Number($("levelInput").value)).slice(-4).map((m) => m.name);
    state.selectedTmMoves = state.tmMoves.slice(0, 4).map((m) => m.name);
    await renderSelectedMoves();
    renderSheet();
  });
}

function getSheetPayload() {
  const base = getBaseStats();
  const { gains, points } = getAllocatedStats(base);
  const unspent = state.mode === "trained" ? Math.max(points - Object.values(gains).reduce((a, b) => a + b, 0), 0) : 0;
  if (unspent > 0) notify(`Ainda faltam ${unspent} pontos para distribuir.`);
  const nature = getNature();
  return {
    mode: state.mode,
    pokemon: state.pokemon.name,
    level: points,
    shiny: $("shinyToggle").checked,
    gender: $("genderSelect").value,
    abilities: [$("ability1").value, $("ability2Wrap").hidden ? null : $("ability2").value].filter(Boolean),
    nickname: $("nicknameInput")?.value || "",
    loyalty: Number($("loyaltyInput")?.value || 0),
    alpha: $("alphaToggle")?.checked || false,
    nature,
    base,
    gains,
    moves: { level: [...state.selectedLevelMoves], tm: [...state.selectedTmMoves] },
  };
}

function setupExport() {
  $("copySheetBtn").addEventListener("click", async () => {
    const payload = getSheetPayload();
    const text = `[${formatName(payload.pokemon)}] Nv.${payload.level} (${payload.mode})\nNature: ${payload.nature.name}\nHabilidades: ${payload.abilities.join(", ")}\nLealdade: ${payload.loyalty}\nBase: ${JSON.stringify(payload.base)}\nGanhos: ${JSON.stringify(payload.gains)}`;
    await navigator.clipboard.writeText(text);
    notify("Ficha copiada!");
  });
  $("copyMovesBtn").addEventListener("click", async () => {
    const payload = getSheetPayload();
    const text = [...payload.moves.level, ...payload.moves.tm].map((m) => `- ${formatName(m)}`).join("\n");
    await navigator.clipboard.writeText(text);
    notify("Golpes copiados!");
  });
  $("saveJsonBtn").addEventListener("click", () => {
    const payload = getSheetPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${payload.pokemon}-ficha.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

async function init() {
  setupMenu();
  setupModes();
  setupSearch();
  setupMoveActions();
  setupQuickGeneration();
  setupExport();
  await fetchPokemonIndex();
}

init();
