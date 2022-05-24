import BN from 'bn.js';
import Decimal from 'decimal.js';

const messages = require('./proto/models_pb.js');
const DNA_BASE = '1000000000000000000';

/** Check if a string is prefixed by 0x */
function isHexPrefixed(str) {
  return str.slice(0, 2) === '0x';
}
/** Removes 0x from a given String */
function stripHexPrefix(str) {
  if (typeof str !== 'string') {
    return str;
  }
  return isHexPrefixed(str) ? str.slice(2) : str;
}

function padToEven(a) {
  return a.length % 2 ? `0${a}` : a;
}

export function bufferToInt(buf) {
  if (!buf || !buf.length) {
    return 0;
  }
  return parseInt(Buffer.from(buf).toString('hex'), 16);
}

/** Transform anything into a Buffer */
export function toBuffer(v) {
  if (!Buffer.isBuffer(v)) {
    if (typeof v === 'string') {
      if (isHexPrefixed(v)) {
        return Buffer.from(padToEven(stripHexPrefix(v)), 'hex');
      }
      return Buffer.from(v);
    }
    if (typeof v === 'number') {
      if (!v) {
        return Buffer.from([]);
      }
      return new BN(v.toLocaleString('fullwide', { useGrouping: false })).toArrayLike(Buffer);
    }
    if (v === null || v === undefined) {
      return Buffer.from([]);
    }
    if (v instanceof Uint8Array) {
      return Buffer.from(v);
    }
    throw new Error('invalid type');
  }
  if (BN.isBN(v)) return v.toBuffer();
  return v;
}

export function hexToUint8Array(hexString) {
  const str = stripHexPrefix(hexString);
  const arrayBuffer = new Uint8Array(str.length / 2);

  for (let i = 0; i < str.length; i += 2) {
    const byteValue = parseInt(str.substr(i, 2), 16);
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(byteValue)) {
      throw new Error('Invalid hexString');
    }
    arrayBuffer[i / 2] = byteValue;
  }

  return arrayBuffer;
}

export function toHexString(byteArray, withPrefix = false) {
  return (
    (withPrefix ? '0x' : '') +
    Array.from(byteArray, function (byte) {
      // eslint-disable-next-line no-bitwise
      return `0${(byte & 0xff).toString(16)}`.slice(-2);
    }).join('')
  );
}

export function toBytes(data) {
  try {
    switch (data.format) {
      case 'byte': {
        const val = parseInt(data.value, 10);
        if (val >= 0 && val <= 255) {
          return [val];
        }
        throw new Error('invalid byte value');
      }
      case 'int8': {
        const val = parseInt(data.value, 10);
        if (val >= 0 && val <= 255) {
          return [val];
        }
        throw new Error('invalid int8 value');
      }
      case 'uint64': {
        const res = new BN(data.value);
        if (res.isNeg()) throw new Error('invalid uint64 value');
        const arr = res.toArray('le');
        return [...arr, ...new Array(8).fill(0)].slice(0, 8);
      }
      case 'int64': {
        const arr = new BN(data.value).toArray('le');
        return [...arr, ...new Array(8).fill(0)].slice(0, 8);
      }
      case 'string': {
        return [...Buffer.from(data.value, 'utf8')];
      }
      case 'bigint': {
        return new BN(data.value).toArray();
      }
      case 'hex': {
        return [...hexToUint8Array(data.value)];
      }
      case 'dna': {
        return new BN(new Decimal(data.value).mul(new Decimal(DNA_BASE)).toString()).toArray();
      }
      default: {
        return [...hexToUint8Array(data.value)];
      }
    }
  } catch (e) {
    throw new Error(`cannot parse ${data.format} at index ${data.index}: ${e.message}`);
  }
}

export function argsToSlice(args) {
  const maxIndex = Math.max(...args.map(x => x.index));

  const result = new Array(maxIndex).fill(null);

  args.forEach(element => {
    result[element.index] = toBytes(element);
  });

  return result;
}

export class DeployContractAttachment {
  constructor(codeHash, args) {
    this.codeHash = codeHash;
    this.args = args;
  }

  fromBytes(bytes) {
    const protoAttachment = messages.ProtoDeployContractAttachment.deserializeBinary(bytes);

    this.codeHash = protoAttachment.getCodehash();
    this.args = protoAttachment.getArgsList();

    return this;
  }

  toBytes() {
    const data = new messages.ProtoDeployContractAttachment();
    data.setCodehash(new Uint8Array(this.codeHash));
    for (let i = 0; i < this.args.length; i += 1) {
      data.addArgs(new Uint8Array(this.args[i]));
    }
    return data.serializeBinary();
  }
}

export function getMultisigPayload() {
  const args = [
    { index: 0, format: 'byte', value: '5' },
    { index: 1, format: 'byte', value: '3' }
  ];
  const argSlice = argsToSlice(args);
  return new DeployContractAttachment(0x05, argSlice).toBytes();
}
