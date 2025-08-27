const { verifyMessage } = require('./dist/index')
const { createPublicClient, http } = require('viem')
const { polygon } = require('viem/chains')
const ethers = require('ethers')

/**
 * @dev Fn is ran for every provider
 * @param {*} t
 * @param {(Provider | window.ethereum | PublicClient)[]} providers Web3 Compatible provider
 * @param {string} signer The signer address to verify the signature against
 * @param {string | Uint8Array} message To verify eth_sign type of signatures. Human-readable message to verify. Message should be a human string or the hex version of the human string encoded as Uint8Array. If a hex string is passed, it will be considered as a regular string
 * @param {{domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, message: Record<string, any>}} typedData To verify a 712 signature type. The {domain, type, message} 712 message object
 * @param {string} finalDigest The final digest to verify. dApp will have to pre-compute the hash as no hashing transformation will occur and this digest will be directly used for recoverAddress and isValidSignature
 * @param {string | Uint8Array} signature The signature to verify as a hex string or Uint8Array
 * NOTE: you only need to pass one of: typedData, finalDigest, message
 */
const verifySignature = async ({
  t,
  providers,
  signer,
  message,
  typedData,
  finalDigest,
  signature,
  expectedValid,
}) => {
  for (const provider of providers) {
    try {
      const result = await verifyMessage({
        provider,
        signer,
        message,
        typedData,
        finalDigest,
        signature,
      })
      t.assert(
        result === expectedValid,
        expectedValid ? 'Valid signature' : 'Detected invalid signature'
      )
    } catch (e) {
      t.error(e, 'Invalid Signature')
    }
  }
}

module.exports = {
  RPC: {
    polygon: 'https://polygon-rpc.com',
  },
  MNEMONIC: ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(32)),
  defaultPublicClient: createPublicClient({
    chain: polygon,
    transport: http('https://polygon-rpc.com'),
  }),
  defaultProvider: new ethers.providers.JsonRpcProvider(
    'https://polygon-rpc.com'
  ),
  verifySignature,
}
