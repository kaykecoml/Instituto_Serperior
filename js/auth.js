import { clearProfile, getProfile, saveProfile } from './storage.js';

function rgbNameMarkup(name) {
  return `<span class="owner-rgb">${name}</span>`;
}

function profileItemHTML(profile) {
  const owner = profile.isOwner || profile.nick === 'kaykecoml';
  return `
    <div class="profile-chip">
      ${profile.avatar ? `<img src="${profile.avatar}" alt="avatar" class="profile-avatar">` : '<div class="profile-avatar fallback">👤</div>'}
      <div>
        <strong>${owner ? rgbNameMarkup(profile.nick) : profile.nick}</strong>
        <small>Conectado localmente</small>
      </div>
    </div>`;
}

function ensureAuthModal() {
  if (document.getElementById('authModal')) return;
  const dialog = document.createElement('dialog');
  dialog.id = 'authModal';
  dialog.className = 'sheet-modal';
  dialog.innerHTML = `
    <div class="modal-head"><h3>Login local</h3><button type="button" data-close-modal="authModal">✕</button></div>
    <div class="auth-modal-body">
      <label>Nick personalizado<input id="authNickInput" maxlength="30" placeholder="Seu nick"></label>
      <label>Imagem de perfil<input id="authAvatarInput" type="file" accept="image/png,image/jpeg,image/gif"></label>
      <div class="inline-row">
        <button id="authSaveBtn" type="button">Entrar</button>
        <button id="authCancelBtn" type="button">Cancelar</button>
      </div>
      <p class="helper-text">Fase 2: este módulo já está preparado para no futuro trocar por OAuth2 do Discord sem quebrar o fluxo local.</p>
    </div>`;
  document.body.appendChild(dialog);
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function buildUserMenu(getLinks) {
  const existing = document.getElementById('userMenuPanel');
  if (existing) existing.remove();
  const panel = document.createElement('div');
  panel.id = 'userMenuPanel';
  panel.className = 'user-menu-panel hidden';
  const links = getLinks?.() || {};
  panel.innerHTML = `
    <button type="button" class="user-menu-link" data-link="characters">Criar personagens</button>
    <button type="button" class="user-menu-link" data-link="school">Criar escola</button>
    <a class="user-menu-link" href="${links.creation || 'creation.html'}">Criar pokemons</a>
    <a class="user-menu-link" href="${links.created || 'created-pokemons.html'}">Pokemons criados</a>
    <button type="button" class="user-menu-link" data-link="created-characters">Personagens criado</button>
    <button type="button" class="user-menu-link danger" id="logoutBtn">Sair</button>`;
  document.body.appendChild(panel);
  panel.querySelectorAll('button[data-link]').forEach((btn) => btn.addEventListener('click', () => alert('Placeholder nesta fase.')));
  panel.querySelector('#logoutBtn')?.addEventListener('click', () => {
    clearProfile();
    window.location.reload();
  });
  return panel;
}

export function initAuthUI({ loginSelector = '.side-menu-login', mountSelector = '.side-menu', linksProvider } = {}) {
  ensureAuthModal();
  const loginBtn = document.querySelector(loginSelector);
  const mount = document.querySelector(mountSelector) || document.body;
  const profile = getProfile();
  const panel = buildUserMenu(linksProvider);

  function refreshBtn() {
    const current = getProfile();
    if (!loginBtn) return;
    if (current) {
      loginBtn.innerHTML = profileItemHTML(current);
      loginBtn.classList.add('is-authenticated');
    } else {
      loginBtn.textContent = 'Logar';
      loginBtn.classList.remove('is-authenticated');
    }
  }

  refreshBtn();

  loginBtn?.addEventListener('click', () => {
    const current = getProfile();
    if (current) {
      panel.classList.toggle('hidden');
      const rect = loginBtn.getBoundingClientRect();
      panel.style.top = `${rect.bottom + window.scrollY + 8}px`;
      panel.style.left = `${Math.max(8, rect.left + window.scrollX - 120)}px`;
      return;
    }
    const modal = document.getElementById('authModal');
    modal?.showModal();
  });

  document.addEventListener('click', (event) => {
    if (!panel.classList.contains('hidden') && !panel.contains(event.target) && event.target !== loginBtn && !loginBtn?.contains(event.target)) {
      panel.classList.add('hidden');
    }
  });

  document.querySelectorAll('[data-close-modal="authModal"], #authCancelBtn').forEach((btn) => {
    btn.addEventListener('click', () => document.getElementById('authModal')?.close());
  });

  document.getElementById('authSaveBtn')?.addEventListener('click', async () => {
    const nick = document.getElementById('authNickInput')?.value.trim();
    if (!nick) return alert('Informe um nick.');
    const file = document.getElementById('authAvatarInput')?.files?.[0];
    const avatar = file ? await fileToDataUrl(file) : '';
    saveProfile({ nick, avatar, isOwner: nick === 'kaykecoml' });
    document.getElementById('authModal')?.close();
    refreshBtn();
  });

  mount.appendChild(panel);
}
