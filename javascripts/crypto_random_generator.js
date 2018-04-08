'use strict';
(function(exports) {
  var max_uint32 = 4294967295;

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
    if (alphabet.length >= max_uint32) {
      throw new RangeError("Symbol alphabet too large");
    }
    if(!window.crypto || !window.crypto.getRandomValues)
    {
      throw new Error("Browser does support secure randomness generation")
    }

    var randomValues = new Uint32Array(1);
    window.crypto.getRandomValues(randomValues);

    return {
      symbol: alphabet[randomValues[0] % alphabet.length],
      bitsOfEntropy: Math.log2(alphabet.length)
    };
  };

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
