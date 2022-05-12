const test = require('tape')
const ethers = require('ethers')
const { RPC, MNEMONIC } = require('../testConfig')
const { verifyMessage } = require('../index')

test('eth_sign (as human message) verification', async function (t) {

  const provider = new ethers.providers.JsonRpcProvider(RPC.polygon)
  const signer = ethers.Wallet.fromMnemonic(MNEMONIC)
  const humanMessage = 'My funds are SAFU with Ambire Wallet'
  const signature = await signer.signMessage(humanMessage)

  return verifyMessage({
    signer: signer.address,
    provider,
    message: humanMessage,
    signature,
  }).then(result => {
    t.assert(result, 'Valid signature')
  }).catch(e => {
    t.error(e, 'Invalid signature')
  })

})
