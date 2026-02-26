import { powerToDamage, accuracyToRPG, ppToRPG } from "./utils.js";
import { abilitiesData } from "./abilities.js";
import { initAuthUI } from "./auth.js";
import { getProfile, saveCreatedPokemon, getCreatedPokemonById } from "./storage.js";

const STAT_KEYS = ["hp", "atk", "def", "spatk", "spdef", "spd"];
const STAT_LABELS = { hp: "Saúde", atk: "Ataque", def: "Defesa", spatk: "Sp.Atk", spdef: "Sp.Def", spd: "Velocidade" };
const VERSION_PRIORITY = ["scarlet-violet", "sword-shield", "ultra-sun-ultra-moon", "sun-moon"];
const POKEBALLS = ["pokeball", "great-ball", "ultra-ball", "premier-ball", "luxury-ball", "timer-ball"];
const XP_TABLE = {1:0,2:10,3:20,4:30,5:40,6:50,7:60,8:70,9:80,10:90,11:110,12:135,13:160,14:190,15:220,16:250,17:285,18:320,19:360,20:400,21:460,22:530,23:600,24:670,25:745,26:820,27:900,28:990,29:1075,30:1165,31:1260,32:1355,33:1455,34:1555,35:1660,36:1770,37:1880,38:1995,39:2110,40:2230,41:2355,42:2480,43:2610,44:2740,45:2875,46:3015,47:3155,48:3300,49:3445,50:3645,51:3850,52:4060,53:4270,54:4485,55:4705,56:4930,57:5160,58:5390,59:5625,60:5865,61:6110,62:6360,63:6610,64:6865,65:7125,66:7390,67:7660,68:7925,69:8205,70:8485,71:8770,72:9060,73:9350,74:9645,75:9945,76:10250,77:10560,78:10870,79:11185,80:11505,81:11910,82:12320,83:12735,84:13155,85:13580,86:14010,87:14445,88:14885,89:15330,90:15780,91:16235,92:16695,93:17160,94:17630,95:18105,96:18585,97:19070,98:19560,99:20055,100:20555};
const NATURES = [["Hardy",null,null,"Estoica","Neutra"],["Lonely","atk","def","Desesperada","Gosta de Picante e não gosta de Azedo"],["Brave","atk","spd","Travessa","Gosta de Picante e não gosta de Doce"],["Adamant","atk","spatk","Solitária","Gosta de Picante e não gosta de Seco"],["Naughty","atk","spdef","Firme","Gosta de Picante e não gosta de Amargo"],["Bold","def","atk","Ousada","Gosta de Azedo e não gosta de Picante"],["Docile",null,null,"Dócil","Neutra"],["Relaxed","def","spd","Relaxada","Gosta de Azedo e não gosta de Doce"],["Impish","def","spatk","Orgulhosa","Gosta de Azedo e não gosta de Seco"],["Lax","def","spdef","Excêntrica","Gosta de Azedo e não gosta de Amargo"],["Timid","spd","atk","Medrosa","Gosta de Doce e não gosta de Picante"],["Hasty","spd","def","Apressada","Gosta de Doce e não gosta de Azedo"],["Serious",null,null,"Séria","Neutra"],["Jolly","spd","spatk","Alegre","Gosta de Doce e não gosta de Seco"],["Naive","spd","spdef","Ingênua","Gosta de Doce e não gosta de Amargo"],["Modest","spatk","atk","Tímida","Gosta de Seco e não gosta de Picante"],["Mild","spatk","def","Modesta","Gosta de Seco e não gosta de Azedo"],["Quiet","spatk","spd","Quieta","Gosta de Seco e não gosta de Doce"],["Bashful",null,null,"Comedida","Neutra"],["Rash","spatk","spdef","Amável","Gosta de Seco e não gosta de Amargo"],["Calm","spdef","atk","Enjoada","Gosta de Amargo e não gosta de Picante"],["Gentle","spdef","def","Calma","Gosta de Amargo e não gosta de Azedo"],["Sassy","spdef","spd","Atrevida","Gosta de Amargo e não gosta de Doce"],["Careful","spdef","spatk","Gentil","Gosta de Amargo e não gosta de Seco"],["Quirky",null,null,"Chata","Neutra"]].map(([name,plus,minus,pt,taste])=>({name,plus,minus,pt,taste})).sort((a,b)=>(a.plus||"zzz").localeCompare(b.plus||"zzz"));

