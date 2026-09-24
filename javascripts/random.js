// Returns a uniformly distributed BigInt in [0, n) for any BigInt n >= 1, so the whole space of
// passphrases can be sampled at once even when it exceeds 2^53.
// Random bytes are masked to the bit length of n - 1 and values >= n rejected, so on average
// fewer than two draws are needed.
export function randomBigIntBelow(n) {
  if (typeof n !== "bigint" || n < 1n) {
    throw new RangeError("Random value range must be a BigInt of at least 1");
  }
  if (!globalThis.crypto || !globalThis.crypto.getRandomValues) {
    throw new Error("Secure random number generation is not supported by this browser");
  }

  const bitLength = (n - 1n).toString(2).length;
  const mask = (1n << BigInt(bitLength)) - 1n;
  const bytes = new Uint8Array(Math.ceil(bitLength / 8));

  for (;;) {
    globalThis.crypto.getRandomValues(bytes);
    let value = 0n;
    for (const byte of bytes) value = (value << 8n) | BigInt(byte);
    value &= mask;
    if (value < n) return value;
  }
}
