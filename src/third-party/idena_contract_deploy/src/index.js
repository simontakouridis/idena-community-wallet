const messages = require('./proto/models_pb');

function toBytes(data) {
  try {
    switch (data.format) {
      case 'byte': {
        const val = parseInt(data.value, 10)
        if (val >= 0 && val <= 255) {
          return [val]
        }
        throw new Error('invalid byte value')
      }
      case 'int8': {
        const val = parseInt(data.value, 10)
        if (val >= 0 && val <= 255) {
          return [val]
        }
        throw new Error('invalid int8 value')
      }
      case 'uint64': {
        const res = new BN(data.value)
        if (res.isNeg()) throw new Error('invalid uint64 value')
        const arr = res.toArray('le')
        return [...arr, ...new Array(8).fill(0)].slice(0, 8)
      }
      case 'int64': {
        const arr = new BN(data.value).toArray('le')
        return [...arr, ...new Array(8).fill(0)].slice(0, 8)
      }
      case 'string': {
        return [...Buffer.from(data.value, 'utf8')]
      }
      case 'bigint': {
        return new BN(data.value).toArray()
      }
      case 'hex': {
        return [...hexToUint8Array(data.value)]
      }
      case 'dna': {
        return new BN(
          new Decimal(data.value).mul(new Decimal(DNA_BASE)).toString()
        ).toArray()
      }
      default: {
        return [...hexToUint8Array(data.value)]
      }
    }
  } catch (e) {
    throw new Error(
      `cannot parse ${data.format} at index ${data.index}: ${e.message}`
    )
  }
}

function argsToSlice(args) {
  const maxIndex = Math.max(...args.map((x) => x.index))

  const result = new Array(maxIndex).fill(null)

  args.forEach((element) => {
    result[element.index] = toBytes(element)
  })

  return result
}


class DeployContractAttachment {
    constructor(codeHash, args) {
        this.codeHash = codeHash
        this.args = args
    }

    fromBytes(bytes) {
        const protoAttachment = messages.ProtoDeployContractAttachment.deserializeBinary(
            bytes
        )

        this.codeHash = protoAttachment.getCodehash()
        this.args = protoAttachment.getArgsList()

        return this
    }

    toBytes() {
        const data = new messages.ProtoDeployContractAttachment()
        data.setCodehash(new Uint8Array(this.codeHash))
        for (let i = 0; i < this.args.length; i += 1) {
            data.addArgs(new Uint8Array(this.args[i]))
        }
        return data.serializeBinary()
    }
}


function testAttachment() {
    const args = [{ "index": 0, "format": "byte", "value": "5" }, { "index": 1, "format": "byte", "value": "3" }]
    const argSlice = argsToSlice(args);
    let attachment = new DeployContractAttachment(0x05, argSlice);
    console.log("attachment bytes:", attachment.toBytes());
    document.querySelector("#attachOutput").innerText = JSON.stringify(new Array(...attachment.toBytes()));
}

window.testAttachment = testAttachment;
