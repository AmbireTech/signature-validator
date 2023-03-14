const test = require('tape')
const ethers = require('ethers')
const { RPC, MNEMONIC } = require('../testConfig')
const { verifyMessage } = require('../dist/index')

test('eth_sign (as human message) verification', async function (t) {

  const provider = new ethers.providers.JsonRpcProvider(RPC.polygon)
  const signer = ethers.Wallet.fromMnemonic(MNEMONIC)
  const humanMessage = 'My funds are SAFU with Ambire Wallet'
  const signature = await signer.signMessage(humanMessage)

  await verifyMessage({
    signer: signer.address,
    provider,
    message: humanMessage,
    signature,
  }).then(result => {
    t.assert(result, 'Valid signature')
  }).catch(e => {
    t.error(e, 'Invalid signature')
  })

  await verifyMessage({
    signer: signer.address,
    provider,
    message: humanMessage,
    signature: signature.slice(0, -6) + '111111',
  }).then(result => {
    t.assert(result === false, 'signature wrongly detected as valid')
  }).catch(e => {
    t.assert(true, 'Detected invalid signature')
  })

})
