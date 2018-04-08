'use strict';
(function(exports) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
  var MAX_SAFE_INTEGER = 9007199254740991;

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

  // Generate a random number in [min, max) using secure window.crypto.getRandomValues API
  // For non-power-of-two ranges, rejection sampling is used to achieve an unbiased distribution
  function secureRandom(min, max) {
    var range = max - min;

    if (max > MAX_SAFE_INTEGER || range > MAX_SAFE_INTEGER) {
      throw new RangeError("Maximum or range of random value larger than safely representable in JavaScript");
    }
  
    var num_bits = Math.ceil(Math.log2(range));
    var bitmask = Math.pow(2, num_bits) - 1;
    var randomArray = new Uint32Array(2);
    var randomValue;

    do {
      window.crypto.getRandomValues(randomArray);
      // 21 upper bits + 32 lower bits = 53 bits (max safe integer)
      var upper_uint32 = randomArray[0] >> 11;
      var lower_uint32 = randomArray[1];
      randomValue = (upper_uint32 << 32 | lower_uint32) & bitmask;
    } while (randomValue > range)

    return min + randomValue;
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
