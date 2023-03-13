export type TypedDataDomain = import("@ethersproject/abstract-signer").TypedDataDomain;
export type TypedDataField = import("@ethersproject/abstract-signer").TypedDataField;
export type Provider = import("@ethersproject/providers").Provider;
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
export function verifyMessage({ provider, signer, message, typedData, finalDigest, signature, undeployedCallback }: Provider | window.ethereum): Promise<boolean>;