const $ = (id) => document.getElementById(id);
const state = { mode:"wild", pokemonIndex:[], pokemon:null, species:null, movesByLevel:[], movesByOther:[], moveCache:new Map(), selectedLevel:[], selectedOther:[], selectedAbilities:[], selectedGender:"", loyalty:0, shiny:false, alpha:false, nature:NATURES[0], xp:0, selectedBall:"", imageCrop:{zoom:1,x:0,y:0,src:""}, typeCache:null };
const formatName = (v) => v.split("-").map((x)=>x[0].toUpperCase()+x.slice(1)).join(" ");
const convertStat = (v) => (v % 10 >= 9 ? Math.floor(v / 10) + 1 : Math.floor(v / 10));
const hasCustomImage = () => Boolean(state.imageCrop.src);

function setupMenu(){const b=$("logoMenuBtn"),m=$("sideMenu"),bd=$("sideMenuBackdrop");b?.addEventListener("click",()=>{m?.classList.add("open");bd?.classList.remove("hidden");});bd?.addEventListener("click",()=>{m?.classList.remove("open");bd?.classList.add("hidden");});}
async function fetchIndex(){const r=await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025").then(x=>x.json());state.pokemonIndex=r.results.map((p,i)=>({id:i+1,name:p.name}));}

function setupModes(){document.querySelectorAll(".mode-btn").forEach((btn)=>btn.addEventListener("click",()=>{state.mode=btn.dataset.mode;document.querySelectorAll(".mode-btn").forEach((x)=>x.classList.toggle("active",x===btn));$("nicknameWrap").hidden=state.mode!=="trained";$("loyaltyWrap").hidden=state.mode!=="trained";$("ballWrap").hidden=state.mode!=="trained";$("xpControls").hidden=state.mode!=="trained";$("generationControls").hidden=state.mode!=="generation";render();}));}
function setupSearch(){const input=$("speciesSearch");input.addEventListener("input",updatePreview);$("speciesSearchBtn").addEventListener("click",()=>loadSpecies(input.value.trim().toLowerCase()));}
function updatePreview(){const q=$("speciesSearch").value.trim().toLowerCase(),wrap=$("speciesPreview");wrap.innerHTML="";if(!q)return;state.pokemonIndex.filter((p)=>p.name.includes(q)||String(p.id).startsWith(q)).slice(0,20).forEach((p)=>{const btn=document.createElement("button");btn.className="preview-item";btn.type="button";btn.innerHTML=`<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png" alt=""><span>#${String(p.id).padStart(4,"0")} ${formatName(p.name)}</span>`;btn.onclick=()=>{$("speciesSearch").value=p.name;wrap.innerHTML="";loadSpecies(String(p.id));};wrap.appendChild(btn);});}

async function loadSpecies(idOrName){
  if(!idOrName) return;
  const pokemon=await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`).then(r=>r.json());
  const species=await fetch(pokemon.species.url).then(r=>r.json());
  state.pokemon=pokemon; state.species=species;
  state.selectedLevel=[]; state.selectedOther=[]; state.selectedAbilities=[]; state.selectedBall=""; state.loyalty=0;
  state.selectedGender=species.gender_rate === -1 ? "asexual" : "";
  state.shiny=false; state.alpha=false;
  $("basicControls").hidden=false; $("natureBlock").hidden=false; $("movesSection").hidden=false; $("sheetEmpty").hidden=true; $("sheetContent").hidden=false;
  $("levelInput").value=5; state.xp=XP_TABLE[5] ?? 0;
  buildGenderMenu(); buildLoyalty(); buildNature(); await buildMovePools(); renderMoveOptions(); await renderRelations(); render();
}

function buildNature(){const sel=$("natureSelect");sel.innerHTML="";NATURES.forEach((n)=>sel.add(new Option(`${n.pt} (${n.name})`,n.name)));sel.value=state.nature.name;sel.onchange=()=>{state.nature=NATURES.find((n)=>n.name===sel.value)||NATURES[0];render();};}
function buildLoyalty(){const wrap=$("loyaltyBlocks");wrap.innerHTML="";for(let i=1;i<=4;i++){const b=document.createElement("button");b.type="button";b.className=`loyalty-block ${i<=state.loyalty?"active":""}`;b.textContent=i<=state.loyalty?"■":"□";b.onclick=()=>{state.loyalty= state.loyalty===i ? i-1 : i; buildLoyalty(); render();};wrap.appendChild(b);}if(!state.loyalty){[...wrap.children].forEach((x)=>x.textContent="□");}}

function buildGenderMenu(){
  const menu=$("genderMenu"),btn=$("genderDropdownBtn");
  menu.innerHTML="";
  const setGenderClass=(g)=>{btn.classList.remove("gender-male","gender-female","gender-asexual");btn.classList.add(g==="male"?"gender-male":g==="female"?"gender-female":"gender-asexual");};
  if(state.species?.gender_rate===-1){btn.textContent="Gênero: Assexual";btn.disabled=true;setGenderClass("asexual");return;}
  btn.disabled=false;
  [ ["male","Masculino","assets/icons/male.png"], ["female","Feminino","assets/icons/female.png"] ].forEach(([key,label,icon])=>{const b=document.createElement("button");b.type="button";b.dataset.g=key;b.innerHTML=`<img src="${icon}" width="14" alt="">${label}`;b.onclick=()=>{state.selectedGender=key;btn.textContent=`Gênero: ${label}`;setGenderClass(key);closeGenderMenu();render();};menu.appendChild(b);});
  if(!state.selectedGender) btn.textContent="Gênero: —"; else btn.textContent=`Gênero: ${state.selectedGender==="male"?"Masculino":"Feminino"}`;
  setGenderClass(state.selectedGender||"asexual");
}
const openGenderMenu=()=>{$("genderMenu").classList.remove("hidden");$("genderDropdownBtn").setAttribute("aria-expanded","true");};
const closeGenderMenu=()=>{$("genderMenu").classList.add("hidden");$("genderDropdownBtn").setAttribute("aria-expanded","false");};

function level(){return Math.max(1,Math.min(100,Number($("levelInput").value)||1));}
function getBaseStats(){const raw={};state.pokemon.stats.forEach((s)=>raw[s.stat.name]=s.base_stat);return {hp:convertStat(raw.hp),atk:convertStat(raw.attack),def:convertStat(raw.defense),spatk:convertStat(raw["special-attack"]),spdef:convertStat(raw["special-defense"]),spd:convertStat(raw.speed)};}
function getFinalStats(base){const lv=level();const growth=Math.floor(lv/10);const out={};STAT_KEYS.forEach((k)=>{out[k]=base[k]+growth+(state.nature.plus===k?2:0)-(state.nature.minus===k?2:0);});if(state.alpha){const top=[...STAT_KEYS].sort((a,b)=>out[b]-out[a]).slice(0,2);top.forEach((k)=>{out[k]+=5;});}return out;}

async function buildMovePools(){state.movesByLevel=[];state.movesByOther=[];for(const m of state.pokemon.moves){const v=[...m.version_group_details].sort((a,b)=>VERSION_PRIORITY.indexOf(a.version_group.name)-VERSION_PRIORITY.indexOf(b.version_group.name))[0];if(!v)continue;const obj={name:m.move.name,url:m.move.url,level:v.level_learned_at,method:v.move_learn_method.name};if(v.move_learn_method.name==="level-up")state.movesByLevel.push(obj);else state.movesByOther.push(obj);}state.movesByLevel.sort((a,b)=>a.level-b.level);}
function ensureAlphaMove(){if(!state.alpha||!state.movesByLevel.length)return;const forced=state.movesByLevel[state.movesByLevel.length-1]?.name;if(!forced)return;if(!state.selectedLevel.includes(forced)){if(state.selectedLevel.length>=4)state.selectedLevel.pop();state.selectedLevel.unshift(forced);}}
function renderMoveOptions(){const lv=level();const ls=$("levelMoveSelect"),ts=$("tmMoveSelect");ls.innerHTML="";ts.innerHTML="";state.movesByLevel.filter((m)=>m.level<=lv).forEach((m)=>ls.add(new Option(`Lv.${m.level} ${formatName(m.name)}`,m.name)));state.movesByOther.slice(0,300).forEach((m)=>ts.add(new Option(formatName(m.name),m.name)));}

async function getMove(url){if(state.moveCache.has(url))return state.moveCache.get(url);const d=await fetch(url).then(r=>r.json());state.moveCache.set(url,d);return d;}
function moveTypeColor(type){const c={fire:"#f08030",water:"#6890f0",grass:"#78c850",electric:"#f8d030",normal:"#a8a878",dark:"#705848",psychic:"#f85888",ice:"#98d8d8",fighting:"#c03028",poison:"#a040a0",ground:"#e0c068",flying:"#a890f0",bug:"#a8b820",rock:"#b8a038",ghost:"#705898",dragon:"#7038f8",steel:"#b8b8d0",fairy:"#ee99ac"};return c[type]||"#7bdc65";}
async function renderSelectedMoves(){const out=$("selectedMovesOutput");out.innerHTML="";for(const name of [...state.selectedLevel,...state.selectedOther]){const e=state.movesByLevel.find((m)=>m.name===name)||state.movesByOther.find((m)=>m.name===name);if(!e)continue;const d=await getMove(e.url);const c=moveTypeColor(d.type.name);const li=document.createElement("li");li.className="move-chip";li.style.background=`${c}22`;li.style.borderColor=c;li.textContent=`${formatName(name)} (${powerToDamage(d.power||0)} / ${accuracyToRPG(d.accuracy||100)} / PP ${ppToRPG(d.pp||0)})`;li.onclick=()=>openMoveModal(d);out.appendChild(li);}}
function openMoveModal(move){$("moveModalTitle").textContent=formatName(move.name);$("moveDetailsBody").innerHTML=`<div class='move-modal-shell'><div class='move-details-grid'><div><small>Tipo</small><p>${formatName(move.type.name)}</p></div><div><small>Classe</small><p>${formatName(move.damage_class.name)}</p></div><div><small>Poder</small><p>${powerToDamage(move.power||0)}</p></div></div><p>${move.effect_entries?.find((x)=>x.language.name==="en")?.short_effect || "Sem descrição"}</p></div>`;$("moveDetailsModal").showModal();}

function spriteSource(){if(hasCustomImage())return state.imageCrop.src;if(state.shiny && state.pokemon.sprites.other["official-artwork"].front_shiny)return state.pokemon.sprites.other["official-artwork"].front_shiny;return state.pokemon.sprites.other["official-artwork"].front_default || state.pokemon.sprites.front_default;}
function renderTypeBlocks(el,types){el.innerHTML="";types.forEach((t)=>{const img=document.createElement("img");img.src=`assets/types name/${t}.png`;img.alt=t;img.onerror=()=>img.src=`assets/types/${t}.png`;el.appendChild(img);});}

async function renderRelations(){if(!state.typeCache){const data=await fetch("https://pokeapi.co/api/v2/type").then(r=>r.json());const map={};await Promise.all(data.results.map(async(t)=>{const d=await fetch(t.url).then(r=>r.json());map[t.name]=d.damage_relations;}));state.typeCache=map;}const mult={};Object.keys(state.typeCache).forEach((k)=>mult[k]=1);state.pokemon.types.forEach((t)=>{state.typeCache[t.type.name].double_damage_from.forEach((x)=>mult[x.name]*=2);state.typeCache[t.type.name].half_damage_from.forEach((x)=>mult[x.name]*=.5);state.typeCache[t.type.name].no_damage_from.forEach((x)=>mult[x.name]=0);});const put=(id,val)=>{const el=$(id);el.innerHTML="";Object.entries(mult).filter(([,m])=>m===val).forEach(([n])=>{const i=document.createElement("img");i.src=`assets/types name/${n}.png`;i.alt=n;i.onerror=()=>i.src=`assets/types/${n}.png`;el.appendChild(i);});};put("weaknesses",2);put("resistances",0.5);put("immunities",0);}

function renderAbilities(){const body=$("abilitiesModalBody");const levelNow=level();const abilities=(state.pokemon.abilities||[]).map((a)=>({key:a.ability.name,hidden:a.is_hidden}));if(!abilities.length){body.innerHTML="<p>Sem habilidades.</p>";return;}body.innerHTML=`${levelNow>=20?"<p class='ability-help'>Nível permite escolher 2 habilidades.</p>":""}`;abilities.forEach((ab)=>{const data=abilitiesData[ab.key];const label=formatName(ab.key)+(ab.hidden?" (oculta)":"");const idx=state.selectedAbilities.indexOf(ab.key);const selectedClass=idx===0?"selected-1":idx===1?"selected-2":"";const card=document.createElement("button");card.type="button";card.className=`ability-option ${selectedClass} ${ab.hidden?"hidden-ability":""}`;card.innerHTML=`<strong>${data?.ptName || label}</strong><p>${data?.effect||"Sem descrição"}</p>`;card.onclick=()=>{const max=levelNow>=20?2:1; if(state.selectedAbilities.includes(ab.key)){state.selectedAbilities=state.selectedAbilities.filter((x)=>x!==ab.key);} else {state.selectedAbilities.push(ab.key);if(state.selectedAbilities.length>max)state.selectedAbilities=state.selectedAbilities.slice(-max);} renderAbilities(); render();};body.appendChild(card);});}

function renderInfo(){
  const g=state.selectedGender==="male"?"♂":state.selectedGender==="female"?"♀":"⚲";
  const egg=(state.species.egg_groups||[]).map((x)=>formatName(x.name)).join(" | ") || "—";
  const rows=[`<div class='info-row'><strong>Proporções:</strong> Altura ${state.pokemon.height/10}m | Peso ${state.pokemon.weight/10}kg</div>`,`<div class='info-row'><strong>Reprodução:</strong> ${g} ${egg}</div>`,`<div class='info-row wrap'><strong>Natureza:</strong> Gosta de ${state.nature.taste.split(" e ")[0].replace("Gosta de ","")}<br>Não gosta de ${state.nature.taste.split("não gosta de ")[1]||"—"}</div>`,`<div class='info-row'><strong>Modo:</strong> ${state.mode==="trained"?"Adestrado":"Selvagem"}</div>`];
  if(state.mode==="wild") rows.push(`<div class='info-row'><strong>XP dado:</strong> ${level()}</div>`);
  if(state.mode==="trained") rows.push(`<div class='info-row'><strong>Lealdade:</strong> ${"■".repeat(state.loyalty)}${"□".repeat(4-state.loyalty)}</div>`);
  $("infoContent").innerHTML=rows.join("");
}

function applyXpLeveling(){let lv=level();while(lv<100 && state.xp>=(XP_TABLE[lv+1]??Infinity)){lv+=1;}$("levelInput").value=lv;}
function xpProgress(){const lv=level();const curr=XP_TABLE[lv] ?? 0;const next=XP_TABLE[Math.min(100,lv+1)] ?? curr;const denom=Math.max(1,next-curr);const pct=lv>=100?100:Math.max(0,Math.min(100,((state.xp-curr)/denom)*100));return {curr,next,pct};}

function render(){
  if(!state.pokemon) return;
  ensureAlphaMove();
  const base=getBaseStats(); const stats=getFinalStats(base); const lv=level();
  const displayName = state.mode==="trained" && $("nicknameInput").value.trim() ? $("nicknameInput").value.trim() : formatName(state.pokemon.name);
  const finalName = state.alpha ? `Alpha (${displayName})` : displayName;

  $("sheetSprite").src=spriteSource();
  if(hasCustomImage()){$("sheetSprite").style.objectFit="cover";$("sheetSprite").style.transform=`translate(${state.imageCrop.x}px, ${state.imageCrop.y}px) scale(${state.imageCrop.zoom})`;} else {$("sheetSprite").style.objectFit="contain";$("sheetSprite").style.transform="none";}
  $("sheetDex").textContent=`#${String(state.pokemon.id).padStart(4,"0")}`;
  $("sheetName").textContent=finalName;
  $("sheetLevel").textContent=`Nv.${lv}`;
  $("sheetSpeciesSub").textContent=formatName(state.pokemon.species.name);

  renderTypeBlocks($("sheetTypes"),state.pokemon.types.map((t)=>t.type.name));
  const hpTotal=stats.hp*3;const hpQuick=stats.hp*2;
  $("hp1Text").textContent=`${hpTotal}/${hpTotal}`; $("hp2Text").textContent=`${hpQuick}/${hpQuick}`;
  $("hp1Fill").style.width="100%"; $("hp2Fill").style.width="100%";
  
  const xp=xpProgress(); $("xpBarFill").style.width=`${xp.pct}%`; $("xpBarText").textContent=`XP ${state.xp} (${Math.round(xp.pct)}%)`;
  const ball=$("sheetBallIcon"); ball.innerHTML="";
  if(state.mode==="trained" && state.selectedBall){ball.innerHTML += `<img class='corner-icon' src='assets/pokeball/${state.selectedBall}.png' alt='Pokébola'>`;}
  if(state.mode==="trained" && state.loyalty>0){ball.innerHTML += `<img class='corner-icon' src='assets/forms/lealdade${state.loyalty}.png' alt='Lealdade'>`;}
  const badges=$("sheetBadges"); badges.innerHTML="";
  if(state.shiny){badges.innerHTML += `<img class='badge-icon' src='assets/forms/shiny.png' alt='Shiny'>`;}
  if(state.alpha){badges.innerHTML += `<img class='badge-icon' src='assets/icons/alpha.png' alt='Alpha'>`;}

  const statsCompact=$("statsCompact");
  statsCompact.innerHTML=`<div class='stats-col'><ul>${STAT_KEYS.slice(0,2).map((k)=>`<li><span>${STAT_LABELS[k]}</span><strong>${stats[k]}</strong></li>`).join("")}</ul></div><div class='stats-col'><ul>${STAT_KEYS.slice(2,4).map((k)=>`<li><span>${STAT_LABELS[k]}</span><strong>${stats[k]}</strong></li>`).join("")}</ul></div><div class='stats-col'><ul>${STAT_KEYS.slice(4).map((k)=>`<li><span>${STAT_LABELS[k]}</span><strong>${stats[k]}</strong></li>`).join("")}</ul></div>`;

  $("cap-int").textContent=Math.ceil((stats.spatk+stats.spdef)/2); $("cap-str").textContent=Math.ceil((stats.atk+stats.def)/2); $("cap-mov").textContent=Math.max(1,Math.floor(stats.spd/2));
  $("cap-int-label").textContent="Raciocínio"; $("cap-str-label").textContent="Corpo"; $("cap-mov-label").textContent="Passos";

  renderSelectedMoves(); renderInfo(); buildGenderMenu();
  $("shinyToggle").classList.toggle("active",state.shiny); $("alphaToggle").classList.toggle("active",state.alpha);
  $("selectedBallText").textContent = state.selectedBall ? formatName(state.selectedBall) : "Nenhuma selecionada";
}

function getPayload(){return {pokemonId:state.pokemon.id,pokemonName:state.pokemon.name,nickname:$("nicknameInput").value.trim(),mode:state.mode,level:level(),xp:state.xp,shiny:state.shiny,alpha:state.alpha,nature:state.nature,abilities:[...state.selectedAbilities],moves:[...state.selectedLevel,...state.selectedOther],selectedBall:state.selectedBall,loyalty:state.loyalty,gender:state.selectedGender,imageCrop:state.imageCrop,sprite:spriteSource(),dex:`#${String(state.pokemon.id).padStart(4,"0")}`};}
function saveCurrent(){const profile=getProfile();if(!profile){alert("Faça login para salvar.");return;}if(state.mode==="trained" && level()>1){const expected=level()-1; if(expected>0){} }const saved=saveCreatedPokemon(getPayload());alert(`Salvo: ${saved.id}`);} 

function setupDialogs(){
  document.querySelectorAll("dialog").forEach((dialog)=>{dialog.addEventListener("click",(e)=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});});
  document.querySelectorAll("[data-close-modal]").forEach((btn)=>btn.addEventListener("click",()=>$(btn.dataset.closeModal)?.close()));
  document.addEventListener("keydown",(e)=>{if(e.key==="Escape")document.querySelectorAll("dialog[open]").forEach((d)=>d.close()); if(e.key==="Escape")closeGenderMenu();});
}

