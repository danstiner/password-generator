import {randomUint32, randomInt} from './random'
import crypto from 'crypto'

Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: <T extends NodeJS.TypedArray>(arr: T) => crypto.randomFillSync(arr),
  },
});

describe('randomInt', () => {
    it('throws if maximum value is outside the range (0, 2^32)', () => {
        expect(() => randomInt(-1)).toThrow()
        expect(() => randomInt(0)).toThrow()
        expect(() => randomInt(Math.pow(2, 32))).toThrow()
    })
    it('can generate the number zero when limited to the range [0, 1]', () => {
        var value
        do {
            value = randomInt(2);
            expect(value).toEqual(expect.any(Number))
            expect(value).toBeGreaterThanOrEqual(0)
            expect(value).toBeLessThanOrEqual(1)
        } while (value != 0)
    })
    it('can generate the number one when limited to the range [0, 1]', () => {
        var value
        do {
            value = randomInt(2);
            expect(value).toEqual(expect.any(Number))
            expect(value).toBeGreaterThanOrEqual(0)
            expect(value).toBeLessThanOrEqual(1)
        } while (value != 1)
    })

    it('can generate the number two when limited to the range [0, 2]', () => {
        var value
        do {
            value = randomInt(3);
            expect(value).toEqual(expect.any(Number))
            expect(value).toBeGreaterThanOrEqual(0)
            expect(value).toBeLessThanOrEqual(2)
        } while (value != 2)
    })
    it('generates a different value for each invocation with high probability', () => {
        expect(randomInt(Math.pow(2, 32) - 1)).not.toEqual(randomInt(Math.pow(2, 32) - 1))
    })
})

describe('randomUint32', () => {
    it('generates integers in the range [0, 2^32)', () => {
        const value = randomUint32();
        expect(value).toEqual(expect.any(Number))
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(Math.pow(2, 32))
    })
    it('generates a different value for each invocation with high probability', () => {
        expect(randomUint32()).not.toEqual(randomUint32())
    })
})
