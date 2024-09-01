import type { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";
import { Provider } from "@ethersproject/providers";
import { PublicClient } from "viem";
type Props = {
    provider?: Provider | PublicClient;
    signer?: string;
    signature: string | Uint8Array;
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
export declare function verifyMessage({ provider, signer, signature, message, typedData, finalDigest, }: (Required<Pick<Props, "message">> | Required<Pick<Props, "typedData">> | Required<Pick<Props, "finalDigest">>) & Props): Promise<boolean>;
export {};
