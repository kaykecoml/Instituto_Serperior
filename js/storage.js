const PROFILE_KEY = "serperior.profile";
const POKEMON_KEY = "serperior.createdPokemons";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProfile() {
  return readJson(PROFILE_KEY, null);
}

export function saveProfile(profile) {
  writeJson(PROFILE_KEY, profile);
  return profile;
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

export function getProfileId(profile = getProfile()) {
  if (!profile?.nick) return "guest";
  return profile.nick.trim().toLowerCase();
}

export function listCreatedPokemons(profileId = getProfileId()) {
  const all = readJson(POKEMON_KEY, []);
  return all.filter((entry) => entry.profileId === profileId).sort((a, b) => b.createdAt - a.createdAt);
}

export function getCreatedPokemonById(id, profileId = getProfileId()) {
  const all = readJson(POKEMON_KEY, []);
  return all.find((entry) => entry.id === id && entry.profileId === profileId) || null;
}

export function saveCreatedPokemon(payload, profileId = getProfileId()) {
  const all = readJson(POKEMON_KEY, []);
  const now = Date.now();
  const id = payload.id || `pkm-${now}-${Math.random().toString(36).slice(2, 8)}`;
  const next = {
    ...payload,
    id,
    profileId,
    updatedAt: now,
    createdAt: payload.createdAt || now,
  };
  const idx = all.findIndex((entry) => entry.id === id && entry.profileId === profileId);
  if (idx >= 0) all[idx] = next;
  else all.push(next);
  writeJson(POKEMON_KEY, all);
  return next;
}

export function deleteCreatedPokemon(id, profileId = getProfileId()) {
  const all = readJson(POKEMON_KEY, []);
  writeJson(POKEMON_KEY, all.filter((entry) => !(entry.id === id && entry.profileId === profileId)));
}
