const test = require('tape')
const ethers = require('ethers')
const { RPC, MNEMONIC } = require('../testConfig')
const { verifyMessage } = require('../dist/index')

test('eth_sign (as bytes) verification', async function (t) {

  const provider = new ethers.providers.JsonRpcProvider(RPC.polygon)
  const signer = ethers.Wallet.fromMnemonic(MNEMONIC)
  const hexxed = '0x123456'
  const signature = await signer.signMessage(ethers.utils.arrayify(hexxed))

  return verifyMessage({
    signer: signer.address,
    provider,
    message: ethers.utils.arrayify(hexxed),
    signature,
  }).then(result => {
    t.assert(result, 'Valid signature')
  }).catch(e => {
    t.error(e, 'Invalid signature')
  })

})