function openPokeballModal(){const body=$("pokeballModalBody");body.innerHTML="";POKEBALLS.forEach((slug)=>{const btn=document.createElement("button");btn.type="button";btn.className="pokeball-item";btn.innerHTML=`<img src='assets/pokeball/${slug}.png' alt='${slug}'><span>${formatName(slug)}</span>`;btn.onclick=()=>{state.selectedBall=slug;$("pokeballModal").close();render();};body.appendChild(btn);});$("pokeballModal").showModal();}

function openImageModal(){
  if(state.mode!=="trained" || !state.pokemon) return;
  const src=state.imageCrop.src || state.pokemon.sprites.other["official-artwork"].front_default;
  $("cropBody").innerHTML=`<input id='imgUpload' type='file' accept='image/png,image/jpeg,image/gif'><div id='cropViewer' class='crop-viewer'><img id='cropPreview' src='${src}' alt='Preview'></div><p class='crop-help'>Arraste para reposicionar e use roda do mouse para zoom.</p><button id='saveCropBtn' type='button'>Salvar imagem</button>`;
  const viewer=$("cropViewer"),img=$("cropPreview");
  let local={zoom:state.imageCrop.zoom||1,x:state.imageCrop.x||0,y:state.imageCrop.y||0};
  const paint=()=>{img.style.transform=`translate(calc(-50% + ${local.x}px), calc(-50% + ${local.y}px)) scale(${local.zoom})`;}; paint();
  let drag=false, sx=0, sy=0;
  viewer.addEventListener("pointerdown",(e)=>{drag=true;sx=e.clientX;sy=e.clientY;viewer.setPointerCapture(e.pointerId);});
  viewer.addEventListener("pointermove",(e)=>{if(!drag)return;local.x+=e.clientX-sx;local.y+=e.clientY-sy;sx=e.clientX;sy=e.clientY;paint();});
  viewer.addEventListener("pointerup",()=>{drag=false;});
  viewer.addEventListener("wheel",(e)=>{e.preventDefault();local.zoom=Math.min(3,Math.max(.5,local.zoom + (e.deltaY>0?-0.05:0.05)));paint();},{passive:false});
  $("imgUpload").onchange=()=>{const f=$("imgUpload").files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{img.src=String(reader.result);};reader.readAsDataURL(f);};
  $("saveCropBtn").onclick=()=>{state.imageCrop={...local,src:img.src};$("imageCropModal").close();render();};
  $("imageCropModal").showModal();
}

