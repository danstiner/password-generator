import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { adjectives, nouns, verbs } from "../js/vocabulary.js";

const lists = { adjectives, nouns, verbs };
const blocklist = new Set(
  readFileSync(new URL("../scripts/blocklist.txt", import.meta.url), "utf8").replace(/#.*/g, "").split(/\s+/).filter(Boolean),
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

// The ratings' license forbids modified copies, so check the committed file is byte-for-byte the
// authors' original. Git must not convert its CRLF line endings; see .gitattributes.
test("concreteness ratings file is unmodified", () => {
  const data = readFileSync(new URL("../scripts/data/Concreteness_ratings_Brysbaert_et_al_BRM.txt", import.meta.url));
  assert.equal(createHash("sha256").update(data).digest("hex"), "0b4082dbd38585b0ee1fd258145b7a50592f8d0d98e5fc6b6844ceef3cd8ecc8");
});
