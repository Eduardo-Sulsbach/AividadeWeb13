// ============================================================
//  MYCOLLECTION MANAGER — main.js
//  Todos os 6 requisitos de manipulação de DOM
// ============================================================

// Requisito 1 — Capturador de Dados (lendo o DOM)
const form = document.getElementById("collection-form");
const inputName = document.getElementById("item-name");
const inputImage = document.getElementById("item-image");
const inputRarity = document.getElementById("item-rarity");
const inputRepeated = document.getElementById("item-repeated");
const searchInput = document.getElementById("search-input");
const cardsGrid = document.getElementById("cards-grid");
const emptyState = document.getElementById("empty-state");
const formError = document.getElementById("form-error");

// Requisito 5 — Placar ao Vivo
const statTotal = document.getElementById("stat-total");
const statRepeated = document.getElementById("stat-repeated");
const statUnique = document.getElementById("stat-unique");

// Estado interno da coleção
const collection = new Map();

// ============================================================
// REQUISITO 5: PLACAR AO VIVO — textContent
// ============================================================
function updateStats() {
  const total = collection.size;
  const repeated = [...collection.values()].filter(
    (item) => item.isRepeated,
  ).length;
  const unique = total - repeated;

  animateCounter(statTotal, total);
  animateCounter(statRepeated, repeated);
  animateCounter(statUnique, unique);

  emptyState.style.display = total === 0 ? "flex" : "none";
}

function animateCounter(el, value) {
  el.textContent = String(value); // ← textContent (Requisito 5)
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 300);
}

// ============================================================
// REQUISITO 2: CONSTRUTOR DE CARTINHAS — createElement + appendChild
// ============================================================
function buildCard(item) {
  // Cria o card do zero
  const card = document.createElement("div"); // ← createElement
  card.classList.add("card");
  card.dataset.id = item.id;
  card.dataset.name = item.name.toLowerCase();

  // Imagem ou placeholder
  if (item.imageUrl) {
    const img = document.createElement("img"); // ← createElement
    img.classList.add("card-image");
    img.src = item.imageUrl;
    img.alt = item.name;
    img.loading = "lazy";
    img.onerror = () => img.replaceWith(buildPlaceholder(item.rarity));
    card.appendChild(img); // ← appendChild
  } else {
    card.appendChild(buildPlaceholder(item.rarity)); // ← appendChild
  }

  // Corpo
  const body = document.createElement("div"); // ← createElement
  body.classList.add("card-body");

  const name = document.createElement("p"); // ← createElement
  name.classList.add("card-name");
  name.textContent = item.name; // ← textContent
  body.appendChild(name); // ← appendChild

  // Badges
  const badgesContainer = document.createElement("div"); // ← createElement
  badgesContainer.classList.add("card-badges");

  const rarityBadge = document.createElement("span"); // ← createElement
  rarityBadge.classList.add("card-rarity");
  rarityBadge.dataset.rarity = item.rarity;
  rarityBadge.textContent = item.rarity;
  badgesContainer.appendChild(rarityBadge); // ← appendChild

  if (item.isRepeated) {
    const repeatedBadge = document.createElement("span"); // ← createElement
    repeatedBadge.classList.add("card-badge-repeated");
    repeatedBadge.textContent = "Repetida";
    badgesContainer.appendChild(repeatedBadge); // ← appendChild
  }

  body.appendChild(badgesContainer); // ← appendChild

  // Botões
  const actions = document.createElement("div"); // ← createElement
  actions.classList.add("card-actions");

  // Botão Favorito (Requisito 4)
  const btnFav = document.createElement("button"); // ← createElement
  btnFav.classList.add("card-btn", "card-btn--fav");
  btnFav.type = "button";
  btnFav.textContent = "★ Favorito";
  btnFav.addEventListener("click", () =>
    toggleCardClass(card, btnFav, "is-favorite"),
  );

  // Botão Troca (Requisito 4)
  const btnTrade = document.createElement("button"); // ← createElement
  btnTrade.classList.add("card-btn", "card-btn--trade");
  btnTrade.type = "button";
  btnTrade.textContent = "⇄ Troca";
  btnTrade.addEventListener("click", () =>
    toggleCardClass(card, btnTrade, "is-trade"),
  );

  // Botão Lixeira (Requisito 3)
  const btnDelete = document.createElement("button"); // ← createElement
  btnDelete.classList.add("card-btn", "card-btn--delete");
  btnDelete.type = "button";
  btnDelete.textContent = "🗑️";
  btnDelete.addEventListener("click", () => deleteCard(card, item.id));

  actions.appendChild(btnFav); // ← appendChild
  actions.appendChild(btnTrade); // ← appendChild
  actions.appendChild(btnDelete); // ← appendChild
  body.appendChild(actions); // ← appendChild
  card.appendChild(body); // ← appendChild

  return card;
}

function buildPlaceholder(rarity) {
  const emojiMap = {
    Lendário: "👑",
    "Ultra Raro": "💎",
    Raro: "🔷",
    Incomum: "🟢",
    Comum: "⚪",
  };
  const el = document.createElement("div"); // ← createElement
  el.classList.add("card-image-placeholder");
  el.textContent = emojiMap[rarity] || "📦";
  return el;
}

// ============================================================
// REQUISITO 4: CAMALEÃO — classList.toggle()
// ============================================================
function toggleCardClass(card, btn, cssClass) {
  card.classList.toggle(cssClass); // ← classList.toggle()
  const isActive = card.classList.contains(cssClass);
  btn.classList.toggle("active", isActive);
}

// ============================================================
// REQUISITO 3: DESTRUIDOR — .remove()
// ============================================================
function deleteCard(card, id) {
  card.style.transition = "opacity 0.2s, transform 0.2s";
  card.style.opacity = "0";
  card.style.transform = "scale(0.9)";
  setTimeout(() => {
    card.remove(); // ← .remove()
    collection.delete(id);
    updateStats();
  }, 200);
}

// ============================================================
// REQUISITO 1: CAPTURADOR DE DADOS — lendo o formulário
// ============================================================
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = inputName.value.trim(); // lê o DOM
  const imageUrl = inputImage.value.trim(); // lê o DOM
  const rarity = inputRarity.value; // lê o DOM
  const repeated = inputRepeated.checked; // lê o DOM

  if (!name) {
    formError.textContent = "Por favor, informe o nome do item.";
    formError.style.display = "block";
    inputName.focus();
    return;
  }

  formError.style.display = "none";

  const id =
    "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  const item = { id, name, imageUrl, rarity, isRepeated: repeated };

  collection.set(id, item);

  // Requisito 2 — insere o card na grade
  const cardEl = buildCard(item);
  cardsGrid.appendChild(cardEl); // ← appendChil

  updateStats();
  applySearch();
  form.reset();
  inputName.focus();
});

// ============================================================
// REQUISITO 6: BUSCA NINJA — display: none em tempo real
// ============================================================
searchInput.addEventListener("input", applySearch);

function applySearch() {
  const query = searchInput.value.trim().toLowerCase();
  const cards = cardsGrid.querySelectorAll(".card");

  cards.forEach(function (card) {
    const cardName = (card.dataset.name || "").toLowerCase();
    card.style.display = cardName.includes(query) ? "" : "none"; // ← display: none
  });
}

// Inicializa os contadores
updateStats();
