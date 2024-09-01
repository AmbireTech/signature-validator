const test = require('tape')
const tapSpec = require('tap-spec')
const ethers = require('ethers')
const { RPC, MNEMONIC } = require('../testConfig')
const { verifyMessage } = require('../dist/index')
const { createPublicClient, http } = require('viem')
const { polygon } = require('viem/chains')

// The valid ERC-6492 sig for 0x787177
const coder = new ethers.utils.AbiCoder()
// As per ERC-6492: create2Factory, factoryCalldata, originalSig
const signature =
  coder.encode(
    ['address', 'bytes', 'bytes'],
    [
      '0xBf07a0Df119Ca234634588fbDb5625594E2a5BCA',
      '0x49c81579000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000004836a472ab1dd406ecb8d0f933a985541ee3921f0000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000007a7f00000000000000000000000000000000000000000000000000000000000000017f7f0f292b79d9ce101861526459da50f62368077ae24affe97b792bf4bdd2e171553d602d80604d3d3981f3363d3d373d3d3d363d732a2b85eb1054d6f0c6c2e37da05ed3e5fea684ef5af43d82803e903d91602b57fd5bf300000000000000000000000000000000000000000000000000000000000000000000000002246171d1c9000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000004836a472ab1dd406ecb8d0f933a985541ee3921f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000942f9ce5d9a33a82f88d233aeb3292e6802303480000000000000000000000000000000000000000000000000014c3c6ef1cdc01000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000042f2eaaebf45fc0340eb55f11c52a30e2ca7f48539d0a1f1cdc240482210326494545def903e8ed4441bd5438109abe950f1f79baf032f184728ba2d4161dea32e1b0100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0xc0f8db6019888d87a0afc1299e81ef45d3abce64f63072c8d7a6ef00f5f82c1522958ff110afa98b8c0d23b558376db1d2fbab4944e708f8bf6dc7b977ee07201b00',
    ]
  ) + '6492649264926492649264926492649264926492649264926492649264926492' // append the magic suffix

const message = '0x787177'
test('eth_sign + 6492', async function (t) {
  const publicClient = createPublicClient({
    chain: polygon,
    transport: http(RPC.polygon),
  })
  const provider = new ethers.providers.JsonRpcProvider(RPC.polygon)
  const signerAddress = '0x4836a472ab1dd406ecb8d0f933a985541ee3921f'
  // signature from 0x4836a472ab1dd406ecb8d0f933a985541ee3921f (Ambire Wallet Identity - deployed on polygon)
  await verifyMessage({
    signer: signerAddress,
    provider,
    message: ethers.utils.arrayify(message),
    signature,
  })
    .then((result) => {
      t.assert(result, 'Valid signature')
    })
    .catch((e) => {
      t.error(e, 'Invalid signature')
    })

  await verifyMessage({
    signer: signerAddress,
    provider: publicClient,
    message: ethers.utils.arrayify(message),
    signature,
  })
    .then((result) => {
      t.assert(result, 'Valid signature')
    })
    .catch((e) => {
      t.error(e, 'Invalid signature')
    })
})

test('eth_sign + 6492: invalid', async function (t) {
  const publicClient = createPublicClient({
    chain: polygon,
    transport: http(RPC.polygon),
  })
  const provider = new ethers.providers.JsonRpcProvider(RPC.polygon)
  const signerAddress = '0x4836a472ab1dd406ecb8d0f933a985541ee3921f'
  // Different message, so the sig should not be valid
  const hexxed = message + '69'

  await verifyMessage({
    signer: signerAddress,
    provider,
    message: ethers.utils.arrayify(hexxed),
    signature,
  })
    .then((result) => {
      t.error(result, 'signature should not be valid')
    })
    .catch((e) => {
      t.assert(true, 'detected as invalid signature')
    })

  await verifyMessage({
    signer: signerAddress,
    provider: publicClient,
    message: ethers.utils.arrayify(hexxed),
    signature,
  })
    .then((result) => {
      t.error(result, 'signature should not be valid')
    })
    .catch((e) => {
      t.assert(true, 'detected as invalid signature')
    })
})
