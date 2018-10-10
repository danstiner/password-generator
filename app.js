"use strict";
function randomUint32() {
    var array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0];
}
// 2^32-1
var MAX_RANDOM_INTEGER = 4294967295;
// Generate a random integer in [0, max)
function randomInt(max) {
    if (max <= 0) {
        throw new RangeError("");
    }
    if (max > MAX_RANDOM_INTEGER) {
        throw new RangeError("Maximum value larger than supported");
    }
    // Minimum number of bits needed to encode a value of max - 1
    var k = max <= 1 ? max : Math.ceil(Math.log(max - 1) * Math.LOG2E);
    // Mask to increase probability candidate value is less than max
    var bitmask = Math.pow(2, k) - 1;
    // Reject candidate values less than max (rejection sampling)
    // Gives an unbiased distribution for non-power-of-two ranges 
    var randomValue;
    do {
        randomValue = randomUint32() & bitmask;
    } while (randomValue >= max);
    return randomValue;
}
var passphraseElem = document.getElementById('generated_passphrase');
console.log(randomInt(1));
