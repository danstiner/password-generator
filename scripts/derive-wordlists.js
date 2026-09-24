// Derives the adjective, noun and verb lists used to build sentence passphrases, writing
// javascripts/vocabulary.js. Run with `npm run derive:wordlists` after `npm install`.
//
// Words are chosen to be concrete (easy to picture) and familiar (easy to spell), using:
// - Brysbaert, Warriner & Kuperman (2014) concreteness ratings for 40k English lemmas, which
//   also give each word's SUBTLEX-US frequency and dominant part of speech.
// - WordNet 3.1 to keep only base forms (lemmas) and only verbs that take a direct object.
// - src/wordlists/blocklist.txt, a hand-reviewed list of words not to use.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import wordnet from "wordnet-db";

const root = fileURLToPath(new URL("..", import.meta.url));
const target = `${root}javascripts/vocabulary.js`;
const blocklistPath = `${root}src/wordlists/blocklist.txt`;

const norms = {
  url: "https://raw.githubusercontent.com/ArtsEngine/concreteness/master/Concreteness_ratings_Brysbaert_et_al_BRM.txt",
  sha256: "0b4082dbd38585b0ee1fd258145b7a50592f8d0d98e5fc6b6844ceef3cd8ecc8",
};
const subtlexCorpusMillions = 51; // SUBTLEX-US contains 51 million words

// Concreteness is rated 1 (abstract) to 5 (concrete). Zipf frequency is log10(occurrences per
// billion words); below 3 is considered low frequency (van Heuven et al., 2014).
const criteria = {
  adjectives: { pos: "Adjective", wordnetPos: "adj", minConcreteness: 2.5, minZipf: 2.5 },
  nouns: { pos: "Noun", wordnetPos: "noun", minConcreteness: 4.0, minZipf: 3.0 },
  verbs: { pos: "Verb", wordnetPos: "verb", minConcreteness: 3.0, minZipf: 2.5 },
};
const minPercentKnown = 0.95;
const wordPattern = /^[a-z]{3,10}$/;

// WordNet verb frames with a direct object: "Somebody ----s something", "Something ----s something"
const transitiveFrames = new Set([8, 11]);

async function fetchPinned({ url, sha256 }) {
  const cachePath = `${root}.cache/${sha256}`;
  const data = existsSync(cachePath)
    ? readFileSync(cachePath)
    : Buffer.from(await (await fetch(url)).arrayBuffer());
  const actual = createHash("sha256").update(data).digest("hex");
  if (actual !== sha256) throw new Error(`Checksum mismatch for ${url}: got ${actual}`);
  mkdirSync(`${root}.cache`, { recursive: true });
  writeFileSync(cachePath, data);
  return data.toString("utf8");
}

function parseNorms(text) {
  return text.split(/\r?\n/).slice(1).filter(Boolean).map((line) => {
    const [word, bigram, concreteness, , , , percentKnown, subtlexCount, pos] = line.split("\t");
    return {
      word,
      isSingleWord: bigram === "0",
      concreteness: Number(concreteness),
      percentKnown: Number(percentKnown),
      zipf: Math.log10(Number(subtlexCount) / subtlexCorpusMillions) + 3,
      pos,
    };
  });
}

function readWordnet(file) {
  // Lines starting with a space are the license header
  return readFileSync(`${wordnet.path}/${file}`, "utf8").split("\n").filter((line) => /^\S/.test(line));
}

function wordnetLemmas(pos) {
  return new Set(readWordnet(`index.${pos}`).map((line) => line.split(" ")[0]));
}

// Parses a data.<pos> line: offset lex_filenum ss_type w_cnt [word lex_id]... p_cnt [pointer]... [frames]
function parseSynset(line) {
  const fields = line.split(" | ")[0].trim().split(" ");
  const wordCount = parseInt(fields[3], 16);
  const words = [];
  for (let i = 0; i < wordCount; i++) words.push(fields[4 + 2 * i].toLowerCase());
  const pointerCount = Number(fields[4 + 2 * wordCount]);
  const framesStart = 5 + 2 * wordCount + 4 * pointerCount;
  const frames = [];
  for (let i = framesStart + 1; i < fields.length; i += 3) {
    frames.push({ frame: Number(fields[i + 1]), wordIndex: parseInt(fields[i + 2], 16) });
  }
  return { words, frames };
}

function transitiveVerbs() {
  const verbs = new Set();
  for (const { words, frames } of readWordnet("data.verb").map(parseSynset)) {
    for (const { frame, wordIndex } of frames) {
      if (!transitiveFrames.has(frame)) continue;
      if (wordIndex === 0) words.forEach((word) => verbs.add(word));
      else verbs.add(words[wordIndex - 1]);
    }
  }
  return verbs;
}

function isComparative(word, adjectives) {
  const match = word.match(/^(.+?)(er|est)$/);
  if (!match) return false;
  const stem = match[1];
  return [stem, stem + "e", stem.replace(/i$/, "y"), stem.replace(/(.)\1$/, "$1")].some((s) => adjectives.has(s));
}

function readBlocklist() {
  const text = readFileSync(blocklistPath, "utf8").replace(/#.*/g, "");
  return new Set(text.split(/\s+/).filter(Boolean));
}

function isWellFormed(word, pos, lemmas) {
  if (!lemmas.has(word)) return false;
  if (pos === "noun") return !/[^su]s$/.test(word); // plural or plural-only nouns: boots, jeans
  if (pos === "adj") return !isComparative(word, lemmas);
  return true;
}

const rows = parseNorms(await fetchPinned(norms));
const blocklist = readBlocklist();
const blocked = new Set();
const verbsWithObject = transitiveVerbs();
const lists = {};

for (const [name, c] of Object.entries(criteria)) {
  const lemmas = wordnetLemmas(c.wordnetPos);
  lists[name] = rows
    .filter((r) => r.pos === c.pos && r.isSingleWord && wordPattern.test(r.word) && r.percentKnown >= minPercentKnown)
    .filter((r) => r.concreteness >= c.minConcreteness && r.zipf >= c.minZipf)
    .filter((r) => isWellFormed(r.word, c.wordnetPos, lemmas))
    .filter((r) => c.wordnetPos !== "verb" || verbsWithObject.has(r.word))
    .filter((r) => {
      if (!blocklist.has(r.word)) return true;
      blocked.add(r.word);
      return false;
    })
    .map((r) => r.word)
    .sort();
}

const out = ["// Generated by scripts/derive-wordlists.js, do not edit."];
for (const [name, words] of Object.entries(lists)) {
  out.push(`export const ${name} = [`, ...words.map((word) => `  ${JSON.stringify(word)},`), "];");
  console.log(`${name}: ${words.length} words, ${Math.log2(words.length).toFixed(2)} bits each`);
}
writeFileSync(target, out.join("\n") + "\n");

const unused = [...blocklist].filter((word) => !blocked.has(word));
if (unused.length) console.log(`Blocklist entries matching no candidate: ${unused.join(" ")}`);
