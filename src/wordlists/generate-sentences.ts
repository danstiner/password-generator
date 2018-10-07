// @flow
'strict'
import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'
import {expandRule, flattenTree} from './generate.logic'

const readFile = util.promisify(fs.readFile)

async function main() {
    const file = 'sentence.grammar.json'
    const contents = await readFile(path.resolve(__dirname, file))
    const grammar = JSON.parse(contents.toString())
    const context = {
        expansions: {},
        maxExpansions: 1,
        rules: grammar.rules
    }
    const expansion = expandRule(context, 'SENTENCE')
    if (expansion === null) {
        throw Error("Expansion returned null")
    }
    const sentences = flattenTree(expansion)
    for (const sentence of sentences) {
        console.log(sentence.join(" "))
    }
}

main().catch(reason => {
    console.error(reason)
    process.exit(1)
})
