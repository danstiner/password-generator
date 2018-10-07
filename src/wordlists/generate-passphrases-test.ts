// @flow
'strict'
import {randomBytes} from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'
import { expandRule, flattenTree } from './generate.logic'

const readFile = util.promisify(fs.readFile)
const MAX_SAFE_INTEGER = 9007199254740991;

async function main() {
    const templates = (await readFile(path.resolve(__dirname, 'sentence-templates.txt'))).toString().split('\n')
    const template = templates[secureRandom(0, templates.length)].split(' ')
    const file = 'wordlist.grammar.json'
    const contents = await readFile(path.resolve(__dirname, file))
    const grammar = JSON.parse(contents.toString())
    const context = {
        expansions: {},
        maxExpansions: 1,
        rules: grammar.rules
    }
    const passphrase = template.map(part => {
        const expansion = expandRule(context, part)
        if (expansion === null) {
            throw Error("Expansion returned null")
        }
        const words = flattenTree(expansion)
        if (words.length === 0) {
            throw Error("")
        }
        return words[secureRandom(0, words.length)].join(" ")
    }).join(" ")
    console.log(passphrase)
}


// Generate a random number in [min, max) using secure window.crypto.getRandomValues API
// For non-power-of-two ranges, rejection sampling is used to achieve an unbiased distribution
function secureRandom(min: number, max: number): number {
    var range = max - min - 1;

    if (min < 0) {
        throw new RangeError()
    }

    if (range < 0) {
        throw new RangeError("")
    }

    if (max > MAX_SAFE_INTEGER || range > MAX_SAFE_INTEGER) {
        throw new RangeError("Maximum or range of random value larger than safely representable in JavaScript");
    }

    var num_bits = range <= 1 ? range : Math.ceil(Math.log2(range));
    var bitmask = Math.pow(2, num_bits) - 1;
    var randomValue;

    do {
        // 53 bits total (max safe integer)
        const bytes = randomBytes(7);
        const upper_byte = bytes[6] & 31;
        randomValue = (upper_byte << 48 | bytes[5] << 40 | bytes[4] << 32 | bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0]) & bitmask;
    } while (randomValue > range)

    return min + randomValue;
}

main().catch(reason => {
    console.error(reason)
    process.exit(1)
})
