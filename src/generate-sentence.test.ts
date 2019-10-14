import { randomUint32, randomInt } from './random'
import crypto from 'crypto'

Object.defineProperty(window, 'crypto', {
    value: {
        getRandomValues: <T extends NodeJS.TypedArray>(arr: T) => crypto.randomFillSync(arr),
    },
});

function choose(wordlist: string[]): string {
    return wordlist[randomInt(wordlist.length)]
}

function randomSentence() {
    const person_noun = [
        'acrobat',
        'baker',
        'urologist',
        'usher',
        'veteran',
        'vigilante',
        'wanderer',
        'widow',
        'zombie',
        'zookeeper',
    ]
    const thing_noun = [
        'aardvark',
        'abdomen',
        'abhorrence',
        'abrasion',
        'acid',
        'agency',
        'aggressor',
        'bamboo',
        'banana',
        'body',
        'cow',
        'dog',
        'ghost',
        'onlooker',
        'oompa loompa',
        'ostrich',
        'smartphone',
        'snake',
        'vegetable',
        'violin',
        'visor',
        'vitamins',
        'vixen',
        'volleyball',
        'waffle',
        'wagon',
        'walrus',
        'wish',
        'wizardry',
        'water',
        'wound',
        'wristwatch',
        'xerox',
        'xylophone',
        'yacht',
        'yearbook',
        'yo-yo',
        'zebra',
        'zucchini',
    ].concat(person_noun)
    const place_noun = [
        'abyss',
        'bakery',
        'moon',
        'windmill',
        'yard',
    ]
    const any_noun = thing_noun.concat(place_noun)
    const verbs = [
        'ate',
        'jumped',
        'painted'
    ]
    const modifier = [
        'abandoned',
        'abbreviated',
        'abhorrent',
        'abiding',
        'abnormal',
        'abrasive',
        'absent',
        'absorbing',
        'abundant',
        'adept',
        'adult',
        'astral',
        'athletic',
        'atomic',
        'automatic',
        'agonizing',
        'bashful',
        'basic',
        'bogus',
        'brown',
        'carefree',
        'casual',
        'caustic',
        'common',
        'crass',
        'cruel',
        'dirty',
        'disabled',
        'divine',
        'dusty',
        'dynamic',
        'fine',
        'flashy',
        'freezing',
        'godless',
        'gold',
        'grand',
        'happy',
        'haunted',
        'heavenly',
        'hellish',
        'icy',
        'intent',
        'ironic',
        'ivory',
        'jelly',
        'knotted',
        'lame',
        'loud',
        'sexy',
        'unknown',
    ]
    const prepositions = [
        'along',
        'below',
        'concerning',
        'despite',
        'from',
        'inside',
        'over',
        'through',
        'with',
    ]

    return {
        sentence: `${randomInt(100)} ${choose(modifier)} ${choose(thing_noun)}s ${choose(verbs)} ${choose(prepositions)} the ${choose(modifier)} ${choose(any_noun)}`,
        entropy: Math.log2(100 * modifier.length * thing_noun.length * verbs.length * prepositions.length * modifier.length + any_noun.length)
    }
}

describe('randomSentence', () => {
    it('generates a memorable passphrase with sufficient entropy', () => {
        for(var i=0; i<5; i++) {
            console.log(randomSentence().sentence)
        }
        expect(randomSentence().entropy).toBeGreaterThan(28)
    })
})
