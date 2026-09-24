import { generatePassphrase, getTimeToCrackText, phraseShapes } from "./passphrase_generator.js";
import {
  common_password_adjectives as adjectives,
  common_password_nouns as nouns,
  common_password_verbs as verbs,
} from "./wordlists.js";

const defaultWordCount = 4;
let wordCount = loadWordCount();

// localStorage access throws when storage is disabled, and saved values may be stale or tampered with.
function loadWordCount() {
  try {
    const saved = Number(localStorage.getItem("wordCount"));
    if (saved in phraseShapes) return saved;
  } catch {
    // Fall back to the default below
  }
  return defaultWordCount;
}

function saveWordCount() {
  try {
    localStorage.setItem("wordCount", wordCount);
  } catch {
    // Not remembering the choice is fine
  }
}

function showPassphrase() {
  try {
    const result = generatePassphrase(wordCount);
    document.getElementById("generated_passphrase").textContent = result.symbols.join(" ");
    displayPassphraseStrength(result.bitsOfEntropy);
  } catch (ex) {
    displayError(ex);
    throw ex;
  }
}

function updateSelectors() {
  const selected = document.querySelector(`#passphrase_generation_symbol_counts a[data-value="${wordCount}"]`);
  document.getElementById("passphrase_generation_symbol_count").textContent = selected.textContent;
}

function showWordListSizes() {
  const sizes = { adjective_count: adjectives, noun_count: nouns, verb_count: verbs };
  for (const [id, list] of Object.entries(sizes)) {
    document.getElementById(id).textContent = list.length.toLocaleString("en-US");
  }
}

function selectNodeContents(event) {
  const range = document.createRange();
  range.selectNodeContents(event.currentTarget);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function displayPassphraseStrength(bitsOfEntropy) {
  const offlineElement = document.getElementById("time_to_guess_offline");
  const entropyElement = document.getElementById("generated_passphrase_entropy");

  entropyElement.textContent = "~" + Math.floor(bitsOfEntropy) + " bits of entropy";
  offlineElement.textContent = getTimeToCrackText(Number(offlineElement.dataset.rate), bitsOfEntropy);
}

function displayError(exception) {
  const element = document.getElementById("passphrase_generation_error");
  const label = document.createElement("strong");
  label.textContent = "Error";
  element.replaceChildren(label, ": " + exception.message);
  element.style.display = "inline-block";
}

function onChangeWordCount(event) {
  event.preventDefault();
  wordCount = Number(event.target.dataset.value);
  saveWordCount();
  updateSelectors();
  showPassphrase();
}

for (const elem of document.querySelectorAll("#passphrase_generation_symbol_counts a")) {
  elem.addEventListener("click", onChangeWordCount);
}
document.getElementById("generated_passphrase").addEventListener("click", selectNodeContents);

updateSelectors();
showWordListSizes();
showPassphrase();
