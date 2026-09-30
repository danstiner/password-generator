import { generateSentence, templates } from "./sentence.js";
import { adjectives, nouns, verbs } from "./vocabulary.js";
import { attackers, equivalentDicewareWords, equivalentDigits, formatDuration, secondsToCrack } from "./strength.js";

const defaultWordCount = 4;
const $ = (id) => document.getElementById(id);
let wordCount = loadWordCount();
let current = null;

// localStorage access throws when storage is disabled, and saved values may be stale or tampered with.
function loadWordCount() {
  try {
    const saved = Number(localStorage.getItem("wordCount"));
    if (saved in templates) return saved;
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

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function render() {
  try {
    current = generateSentence(wordCount);
  } catch (error) {
    $("error").textContent = "Error: " + error.message;
    $("error").hidden = false;
    throw error;
  }

  // Secret words are highlighted; the fixed words around them are dimmed.
  $("phrase").replaceChildren(...current.parts.flatMap((part, i) => [
    ...(i > 0 ? [" "] : []),
    element("span", part.text, part.secret ? "word" : "glue"),
  ]));
  $("bits").textContent = current.bits.toFixed(1);
  $("digits").textContent = equivalentDigits(current.bits);
  $("diceware").textContent = equivalentDicewareWords(current.bits).toFixed(1);
  $("crack").replaceChildren(...attackers.flatMap(({ label, guessesPerSecond }) => [
    element("dt", formatDuration(secondsToCrack(current.bits, guessesPerSecond))),
    element("dd", `${label}, 10^${Math.log10(guessesPerSecond)} guesses/s`),
  ]));
  for (const button of document.querySelectorAll("[data-words]")) {
    button.setAttribute("aria-pressed", String(Number(button.dataset.words) === wordCount));
  }
  $("copy").textContent = "⧉ Copy";
  $("copy").classList.remove("copied");
}

function renderLedger() {
  $("ledger").replaceChildren(...Object.entries({ adjectives, nouns, verbs }).map(([name, words]) => {
    const row = document.createElement("tr");
    row.append(element("td", name), element("td", `${words.length.toLocaleString("en-US")} words → ${Math.log2(words.length).toFixed(2)} bits each`));
    return row;
  }));
}

async function copy() {
  if (!current) return;
  try {
    await navigator.clipboard.writeText(current.text);
    $("copy").textContent = "✓ Copied";
    $("copy").classList.add("copied");
  } catch {
    $("copy").textContent = "Select and copy manually";
  }
}

$("generate").addEventListener("click", render);
$("copy").addEventListener("click", copy);
for (const button of document.querySelectorAll("[data-words]")) {
  button.addEventListener("click", () => {
    wordCount = Number(button.dataset.words);
    saveWordCount();
    render();
  });
}
// Space re-rolls unless a control has focus, so it never hijacks buttons or <summary>.
document.addEventListener("keydown", (event) => {
  if (event.key === " " && event.target === document.body) {
    event.preventDefault();
    render();
  }
});

renderLedger();
render();
