import { initAuthUI } from "./auth.js";
import { deleteCreatedPokemon, listCreatedPokemons } from "./storage.js";

const $=(id)=>document.getElementById(id);
function setupMenu(){const b=$("logoMenuBtn"),m=$("sideMenu"),bd=$("sideMenuBackdrop");b?.addEventListener("click",()=>{m?.classList.add("open");bd?.classList.remove("hidden");});bd?.addEventListener("click",()=>{m?.classList.remove("open");bd?.classList.add("hidden");});}
function render(){const list=listCreatedPokemons();$("cards").innerHTML="";$("emptyState").hidden=list.length>0;list.forEach((p)=>{const card=document.createElement("article");card.className="created-card";card.innerHTML=`<div class='card-row'><img src='${p.sprite}' alt='${p.pokemonName}'><div><strong>${p.nickname||p.pokemonName}</strong><p>${p.dex} • Nv.${p.level}</p><p>${p.mode} ${p.shiny?"• shiny":""} ${p.alpha?"• alpha":""}</p><small>${new Date(p.createdAt).toLocaleString("pt-BR")}</small></div></div><div class='card-actions'><a href='creation.html?id=${p.id}'>Abrir</a><button type='button' data-delete='${p.id}'>Excluir</button></div>`;$("cards").appendChild(card);});document.querySelectorAll("[data-delete]").forEach((b)=>b.onclick=()=>{deleteCreatedPokemon(b.dataset.delete);render();});}
setupMenu();initAuthUI();render();
