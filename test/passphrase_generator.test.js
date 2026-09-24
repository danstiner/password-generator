import { test } from "node:test";
import assert from "node:assert/strict";
import { generatePassphrase, phraseShapes } from "../javascripts/passphrase_generator.js";

test("generates one word from the expected list for each position", () => {
  for (const [wordCount, shape] of Object.entries(phraseShapes)) {
    const { symbols, bitsOfEntropy } = generatePassphrase(Number(wordCount));
    assert.equal(symbols.length, Number(wordCount));
    symbols.forEach((word, i) => assert.ok(shape[i].includes(word), `${word} not in list ${i}`));
    const expectedBits = shape.reduce((bits, list) => bits + Math.log2(list.length), 0);
    assert.equal(bitsOfEntropy, expectedBits);
  }
});

test("rejects unsupported word counts", () => {
  for (const wordCount of [0, 3, 7, NaN]) {
    assert.throws(() => generatePassphrase(wordCount), RangeError);
  }
});
