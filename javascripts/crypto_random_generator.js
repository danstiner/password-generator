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

  function concatRandomSymbols(randomSymbols) {
    return randomSymbols.reduce(
      (previousValue, currentValue) => ({
        symbols: previousValue.symbols.concat(currentValue.symbol),
        bitsOfEntropy: (previousValue.bitsOfEntropy + currentValue.bitsOfEntropy)
      }),
      {symbols: [], bitsOfEntropy: 0});
  };

  exports.getRandomSymbolsFromFixedAlphabet = function(alphabet, count) {
      return concatRandomSymbols(Array(count).fill(alphabet).map(getRandomSymbol));
  };


})(this.crypto_random_generator = {});
