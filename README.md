# Signature Validator library

As signatures can be daunting at times, this is a library aiming an all fits one signature verification, supporting: 

- Standard message verification (eth_sign)
- 712 Typed data verification (eth_signTypedData)
- 1271 Smart contract on-chain verification (isValidSignature)
- An optional graceful 1271 Smart contract off-chain verification

![signature-validator flow](./ambire_signature_education.png)

### Usage

---

Simple eth_sign verification
```js
const ethers = require('ethers')
const { verifyMessage } = require('signature-validator')

const provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com')

// Returning {success:bool, type:string}
verifyMessage({
    signer: '0xaC39b311DCEb2A4b2f5d8461c1cdaF756F4F7Ae9',
    provider,
    message: 'My funds are SAFU with Ambire Wallet',
    signature: '0x9863d84f3119ac01d9e3bf9294e6c0c3572a07780fc7c49e8dc913806f4b1dbd4cc075462dc84422a9b981b2556f9c9197d76da7ba3603e53e9300869c574d821c',
    }).then(result => {
        if (result.success) {
            console.log('Signature valid')
        } else {
            console.log('Signature invalid')
        }
    }).catch(e => {
        console.error('Error validating')
    })

```

For more examples, you can check the /tests folder
