import BN from 'bn.js'

/** Check if a string is prefixed by 0x */
function isHexPrefixed(str) {
  return str.slice(0, 2) === '0x'
}
/** Removes 0x from a given String */
function stripHexPrefix(str) {
  if (typeof str !== 'string') {
    return str
  }
  return isHexPrefixed(str) ? str.slice(2) : str
}

function padToEven(a) {
  return a.length % 2 ? `0${a}` : a
}

/** Transform anything into a Buffer */
export function toBuffer(v) {
  if (!Buffer.isBuffer(v)) {
    if (typeof v === 'string') {
      if (isHexPrefixed(v)) {
        return Buffer.from(padToEven(stripHexPrefix(v)), 'hex')
      }
      return Buffer.from(v)
    }
    if (typeof v === 'number') {
      if (!v) {
        return Buffer.from([])
      }
      return new BN(v).toBuffer()
    }
    if (v === null || v === undefined) {
      return Buffer.from([])
    }
    if (v instanceof Uint8Array) {
      return Buffer.from(v)
    }
    throw new Error('invalid type')
  }
  if (BN.isBN(v)) return v.toBuffer()
  return v
}

export function hexToUint8Array(hexString) {
  const str = stripHexPrefix(hexString)

  const arrayBuffer = new Uint8Array(str.length / 2)

  for (let i = 0; i < str.length; i += 2) {
    const byteValue = parseInt(str.substr(i, 2), 16)
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(byteValue)) {
      throw new Error('Invalid hexString')
    }
    arrayBuffer[i / 2] = byteValue
  }

  return arrayBuffer
}

export function toHexString(byteArray, withPrefix = false) {
  return (
    (withPrefix ? '0x' : '') +
    Array.from(byteArray, function (byte) {
      // eslint-disable-next-line no-bitwise
      return `0${(byte & 0xff).toString(16)}`.slice(-2)
    }).join('')
  )
}
