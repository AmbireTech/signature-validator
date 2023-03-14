const test = require('tape')
const tapSpec = require('tap-spec')
const ethers = require('ethers')
const { RPC, MNEMONIC } = require('../testConfig')
const { verifyMessage } = require('../dist/index')

test('eth_sign + 1271', async function (t) {

  const provider = new ethers.providers.JsonRpcProvider(RPC.polygon)
  const signerAddress = '0x4836a472ab1dd406ecb8d0f933a985541ee3921f'
  const hexxed = '0x787177'
  // signature from 0x4836a472ab1dd406ecb8d0f933a985541ee3921f (Ambire Wallet Identity - deployed on polygon)
  const signature = '0xc0f8db6019888d87a0afc1299e81ef45d3abce64f63072c8d7a6ef00f5f82c1522958ff110afa98b8c0d23b558376db1d2fbab4944e708f8bf6dc7b977ee07201b00'

  const result = await verifyMessage({
    signer: signerAddress,
    provider,
    message: ethers.utils.arrayify(hexxed),
    signature,
  }).then(result => {
    t.assert(result, 'Valid signature')
  }).catch(e => {
    t.error(e, 'Invalid signature')
  })
})

test('eth_sign + 1271: invalid', async function (t) {

  const provider = new ethers.providers.JsonRpcProvider(RPC.polygon)
  const signerAddress = '0x4836a472ab1dd406ecb8d0f933a985541ee3921f'
  const hexxed = '0x787176'
  // invalid sig
  const signature = '0xc0f8db6019888d87a0afc1299e81ef45d3abce64f63072c8d7a6ef00f5f82c1522958ff110afa98b8c0d23b558376db1d2fbab4944e708f8bf6dc7b977ee07201b00'

  const result = await verifyMessage({
    signer: signerAddress,
    provider,
    message: ethers.utils.arrayify(hexxed),
    signature,
  }).then(result => {
    t.error(result, 'signature should not be valid')
  }).catch(e => {
    t.assert(true, 'detected as invalid signature')
  })
})
