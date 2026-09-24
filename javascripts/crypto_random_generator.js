'use strict';
(function(exports) {
  // Number of distinct values a Uint32 can hold
  var UINT32_RANGE = 4294967296;

  if (!Array.prototype.fill) {
    Array.prototype.fill = function(value) {
      if (this == null) {
        throw new TypeError('this is null or not defined');
      }

      var O = Object(this);
      var len = O.length >>> 0;

      for (var k = 0; k < len; k++) {
        O[k] = value;
      }

      return O;
    };
  };

  function getRandomSymbol(alphabet) {
    if (!window.crypto || !window.crypto.getRandomValues)
    {
      throw new Error("Browser does support secure randomness generation")
    }

    var index = secureRandom(0, alphabet.length);

    return {
      symbol: alphabet[index],
      bitsOfEntropy: Math.log2(alphabet.length)
    };
  };

  // Generate a uniformly distributed integer in [min, max) using the secure window.crypto.getRandomValues API.
  // A 32-bit value is drawn and values at or above the largest multiple of the range that fits in 32 bits
  // are rejected, so every result is equally likely. Bitwise operators are avoided because JavaScript
  // truncates their operands to 32 bits (e.g. `x << 32` is a no-op).
  function secureRandom(min, max) {
    var range = max - min;

    if (!Number.isInteger(range) || range < 1 || range > UINT32_RANGE) {
      throw new RangeError("Random value range must be an integer between 1 and 2^32");
    }

    var limit = UINT32_RANGE - (UINT32_RANGE % range);
    var randomArray = new Uint32Array(1);

    do {
      window.crypto.getRandomValues(randomArray);
    } while (randomArray[0] >= limit);

    return min + (randomArray[0] % range);
  }

  exports.getRandomSymbolsFromFixedAlphabet = function(alphabet, count) {
      return concatRandomSymbols(Array(count).fill(alphabet).map(getRandomSymbol));
  };

  exports.getRandomSymbolsFromAlphabets = function(alphabets) {
      return concatRandomSymbols(alphabets.map(getRandomSymbol));
  };

  function concatRandomSymbols(randomSymbols) {
    return randomSymbols.reduce(
      (previousValue, currentValue) => ({
        symbols: previousValue.symbols.concat(currentValue.symbol),
        bitsOfEntropy: (previousValue.bitsOfEntropy + currentValue.bitsOfEntropy)
      }),
      {symbols: [], bitsOfEntropy: 0});
  };

})(this.crypto_random_generator = {});
