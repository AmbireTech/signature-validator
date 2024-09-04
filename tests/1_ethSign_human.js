const test = require('tape')
const ethers = require('ethers')
const {
  verifySignature,
  defaultProvider,
  defaultPublicClient,
  MNEMONIC,
} = require('../testConfig')

test('eth_sign (as human message) verification', async function (t) {
  const signer = ethers.Wallet.fromMnemonic(MNEMONIC)
  const notSigner = ethers.Wallet.createRandom()
  const humanMessage = 'My funds are SAFU with Ambire Wallet'
  const signature = await signer.signMessage(humanMessage)
  await verifySignature({
    t,
    signer: signer.address,
    providers: [defaultProvider, defaultPublicClient],
    message: humanMessage,
    signature,
    expectedValid: true,
  })
  await verifySignature({
    t,
    signer: notSigner.address,
    providers: [defaultProvider, defaultPublicClient],
    message: humanMessage,
    signature,
    expectedValid: false,
  })
})
