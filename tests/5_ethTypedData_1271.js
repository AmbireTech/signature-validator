const test = require('tape')
const tapSpec = require('tap-spec')
const ethers = require('ethers')
const { RPC, MNEMONIC } = require('../testConfig')
const { verifyMessage } = require('../dist/index')

test('eth_typedData_v4 + 1271', async function (t) {

  const provider = new ethers.providers.JsonRpcProvider(RPC.polygon)
  const signerAddress = '0x4836a472ab1dd406ecb8d0f933a985541ee3921f'

  const typedDataMessage = {
    'types': {
      'Order': [
        {
          'name': 'sellToken',
          'type': 'address'
        },
        {
          'name': 'buyToken',
          'type': 'address'
        },
        {
          'name': 'receiver',
          'type': 'address'
        },
        {
          'name': 'sellAmount',
          'type': 'uint256'
        },
        {
          'name': 'buyAmount',
          'type': 'uint256'
        },
        {
          'name': 'validTo',
          'type': 'uint32'
        },
        {
          'name': 'appData',
          'type': 'bytes32'
        },
        {
          'name': 'feeAmount',
          'type': 'uint256'
        },
        {
          'name': 'kind',
          'type': 'string'
        },
        {
          'name': 'partiallyFillable',
          'type': 'bool'
        },
        {
          'name': 'sellTokenBalance',
          'type': 'string'
        },
        {
          'name': 'buyTokenBalance',
          'type': 'string'
        }
      ]
    },
    'domain': {
      'name': 'Gnosis Protocol',
      'version': 'v2',
      'chainId': '1',
      'verifyingContract': '0x9008d19f58aabd9ed0d60971565aa8510560ab41'
    },
    'primaryType': 'Order',
    'message': {
      'sellToken': '0x6b175474e89094c44da98b954eedeac495271d0f',
      'buyToken': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      'receiver': '0x4836a472ab1dd406ecb8d0f933a985541ee3921f',
      'sellAmount': '6158533540992737280',
      'buyAmount': '6102719',
      'validTo': '1651585108',
      'appData': '0xa5dae7a114f1bd6bb9b3ff976150380a95cb18856212db555c25ef9d7801e9a4',
      'feeAmount': '35841466459007262720',
      'kind': 'sell',
      'partiallyFillable': false,
      'sellTokenBalance': 'erc20',
      'buyTokenBalance': 'erc20'
    }
  }

  // 712 signature from 0x4836a472ab1dd406ecb8d0f933a985541ee3921f (Ambire Wallet Identity - deployed on polygon)
  const signature = '0x4e5bcc32b6cdd2c7ef00a738ca797e89daeca288e3e18c5c3b740cc8a15b35e758f33ba982f6efefc42ae75e272a22e3b6245f2371d0382713785b3b9c31a1861c00'

  return verifyMessage({
    signer: signerAddress,
    provider,
    typedData: typedDataMessage,
    signature,
  }).then(result => {
    t.assert(result, 'Valid signature')
  }).catch(e => {
    t.error(e, 'Invalid signature')
  })

})
