import { test } from "node:test";
import assert from "node:assert/strict";
import * as wordlists from "../javascripts/wordlists.js";

// Entropy is computed from list lengths, so duplicate or malformed entries would overstate it.
for (const [name, words] of Object.entries(wordlists)) {
  test(`${name} contains unique lowercase words`, () => {
    assert.ok(words.length > 256, `${name} is unexpectedly small`);
    assert.equal(new Set(words).size, words.length);
    for (const word of words) assert.match(word, /^[a-z]+$/);
  });
}
