(function(exports) {
  var generationAlgorithms = {
    "common_passwords": {
      description: "common words",
      run: wordCount => crypto_random_generator.getRandomSymbolsFromFixedAlphabet(wordlists.common_passwords, wordCount)
    },
    "diceware": {
      description: "<a href=\"http://www.diceware.com/\">Diceware</a> words",
      run: wordCount => crypto_random_generator.getRandomSymbolsFromFixedAlphabet(wordlists.diceware, wordCount)
    },
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
  var algorithm = generationAlgorithms[localStorage.getItem("algorithm")] || generationAlgorithms["phrase"];
  var wordCount = parseInt(localStorage.getItem("wordCount")) || 4;

  function generatePassphrase() {
    try {
      var result = runGenerationAlgorithm(algorithm);
      document.getElementById("generated_passphrase").textContent = concat_words(result.symbols);
      displayPassphraseStrength(result.bitsOfEntropy);
    } catch (ex) {
      displayError(ex);
      throw ex;
    } 
  };

  function runGenerationAlgorithm(algorithm) {
    return algorithm.run(wordCount);
  };

  var updateSelectors = () => {
    document.getElementById("passphrase_generation_symbol_count").innerHTML = Array.from(document.querySelectorAll("#passphrase_generation_symbol_counts a")).filter(elem => elem.dataset.value == wordCount)[0].innerHTML;
    document.getElementById("passphrase_generation_wordlist").innerHTML = algorithm.description;
  };

  exports.selectNodeContents = function (element) {
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
    algorithm = generationAlgorithms[wordlistName];
    localStorage.setItem("algorithm", wordlistName)
    generatePassphrase();
    document.getElementById("passphrase_generation_wordlist").innerHTML = algorithm.description;
    return false;
  };
})(this.passphrase_generator = {});