function setupEvents(){
  $("addLevelMoveBtn").onclick=()=>{const v=$("levelMoveSelect").value;if(!v||state.selectedLevel.includes(v)||state.selectedLevel.length>=4)return;state.selectedLevel.push(v);render();};
  $("addTmMoveBtn").onclick=()=>{const v=$("tmMoveSelect").value;if(!v||state.selectedOther.includes(v)||state.selectedOther.length>=4)return;state.selectedOther.push(v);render();};
  $("levelInput").addEventListener("input",()=>{renderMoveOptions();render();});
  $("nicknameInput").addEventListener("input",render);
  $("shinyToggle").onclick=()=>{state.shiny=!state.shiny;render();};
  $("alphaToggle").onclick=()=>{state.alpha=!state.alpha;render();};
  $("quickGenerateBtn").onclick=async()=>{const p=state.pokemonIndex[Math.floor(Math.random()*state.pokemonIndex.length)];await loadSpecies(String(p.id));$("levelInput").value=Math.floor(Math.random()*100)+1;state.xp=XP_TABLE[level()]??0;render();};
  $("addXpBtn").onclick=()=>{state.xp+=Math.max(0,Number($("xpInput").value)||0);const before=level();applyXpLeveling();const after=level();if(after>before){alert(`Subiu para nível ${after}!`);}renderMoveOptions();render();};
  $("copySheetBtn").onclick=async()=>{await navigator.clipboard.writeText(`${$("sheetDex").textContent} ${$("sheetName").textContent} ${$("sheetLevel").textContent}`);alert("Ficha copiada!");};
  $("copyMovesBtn").onclick=async()=>{await navigator.clipboard.writeText([...state.selectedLevel,...state.selectedOther].map(formatName).join("\n"));alert("Golpes copiados!");};
  $("savePokemonBtn").onclick=()=>saveCurrent();
  $("sheetImageButton").onclick=()=>openImageModal();
  $("openAbilitiesModalBtn").onclick=()=>{renderAbilities();$("abilitiesModal").showModal();};
  $("openPokeballModalBtn").onclick=()=>openPokeballModal();
  $("genderDropdownBtn").addEventListener("click",()=>$("genderMenu").classList.contains("hidden")?openGenderMenu():closeGenderMenu());
  $("genderDropdownBtn").addEventListener("keydown",(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openGenderMenu();}});
  document.addEventListener("click",(e)=>{if(!$("genderMenu").contains(e.target) && e.target!==$("genderDropdownBtn"))closeGenderMenu();});
}

