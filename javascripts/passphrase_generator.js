import { getRandomSymbolsFromAlphabets } from "./random.js";
import {
  common_password_adjectives as adjectives,
  common_password_nouns as nouns,
  common_password_verbs as verbs,
} from "./wordlists.js";

// Word list to draw from for each position in the phrase, by number of words
export const phraseShapes = {
  4: [adjectives, nouns, verbs, nouns],
  5: [adjectives, nouns, verbs, adjectives, nouns],
  6: [adjectives, adjectives, nouns, verbs, adjectives, nouns],
};

// Returns { symbols: [word, ...], bitsOfEntropy }
export function generatePassphrase(wordCount) {
  const shape = phraseShapes[wordCount];
  if (!shape) {
    throw new RangeError("Word count out of range");
  }
  return getRandomSymbolsFromAlphabets(shape);
}

// Expected time for an attacker to guess the passphrase: on average half of all
// possible passphrases must be tried before finding the right one.
export function getTimeToCrackText(guessesPerSecond, bitsOfEntropy) {
  const expectedGuesses = Math.pow(2, bitsOfEntropy - 1);
  const timeToCrack = secondsToTimeWithUnit(expectedGuesses / guessesPerSecond);
  return timeToCrack.value.toLocaleString("en-US") + " " + timeToCrack.unit;
}

function secondsToTimeWithUnit(seconds) {
  const secondsPerMinute = 60;
  const secondsPerHour = 3600;
  const secondsPerDay = 86400;
  const secondsPerYear = 31556940; // one average Gregorian year

  const pluralize = (value, unit) => {
    const roundedValue = Math.round(value);
    return {
      value: roundedValue,
      unit: roundedValue === 1 ? unit : unit + "s"
    };
  };

  if (seconds > secondsPerYear) {
    return pluralize(seconds / secondsPerYear, "year");
  } else if (seconds > secondsPerDay) {
    return pluralize(seconds / secondsPerDay, "day");
  } else if (seconds > secondsPerHour) {
    return pluralize(seconds / secondsPerHour, "hour");
  } else if (seconds > secondsPerMinute) {
    return pluralize(seconds / secondsPerMinute, "minute");
  } else {
    return pluralize(seconds, "second");
  }
}
