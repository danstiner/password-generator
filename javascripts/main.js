/*
    Copyright (c) 2016 Daniel Stiner

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the Software
    is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
    OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var wordlist = wordlistCommonPasswords;
var wordCount = 6;

function generatePassphrase() {
  try {
    var result = getRandomSymbols(wordlist, wordCount);
    document.getElementById("generated_passphrase").textContent = concat_words(result.symbols);
    displayPassphraseStrength(result.bitsOfEntropy);
  } catch (ex) {
    displayError(ex);
    throw ex;
  } 
}

function getRandomSymbols(alphabet, count) {
  var randomValues = new Uint32Array(count);
  window.crypto.getRandomValues(randomValues);
  return {
    symbols: Array.from(randomValues).map(value => alphabet[value % alphabet.length]),
    bitsOfEntropy: count * Math.log2(alphabet.length)
  };
}

function concat_words(words) {
  return words.reduce((prev, cur) => prev + " " + cur);
}

function displayPassphraseStrength(bitsOfEntropy) {
  var offlineHashRate = 100000000000000;
  var offlineHashRateText = "one hundred trillion guesses/sec";
  var timeToCrack = getTimeToCrack(offlineHashRate, bitsOfEntropy);

  var strengthElement = document.getElementById("generated_passphrase_strength");
  var entropyElement = document.getElementById("generated_passphrase_entropy");

  entropyElement.textContent = "~" + Math.floor(bitsOfEntropy) + " bits of entropy";
  strengthElement.textContent = timeToCrack.value + " " + timeToCrack.unit + " at " + offlineHashRateText;
  strengthElement.title = "Conservative estimate. Assumes attacker has a hash "
  + "of the passphrase (say through a server data breach) and is using a "
  + "supercomputer to brute-force guess each of the ~2^" + Math.floor(bitsOfEntropy)
  + " possible passphrases (unlikely now but computers continue double in speed each year).";
}

function getTimeToCrack(guessesPerSecond, bitsOfEntropy) {
  var log2GuessRate = Math.log2(guessesPerSecond);
  var secondsToCrack = (bitsOfEntropy < log2GuessRate) ? 0 : Math.pow(2, bitsOfEntropy - log2GuessRate);
  return secondsToTimeWithUnit(secondsToCrack);
}

function secondsToTimeWithUnit(seconds) {
  var secondsPerMinute = 60;
  var secondsPerHour = 60 * secondsPerMinute;
  var secondsPerDay = 24 * secondsPerHour;
  var secondsPerYear = 365 * secondsPerDay;

  var pluralize = (value, unit) => {
    var roundedValue = Math.round(value);
    return {
      value: roundedValue,
      unit: roundedValue === 1 ? unit : unit + "s"
    };
  };

  if (seconds > secondsPerYear) {
    return pluralize(seconds / secondsPerYear, "year");
  } else if (seconds > secondsPerDay) {
    return pluralize(seconds / secondsPerDay, "day");
  } else if (seconds > secondsPerHour) {
    return pluralize(seconds / secondsPerHour, "hour");
  } else if (seconds > secondsPerMinute) {
    return pluralize(seconds / secondsPerMinute, "minute");
  } else {
    return pluralize(seconds, "second");
  }
}

function displayError(exception) {
  var element = document.getElementById("passphrase_generation_error");
  element.innerHTML = "<strong>Error</strong>: " + exception.message;
  element.style.display = "";
}
