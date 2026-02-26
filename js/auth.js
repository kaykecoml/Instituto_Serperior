import { clearProfile, getProfile, saveProfile } from "./storage.js";

function ownerRGB(profile) {
  return profile?.isOwner || profile?.nick?.toLowerCase() === "kaykecoml";
}

function profileMarkup(profile) {
  const rgbClass = ownerRGB(profile) ? "rgb-owner" : "";
  const avatar = profile?.avatar || "assets/logo.png";
  return `
    <button class="side-menu-btn user-menu-trigger ${rgbClass}" type="button" id="userMenuTrigger">
      <img src="${avatar}" alt="avatar" class="user-avatar"> ${profile.nick}
    </button>
    <div id="userMenuDropdown" class="user-menu-dropdown hidden">
      <button type="button" class="side-menu-btn">Criar personagens</button>
      <button type="button" class="side-menu-btn">Criar escola</button>
      <a class="side-menu-btn" href="creation.html">Criar pokemons</a>
      <a class="side-menu-btn" href="created-pokemons.html">Pokemons criados</a>
      <button type="button" class="side-menu-btn">Personagens criado</button>
      <button type="button" class="side-menu-btn" id="logoutBtn">Sair</button>
    </div>
  `;
}

function buildModal() {
  const modal = document.createElement("dialog");
  modal.id = "authModal";
  modal.className = "sheet-modal";
  modal.innerHTML = `
    <div class="modal-head"><h3>Logar (local)</h3><button type="button" id="closeAuthModal">✕</button></div>
    <div class="auth-body">
      <label>Nick<input id="authNick" maxlength="24" placeholder="Seu nick"></label>
      <label>Imagem de perfil<input id="authAvatar" type="file" accept="image/png,image/jpeg,image/gif"></label>
      <button id="authSaveBtn" type="button">Entrar</button>
      <small>Fase 1 localStorage. Fase 2: preparado para OAuth Discord no futuro.</small>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector("#closeAuthModal")?.addEventListener("click", () => modal.close());
  return modal;
}

async function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export function initAuthUI({ loginButtonSelector = ".side-menu-login", mountSelector = ".side-menu" } = {}) {
  const loginBtn = document.querySelector(loginButtonSelector);
  const mount = document.querySelector(mountSelector);
  if (!mount) return;
  const modal = document.getElementById("authModal") || buildModal();

  const render = () => {
    const profile = getProfile();
    let holder = mount.querySelector(".user-menu-holder");
    if (!holder) {
      holder = document.createElement("div");
      holder.className = "user-menu-holder";
      mount.appendChild(holder);
    }
    holder.innerHTML = profile ? profileMarkup(profile) : "";
    if (loginBtn) loginBtn.hidden = Boolean(profile);

    const trigger = holder.querySelector("#userMenuTrigger");
    const dropdown = holder.querySelector("#userMenuDropdown");
    trigger?.addEventListener("click", () => dropdown?.classList.toggle("hidden"));
    holder.querySelector("#logoutBtn")?.addEventListener("click", () => {
      clearProfile();
      render();
    });
  };

  loginBtn?.addEventListener("click", () => modal.showModal());
  modal.querySelector("#authSaveBtn")?.addEventListener("click", async () => {
    const nick = modal.querySelector("#authNick")?.value?.trim();
    if (!nick) return;
    const file = modal.querySelector("#authAvatar")?.files?.[0];
    const avatar = file ? await fileToDataUrl(file) : "assets/logo.png";
    saveProfile({ nick, avatar, isOwner: nick.toLowerCase() === "kaykecoml" });
    modal.close();
    render();
  });

  render();
}
