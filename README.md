# Signature Validator library

As signatures can be daunting at times, this is a library aiming to implement universal signature verification, supporting: 

- Standard message verification (`eth_sign`)
- EIP-712 Typed data verification (`eth_signTypedData_v*`)
- ERC-1271 Smart contract on-chain verification (`isValidSignature`)
- [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492): Signature verification for pre-deploy counterfactual contracts

### Usage

---

Simple `eth_sign` verification
```ts
import ethers from 'ethers';
import { verifyMessage } from '@ambire/signature-validator';

const provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com')

async function run() {
	// Replace `ethers.verifyMessage(message, signature) === signer` with this:
	const isValidSig = await verifyMessage({
	    signer: '0xaC39b311DCEb2A4b2f5d8461c1cdaF756F4F7Ae9',
	    message: 'My funds are SAFU with Ambire Wallet',
	    signature: '0x9863d84f3119ac01d9e3bf9294e6c0c3572a07780fc7c49e8dc913806f4b1dbd4cc075462dc84422a9b981b2556f9c9197d76da7ba3603e53e9300869c574d821c',
	    // this is needed so that smart contract signatures can be verified; this property can also be a viem PublicClient
	    provider,
	})
	console.log('is the sig valid: ', isValidSig)
}
run().catch(e => console.error(e))
```

For more examples, you can check the /tests folder

### viem support
The `provider` property can also be a `viem` `PublicClient`, as shown in the tests (`testConfig.js`).

### On-chain usage
For on-chain usage, we've deployed a singleton here: https://etherscan.io/address/0x7dd271fa79df3a5feb99f73bebfa4395b2e4f4be#code

And it can be deployed at the same address on every othe EVM network thanks to EIP-2470. If you wish to deploy it yourself, just use the [singleton factory](https://etherscan.io/address/0xce0042B868300000d44A59004Da54A005ffdcf9f) (use the target network's explorer) and use the bytecode resulted from compiling `UniversalSigValidator` from [EIP-6492](https://eips.ethereum.org/EIPS/eip-6492) with Solidity 0.8.28 and salt `0x0`.

Please note that onchain use cases are rare, but they do exist. For example, if you have a DEX that stores the user's orders in the form of signed messages that can be applied on-chain by anyone at any time, you may reason that sometimes an account that isn't deployed yet might want to submit such an order.

### Porting the library to other languages (eg Golang, Rust)
Porting can be done very easily because the library is now essentially just a single `eth_call`, thanks to the univeresal signature verifier being implemented in Solidity [here](https://github.com/AmbireTech/signature-validator/blob/main/contracts/EIP6492Full.sol).

### Debugging utility / user interface
To test signatures in an easier manner, you can use the signature-validator UI here: https://sigtool.ambire.com/

### Security
A formal audit was done on the ERC-6492 reference implementation used here, and all remarks were resolved. You can find the audit [here](./ERC6492-Hunter-Security-Audit-Report-V1.0.pdf). This repo uses a [simplified variant of that reference implementation](./contracts/EIP6492.sol) that the audit also applies to (except all of the issues related to `prepare` which is not used here).

Furthermore, you can self-audit the library quite easily as it's only ~80 lines of code (index.js).

### Testing

```
npm i --development
npm test
```
