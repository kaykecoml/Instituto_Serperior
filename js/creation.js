import { powerToDamage, accuracyToRPG, ppToRPG } from "./utils.js";
import { abilitiesData } from "./abilities.js";
import { initAuthUI } from "./auth.js";
import { getProfile, saveCreatedPokemon } from "./storage.js";
import { STAT_KEYS, STAT_LABELS, getRpgStatsFromPokemon, calcIntelligence, calcStrength, calcMovement, INT_LABELS, STR_LABELS, MOV_LABELS } from "./shared-pokemon.js";

const VERSION_PRIORITY = ["scarlet-violet", "sword-shield", "ultra-sun-ultra-moon", "sun-moon"];
const POKEBALLS = ["pokeball", "great-ball", "ultra-ball", "premier-ball", "luxury-ball", "timer-ball"];
const NATURES = [["Hardy",null,null,"Estoica","Neutra"],["Lonely","atk","def","Desesperada","Gosta de Picante e não gosta de Azedo"],["Brave","atk","spd","Travessa","Gosta de Picante e não gosta de Doce"],["Adamant","atk","spatk","Solitária","Gosta de Picante e não gosta de Seco"],["Naughty","atk","spdef","Firme","Gosta de Picante e não gosta de Amargo"],["Bold","def","atk","Ousada","Gosta de Azedo e não gosta de Picante"],["Docile",null,null,"Dócil","Neutra"],["Relaxed","def","spd","Relaxada","Gosta de Azedo e não gosta de Doce"],["Impish","def","spatk","Orgulhosa","Gosta de Azedo e não gosta de Seco"],["Lax","def","spdef","Excêntrica","Gosta de Azedo e não gosta de Amargo"],["Timid","spd","atk","Medrosa","Gosta de Doce e não gosta de Picante"],["Hasty","spd","def","Apressada","Gosta de Doce e não gosta de Azedo"],["Serious",null,null,"Séria","Neutra"],["Jolly","spd","spatk","Alegre","Gosta de Doce e não gosta de Seco"],["Naive","spd","spdef","Ingênua","Gosta de Doce e não gosta de Amargo"],["Modest","spatk","atk","Tímida","Gosta de Seco e não gosta de Picante"],["Mild","spatk","def","Modesta","Gosta de Seco e não gosta de Azedo"],["Quiet","spatk","spd","Quieta","Gosta de Seco e não gosta de Doce"],["Bashful",null,null,"Comedida","Neutra"],["Rash","spatk","spdef","Amável","Gosta de Seco e não gosta de Amargo"],["Calm","spdef","atk","Enjoada","Gosta de Amargo e não gosta de Picante"],["Gentle","spdef","def","Calma","Gosta de Amargo e não gosta de Azedo"],["Sassy","spdef","spd","Atrevida","Gosta de Amargo e não gosta de Doce"],["Careful","spdef","spatk","Gentil","Gosta de Amargo e não gosta de Seco"],["Quirky",null,null,"Chata","Neutra"]].map(([name,plus,minus,pt,taste])=>({name,plus,minus,pt,taste}));
const XP_TABLE={1:0,2:10,3:20,4:30,5:40,6:50,7:60,8:70,9:80,10:90,11:110,12:135,13:160,14:190,15:220,16:250,17:285,18:320,19:360,20:400,21:460,22:530,23:600,24:670,25:745,26:820,27:900,28:990,29:1075,30:1165,31:1260,32:1355,33:1455,34:1555,35:1660,36:1770,37:1880,38:1995,39:2110,40:2230,41:2355,42:2480,43:2610,44:2740,45:2875,46:3015,47:3155,48:3300,49:3445,50:3645,51:3850,52:4060,53:4270,54:4485,55:4705,56:4930,57:5160,58:5390,59:5625,60:5865,61:6110,62:6360,63:6610,64:6865,65:7125,66:7390,67:7660,68:7925,69:8205,70:8485,71:8770,72:9060,73:9350,74:9645,75:9945,76:10250,77:10560,78:10870,79:11185,80:11505,81:11910,82:12320,83:12735,84:13155,85:13580,86:14010,87:14445,88:14885,89:15330,90:15780,91:16235,92:16695,93:17160,94:17630,95:18105,96:18585,97:19070,98:19560,99:20055,100:20555};

