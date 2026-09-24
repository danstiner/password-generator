import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBigIntBelow } from "../javascripts/random.js";

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
  // Regression test: an earlier implementation OR'ed two random words together, making values
  // with more one bits up to 9x more likely for this range.
  const n = 6, draws = 60000, expected = draws / n;
  const counts = new Array(n).fill(0);
  for (let i = 0; i < draws; i++) counts[Number(randomBigIntBelow(BigInt(n)))]++;
  const tolerance = 6 * Math.sqrt(expected * (1 - 1 / n));
  for (const count of counts) {
    assert.ok(Math.abs(count - expected) < tolerance, `counts ${counts} not uniform`);
  }
});

test("randomBigIntBelow fails loudly without a secure random source", (t) => {
  t.mock.property(globalThis.crypto, "getRandomValues", undefined);
  assert.throws(() => randomBigIntBelow(2n), /not supported/);
});
