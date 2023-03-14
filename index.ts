import type {
  TypedDataDomain,
  TypedDataField,
} from "@ethersproject/abstract-signer";
import { Provider } from "@ethersproject/providers";
import { ethers, utils } from "ethers";

const VALIDATOR_1271_ABI = [
  "function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)",
];

type Props = {
  provider?: Provider;
  signer?: string;
  signature: string | Uint8Array;
  undeployedCallback?: (
    errorMessage: string,
    data: string,
    signature: string | Uint8Array
  ) => boolean;
  message?: string | Uint8Array;
  typedData?: {
    domain: TypedDataDomain;
    types: Record<string, Array<TypedDataField>>;
    message: Record<string, any>;
  };
  finalDigest?: string;
};

/**
 * NOTE: you only need to pass one of: typedData, finalDigest, message
 */
export async function verifyMessage({
  provider,
  signer,
  signature,
  undeployedCallback,
  message,
  typedData,
  finalDigest,
}: (
  | Required<Pick<Props, "message">>
  | Required<Pick<Props, "typedData">>
  | Required<Pick<Props, "finalDigest">>
) &
  Props): Promise<boolean> {
  if (message) {
    finalDigest = utils.hashMessage(message);
  } else if (typedData) {
    finalDigest = ethers.utils._TypedDataEncoder.hash(
      typedData.domain,
      typedData.types,
      typedData.message
    );
  } else if (!finalDigest) {
    throw Error(
      "Missing one of the properties: message, unPrefixedMessage, typedData or finalDigest"
    );
  }

  // 1st try: Getting code from deployed smart contract to call 1271 isValidSignature.
  // eip1271 check should be the prioritary option in the logic for 2 reasons:
  // - eip1271 could potentially also be a valid ecrecover signature
  // - Future-proof implementation of Account Abstraction
  if (await eip1271Check(provider, signer, finalDigest, signature)) return true;

  // 2nd try: elliptic curve signature (EOA)
  if (addrMatching(recoverAddress(finalDigest, signature), signer)) return true;

  // Last attempt, for undeployed smart contract with custom logic
  if (undeployedCallback) {
    try {
      if (undeployedCallback(signer, finalDigest, signature)) return true;
    } catch (e) {
      throw new Error("undeployedCallback error: " + e.message);
    }
  }

  return false;
}

// Address recovery wrapper
const recoverAddress = (hash, signature) => {
  try {
    return ethers.utils.recoverAddress(hash, signature);
  } catch {
    return false;
  }
};

// Comparing addresses. targetAddr is already checked upstream
const addrMatching = (recoveredAddr: string | false, targetAddr: string) => {
  if (recoveredAddr === false) return false;
  if (!ethers.utils.isAddress(recoveredAddr))
    throw new Error("Invalid recovered address: " + recoveredAddr);

  return recoveredAddr.toLowerCase() === targetAddr.toLowerCase();
};

// EIP 1271 check
const eip1271Check = async (
  web3CompatibleProvider: Provider,
  signer: string,
  hash: string,
  signature: string | Uint8Array
) => {
  let ethersProvider;
  if (ethers.providers.Provider.isProvider(web3CompatibleProvider)) {
    ethersProvider = web3CompatibleProvider;
  } else {
    ethersProvider = new ethers.providers.Web3Provider(web3CompatibleProvider);
  }
  const code = await ethersProvider.getCode(signer);
  if (code && code !== "0x") {
    const contract = new ethers.Contract(
      signer,
      VALIDATOR_1271_ABI,
      ethersProvider
    );
    return (await contract.isValidSignature(hash, signature)) === "0x1626ba7e";
  }
  return false;
};