const $=(id)=>document.getElementById(id);
const state={mode:"wild",pokemon:null,species:null,index:[],movesByLevel:[],movesByOther:[],selectedLevel:[],selectedOther:[],selectedAbilities:[],selectedGender:"",selectedBall:"",nature:NATURES[0],xp:40,shiny:false,alpha:false,loyalty:0,imageCrop:{src:"",zoom:1,x:0,y:0},manualAlloc:{hp:0,atk:0,def:0,spatk:0,spdef:0,spd:0},typeCache:null,moveCache:new Map()};

const formatName=(v)=>v.split("-").map((x)=>x.charAt(0).toUpperCase()+x.slice(1)).join(" ");
const level=()=>Math.max(1,Math.min(100,Number($("levelInput").value)||1));
const hasCustomImage=()=>Boolean(state.imageCrop.src);

async function fetchIndex(){const r=await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025").then(x=>x.json());state.index=r.results.map((p,i)=>({id:i+1,name:p.name}));}
function setupSearch(){const input=$("speciesSearch");input.addEventListener("input",()=>{const q=input.value.trim().toLowerCase(),w=$("speciesPreview");w.innerHTML="";if(!q)return;state.index.filter((p)=>p.name.includes(q)||String(p.id).startsWith(q)).slice(0,20).forEach((p)=>{const b=document.createElement("button");b.className="preview-item";b.type="button";b.innerHTML=`<img src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png' alt=''><span>#${String(p.id).padStart(4,"0")} ${formatName(p.name)}</span>`;b.onclick=()=>loadSpecies(String(p.id));w.appendChild(b);});});$("speciesSearchBtn").onclick=()=>loadSpecies(input.value.trim().toLowerCase());}

async function loadSpecies(idOrName){
  if(!idOrName)return;
  const pokemon=await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`).then(r=>r.json());
  const species=await fetch(pokemon.species.url).then(r=>r.json());
  state.pokemon=pokemon;state.species=species;state.selectedLevel=[];state.selectedOther=[];state.selectedAbilities=[];state.manualAlloc={hp:0,atk:0,def:0,spatk:0,spdef:0,spd:0};state.selectedGender=species.gender_rate===-1?"asexual":"";state.xp=XP_TABLE[5];$("levelInput").value=5;
  $("basicControls").hidden=false;$("natureBlock").hidden=false;$("movesSection").hidden=false;$("sheetEmpty").hidden=true;$("sheetContent").hidden=false;
  buildNature();buildLoyalty();buildGenderMenu();await buildMovePools();renderMoveOptions();await renderRelations();render();
}

function setupModes(){document.querySelectorAll(".mode-btn").forEach((btn)=>btn.onclick=()=>{state.mode=btn.dataset.mode;document.querySelectorAll(".mode-btn").forEach((x)=>x.classList.toggle("active",x===btn));$("nicknameWrap").hidden=state.mode!=="trained";$("xpControls").hidden=state.mode!=="trained";$("ballWrap").hidden=state.mode!=="trained";$("loyaltyWrap").hidden=state.mode!=="trained";render();});}
function buildNature(){const s=$("natureSelect");s.innerHTML="";NATURES.forEach((n)=>s.add(new Option(`${n.pt} (${n.name})`,n.name)));s.value=state.nature.name;s.onchange=()=>{state.nature=NATURES.find((x)=>x.name===s.value)||NATURES[0];render();};}
function buildLoyalty(){const w=$("loyaltyBlocks");w.innerHTML="";for(let i=1;i<=4;i++){const b=document.createElement("button");b.className=`loyalty-block ${i<=state.loyalty?"active":""}`;b.type="button";b.textContent=i<=state.loyalty?"■":"□";b.onclick=()=>{state.loyalty=(state.loyalty===i?i-1:i);buildLoyalty();render();};w.appendChild(b);}}
function buildGenderMenu(){const m=$("genderMenu"),btn=$("genderDropdownBtn");m.innerHTML="";btn.classList.remove("gender-male","gender-female","gender-asexual");if(state.species?.gender_rate===-1){state.selectedGender="asexual";btn.textContent="Gênero: Assexual";btn.disabled=true;btn.classList.add("gender-asexual");return;}btn.disabled=false;[["male","Masculino","assets/icons/male.png"],["female","Feminino","assets/icons/female.png"]].forEach(([g,l,icon])=>{const b=document.createElement("button");b.type="button";b.innerHTML=`<img src='${icon}' width='14' alt=''>${l}`;b.onclick=()=>{state.selectedGender=g;btn.textContent=`Gênero: ${l}`;closeGender();render();};m.appendChild(b);});btn.textContent=state.selectedGender?`Gênero: ${state.selectedGender==="male"?"Masculino":"Feminino"}`:"Gênero: —";btn.classList.add(state.selectedGender==="male"?"gender-male":state.selectedGender==="female"?"gender-female":"gender-asexual");}
const openGender=()=>{$("genderMenu").classList.remove("hidden");$("genderDropdownBtn").setAttribute("aria-expanded","true");}; const closeGender=()=>{$("genderMenu").classList.add("hidden");$("genderDropdownBtn").setAttribute("aria-expanded","false");};

async function buildMovePools(){state.movesByLevel=[];state.movesByOther=[];for(const m of state.pokemon.moves){const v=[...m.version_group_details].sort((a,b)=>VERSION_PRIORITY.indexOf(a.version_group.name)-VERSION_PRIORITY.indexOf(b.version_group.name))[0];if(!v)continue;const item={name:m.move.name,url:m.move.url,level:v.level_learned_at,method:v.move_learn_method.name};if(v.move_learn_method.name==="level-up")state.movesByLevel.push(item);if(["machine","tutor","egg"].includes(v.move_learn_method.name))state.movesByOther.push(item);}state.movesByLevel.sort((a,b)=>a.level-b.level);}
function renderMoveOptions(){const lv=level(),ls=$("levelMoveSelect"),ts=$("tmMoveSelect");ls.innerHTML="";ts.innerHTML="";state.movesByLevel.filter((m)=>m.level<=lv).forEach((m)=>ls.add(new Option(`Lv.${m.level} ${formatName(m.name)}`,m.name)));state.movesByOther.forEach((m)=>ts.add(new Option(`${formatName(m.name)} (${m.method})`,m.name)));}
function ensureAlphaMove(){if(!state.alpha)return;const forced=state.movesByLevel[state.movesByLevel.length-1]?.name;if(!forced)return;if(!state.selectedLevel.includes(forced)){if(state.selectedLevel.length>=4)state.selectedLevel[3]=forced;else state.selectedLevel.push(forced);}}

function rankByBasal(base){return [...STAT_KEYS].sort((a,b)=>base[b]-base[a]||STAT_KEYS.indexOf(a)-STAT_KEYS.indexOf(b));}
function wildAutoAllocation(base,points){const rank=rankByBasal(base);const gain={hp:0,atk:0,def:0,spatk:0,spdef:0,spd:0};let i=0;while(points>0){gain[rank[i%rank.length]]+=1;i++;points--;}return gain;}
function usedPoints(){return Object.values(state.manualAlloc).reduce((a,b)=>a+b,0);} 

function getComputedStats(){
  const base=getRpgStatsFromPokemon(state.pokemon);
  const growth=Math.floor(level()/10);
  const levelPoints=Math.max(0,level()-1);
  let gained=state.mode==="trained"?{...state.manualAlloc}:wildAutoAllocation(base,levelPoints);
  if(state.mode==="trained") STAT_KEYS.forEach((k)=>{if(gained[k]<0)gained[k]=0;});
  const final={};
  STAT_KEYS.forEach((k)=>final[k]=base[k]+growth+gained[k]);
  if(state.nature.plus) final[state.nature.plus]+=2;
  if(state.nature.minus) final[state.nature.minus]-=2;
  if(state.alpha){const rk=rankByBasal(base);final[rk[0]]+=5;final[rk[1]]+=5;}
  return {base,gained,final,levelPoints};
}

function spriteSource(){if(hasCustomImage())return state.imageCrop.src;if(state.shiny)return state.pokemon.sprites.other["official-artwork"].front_shiny||state.pokemon.sprites.front_shiny||state.pokemon.sprites.other["official-artwork"].front_default;return state.pokemon.sprites.other["official-artwork"].front_default||state.pokemon.sprites.front_default;}
function renderTypeBlocks(el,types){el.innerHTML="";types.forEach((t)=>{const i=document.createElement("img");i.src=`assets/types name/${t}.png`;i.onerror=()=>i.src=`assets/types/${t}.png`;i.alt=t;el.appendChild(i);});}
async function renderRelations(){if(!state.typeCache){const data=await fetch("https://pokeapi.co/api/v2/type").then(r=>r.json());const map={};await Promise.all(data.results.map(async(t)=>map[t.name]= (await fetch(t.url).then(r=>r.json())).damage_relations));state.typeCache=map;}const mult={};Object.keys(state.typeCache).forEach((k)=>mult[k]=1);state.pokemon.types.forEach((t)=>{state.typeCache[t.type.name].double_damage_from.forEach((x)=>mult[x.name]*=2);state.typeCache[t.type.name].half_damage_from.forEach((x)=>mult[x.name]*=.5);state.typeCache[t.type.name].no_damage_from.forEach((x)=>mult[x.name]=0);});[["weaknesses",2],["resistances",0.5],["immunities",0]].forEach(([id,val])=>{const el=$(id);el.innerHTML="";Object.entries(mult).filter(([,m])=>m===val).forEach(([n])=>{const i=document.createElement("img");i.src=`assets/types name/${n}.png`;i.onerror=()=>i.src=`assets/types/${n}.png`;i.alt=n;el.appendChild(i);});});}

function renderAbilities(){const b=$("abilitiesModalBody"),max=level()>=40?2:1;b.innerHTML=`<p>${max===2?"Nível >= 40: selecione até 2 habilidades.":"Nível < 40: selecione 1 habilidade."}</p>`;(state.pokemon.abilities||[]).forEach((a)=>{const key=a.ability.name;const data=abilitiesData[key];const idx=state.selectedAbilities.indexOf(key);const card=document.createElement("button");card.type="button";card.className=`ability-option ${idx===0?"selected-1":""} ${idx===1?"selected-2":""} ${a.is_hidden?"hidden-ability":""}`;card.innerHTML=`<strong>${data?.ptName||formatName(key)}${a.is_hidden?" (oculta)":""}</strong><p>${data?.effect||"Sem descrição"}</p>`;card.onclick=()=>{if(state.selectedAbilities.includes(key)) state.selectedAbilities=state.selectedAbilities.filter((x)=>x!==key); else {state.selectedAbilities.push(key); if(state.selectedAbilities.length>max) state.selectedAbilities=state.selectedAbilities.slice(-max);}renderAbilities();render();};b.appendChild(card);});}
function renderSelectedAbilities(){const names=state.selectedAbilities.map((k)=>{const i=abilitiesData[k];const hidden=state.pokemon.abilities.find((x)=>x.ability.name===k)?.is_hidden;return `<div class='info-row'>${i?.ptName||formatName(k)}${hidden?" (oculta)":""}</div>`;});$("selectedAbilitiesView").innerHTML=names.join("");}

function xpProgress(){const lv=level();const curr=XP_TABLE[lv]??0,next=XP_TABLE[Math.min(100,lv+1)]??curr;const pct=lv>=100?100:Math.max(0,Math.min(100,((state.xp-curr)/Math.max(1,next-curr))*100));return {pct,curr,next};}
function applyXp(){let lv=level();while(lv<100 && state.xp >= (XP_TABLE[lv+1]??Infinity)) lv++;$("levelInput").value=lv;}

async function getMove(url){if(state.moveCache.has(url))return state.moveCache.get(url);const d=await fetch(url).then(r=>r.json());state.moveCache.set(url,d);return d;}
async function renderMoveLists(){const draw=async(list,target,kind)=>{const el=$(target);el.innerHTML="";for(const [idx,name] of list.entries()){const move=(state.movesByLevel.find((m)=>m.name===name)||state.movesByOther.find((m)=>m.name===name));if(!move)continue;const d=await getMove(move.url);const baseDamage=powerToDamage(d.power||0);const isDamaging=Number(d.power)>0;const stab= isDamaging && state.pokemon.types.some((t)=>t.type.name===d.type.name) ? Math.floor(level()/5) : 0;const damageText=isDamaging?(stab>0?`${baseDamage} + ${stab}`:`${baseDamage}`):"Status";const li=document.createElement("li");li.innerHTML=`<span>${formatName(name)} — Dano ${damageText} / Acc ${accuracyToRPG(d.accuracy||100)} / PP ${ppToRPG(d.pp||0)}</span><button data-k='${kind}' data-i='${idx}' type='button'>Remover</button>`;el.appendChild(li);}el.querySelectorAll("button").forEach((b)=>b.onclick=()=>{const i=Number(b.dataset.i);if(b.dataset.k==="level")state.selectedLevel.splice(i,1);else state.selectedOther.splice(i,1);render();});};await draw(state.selectedLevel,"levelMoveSlots","level");await draw(state.selectedOther,"tmMoveSlots","tm");
  const out=$("selectedMovesOutput");out.innerHTML="";[...state.selectedLevel,...state.selectedOther].forEach((n)=>{const li=document.createElement("li");li.textContent=formatName(n);out.appendChild(li);});
}

function renderStatsBoard(comp){const {base,gained,final,levelPoints}=comp;const trained=state.mode==="trained";const rows=[`<div class='stats-row header'><span>Atributo</span><span>Basal</span><span>Ganho Nv</span><span>Final</span></div>`];STAT_KEYS.forEach((k)=>{const clsPlus=state.nature.plus===k?"nature-plus":"";const clsMinus=state.nature.minus===k?"nature-minus":"";const control=trained?`<span class='alloc-control'><button data-stat='${k}' data-d='-1' type='button'>-</button>${gained[k]}<button data-stat='${k}' data-d='1' type='button'>+</button></span>`:`<span>${gained[k]}</span>`;rows.push(`<div class='stats-row ${clsPlus} ${clsMinus}'><span>${STAT_LABELS[k]}</span><span>${base[k]}</span>${control}<strong>${final[k]}</strong></div>`);});rows.push(`<div class='info-row'>Pontos de nível: ${trained?`${usedPoints()}/${levelPoints}`:`automático (${levelPoints})`}</div>`);$("statsBoard").innerHTML=rows.join("");if(trained){$("statsBoard").querySelectorAll(".alloc-control button").forEach((b)=>b.onclick=()=>{const st=b.dataset.stat,d=Number(b.dataset.d),limit=Math.max(0,level()-1);if(d>0 && usedPoints()>=limit)return;if(d<0 && state.manualAlloc[st]<=0)return;state.manualAlloc[st]+=d;render();});}}

function render(){if(!state.pokemon)return;ensureAlphaMove();const comp=getComputedStats();const finalName=(state.alpha?"Alpha ":"") + ((state.mode==="trained" && $("nicknameInput").value.trim())?$("nicknameInput").value.trim():formatName(state.pokemon.name));
  $("sheetSprite").src=spriteSource();
  $("sheetDex").textContent=`#${String(state.pokemon.id).padStart(4,"0")}`;$("sheetName").textContent=finalName;$("sheetLevel").textContent=`Nv.${level()}`;$("sheetSpeciesSub").textContent=formatName(state.pokemon.name);
  renderTypeBlocks($("sheetTypes"),state.pokemon.types.map((t)=>t.type.name));
  const hpTotal=(comp.final.hp+level())*4;const hpQuick=level()+(comp.final.hp*3);$("hp1Text").textContent=`${hpTotal}/${hpTotal}`;$("hp2Text").textContent=`${hpQuick}/${hpQuick}`;
  const xp=xpProgress();$("xpBarFill").style.width=`${xp.pct}%`;$("xpBarText").textContent=`XP ${state.xp} (${Math.round(xp.pct)}%)`;
  $("sheetBallIcon").innerHTML=`${state.mode==="trained"&&state.selectedBall?`<img class='corner-icon' src='assets/pokeball/${state.selectedBall}.png' alt='pokeball'>`:""}${state.mode==="trained"&&state.loyalty>0?`<img class='corner-icon' src='assets/forms/lealdade${state.loyalty}.png' alt='lealdade'>`:""}`;
  $("sheetBadges").innerHTML=`${state.shiny?`<img class='badge-icon' src='assets/forms/shiny.png' alt='shiny'>`:""}${state.alpha?`<img class='badge-icon' src='assets/icons/alpha.png' alt='alpha'>`:""}`;
  renderSelectedAbilities();renderStatsBoard(comp);
  const meta={types:state.pokemon.types.map((t)=>t.type.name),eggGroups:(state.species.egg_groups||[]).map((x)=>x.name),stats:comp.final,weight:state.pokemon.weight/10,isLegendary:Boolean(state.species.is_legendary||state.species.is_mythical),isSingleStage:false,isFinalStage:false};
  const ci=calcIntelligence(meta),cs=calcStrength(meta),cm=calcMovement(meta);$("cap-int").textContent=ci;$("cap-int-label").textContent=INT_LABELS[ci];$("cap-str").textContent=cs;$("cap-str-label").textContent=STR_LABELS[cs];$("cap-mov").textContent=cm;$("cap-mov-label").textContent=MOV_LABELS[cm];
  $("infoContent").innerHTML=`<div class='info-row'>Proporções: ${state.pokemon.height/10}m | ${state.pokemon.weight/10}kg</div><div class='info-row'>Reprodução: ${(state.species.egg_groups||[]).map((x)=>formatName(x.name)).join(" | ")||"—"}</div><div class='info-row'>Natureza: ${state.nature.pt}</div><div class='info-row'>Modo: ${state.mode==="trained"?"Adestrado":"Selvagem"}</div>`;
  $("selectedBallText").textContent=state.selectedBall?formatName(state.selectedBall):"Nenhuma selecionada";
  $("shinyToggle").classList.toggle("active",state.shiny);$("alphaToggle").classList.toggle("active",state.alpha);
  renderMoveLists();
}

function saveCurrent(){if(!state.pokemon)return;const profile=getProfile();if(!profile){alert("Faça login para salvar.");return;}if(state.mode==="trained"){const missing=Math.max(0,(level()-1)-usedPoints());if(missing>0){alert(`Ainda faltam ${missing} pontos para distribuir.`);return;}}const payload={pokemonId:state.pokemon.id,pokemonName:state.pokemon.name,level:level(),mode:state.mode,nickname:$("nicknameInput").value.trim(),nature:state.nature,moves:[...state.selectedLevel,...state.selectedOther],abilities:[...state.selectedAbilities],shiny:state.shiny,alpha:state.alpha,xp:state.xp,selectedBall:state.selectedBall,loyalty:state.loyalty,gender:state.selectedGender,imageCrop:state.imageCrop,sprite:spriteSource()};const saved=saveCreatedPokemon(payload);alert(`Salvo: ${saved.id}`);}

function setupEvents(){
  $("levelInput").addEventListener("input",()=>{renderMoveOptions();render();});
  $("nicknameInput").addEventListener("input",render);
  $("shinyToggle").onclick=()=>{state.shiny=!state.shiny;render();};
  $("alphaToggle").onclick=()=>{state.alpha=!state.alpha;render();};
  $("addXpBtn").onclick=()=>{state.xp += Math.max(0,Number($("xpInput").value)||0);const before=level();applyXp();if(level()>before)alert(`Subiu para o nível ${level()}!`);renderMoveOptions();render();};
  $("addLevelMoveBtn").onclick=()=>{const v=$("levelMoveSelect").value;if(!v||state.selectedLevel.includes(v)||state.selectedLevel.length>=4)return;state.selectedLevel.push(v);render();};
  $("addTmMoveBtn").onclick=()=>{const v=$("tmMoveSelect").value;if(!v||state.selectedOther.includes(v)||state.selectedOther.length>=4)return;state.selectedOther.push(v);render();};
  $("openAbilitiesModalBtn").onclick=()=>{renderAbilities();$("abilitiesModal").showModal();};
  $("openPokeballModalBtn").onclick=()=>{const b=$("pokeballModalBody");b.innerHTML="";POKEBALLS.forEach((slug)=>{const bt=document.createElement("button");bt.type="button";bt.className="pokeball-item";bt.innerHTML=`<img src='assets/pokeball/${slug}.png' alt='${slug}'><span>${formatName(slug)}</span>`;bt.onclick=()=>{state.selectedBall=slug;$("pokeballModal").close();render();};b.appendChild(bt);});$("pokeballModal").showModal();};
  $("genderDropdownBtn").onclick=()=>$("genderMenu").classList.contains("hidden")?openGender():closeGender();
  $("genderDropdownBtn").addEventListener("keydown",(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openGender();}});
  document.addEventListener("click",(e)=>{if(!$("genderMenu").contains(e.target)&&e.target!==$("genderDropdownBtn"))closeGender();});
  document.addEventListener("keydown",(e)=>{if(e.key==="Escape"){closeGender();document.querySelectorAll("dialog[open]").forEach((d)=>d.close());}});
  document.querySelectorAll("[data-close-modal]").forEach((b)=>b.onclick=()=>$(b.dataset.closeModal).close());
  $("savePokemonBtn").onclick=saveCurrent;
}