async function loadFromQuery(){const id=new URLSearchParams(location.search).get("id");if(!id)return;const saved=getCreatedPokemonById(id);if(!saved)return;await loadSpecies(String(saved.pokemonId));$("nicknameInput").value=saved.nickname||"";$("levelInput").value=saved.level;state.mode=saved.mode;document.querySelector(`.mode-btn[data-mode='${saved.mode}']`)?.click();state.xp=saved.xp||XP_TABLE[saved.level]||0;state.shiny=Boolean(saved.shiny);state.alpha=Boolean(saved.alpha);state.nature=saved.nature||NATURES[0];$("natureSelect").value=state.nature.name;state.selectedAbilities=saved.abilities||[];state.selectedLevel=(saved.moves||[]).filter((m)=>state.movesByLevel.find((x)=>x.name===m)).slice(0,4);state.selectedOther=(saved.moves||[]).filter((m)=>state.movesByOther.find((x)=>x.name===m)).slice(0,4);state.selectedBall=saved.selectedBall||"";state.loyalty=saved.loyalty||0;state.selectedGender=saved.gender||state.selectedGender;state.imageCrop=saved.imageCrop||state.imageCrop;buildLoyalty();render();}

async function init(){setupMenu();initAuthUI();setupModes();setupSearch();setupDialogs();setupEvents();await fetchIndex();await loadFromQuery();}
init();
