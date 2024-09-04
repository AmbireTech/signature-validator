const test = require('tape')
const ethers = require('ethers')
const {
  MNEMONIC,
  verifySignature,
  defaultProvider,
  defaultPublicClient,
} = require('../testConfig')

test('eth_sign (as bytes) verification', async function (t) {
  const signer = ethers.Wallet.fromMnemonic(MNEMONIC)
  const hexxed = '0x123456'
  const signature = await signer.signMessage(ethers.utils.arrayify(hexxed))
  await verifySignature({
    t,
    signer: signer.address,
    providers: [defaultProvider, defaultPublicClient],
    message: ethers.utils.arrayify(hexxed),
    signature,
    expectedValid: true,
  })
})
