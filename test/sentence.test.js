import { test } from "node:test";
import assert from "node:assert/strict";
import { capacity, generateSentence, log2, sentenceAt, templates, thirdPersonSingular } from "../javascripts/sentence.js";
import { verbs } from "../javascripts/vocabulary.js";

test("thirdPersonSingular follows English spelling rules", () => {
  const cases = { juggle: "juggles", catch: "catches", wash: "washes", mix: "mixes", toss: "tosses",
    buzz: "buzzes", carry: "carries", play: "plays", go: "goes", echo: "echoes", boo: "boos" };
  for (const [verb, expected] of Object.entries(cases)) assert.equal(thirdPersonSingular(verb), expected);
});

test("inflected verbs stay distinct, so no two random picks render the same", () => {
  assert.equal(new Set(verbs.map(thirdPersonSingular)).size, verbs.length);
});

test("sentenceAt maps every index of a small space to a distinct sentence", () => {
  const a = { name: "a", words: ["red", "blue"] };
  const b = { name: "b", words: ["cat", "dog", "owl"] };
  const options = [[a, b, "sits"], [b, "and", b]];
  const total = capacity(options[0]) + capacity(options[1]);
  assert.equal(total, 15n);
  const texts = new Set();
  for (let i = 0n; i < total; i++) texts.add(sentenceAt(options, i).text);
  assert.equal(texts.size, 15);
  assert.ok(texts.has("Red cat sits") && texts.has("Owl and owl"));
});

test("generates sentences with one secret word per requested word", () => {
  for (const wordCount of Object.keys(templates).map(Number)) {
    const { text, parts } = generateSentence(wordCount);
    assert.equal(parts.filter((part) => part.secret).length, wordCount);
    assert.equal(text, parts.map((part) => part.text).join(" "));
    assert.match(text, /^[A-Z][a-z]*( [a-z]+)+$/);
  }
});

test("entropy is the sum of log2 of each slot's list size", () => {
  for (const [wordCount, [template]] of Object.entries(templates)) {
    const expected = template.filter((part) => typeof part !== "string")
      .reduce((bits, slot) => bits + Math.log2(slot.words.length), 0);
    assert.ok(Math.abs(generateSentence(Number(wordCount)).bits - expected) < 1e-9);
  }
});

test("log2 is accurate beyond 2^53", () => {
  assert.equal(log2(1n << 80n), 80);
  assert.ok(Math.abs(log2(3n ** 50n) - 50 * Math.log2(3)) < 1e-9);
});

test("rejects unsupported word counts", () => {
  for (const wordCount of [0, 3, 7]) assert.throws(() => generateSentence(wordCount), RangeError);
});
