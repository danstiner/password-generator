import crypto from 'crypto'

export function randomUint32(): number {
    const buf = crypto.randomBytes(4)

    return buf[3] << 24 | buf[2] << 16 | buf[1] << 8 | buf[0]
}
