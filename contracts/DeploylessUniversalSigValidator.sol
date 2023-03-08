interface IERC1271Wallet {
  function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4 magicValue);
}

contract VerifySig {
  constructor (address _signer, bytes32 _hash, bytes memory _signature) {
    UniversalSigValidator validator = new UniversalSigValidator();
    bool isValidSig = validator.isValidUniversalSig(_signer, _hash, _signature);
    assembly {
      mstore(0, isValidSig)
      return(31, 1)
    }
  }
}
contract UniversalSigValidator {
  // ERC-6492 suffix: https://eips.ethereum.org/EIPS/eip-6492
  bytes32 private constant ERC6492_DETECTION_SUFFIX = 0x6492649264926492649264926492649264926492649264926492649264926492;
  bytes4 private constant ERC1271_SUCCESS = 0x1626ba7e;
  /**
   * @notice Verifies that the signature is valid for that signer and hash
   */
  function isValidUniversalSig(
    address _signer,
    bytes32 _hash,
    bytes calldata _signature
  ) public returns (bool) {
    bytes memory contractCode = address(_signer).code;
    // The order here is striclty defined in https://eips.ethereum.org/EIPS/eip-6492
    // - ERC-6492 suffix check and verification first, while being permissive in case the contract is already deployed so as to not invalidate old sigs
    // - ERC-1271 verification if there's contract code
    // - finally, ecrecover
    if (bytes32(_signature[_signature.length-32:_signature.length]) == ERC6492_DETECTION_SUFFIX) {
      // resize the sig to remove the magic suffix
      _signature = _signature[0:_signature.length-32];

      address create2Factory;
      bytes memory factoryCalldata;
      bytes memory originalSig;
      (create2Factory, factoryCalldata, originalSig) = abi.decode(_signature, (address, bytes, bytes));

      if (contractCode.length == 0) {
        (bool success, ) = create2Factory.call(factoryCalldata);
        require(success, 'SignatureValidator: deployment');
      }
      return IERC1271Wallet(_signer).isValidSignature(_hash, originalSig) == ERC1271_SUCCESS;
    }

    if (contractCode.length > 0) {
      return IERC1271Wallet(_signer).isValidSignature(_hash, _signature) == ERC1271_SUCCESS;
    }

    // ecrecover verification
    require(_signature.length == 65, 'SignatureValidator#recoverSigner: invalid signature length');

    bytes memory tempSig = _signature;
    bytes32 r;
    bytes32 s;
    uint8 v;

    assembly {
      r := mload(add(tempSig, 32))
      s := mload(add(tempSig, 64))
      v := and(mload(add(tempSig, 65)), 255)
    }

    if (v != 27 && v != 28) {
      revert('SignatureValidator#recoverSigner: invalid signature v value');
    }

    return ecrecover(_hash, v, r, s) == _signer;
  }
}

