const toppings = [
  { id: "maguro", label: "🐟 まぐろ" },
  { id: "ebi", label: "🦐 えび" },
  { id: "tamago", label: "🥚 たまご" },
  { id: "ika", label: "🦑 いか" },
  { id: "salmon", label: "🍣 サーモン" },
];

const avatars = ["👨‍🍳", "👩", "🧑‍💼", "👴", "👧", "🧔"];

const state = {
  score: 0,
  combo: 0,
  lives: 3,
  activeOrder: null,
  step: 0,
  timerMax: 5000,
  timerLeft: 5000,
  timerId: null,
  running: false,
};

const els = {
  customers: document.getElementById("customers"),
  toppings: document.getElementById("toppings"),
  riceBtn: document.getElementById("riceBtn"),
  startBtn: document.getElementById("startBtn"),
  score: document.getElementById("score"),
  combo: document.getElementById("combo"),
  lives: document.getElementById("lives"),
  stepLabel: document.getElementById("stepLabel"),
  timerBar: document.getElementById("timerBar"),
  message: document.getElementById("message"),
};

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function createCustomers() {
  const cards = Array.from({ length: 5 }).map((_, i) => {
    const buttonId = `serve-${i}`;
    return `
      <article class="customer" data-slot="${i}">
        <div class="customer-avatar">${avatars[i % avatars.length]}</div>
        <div class="order" id="order-${i}">待機中...</div>
        <button id="${buttonId}" disabled>この人に渡す</button>
      </article>
    `;
  });
  els.customers.innerHTML = cards.join("");
}

function createToppings() {
  els.toppings.innerHTML = toppings
    .map(
      (item) =>
        `<button class="topping" data-topping="${item.id}">${item.label}</button>`,
    )
    .join("");
}

function setMessage(text, ok = true) {
  els.message.textContent = text;
  els.message.style.color = ok ? "var(--ok)" : "var(--accent)";
}

function updateHud() {
  els.score.textContent = String(state.score);
  els.combo.textContent = String(state.combo);
  els.lives.textContent = "💢".repeat(state.lives) || "0";
}

function updateStepLabel() {
  if (!state.running) {
    els.stepLabel.textContent = "開始ボタンでスタート";
    return;
  }
  if (state.step === 0) els.stepLabel.textContent = "1) 注文どおりのネタを選ぶ";
  if (state.step === 1) els.stepLabel.textContent = "2) お米をクリック";
  if (state.step === 2) els.stepLabel.textContent = "3) 指定のお客さんに渡す";
}

function assignOrders() {
  const picks = shuffle(toppings).slice(0, 5);
  picks.forEach((top, i) => {
    const orderEl = document.getElementById(`order-${i}`);
    orderEl.textContent = `注文: ${top.label}`;
    orderEl.dataset.topping = top.id;
  });
}

function pickActiveOrder() {
  const slot = Math.floor(Math.random() * 5);
  const orderEl = document.getElementById(`order-${slot}`);
  state.activeOrder = { slot, topping: orderEl.dataset.topping };
  state.step = 0;

  document.querySelectorAll(".customer button").forEach((btn, index) => {
    btn.disabled = index !== slot;
  });

  setMessage(`急げ！ ${slot + 1}番のお客さんに「${labelById(state.activeOrder.topping)}」を作る！`);
  state.timerLeft = state.timerMax;
  updateStepLabel();
}

function labelById(id) {
  return toppings.find((t) => t.id === id)?.label ?? id;
}

function loseLife(reason) {
  state.lives -= 1;
  state.combo = 0;
  updateHud();
  setMessage(reason, false);

  if (state.lives <= 0) {
    gameOver();
  } else {
    pickActiveOrder();
  }
}

function gameOver() {
  state.running = false;
  clearInterval(state.timerId);
  state.timerId = null;
  document.querySelectorAll("button").forEach((btn) => {
    if (btn.id !== "startBtn") btn.disabled = true;
  });
  els.startBtn.disabled = false;
  els.timerBar.style.width = "0%";
  updateStepLabel();
  setMessage(`ゲームオーバー！ 最終スコア: ${state.score}`, false);
}

function onToppingClick(id) {
  if (!state.running || state.step !== 0) return;
  if (id !== state.activeOrder.topping) {
    loseLife("違うネタを取ってしまった！お客さんが怒った！");
    return;
  }
  state.step = 1;
  updateStepLabel();
  setMessage("よし！次はお米をのせる！");
}

function onRiceClick() {
  if (!state.running || state.step !== 1) {
    if (state.running) loseLife("手順ミス！先にネタを選ぶ必要がある。");
    return;
  }
  state.step = 2;
  updateStepLabel();
  setMessage("最後に正しいお客さんへ渡そう！");
}

function onServeClick(index) {
  if (!state.running || state.step !== 2) {
    if (state.running) loseLife("手順ミス！今はまだ渡せない。");
    return;
  }
  if (index !== state.activeOrder.slot) {
    loseLife("違うお客さんに渡してしまった！");
    return;
  }

  state.score += 100 + state.combo * 10;
  state.combo += 1;
  state.timerMax = Math.max(2500, 5000 - state.combo * 120);
  updateHud();
  setMessage("ナイス配膳！次の注文へ！");
  pickActiveOrder();
}

function tick() {
  if (!state.running) return;
  state.timerLeft -= 100;
  const ratio = Math.max(0, state.timerLeft / state.timerMax);
  els.timerBar.style.width = `${ratio * 100}%`;
  if (state.timerLeft <= 0) {
    loseLife("遅すぎる！待ちきれずに帰ってしまった...");
  }
}

function startGame() {
  state.score = 0;
  state.combo = 0;
  state.lives = 3;
  state.timerMax = 5000;
  state.running = true;
  updateHud();
  assignOrders();
  pickActiveOrder();

  document.querySelectorAll(".topping").forEach((btn) => (btn.disabled = false));
  els.riceBtn.disabled = false;
  els.startBtn.disabled = true;

  clearInterval(state.timerId);
  state.timerId = setInterval(tick, 100);
}

function setupEvents() {
  els.toppings.addEventListener("click", (event) => {
    const target = event.target.closest(".topping");
    if (!target) return;
    onToppingClick(target.dataset.topping);
  });

  els.riceBtn.addEventListener("click", onRiceClick);

  els.customers.addEventListener("click", (event) => {
    const target = event.target.closest("button[id^='serve-']");
    if (!target) return;
    const index = Number(target.id.split("-")[1]);
    onServeClick(index);
  });

  els.startBtn.addEventListener("click", startGame);
}

function init() {
  createCustomers();
  createToppings();
  updateHud();
  updateStepLabel();
  els.riceBtn.disabled = true;
  setupEvents();
}

init();