function setupImageModal(){ $("sheetImageButton").onclick=()=>{if(state.mode!=="trained"||!state.pokemon)return;const src=state.imageCrop.src||state.pokemon.sprites.other["official-artwork"].front_default;$("cropBody").innerHTML=`<input id='imgUpload' type='file' accept='image/png,image/jpeg,image/gif'><div id='cropViewer' class='crop-viewer'><img id='cropPreview' src='${src}' alt='preview'></div><button id='saveCropBtn' type='button'>Salvar imagem</button>`;const viewer=$("cropViewer"),img=$("cropPreview");let local={...state.imageCrop};const paint=()=>{img.style.transform=`translate(calc(-50% + ${local.x}px), calc(-50% + ${local.y}px)) scale(${local.zoom})`;};paint();let drag=false,sx=0,sy=0;viewer.onpointerdown=(e)=>{drag=true;sx=e.clientX;sy=e.clientY;viewer.setPointerCapture(e.pointerId);};viewer.onpointermove=(e)=>{if(!drag)return;local.x+=(e.clientX-sx);local.y+=(e.clientY-sy);sx=e.clientX;sy=e.clientY;paint();};viewer.onpointerup=()=>drag=false;viewer.onwheel=(e)=>{e.preventDefault();local.zoom=Math.min(3,Math.max(.5,(local.zoom||1)+(e.deltaY>0?-0.05:0.05)));paint();};$("imgUpload").onchange=()=>{const f=$("imgUpload").files?.[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{img.src=String(rd.result);};rd.readAsDataURL(f);};$("saveCropBtn").onclick=()=>{state.imageCrop={...local,src:img.src};$("imageCropModal").close();render();};$("imageCropModal").showModal();}; }

async function init(){initAuthUI();setupModes();setupSearch();setupEvents();setupImageModal();await fetchIndex();}
init();
