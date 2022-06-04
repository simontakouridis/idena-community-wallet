import assert from 'assert'
import {argsToSlice} from '../src'
import {DeployContractAttachment} from '../src/deployContractAttachment'
import {Transaction} from '../src/transaction'

const deployTx =
  '0a930108011042180f2a0902b5e3af16b1880000320715bf3e10490c0042770a20000000000000000000000000000000000000000000000000000000000000000212157b227469746c65223a20225175657374696f6e227d1208600567600000000012080f000000000000001208630000000000000012013712017b12080000000000000000120b0104b92a8f76958e9c0000120132'

const deployTxArgs = [
  {
    index: 0,
    format: 'hex',
    value: '0x7b227469746c65223a20225175657374696f6e227d',
  },
  {
    index: 1,
    format: 'uint64',
    value: '1617364320',
  },
  {
    index: 2,
    format: 'uint64',
    value: '15',
  },
  {
    index: 3,
    format: 'uint64',
    value: '99',
  },
  {
    index: 4,
    format: 'byte',
    value: '55',
  },
  {
    index: 5,
    format: 'byte',
    value: '123',
  },
  {
    index: 6,
    format: 'uint64',
    value: '0',
  },
  {
    index: 7,
    format: 'dna',
    value: '1231231',
  },
  {
    index: 8,
    format: 'byte',
    value: '50',
  },
]

describe('parse tx', () => {
  it('parse deploy tx', () => {
    const tx = new Transaction()
    tx.fromHex(deployTx)

    const {payload} = tx

    const attachment = new DeployContractAttachment().fromBytes(payload)

    // codehash length is 32 bytes
    const codeHash = new Array(31).fill(0).concat([2])

    // compare codehash with existing tx
    assert.deepStrictEqual([...attachment.codeHash], [...codeHash])

    // convert given args to bytes
    const slice = argsToSlice(deployTxArgs)

    // compare args with existing tx
    for (let i = 0; i < attachment.args.length; i += 1) {
      assert.deepStrictEqual([...slice[i]], [...attachment.args[i]])
    }

    // example how to create tx payload
    const attachment2 = new DeployContractAttachment(codeHash, slice)
    assert.deepStrictEqual([...attachment2.toBytes()], [...payload])
  })
})
