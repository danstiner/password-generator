import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { randomBelow, randomBigIntBelow, getRandomSymbolsFromAlphabets } from "../javascripts/random.js";

test("randomBelow returns integers in [0, n)", () => {
  for (const n of [1, 2, 3, 7, 361, 2643, 2 ** 31 + 1, 2 ** 32]) {
    for (let i = 0; i < 1000; i++) {
      const value = randomBelow(n);
      assert.ok(Number.isInteger(value) && value >= 0 && value < n, `${value} out of range for n=${n}`);
    }
  }
});

test("randomBelow rejects invalid ranges", () => {
  for (const n of [0, -1, 1.5, NaN, Infinity, 2 ** 32 + 1, "3"]) {
    assert.throws(() => randomBelow(n), RangeError, `n=${n}`);
  }
});

test("randomBelow rejects values that would bias the result", (t) => {
  // For n = 3 the largest multiple of 3 below 2^32 is 2^32 - 1, so only 0xffffffff is rejected.
  const values = [0xffffffff, 0xfffffffe];
  const getRandomValues = t.mock.method(globalThis.crypto, "getRandomValues", (array) => {
    array[0] = values.shift();
    return array;
  });
  assert.equal(randomBelow(3), 0xfffffffe % 3);
  assert.equal(getRandomValues.mock.callCount(), 2);
});

test("randomBelow is uniform for a range that is not a power of two", () => {
  // Regression test: the previous implementation OR'ed two random words together, making
  // values with more one bits up to 9x more likely for this range.
  const n = 6, draws = 60000, expected = draws / n;
  const counts = new Array(n).fill(0);
  for (let i = 0; i < draws; i++) counts[randomBelow(n)]++;
  // Allow six standard deviations; a false failure has probability below 1e-8.
  const tolerance = 6 * Math.sqrt(expected * (1 - 1 / n));
  for (const count of counts) {
    assert.ok(Math.abs(count - expected) < tolerance, `counts ${counts} not uniform`);
  }
});

test("getRandomSymbolsFromAlphabets picks one symbol per alphabet and sums entropy", () => {
  const alphabets = [["a", "b"], ["c", "d", "e", "f"], ["g"]];
  const result = getRandomSymbolsFromAlphabets(alphabets);
  assert.equal(result.symbols.length, 3);
  result.symbols.forEach((symbol, i) => assert.ok(alphabets[i].includes(symbol)));
  assert.equal(result.bitsOfEntropy, 3);
});

test("randomBelow fails loudly without a secure random source", (t) => {
  t.mock.property(globalThis.crypto, "getRandomValues", undefined);
  assert.throws(() => randomBelow(2), /not supported/);
});

test("randomBigIntBelow returns BigInts in [0, n), including beyond 2^53", () => {
  for (const n of [1n, 2n, 3n, 255n, 256n, 257n, (1n << 64n) + 1n, 3n ** 40n]) {
    for (let i = 0; i < 500; i++) {
      const value = randomBigIntBelow(n);
      assert.ok(typeof value === "bigint" && value >= 0n && value < n, `${value} out of range for n=${n}`);
    }
  }
  for (const n of [0n, -1n, 5]) assert.throws(() => randomBigIntBelow(n), RangeError);
});

test("randomBigIntBelow rejects values at or above n", (t) => {
  // n = 300 needs 9 bits: two bytes masked to 0x1ff. 0x01ff = 511 is rejected, 0x0005 accepted.
  const draws = [[0x01, 0xff], [0x00, 0x05]];
  const getRandomValues = t.mock.method(globalThis.crypto, "getRandomValues", (array) => {
    array.set(draws.shift());
    return array;
  });
  assert.equal(randomBigIntBelow(300n), 5n);
  assert.equal(getRandomValues.mock.callCount(), 2);
});

test("randomBigIntBelow is uniform", () => {
  const n = 6, draws = 60000, expected = draws / n;
  const counts = new Array(n).fill(0);
  for (let i = 0; i < draws; i++) counts[Number(randomBigIntBelow(BigInt(n)))]++;
  const tolerance = 6 * Math.sqrt(expected * (1 - 1 / n));
  for (const count of counts) {
    assert.ok(Math.abs(count - expected) < tolerance, `counts ${counts} not uniform`);
  }
});
