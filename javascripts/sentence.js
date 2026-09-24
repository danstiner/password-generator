// Generates passphrases shaped like sentences: "Fuzzy goat juggles the rusty anvil".
//
// Only the words drawn from the vocabulary are secret. The sentence structure is public and
// fixed for each word count, so the exact passphrase can be rebuilt from its content words alone;
// people remember the gist of a sentence much better than its exact function words.
import { randomBigIntBelow } from "./random.js";
import { adjectives, nouns, verbs } from "./vocabulary.js";

// Present tense for a singular subject: "juggle" -> "juggles". The rule is regular for every
// English verb except "be" and "have", which the vocabulary does not contain.
export function thirdPersonSingular(verb) {
  if (/(s|x|z|ch|sh)$/.test(verb) || /[^aeiou]o$/.test(verb)) return verb + "es";
  if (/[^aeiou]y$/.test(verb)) return verb.slice(0, -1) + "ies";
  return verb + "s";
}

// A template is a list of parts: strings are fixed words, objects are slots filled with a random
// word from `words`, optionally inflected.
const adjective = { name: "adjective", words: adjectives };
const noun = { name: "noun", words: nouns };
const verb = { name: "verb", words: verbs, inflect: thirdPersonSingular };

// Templates for each number of random words. Listing more than one template for a word count
// makes the template choice part of the secret, weighted so every sentence is equally likely.
export const templates = {
  4: [[adjective, noun, verb, "the", noun]],
  5: [[adjective, noun, verb, "the", adjective, noun]],
  6: [[adjective, noun, verb, "the", adjective, noun, "with", "the", noun]],
};

const isSlot = (part) => typeof part !== "string";

// Number of distinct sentences a template produces
export function capacity(template) {
  return template.filter(isSlot).reduce((product, slot) => product * BigInt(slot.words.length), 1n);
}

// log2 of a positive BigInt, accurate to double precision
export function log2(n) {
  const shift = Math.max(0, n.toString(2).length - 53);
  return Math.log2(Number(n >> BigInt(shift))) + shift;
}

// Maps each index in [0, total capacity) to a distinct sentence: the index first selects a
// template, and the remainder is read as mixed-radix digits, one per slot.
export function sentenceAt(options, index) {
  let template = 0;
  while (index >= capacity(options[template])) {
    index -= capacity(options[template]);
    template++;
  }

  const parts = options[template].map((part) => {
    if (!isSlot(part)) return { text: part, secret: false };
    const size = BigInt(part.words.length);
    const word = part.words[Number(index % size)];
    index /= size;
    return { text: part.inflect ? part.inflect(word) : word, secret: true, slot: part.name };
  });
  parts[0].text = parts[0].text[0].toUpperCase() + parts[0].text.slice(1);

  return { text: parts.map((part) => part.text).join(" "), parts };
}

// Returns { text, parts: [{ text, secret, slot }], bits } where bits is the exact entropy:
// log2 of the number of equally likely sentences.
export function generateSentence(wordCount) {
  const options = templates[wordCount];
  if (!options) {
    throw new RangeError("Word count out of range");
  }
  const total = options.reduce((sum, template) => sum + capacity(template), 0n);
  return { ...sentenceAt(options, randomBigIntBelow(total)), bits: log2(total) };
}
