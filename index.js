const { ethers } = require('ethers')

const VALIDATOR_1271_ABI = ['function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)']

/**
 * @param provider Web3 Compatible provider to perform smart contract wallet validation with EIP 1271 (window.ethereum, web3.currentProvider, ethers provider... )
 * @param signer The signer address to verify the signature against
 * @param message To verify eth_sign type of signatures. Human-readable message to verify. Message should be a human string or the hex version of the human string encoded as Uint8Array. If a hex string is passed, it will be considered as a regular string
 * @param typedData To verify a 712 signature type. The {domain, type, message} 712 message object
 * @param finalDigest The final digest to verify. dApp will have to pre-compute the hash as no hashing transformation will occur and this digest will be directly used for recoverAddress and isValidSignature
 * @param signature The signature to verify as a hex string or Uint8Array
 * @param undeployedCallback An optional 1271 callback function to gracefully handle signature validation for non-deployed smart contract wallets
 * @returns {Promise<{success: boolean, type: string}|{success: boolean}>}
 * NOTE: you only need to pass one of: typedData, finalDigest, message
 */
const  verifyMessage = async ({ provider, signer, message, typedData, finalDigest, signature, undeployedCallback }) => {
  if (message) {
    finalDigest = ethers.utils.hashMessage(message)
  } else if (typedData) {
    finalDigest = ethers.utils._TypedDataEncoder.hash(typedData?.domain, typedData?.types, typedData?.message)
  } else if (!finalDigest) {
    throw Error('Missing one of the properties: message, unPrefixedMessage, typedData or finalDigest')
  }

  if (addrMatching(recoverAddress(finalDigest, signature), signer)) return { success: true, type: 'standard' }

  //2nd try: Getting code from deployed smart contract to call 1271 isValidSignature
  if ((await eip1271Check(provider, signer, finalDigest, signature)) === '0x1626ba7e') return { success: true, type: '1271' }

  //Last attempt, for undeployed smart contract with custom logic
  if (undeployedCallback) {
    try {
      if (undeployedCallback(signer, finalDigest, signature)) return { success: true, type: '1271 (undeployed)' }
    } catch (e) {
      throw new Error('undeployedCallback error: ' + e.message)
    }
  }

  return { success: false }
}

// Address recovery wrapper
const recoverAddress = (hash, signature) => {
  try {
    return ethers.utils.recoverAddress(hash, signature);
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
  const code = await ethersProvider.getCode(signer).catch()
  if (code && code !== '0x') {
    const contract = new ethers.Contract(signer, VALIDATOR_1271_ABI, ethersProvider)
    return contract.isValidSignature(hash, signature)
  }
  return false
}

module.exports = {
  verifyMessage
}
