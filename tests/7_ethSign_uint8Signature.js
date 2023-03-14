const test = require('tape')
const ethers = require('ethers')
const { RPC, MNEMONIC } = require('../testConfig')
const { verifyMessage } = require('../dist/index')

test('eth_sign, signature as uint8Arr verification', async function (t) {

  const provider = new ethers.providers.JsonRpcProvider(RPC.polygon)
  const signer = ethers.Wallet.fromMnemonic(MNEMONIC)
  const hexxed = '0x123456'
  const signature = await signer.signMessage(ethers.utils.arrayify(hexxed))

  return verifyMessage({
    signer: signer.address,
    provider,
    message: ethers.utils.arrayify(hexxed),
    signature: ethers.utils.arrayify(signature),
  }).then(result => {
    t.assert(result, 'Valid signature')
  }).catch(e => {
    t.error(e, 'Invalid signature')
  })
})
