const test = require('tape')
const tapSpec = require('tap-spec')
const ethers = require('ethers')
const {
  MNEMONIC,
  verifySignature,
  defaultProvider,
  defaultPublicClient,
} = require('../testConfig')

/*test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout)*/

test('eth_typedData_v4', async function (t) {
  const signer = ethers.Wallet.fromMnemonic(MNEMONIC)

  const typedDataMessage = {
    types: {
      RandomAmbireTypeStruct: [
        { name: 'identity', type: 'address' },
        { name: 'rewards', type: 'uint256' },
      ],
    },
    domain: {
      name: 'Ambire Typed test message',
      chainId: 1,
    },
    primaryType: 'RandomAmbireTypeStruct',
    message: {
      identity: '0x0000000000000000000000000000000000000000',
      rewards: 0,
    },
  }

  const signature = await signer._signTypedData(
    typedDataMessage.domain,
    typedDataMessage.types,
    typedDataMessage.message
  )
  await verifySignature({
    t,
    signer: signer.address,
    providers: [defaultProvider, defaultPublicClient],
    typedData: typedDataMessage,
    signature,
    expectedValid: true,
  })
})
