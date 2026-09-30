// Runs the browser script unmodified in a sandbox whose `window.crypto` is Node's WebCrypto,
// or a stub when a test needs to control the random values.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");

const source = readFileSync(`${__dirname}/../javascripts/crypto_random_generator.js`, "utf8");

function load(crypto = globalThis.crypto) {
  const context = vm.createContext({ window: { crypto } });
  context.this = context;
  vm.runInContext(source, context);
  return context.crypto_random_generator;
}

const pick = (generator, alphabet) => generator.getRandomSymbolsFromAlphabets([alphabet]).symbols[0];

test("never picks past the end of the list", () => {
  // The old rejection check was `> range` instead of `>= range`, returning undefined for
  // this alphabet 9 times in 16.
  const generator = load();
  const alphabet = ["a", "b", "c"];
  for (let i = 0; i < 10000; i++) {
    assert.ok(alphabet.includes(pick(generator, alphabet)));
  }
});

test("picks every item equally often", () => {
  // The old code OR'ed two random words together, so each bit was 1 three times in four and
  // some items came up 9 times more often than others.
  const generator = load();
  const alphabet = ["a", "b", "c", "d", "e", "f"];
  const draws = 60000;
  const expected = draws / alphabet.length;
  const counts = Object.fromEntries(alphabet.map((item) => [item, 0]));
  for (let i = 0; i < draws; i++) counts[pick(generator, alphabet)]++;
  // Six standard deviations: a correct implementation fails less than once in 10^8 runs.
  const tolerance = 6 * Math.sqrt(expected * (1 - 1 / alphabet.length));
  for (const count of Object.values(counts)) {
    assert.ok(Math.abs(count - expected) < tolerance, `counts not uniform: ${JSON.stringify(counts)}`);
  }
});

test("redraws values that would bias the result", () => {
  // For 3 items the largest multiple of 3 below 2^32 is 2^32 - 1, so only 0xffffffff is redrawn.
  const values = [0xffffffff, 7];
  const generator = load({ getRandomValues: (array) => { array[0] = values.shift(); return array; } });
  assert.equal(pick(generator, ["a", "b", "c"]), "b"); // 7 % 3 = 1
  assert.equal(values.length, 0);
});
