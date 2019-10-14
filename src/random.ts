// 2^32-1
const MAX_UINT32_VALUE = 4294967295;

/** Generate a random integer in [0, max) with a uniform distribution */
export function randomInt(max: number): number {
    if (max <= 0) {
        throw new RangeError("Maximum value must be greater than zero")
    }

    if (max > MAX_UINT32_VALUE) {
        throw new RangeError("Maximum value larger than supported")
    }

    // Minimum number of bits needed to encode a value of max - 1
    const k = Math.ceil(Math.log(max) * Math.LOG2E)

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

/** Generate a random integer in [0, 2^32)  */
export function randomUint32(): number {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return array[0]
}
