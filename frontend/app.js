const questionEl = document.getElementById("gcaptcha-question");
const gridEl = document.getElementById("gcaptcha-grid");
const statusEl = document.getElementById("gcaptcha-status");
const verifyBtn = document.getElementById("gcaptcha-verify");
const refreshBtn = document.getElementById("gcaptcha-refresh");
const hintBtn = document.getElementById("gcaptcha-hint");
const topicSelect = document.getElementById("topic-select");
const sourceSelect = document.getElementById("source-select");

let currentChallenge = null;
let selectedIds = new Set();
let locked = false;

function setStatus(message, variant = "") {
  statusEl.textContent = message;
  statusEl.className = `gcaptcha-status${variant ? ` gcaptcha-status--${variant}` : ""}`;
}

function resetState() {
  selectedIds = new Set();
  locked = false;
  verifyBtn.disabled = false;
  setStatus("");
}

function buildTile(tile) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "gcaptcha-tile";
  button.dataset.id = tile.id;
  button.title = tile.label;

  const image = document.createElement("img");
  image.src = tile.img;
  image.alt = tile.label;

  button.appendChild(image);
  button.addEventListener("click", () => {
    if (locked) {
      return;
    }

    if (selectedIds.has(tile.id)) {
      selectedIds.delete(tile.id);
      button.classList.remove("gcaptcha-tile--selected");
    } else {
      selectedIds.add(tile.id);
      button.classList.add("gcaptcha-tile--selected");
    }
  });

  return button;
}

async function fetchMetadata() {
  const response = await fetch("/api/metadata");
  if (!response.ok) {
    throw new Error("Unable to load challenge metadata");
  }

  return response.json();
}

function renderSelect(select, options, defaultLabel) {
  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = defaultLabel;
  select.appendChild(defaultOption);

  options.forEach((option) => {
    const element = document.createElement("option");
    element.value = option;
    element.textContent = option;
    select.appendChild(element);
  });
}

async function loadChallenge() {
  const params = new URLSearchParams({
    topic: topicSelect.value,
    source: sourceSelect.value
  });

  const response = await fetch(`/api/challenges/random?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Unable to fetch challenge");
  }

  currentChallenge = await response.json();
  questionEl.textContent = currentChallenge.prompt;
  gridEl.innerHTML = "";
  currentChallenge.tiles.forEach((tile) => {
    gridEl.appendChild(buildTile(tile));
  });

  resetState();
}

function verifySelection() {
  if (locked || !currentChallenge) {
    return;
  }

  if (selectedIds.size === 0) {
    setStatus("Please select at least one image.", "ng");
    return;
  }

  const correctSet = new Set(currentChallenge.correctIds);
  const selected = Array.from(selectedIds);
  const isExact = selected.length === correctSet.size && selected.every((id) => correctSet.has(id));

  gridEl.querySelectorAll(".gcaptcha-tile").forEach((button) => {
    const tileId = button.dataset.id;
    if (correctSet.has(tileId)) {
      button.classList.add("gcaptcha-tile--correct");
    }
    if (selectedIds.has(tileId) && !correctSet.has(tileId)) {
      button.classList.add("gcaptcha-tile--wrong");
    }
  });

  locked = true;
  verifyBtn.disabled = true;

  if (isExact) {
    setStatus("You passed the parody check. 🎉", "ok");
    return;
  }

  setStatus("Try again with a new challenge.", "ng");
}

function showHint() {
  if (!currentChallenge) {
    return;
  }

  setStatus(`Hint: topic=${currentChallenge.topic}, source=${currentChallenge.source}.`, "");
}

async function initialize() {
  try {
    const metadata = await fetchMetadata();
    renderSelect(topicSelect, metadata.topics, "All topics");
    renderSelect(sourceSelect, metadata.sources, "All sources");
    await loadChallenge();
  } catch (error) {
    setStatus(error.message, "ng");
    verifyBtn.disabled = true;
    refreshBtn.disabled = true;
  }
}

verifyBtn.addEventListener("click", verifySelection);
refreshBtn.addEventListener("click", loadChallenge);
hintBtn.addEventListener("click", showHint);
topicSelect.addEventListener("change", loadChallenge);
sourceSelect.addEventListener("change", loadChallenge);

initialize();
