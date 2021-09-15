import { randomInt } from './random'
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
        'base',
        'moon',
        'windmill',
        'yard',
    ]
    const location_noun = [
        'the abyss',
        'space',
        'the waste',
    ]
    const noun = thing_noun.concat(place_noun)
    const intransitive_complete_verb = [
        'bark',
        'cry',
        'die',
        'laugh',
        'fart',
        'sneeze'
    ]
    const sense_verb = [
        'hear',
        'see',
        'feel',
        'taste',
        'smell'
    ]
    const verb = [
        'abandon',
        'eat',
        'hear',
        'jump',
        'paint',
        'shop',
    ].concat(sense_verb).concat(intransitive_complete_verb)
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
        'French',
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
    const preposition = [
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
    const indefinite_pronoun = [
        'another',
        'any',
        'anybody',
        'anyone',
        'anything',
        'both',
        'each',
        'either',
        'everybody',
        'everyone',
        'everything',
        'many',
        'neither',
        'nobody',
        'none',
        'no one',
        'one',
        'other',
        'others',
        'some',
        'somebody',
        'someone'
    ]
    const qualifier = [
        'always',
        'never',
        'sometimes',
    ]
    const subject = [
        'I',
        'we',
    ].concat(noun.map(noun => 'the ' + noun))
    const subject2 = [
        'I',
        'we',
        'the French',
        'Eskimos',
        'Americans',
        'Brits',
    ]
    const get = [
        'find',
        'get',
        'know',
        'see',
    ]
    const love = [
        'eat',
        'hate',
        'love',
    ]

    const choosen_noun1 = choose(noun)

    // phrasal templates
    // snowclones
    const sentence = [
        // digit the
        `${randomInt(100)} ${choose(modifier)} ${choose(thing_noun)}s ${choose(verb)} ${choose(preposition)} the ${choose(modifier)} ${choose(noun)}`,
        // c
        // `Crying is for ${choose(modifier)} ${choosen_noun1}s. ${choose(modifier)} ${choosen_noun1}s go ${choose(verb)}`,
        // d - Draw me like one of your French girls
        // `Draw ${choose(object)} like one of your ${choose(modifier)} ${choose(any_noun)}s`,
        // i - If Eskimos have N words for snow, X surely have Y words for Z
        `If Eskimos have ${randomInt(100)} words for ${choose(noun)}s, ${choose(subject2)} surely have ${randomInt(10)} words for ${choose(noun)}s`,
        // i - In X, no one can hear you Y
        `In ${choose(location_noun)}, ${choose(indefinite_pronoun)} can ${choose(sense_verb)} you ${choose(intransitive_complete_verb)}`,
        // i - I'm in your X, Y-ing your Zz
        `I'm in your ${choose(place_noun)}, ${choose(verb)}-ing your ${choose(modifier)} ${choose(thing_noun)}`,
        // "X, Y, and Z, oh my!".
        // m - Mama always said 'Life was like a box of chocolates, you never know what you’re gonna get.' — Forrest Gump
        //`Mama always said 'a ${choose(thing_noun)} is like a box of ${choose(thing_noun)}s, you ${choose(qualifier)} know what you're gonna ${choose(get)}'`,
        // M - May the force with with you.
        //`May the ${choose(modifier)} ${choose(any_noun)} be ${choose(preposition)} you ${choose(qualifier)}`,
        // "To X or not to X? That is the question"
        // w
        `Welcome to the ${choose(modifier)} ${choose(thing_noun)}. It's ${choose(modifier)}. You're gonna ${choose(love)} it!`,
    ]

    return {
        sentence: choose(sentence),
        entropy: Math.log2(100 * modifier.length * thing_noun.length * verb.length * preposition.length * modifier.length + noun.length)
    }
}

describe('randomSentence', () => {
    it('generates a memorable passphrase with sufficient entropy', () => {
        for (var i = 0; i < 10; i++) {
            console.log(randomSentence().sentence)
        }
        expect(randomSentence().entropy).toBeGreaterThan(28)
    })
})
