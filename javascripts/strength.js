// Ways of describing how hard a passphrase with a given entropy is to guess.

// Guessing rates for an offline attacker who has stolen a password hash
export const attackers = [
  { label: "GPUs cracking a fast hash such as SHA-256", guessesPerSecond: 1e10 },
  { label: "Argon2id with 256 MB of memory per guess", guessesPerSecond: 1e4 },
];

// On average an attacker tries half of all possible passphrases before finding the right one.
export function secondsToCrack(bits, guessesPerSecond) {
  return 2 ** (bits - 1) / guessesPerSecond;
}

// Number of decimal digits in a random number of equal strength
export function equivalentDigits(bits) {
  return Math.round(bits * Math.log10(2));
}

// Number of Diceware words (7776-word list) of equal strength
export function equivalentDicewareWords(bits) {
  return bits / Math.log2(7776);
}

const units = [
  ["second", 1],
  ["minute", 60],
  ["hour", 60 * 60],
  ["day", 24 * 60 * 60],
  ["year", 365.2425 * 24 * 60 * 60],
];

// Formats a duration to two significant digits in the largest unit that fits:
// "45 seconds", "1.5 hours", "2,900 years", "11 million years"
export function formatDuration(seconds) {
  if (seconds < 1) return "less than a second";
  const [unit, size] = units.findLast(([, size]) => seconds >= size);
  const value = seconds / size;
  const text = new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 2,
    notation: value >= 1e6 ? "compact" : "standard",
    compactDisplay: "long",
  }).format(value);
  return `${text} ${unit}${text === "1" ? "" : "s"}`;
}
