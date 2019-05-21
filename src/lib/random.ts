import { randomUint32 } from 'platform/random'

// 2^32-1
const MAX_RANDOM_INTEGER = 4294967295;

/** Generate a random integer in [0, max)  */
export function randomInt(max: number): number {
    if (max <= 0) {
        throw new RangeError("")
    }

    if (max > MAX_RANDOM_INTEGER) {
        throw new RangeError("Maximum value larger than supported")
    }

    // Minimum number of bits needed to encode a value of max - 1
    const k = max <= 1 ? max : Math.ceil(Math.log(max - 1) * Math.LOG2E)

    // Mask to increase probability candidate value is less than max
    const bitmask = Math.pow(2, k) - 1

    // Reject candidate values less than max (rejection sampling)
    // Gives an unbiased distribution for non-power-of-two ranges 
    var randomValue;
    do {
        randomValue = randomUint32() & bitmask
    } while (randomValue >= max)

    return randomValue;
}
