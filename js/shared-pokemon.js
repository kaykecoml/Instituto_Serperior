export const STAT_KEYS = ["hp", "atk", "def", "spatk", "spdef", "spd"];
export const STAT_LABELS = { hp: "Saúde", atk: "Atk", def: "Def", spatk: "Sp.Atk", spdef: "Sp.Def", spd: "Spd" };
export const INT_LABELS = ["Instintivo", "Consciente", "Racional", "Estrategista", "Gênio"];
export const STR_LABELS = ["Frágil", "Subdesenvolvida", "Robusta", "Poderosa", "Titânica"];
export const MOV_LABELS = ["Estático", "Lento", "Ágil", "Atlético", "Veloz"];

export function convertStat(value) {
  const base = Math.floor(value / 10);
  return value % 10 >= 9 ? base + 1 : base;
}

export function getRpgStatsFromPokemon(pokemon) {
  const raw = {};
  (pokemon?.stats || []).forEach((s) => (raw[s.stat.name] = s.base_stat));
  return {
    hp: convertStat(raw.hp || 0),
    atk: convertStat(raw.attack || 0),
    def: convertStat(raw.defense || 0),
    spatk: convertStat(raw["special-attack"] || 0),
    spdef: convertStat(raw["special-defense"] || 0),
    spd: convertStat(raw.speed || 0),
  };
}

function sumFromList(list = [], rules) {
  let total = 0;
  for (const item of list) if (rules[item] !== undefined) total += rules[item];
  return total;
}
function clampCapacity(value) { return Math.max(0, Math.min(4, value)); }

export function calcIntelligence(meta) {
  let value = 0;
  value += sumFromList(meta.types, { psychic: 2, fighting: 1, ghost: 1, fairy: 1, dark: 1, bug: -1, rock: -1, ground: -1, ice: -1, normal: -1 });
  value += sumFromList(meta.eggGroups, { humanshape: 1, amorphous: 1, mineral: 1, "no-eggs": 1, grass: -1, water2: -1, water3: -1, bug: -1, monster: -1 });
  if (meta.stats.spatk <= 2) value -= 1; else if (meta.stats.spatk >= 10) value += 1;
  if (meta.isLegendary) value += 1;
  if (meta.isFinalStage || meta.isSingleStage) value += 1;
  return clampCapacity(value);
}
export function calcStrength(meta) {
  let value = 0;
  value += sumFromList(meta.types, { fighting: 1, ice: 1, rock: 1, steel: 1, dragon: 1, fairy: -1, bug: -1, ghost: -1 });
  value += sumFromList(meta.eggGroups, { monster: 1, dragon: 1, mineral: 1, "no-eggs": 1, humanshape: 1, amorphous: -1, bug: -1, grass: -1 });
  if (meta.stats.atk <= 2) value -= 1; else if (meta.stats.atk >= 10) value += 1;
  if (meta.weight >= 80) value += 1;
  if (meta.weight <= 20) value -= 1;
  if (meta.isLegendary) value += 1;
  if (meta.isFinalStage || meta.isSingleStage) value += 1;
  return clampCapacity(value);
}
export function calcMovement(meta) {
  let value = 1;
  value += sumFromList(meta.types, { electric: 2, fire: 1, dragon: 1, flying: 1, bug: 1, fighting: 1, rock: -1, ice: -1, steel: -1 });
  value += sumFromList(meta.eggGroups, { field: 1, dragon: 1, flying: 1, humanshape: 1, "no-eggs": 1, monster: -1, ditto: -1, mineral: -1 });
  if (meta.stats.spd <= 5) value -= 1; else if (meta.stats.spd >= 10) value += 1;
  if (meta.isLegendary) value += 1;
  if (meta.isFinalStage || meta.isSingleStage) value += 1;
  return clampCapacity(value);
}
