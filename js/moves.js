const PAGE_SIZE = 30;
let currentIndex = 0;

const typeColors = {
  grass: "#78c850",
  fire: "#f08030",
  water: "#6890f0",
  electric: "#f8d030",
  psychic: "#f85888",
  dark: "#705848",
  dragon: "#7038f8",
  fairy: "#ee99ac",
  steel: "#b8b8d0",
  ghost: "#705898",
  ice: "#98d8d8",
  fighting: "#c03028",
  ground: "#e0c068",
  rock: "#b8a038",
  poison: "#a040a0",
  flying: "#a890f0",
  bug: "#a8b820",
  normal: "#a8a878"
};

let moves = [];
let filtered = [];

/* CARREGAR O JSON */
fetch("json/moves.json")
  .then(res => res.json())
  .then(data => {
    moves = data;
    filtered = [...moves];
    render();
  })
  .catch(err => console.error("Erro ao carregar moves.json", err));

/* PESQUISA */
function searchMoves(text) {
  filtered = moves.filter(m =>
    m.name_en.toLowerCase().includes(text.toLowerCase()) ||
    m.name_pt.toLowerCase().includes(text.toLowerCase())
  );
  render();
}

/* ORDENAÇÃO */
function sortMoves(type) {
  const map = {
    alpha: (a,b)=>a.name_en.localeCompare(b.name_en),
    power: (a,b)=>(b.power||0)-(a.power||0),
    tm: (a,b)=>(a.tm||"").localeCompare(b.tm||""),
    type: (a,b)=>a.type.localeCompare(b.type),
    category: (a,b)=>a.category.localeCompare(b.category)
  };

  filtered.sort(map[type]);
  render();
}

/* RENDERIZAÇÃO */
function render(reset = true) {
  const el = document.getElementById("moves");

  if (reset) {
    el.innerHTML = "";
    currentIndex = 0;
  }

  const slice = filtered.slice(currentIndex, currentIndex + PAGE_SIZE);
  currentIndex += PAGE_SIZE;

  slice.forEach(m => {
    el.insertAdjacentHTML("beforeend", createMoveCard(m));
  });

  if (currentIndex < filtered.length) {
    el.insertAdjacentHTML("beforeend", `
      <button class="load-more" onclick="render(false)">
        Carregar mais golpes
      </button>
    `);
  }
}


function createMoveCard(m) {
  const dmg = powerToDamage(m.power);
  const acc = accuracyToRPG(m.accuracy);
  const pp = ppToRPG(m.pp);

  return `
    <div class="move-card" onclick="toggleMove(this)">

      <div class="move-header">
        <span class="type-dot" style="background:${typeColors[m.type]}"></span>

        <span class="move-name" style="color:${typeColors[m.type]}">
          ${m.tm || "—"} ${m.name_en} <small>[${m.name_pt}]</small>
        </span>

        <img class="cat-icon" src="assets/icons/${m.category}.png">
      </div>

      <div class="move-info">
        <img src="assets/types/${m.type}.png" width="28">
        <span style="color:${typeColors[m.type]}">${m.type_pt}</span>
      </div>

      <div class="move-details" data-loaded="false"></div>

    </div>
  `;
}


/* TEXTO COPIÁVEL */
function formatText(m,d,a,p) {
  return `■〖${m.tm || "—"}〗${m.name_en} [${m.name_pt}]
■〖${m.type_pt}〗
■〖${m.category}〗

◆〖Dano〗-『${d}』
◆〖ACC〗-『${a}』
◆〖PP〗-『${p}』

${m.description_pt}`;
}

function copyMove(text) {
  navigator.clipboard.writeText(text);
}
function toggleMove(card) {
  const details = card.querySelector(".move-details");

  if (!card.classList.contains("open")) {
    if (details.dataset.loaded === "false") {
      const name = card.querySelector(".move-name").innerText;
      const move = moves.find(m => name.includes(m.name_en));

      const dmg = powerToDamage(move.power);
      const acc = accuracyToRPG(move.accuracy);
      const pp = ppToRPG(move.pp);

      details.innerHTML = `
        <div class="move-stats">
          <span>⚔ ${dmg}</span>
          <span>🎯 ${acc}</span>
          <span>⏳ ${pp}</span>
        </div>

        <p class="desc">${move.description_pt}</p>

        <button onclick="event.stopPropagation(); copyMove(\`${formatText(move,dmg,acc,pp)}\`)">
          Copiar golpe
        </button>
      `;

      details.dataset.loaded = "true";
    }
  }

  card.classList.toggle("open");
}



