const test = require('tape')
const tapSpec = require('tap-spec')
const ethers = require('ethers')
const { RPC, MNEMONIC } = require('../testConfig')
const { verifyMessage } = require('../dist/index')

/*test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout)*/

test('eth_typedData_v4', async function (t) {

  const provider = new ethers.providers.JsonRpcProvider(RPC.polygon)
  const signer = ethers.Wallet.fromMnemonic(MNEMONIC)

  const typedDataMessage = {
    types: {
      RandomAmbireTypeStruct: [
        { name: 'identity', type: 'address' },
        { name: 'rewards', type: 'uint256' },
      ]
    },
    domain: {
      name: 'Ambire Typed test message',
      chainId: 1,
    },
    primaryType: 'RandomAmbireTypeStruct',
    message: {
      identity: '0x0000000000000000000000000000000000000000',
      rewards: 0,
    }
  }

  const signature = await signer._signTypedData(typedDataMessage.domain, typedDataMessage.types, typedDataMessage.message)

  return verifyMessage({
    signer: signer.address,
    provider,
    typedData: typedDataMessage,
    signature,
  }).then(result => {
    t.assert(result, 'Valid signature')
  }).catch(e => {
    t.error(e, 'Invalid signature')
  })

})
