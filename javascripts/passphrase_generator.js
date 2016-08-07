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
(function(exports) {
  var wordlistMetadata = {
    "common_passwords": {
      description: "common words",
      words: wordlists.common_passwords
    },
    "diceware": {
      description: "<a href=\"http://www.diceware.com/\">Diceware</a> words",
      words: wordlists.diceware
    }
  };
  var wordlist = wordlistMetadata[localStorage.getItem("wordlist")] || wordlistMetadata["common_passwords"];
  var wordCount = parseInt(localStorage.getItem("wordCount")) || 6;

  function generatePassphrase() {
    try {
      var result = crypto_random_generator.getRandomSymbolsFromFixedAlphabet(wordlist.words, wordCount);
      document.getElementById("generated_passphrase").textContent = concat_words(result.symbols);
      displayPassphraseStrength(result.bitsOfEntropy);
    } catch (ex) {
      displayError(ex);
      throw ex;
    } 
  };

  var updateSelectors = () => {
    document.getElementById("passphrase_generation_symbol_count").innerHTML = Array.from(document.querySelectorAll("#passphrase_generation_symbol_counts a")).filter(elem => elem.dataset.value == wordCount)[0].innerHTML;
    document.getElementById("passphrase_generation_wordlist").innerHTML = wordlist.description;
  };

  function selectNodeContents(element) {
    var range = document.createRange();
    range.selectNodeContents(element);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  function concat_words(words) {
    return words.reduce((prev, cur) => prev + " " + cur);
  }

  function displayPassphraseStrength(bitsOfEntropy) {
    var offlineElement = document.getElementById("time_to_guess_offline");
    var entropyElement = document.getElementById("generated_passphrase_entropy");

    entropyElement.textContent = "~" + Math.floor(bitsOfEntropy) + " bits of entropy";
    offlineElement.textContent = getTimeToCrackText(offlineElement.dataset.rate, bitsOfEntropy);
  }

  function getTimeToCrackText(guessesPerSecond, bitsOfEntropy) {
    var log2GuessRate = Math.log2(guessesPerSecond);
    var secondsToCrack = (bitsOfEntropy < log2GuessRate) ? 0 : Math.pow(2, bitsOfEntropy - log2GuessRate);
    var timeToCrack = secondsToTimeWithUnit(secondsToCrack);
    return timeToCrack.value + " " + timeToCrack.unit;
  }

  function secondsToTimeWithUnit(seconds) {
    var secondsPerMinute = 60;
    var secondsPerHour = 3600;
    var secondsPerDay = 86400;
    var secondsPerYear = 31556940; // one average Gregorian year

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

  exports.run = function() {
    updateSelectors();
    generatePassphrase();
  };

  exports.setWordCount = target => {
    wordCount = parseInt(target.dataset.value);
    localStorage.setItem("wordCount", wordCount);
    generatePassphrase();
    document.getElementById("passphrase_generation_symbol_count").innerHTML = target.innerHTML;
    return false;
  };

  exports.setWordlist = target => {
    var wordlistName = target.dataset.value;
    wordlist = wordlistMetadata[wordlistName];
    localStorage.setItem("wordlist", wordlistName)
    generatePassphrase();
    document.getElementById("passphrase_generation_wordlist").innerHTML = wordlist.description;
    return false;
  };
})(this.passphrase_generator = {});
