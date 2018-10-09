
export interface Context {
    expansions: {
        [name: string]: number,
    },
    maxExpansions: number,
    rules: {
        [name: string]: Rule
    },
};

interface Rule {
    options: Option[]
}

type Option = string | string[] | { value: string }

type Tree<T> = Node<T>
type Node<T> = AllOf<T> | Alternatives<T> | Leaf<T>
interface AllOf<T> {
    each: Node<T>[]
}
interface Alternatives<T> {
    alternatives: Node<T>[]
}
interface Leaf<T> {
    value: T
}

export function expandRule(context: Context, name: string): Tree<string> | null {
    if (!canExpandRule(context, name)) {
        return null
    }

    const rules = context.rules
    const rule = rules[name]

    if (!rule) {
        return { value: name }
    }

    context = {
        ...context,
        expansions: {
            ...context.expansions,
            [name]: (context.expansions[name] || 0) + 1
        }
    }

    const options = rule.options.map(o => expandOption(context, o))

    return {
        alternatives: options.filter(c => c !== null) as Node<string>[]
    }
}

function expandOption(context: Context, option: Option): Node<string> | null {
    if (typeof option === "string") {
        return expandRule(context, option)
    } else if (Array.isArray(option)) {
        const expansion = expandOptionArray(context, option)
        if (expansion === null) {
            return null
        }
        return {
            each: expansion
        }
    } else if ('value' in option) {
        return expandRule(context, option.value)
    } else {
        throw Error(`Unknown option type: ${typeof option}`)
    }
}

function canExpandRule(context: Context, name: string): boolean {
    const expansion = context.expansions[name] || 0
    return expansion < context.maxExpansions
}

function expandOptionArray(context: Context, array: string[]): Node<string>[] | null {
    const expansion = array.map(name => expandRule(context, name))
    if (expansion.some(x => x === null)) {
        return null
    }
    return expansion as Node<string>[]
}

export function flattenTree<T>(node: Tree<T>): T[][] {
    if ('value' in node) {
        return [[node.value]]
    } else if ('alternatives' in node) {
        return flatMap(node.alternatives, flattenTree)
    } else if ('each' in node) {
        return [...cartesianProduct(node.each.map(flattenTree))].map(flat)
    } else {
        throw Error("Not a valid tree to flatten")
    }
}

export function* cartesianProduct<T>(sets: T[][]): IterableIterator<T[]> {
    if (!sets || sets.length === 0 || sets.some(set => set.length === 0)) {
        return
    }

    const state = sets.map(_ => 0)

    while (true) {
        yield sets.map((set, i) => set[state[i]])

        state[0]++

        for (let i = 0; i < state.length; i++) {
            if (state[i] === sets[i].length) {
                if (i + 1 === state.length) {
                    return
                }
                state[i] = 0
                state[i + 1]++
            }
        }
    }
}

function flat<T>(array: T[][]): T[] {
    return array.reduce((acc, val) => acc.concat(val), [])
}

function flatMap<T, U>(array: T[], f: (_: T) => U[]): U[] {
    return Array.prototype.concat.apply([], array.map(f));
}
