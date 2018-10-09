'use strict';
(function(exports) {
  var generationAlgorithms = {
    "phrase": {
      description: "words in a phrase",
      run: wordCount => {
        if (wordCount < 4 || wordCount > 7) {
          throw new RangeError("Word count out of range");
        } else if (wordCount === 4) {
          return crypto_random_generator.getRandomSymbolsFromAlphabets([
            wordlists.common_password_adjectives,
            wordlists.common_password_nouns,
            wordlists.common_password_verbs,
            wordlists.common_password_nouns
            ]);
        } else if (wordCount === 5) {
          return crypto_random_generator.getRandomSymbolsFromAlphabets([
            wordlists.common_password_adjectives,
            wordlists.common_password_nouns,
            wordlists.common_password_verbs,
            wordlists.common_password_adjectives,
            wordlists.common_password_nouns
            ]);
        } else if (wordCount === 6) {
          return crypto_random_generator.getRandomSymbolsFromAlphabets([
            wordlists.common_password_adjectives,
            wordlists.common_password_adjectives,
            wordlists.common_password_nouns,
            wordlists.common_password_verbs,
            wordlists.common_password_adjectives,
            wordlists.common_password_nouns
            ]);
        }
      }
    }
  };
  var algorithm = generationAlgorithms["phrase"];
  var wordCount = parseInt(localStorage.getItem("wordCount")) || 4;

  function generatePassphrase() {
    try {
      const result = runGenerationAlgorithm(algorithm);
      const encoded = result.symbols.map((symbol, index) => construct_trie(result.alphabets[index]).encode(symbol));

      document.getElementById("generated_passphrase").textContent =  encoded.join("") + " - " + encoded.join(" ") + " - " + result.symbols.join(" ");
      displayPassphraseStrength(result.bitsOfEntropy);
    } catch (ex) {
      displayError(ex);
      throw ex;
    } 
  };

  function construct_trie(words) {
    let root = new Map();

    for (let word of words) {
      var current = root;
      for (let letter of word) {
        if (!current.has(letter)) {
          current.set(letter, new Map());
        }
        current = current.get(letter);
      }
      current.set("", word);
    }

    function size_recursive(trie) {
      var size = 0;
      for (let key of trie.keys()) {
        if (key === "") {
          size += 1;
        } else {
          size += size_recursive(trie.get(key));
        }
      }
      return size;
    }

    return  {
      encode: function (word) {
        var current = root;
        let prefix = [];
        for (let letter of word) {
          if (size_recursive(current) > 1) {
            prefix.push(letter);
          }
          if (current.has(letter)) {
            current = current.get(letter);
          } else {
            throw Error("Word not in trie: " + word);
          }
        }
        return prefix.join("");
      }
    }
  }

  function runGenerationAlgorithm(algorithm) {
    return algorithm.run(wordCount);
  };

  var updateSelectors = () => {
    document.getElementById("passphrase_generation_symbol_count").innerHTML = Array.from(document.querySelectorAll("#passphrase_generation_symbol_counts a")).filter(elem => elem.dataset.value == wordCount)[0].innerHTML;
  };

  exports.selectNodeContents = function (element) {
    var range = document.createRange();
    range.selectNodeContents(element);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

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

  function getJSON(url, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          if (onSuccess) {
            onSuccess(JSON.parse(xhr.responseText));
          }
        } else {
          if (onError) {
            onError(xhr);
          }
        }
      }
    };
    xhr.open("GET", url, true);
    xhr.send();
  }

  exports.run = function() {
    updateSelectors();
    generatePassphrase();
  };

  exports.onChangeWordCount = event => {
    wordCount = parseInt(event.target.dataset.value);
    localStorage.setItem("wordCount", wordCount);
    generatePassphrase();
    document.getElementById("passphrase_generation_symbol_count").innerHTML = event.target.innerHTML;
    return false;
  };

})(this.passphrase_generator = {});
