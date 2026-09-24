// Number of distinct values a Uint32 can hold
const UINT32_RANGE = 2 ** 32;

// Returns a uniformly distributed integer in [0, n) using the cryptographically secure
// crypto.getRandomValues API, for 1 <= n <= 2^32.
// A 32-bit value is drawn and values at or above the largest multiple of n that fits in 32 bits
// are rejected, so every result is equally likely. Bitwise operators are avoided because JavaScript
// truncates their operands to 32 bits (e.g. `x << 32` is a no-op).
export function randomBelow(n) {
  if (!Number.isInteger(n) || n < 1 || n > UINT32_RANGE) {
    throw new RangeError("Random value range must be an integer between 1 and 2^32");
  }
  if (!globalThis.crypto || !globalThis.crypto.getRandomValues) {
    throw new Error("Secure random number generation is not supported by this browser");
  }

  const limit = UINT32_RANGE - (UINT32_RANGE % n);
  const value = new Uint32Array(1);

  do {
    globalThis.crypto.getRandomValues(value);
  } while (value[0] >= limit);

  return value[0] % n;
}

// Picks one symbol uniformly at random from each alphabet.
// Entropy is the sum of log2(alphabet size), which holds because every pick is uniform and independent.
export function getRandomSymbolsFromAlphabets(alphabets) {
  return {
    symbols: alphabets.map((alphabet) => alphabet[randomBelow(alphabet.length)]),
    bitsOfEntropy: alphabets.reduce((bits, alphabet) => bits + Math.log2(alphabet.length), 0),
  };
}
