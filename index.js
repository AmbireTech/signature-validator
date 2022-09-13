const { ethers } = require('ethers')

const VALIDATOR_1271_ABI = ['function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)']

/**
 * @typedef { import("@ethersproject/abstract-signer").TypedDataDomain } TypedDataDomain
 * @typedef { import("@ethersproject/abstract-signer").TypedDataField } TypedDataField
 * @typedef { import("@ethersproject/providers").Provider } Provider
 */

/**
 * @param {Provider | window.ethereum} provider Web3 Compatible provider to perform smart contract wallet validation with EIP 1271 (window.ethereum, web3.currentProvider, ethers provider... )
 * @param {string} signer The signer address to verify the signature against
 * @param {string | Uint8Array} message To verify eth_sign type of signatures. Human-readable message to verify. Message should be a human string or the hex version of the human string encoded as Uint8Array. If a hex string is passed, it will be considered as a regular string
 * @param {{domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, message: Record<string, any>}} typedData To verify a 712 signature type. The {domain, type, message} 712 message object
 * @param {string} finalDigest The final digest to verify. dApp will have to pre-compute the hash as no hashing transformation will occur and this digest will be directly used for recoverAddress and isValidSignature
 * @param {string | Uint8Array} signature The signature to verify as a hex string or Uint8Array
 * @param {function(string, string, string | Uint8Array): boolean} undeployedCallback An optional 1271 callback function to gracefully handle signature validation for non-deployed smart contract wallets
 * @returns {Promise<boolean>}
 * NOTE: you only need to pass one of: typedData, finalDigest, message
 */
const  verifyMessage = async ({ provider, signer, message, typedData, finalDigest, signature, undeployedCallback }) => {
  if (message) {
    finalDigest = ethers.utils.hashMessage(message)
  } else if (typedData) {
    if (!typedData.domain || !typedData.types || !typedData.message) {
      throw Error('Missing one or more properties for typedData (domain, types, message)')
    }

    finalDigest = ethers.utils._TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.message)
  } else if (!finalDigest) {
    throw Error('Missing one of the properties: message, unPrefixedMessage, typedData or finalDigest')
  }

  // First try: elliptic curve signature (EOA)
  if (addrMatching(recoverAddress(finalDigest, signature), signer)) return true

  // 2nd try: Getting code from deployed smart contract to call 1271 isValidSignature
  if (await eip1271Check(provider, signer, finalDigest, signature)) return true

  // Last attempt, for undeployed smart contract with custom logic
  if (undeployedCallback) {
    try {
      if (undeployedCallback(signer, finalDigest, signature)) return true
    } catch (e) {
      throw new Error('undeployedCallback error: ' + e.message)
    }
  }

  return false
}

// Address recovery wrapper
const recoverAddress = (hash, signature) => {
  try {
    return ethers.utils.recoverAddress(hash, signature)
  } catch {
    return false
  }
}

// Comparing addresses. targetAddr is already checked upstream
const addrMatching = (recoveredAddr, targetAddr) => {
  if (recoveredAddr === false) return false
  if (!ethers.utils.isAddress(recoveredAddr)) throw new Error('Invalid recovered address: ' + recoveredAddr)

  return recoveredAddr.toLowerCase() === targetAddr.toLowerCase()
}

// EIP 1271 check
const eip1271Check = async (web3CompatibleProvider, signer, hash, signature) => {
  let ethersProvider
  if (ethers.providers.Provider.isProvider(web3CompatibleProvider)) {
    ethersProvider = web3CompatibleProvider
  } else {
    ethersProvider = new ethers.providers.Web3Provider(web3CompatibleProvider);
  }
  const code = await ethersProvider.getCode(signer)
  if (code && code !== '0x') {
    const contract = new ethers.Contract(signer, VALIDATOR_1271_ABI, ethersProvider)
    return (await contract.isValidSignature(hash, signature)) === '0x1626ba7e'
  }
  return false
}

module.exports = {
  verifyMessage
}
