import { generatePassphrase, getTimeToCrackText } from "./passphrase_generator.js";

let wordCount = parseInt(localStorage.getItem("wordCount")) || 4;

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
  document.getElementById("passphrase_generation_symbol_count").innerHTML = Array.from(document.querySelectorAll("#passphrase_generation_symbol_counts a")).filter(elem => elem.dataset.value == wordCount)[0].innerHTML;
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
  offlineElement.textContent = getTimeToCrackText(offlineElement.dataset.rate, bitsOfEntropy);
}

function displayError(exception) {
  const element = document.getElementById("passphrase_generation_error");
  element.innerHTML = "<strong>Error</strong>: " + exception.message;
  element.style.display = "";
}

function onChangeWordCount(event) {
  event.preventDefault();
  wordCount = parseInt(event.target.dataset.value);
  localStorage.setItem("wordCount", wordCount);
  showPassphrase();
  document.getElementById("passphrase_generation_symbol_count").innerHTML = event.target.innerHTML;
}

for (const elem of document.querySelectorAll("#passphrase_generation_symbol_counts a")) {
  elem.addEventListener("click", onChangeWordCount);
}
document.getElementById("generated_passphrase").addEventListener("click", selectNodeContents);

updateSelectors();
showPassphrase();
