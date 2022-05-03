const test = require('tape')
const tapSpec = require('tap-spec')
const ethers = require('ethers')
const { RPC, MNEMONIC } = require('../testConfig')
const { verifyMessage } = require('../index')

test('eth_sign + 1271 Undeployed', async function (t) {

  const provider = new ethers.providers.JsonRpcProvider(RPC.polygon) // the contract should not be deployed here
  const signerAddress = '0xfE47aFaf177e27EE65d2ADAAb50960e85394C3E9'// signer of Identity account 0xd8a4417da81515e7581ae9a518063b245c800be6
  const humanMessage = 'Ambire test'
  // signature from 0x4836a472ab1dd406ecb8d0f933a985541ee3921f (Ambire Wallet Identity - deployed on polygon)
  const signature = '0xaebf10be1e1a07752d19a8be1b8bf188db2153e50a41575647b64f89651d2e361d04bf3a358873c1882ca6e80837540dd118eebb95b91831d66c1dcf40837ad51b00'

  return verifyMessage({
    signer: signerAddress,
    provider,
    message: humanMessage,
    signature,
    undeployedCallback: ambireUndeployedValidationCallback
  }).then(result => {
    t.assert(result.success, 'Valid signature')
    t.equal(result.type, '1271 (undeployed)', 'Verification type: Undeployed 1271 off-chain')
  }).catch(e => {
    t.error(e, 'Invalid signature')
  })

})

//Undeployed implemenatation
const ambireUndeployedValidationCallback = (signer, hash, sig) => {

  const ambireUndeployedQuickAccCheck = (signer, hash, sig) => {
    const decoded = ethers.utils.defaultAbiCoder.decode([
      'uint',
      'bytes',
      'bytes'
    ], sig)

    const sig1 = decoded[1]
    const sig2 = decoded[2]

    const b1 = Buffer.from(sig1.substr(2), 'hex')
    const subMode1 = b1[b1.length - 1]

    const b2 = Buffer.from(sig2.substr(2), 'hex')
    const subMode2 = b2[b2.length - 1]

    return ambireUndeployedStandardCheck(signer, hash, sig1, subMode1 === 1) || ambireUndeployedStandardCheck(signer, hash, sig2, subMode2 === 1)
  }

  const ambireUndeployedStandardCheck = (signer, message, sig, isMessage) => {
    const b = Buffer.from(sig.substr(2), 'hex')
    const v = b[64]

    if (v !== 27 && v !== 28) return false

    if (isMessage) {
      hash = ethers.utils.keccak256(ethers.utils.solidityPack(['string', 'bytes32'], ['\x19Ethereum Signed Message:\n32', hash]))
    }

    const recoveredSigner = ethers.utils.recoverAddress(hash, '0x' + b.slice(0, 65).toString('hex'))

    if (!recoveredSigner) {
      return false
    }
    return recoveredSigner.toLowerCase() === signer.toLowerCase()
  }

  const b = Buffer.from(sig.substr(2), 'hex')
  const mode = b[b.length - 1]

  if (mode === 0 || mode === 1) {
    return ambireUndeployedStandardCheck(signer, hash, '0x' + b.slice(0, 65).toString('hex'), mode === 1)
  } else if (mode === 2) {
    //need deployed contract as privileges are checked, but we can still check one of the signer
    return ambireUndeployedQuickAccCheck(signer, hash, sig)
  } else {
    return false
  }
}
