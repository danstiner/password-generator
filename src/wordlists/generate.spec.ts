import { Context, cartesianProduct, expandRule, flattenTree } from './generate.logic'

describe("expandRule", () => {
    const emptyContext: Context = {
        expansions: {},
        maxExpansions: 1,
        rules: {},
    }

    it('should return null if not possible to expand', () => {
        const context = {
            ...emptyContext,
            maxExpansions: 0,
        }
        expect(expandRule(context, 'non-existant')).toBe(null)
    })

    it('should return rule name if rule is not defined', () => {
        expect(expandRule(emptyContext, 'non-existant')).toEqual({ value: 'non-existant' })
    })

    it('should expand simple rule', () => {
        const context = { ...emptyContext }
        context.rules['S'] = {
            options: [
                ['NP', 'VP']
            ]
        }
        expect(expandRule(context, 'S')).toEqual({"alternatives": [{"each": [{"value": "NP"}, {"value": "VP"}]}]})
    })
})

describe("flattenTree", () => {
    it("should return empty for empty alternatives", () => {
        const tree = { alternatives: [] }
        expect(flattenTree(tree)).toEqual([])
    })

    it("should return empty for empty each", () => {
        const tree = { each: [] }
        expect(flattenTree(tree)).toEqual([])
    })

    it("should return empty for nested empty eaches", () => {
        const tree = { each: [{ each: []}] }
        expect(flattenTree(tree)).toEqual([])
    })

    it("should return single item for a leaf", () => {
        const value = { value: 'x' }
        expect(flattenTree(value)).toEqual([['x']])
    })

    it("should return single item for a leaf nested in alternatives", () => {
        const tree = { alternatives: [{ value: 'x' }] }
        expect(flattenTree(tree)).toEqual([['x']])
    })

    it("should return single item for a leaf nested in each", () => {
        const tree = { each: [{ value: 'x' }] }
        expect(flattenTree(tree)).toEqual([['x']])
    })

    it("should return single item for two each siblings", () => {
        const tree = {
            each: [{ value: 'a' }, { value: 'b' }]
        }
        expect(flattenTree(tree)).toEqual([['a', 'b']])
    })

    it("should return two items for two alternatives", () => {
        const tree = {
            alternatives: [{ value: 'a' }, { value: 'b' }]
        }
        expect(flattenTree(tree)).toEqual([['a'], ['b']])
    })
});

describe("cartesianProduct", () => {
    let product = (sets: any[][]) => [...cartesianProduct(sets)]

    test("{} = {[a]}", () => {
        expect(product([])).toEqual([])
    })

    test("{a} = {[a]}", () => {
        expect(product([['a']])).toEqual([['a']])
    })

    test("{a} * {b} = {[a,b]}", () => {
        expect(product([['a'], ['b']])).toEqual([['a', 'b']])
    })

    test("{a1, a2} * {b} = {[a1,b], [a2,b]}", () => {
        expect(product([['a1', 'a2'], ['b']])).toEqual([['a1', 'b'], ['a2', 'b']])
    })

    test("{a} * {b1, b2} = {[a,b1], [a,b2]}", () => {
        expect(product([['a'], ['b1', 'b2']])).toEqual([['a', 'b1'], ['a', 'b2']])
    })
});
