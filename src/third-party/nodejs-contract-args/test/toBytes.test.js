const assert = require('assert')
const {toBytes} = require('../src')

describe('convert args to bytes', () => {
  it('byte to bytes', () => {
    assert.deepStrictEqual(
      toBytes({
        index: 0,
        format: 'byte',
        value: 10,
      }),
      [10]
    )
    assert.deepStrictEqual(
      toBytes({
        index: 0,
        format: 'byte',
        value: 255,
      }),
      [255]
    )
    assert.throws(
      () =>
        toBytes({
          index: 0,
          format: 'byte',
          value: 500,
        }),
      {message: /cannot parse byte at index 0/}
    )
  })

  it('int8 to bytes', () => {
    assert.deepStrictEqual(
      toBytes({
        index: 0,
        format: 'int8',
        value: 0,
      }),
      [0]
    )
    assert.deepStrictEqual(
      toBytes({
        index: 0,
        format: 'int8',
        value: 17,
      }),
      [17]
    )
    assert.throws(
      () =>
        toBytes({
          index: 0,
          format: 'int8',
          value: 1231,
        }),
      {message: /cannot parse int8 at index 0/}
    )
  })

  it('string to bytes', () => {
    assert.deepStrictEqual(
      toBytes({
        index: 0,
        format: 'string',
        value: 'qwe-+!123',
      }),
      [113, 119, 101, 45, 43, 33, 49, 50, 51]
    )

    assert.deepStrictEqual(
      toBytes({
        index: 0,
        format: 'string',
        value: '',
      }),
      []
    )
  })

  it('hex to bytes', () => {
    assert.deepStrictEqual(
      toBytes({
        index: 0,
        format: 'hex',
        value: '0x1212ff',
      }),
      [18, 18, 255]
    )
  })

  it('dna to bytes', () => {
    assert.deepStrictEqual(
      toBytes({
        index: 0,
        format: 'dna',
        value: '1.123',
      }),
      [15, 149, 178, 140, 210, 195, 128, 0]
    )

    assert.deepStrictEqual(
      toBytes({
        index: 0,
        format: 'dna',
        value: '0.123456789123456789',
      }),
      [1, 182, 155, 75, 172, 208, 95, 21]
    )
  })

  it('uint64 to bytes', () => {
    assert.deepStrictEqual(
      toBytes({
        index: 0,
        format: 'uint64',
        value: '9223372036854775807',
      }),
      [255, 255, 255, 255, 255, 255, 255, 127]
    )

    assert.throws(
      () =>
        toBytes({
          index: 1,
          format: 'uint64',
          value: -1231,
        }),
      {message: /cannot parse uint64 at index 1/}
    )
  })

  it('int64 to bytes', () => {
    assert.deepStrictEqual(
      toBytes({
        index: 0,
        format: 'int64',
        value: '9223372036854775807',
      }),
      [255, 255, 255, 255, 255, 255, 255, 127]
    )

    assert.deepStrictEqual(
      toBytes({
        index: 0,
        format: 'int64',
        value: '-9223372036854775808',
      }),
      [0, 0, 0, 0, 0, 0, 0, 128]
    )
  })
})
