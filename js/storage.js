const PROFILE_KEY = 'instituto.profile';
const POKEMONS_KEY = 'instituto.createdPokemons';

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProfile() {
  return safeRead(PROFILE_KEY, null);
}

export function saveProfile(profile) {
  safeWrite(PROFILE_KEY, {
    nick: profile.nick,
    avatar: profile.avatar || '',
    isOwner: profile.isOwner || false,
    createdAt: profile.createdAt || Date.now(),
  });
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

export function getCreatedPokemons() {
  return safeRead(POKEMONS_KEY, []);
}

export function getCreatedPokemonsByNick(nick) {
  return getCreatedPokemons().filter((item) => item.profileNick === nick);
}

export function saveCreatedPokemon(payload) {
  const all = getCreatedPokemons();
  const id = payload.id || `pkm_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  const record = { ...payload, id, updatedAt: Date.now(), createdAt: payload.createdAt || Date.now() };
  const idx = all.findIndex((p) => p.id === id);
  if (idx >= 0) all[idx] = record;
  else all.unshift(record);
  safeWrite(POKEMONS_KEY, all);
  return record;
}

export function getCreatedPokemonById(id) {
  return getCreatedPokemons().find((p) => p.id === id) || null;
}

export function deleteCreatedPokemon(id) {
  const filtered = getCreatedPokemons().filter((p) => p.id !== id);
  safeWrite(POKEMONS_KEY, filtered);
}
