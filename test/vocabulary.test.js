import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { adjectives, nouns, verbs } from "../javascripts/vocabulary.js";

const lists = { adjectives, nouns, verbs };
const blocklist = new Set(
  readFileSync(new URL("../src/wordlists/blocklist.txt", import.meta.url), "utf8").replace(/#.*/g, "").split(/\s+/).filter(Boolean),
);

// Entropy is computed from list lengths, so duplicate or malformed entries would overstate it.
for (const [name, words] of Object.entries(lists)) {
  test(`${name} contains unique, short, lowercase words`, () => {
    assert.ok(words.length >= 512, `${name} is unexpectedly small`);
    assert.equal(new Set(words).size, words.length);
    for (const word of words) assert.match(word, /^[a-z]{3,10}$/);
  });

  test(`${name} excludes blocklisted words`, () => {
    assert.deepEqual(words.filter((word) => blocklist.has(word)), []);
  });
}

test("each word belongs to exactly one part of speech", () => {
  const all = [...adjectives, ...nouns, ...verbs];
  assert.equal(new Set(all).size, all.length);
});

test("nouns are singular so the verb agrees with them", () => {
  assert.deepEqual(nouns.filter((noun) => /[^su]s$/.test(noun)), []);
});
