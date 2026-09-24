import { test } from "node:test";
import assert from "node:assert/strict";
import { equivalentDicewareWords, equivalentDigits, formatDuration, secondsToCrack } from "../javascripts/strength.js";

test("crack time uses the expected number of guesses, half the keyspace", () => {
  assert.equal(secondsToCrack(11, 1024), 1);
  assert.equal(secondsToCrack(41, 1e4), 2 ** 40 / 1e4);
});

test("formatDuration picks the largest unit and two significant digits", () => {
  const hour = 3600, year = 365.2425 * 24 * hour;
  assert.equal(formatDuration(0.2), "less than a second");
  assert.equal(formatDuration(1), "1 second");
  assert.equal(formatDuration(45.4), "45 seconds");
  assert.equal(formatDuration(1.5 * hour), "1.5 hours");
  assert.equal(formatDuration(2 * 24 * hour), "2 days");
  assert.equal(formatDuration(2934 * year), "2,900 years");
  assert.equal(formatDuration(1.1e7 * year), "11 million years");
  assert.equal(formatDuration(3.2e9 * year), "3.2 billion years");
});

test("equivalents in digits and Diceware words", () => {
  assert.equal(equivalentDigits(41.5), 12);
  assert.equal(equivalentDigits(Math.log2(1e6)), 6);
  assert.ok(Math.abs(equivalentDicewareWords(Math.log2(7776) * 4) - 4) < 1e-12);
});
