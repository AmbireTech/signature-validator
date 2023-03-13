import type { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";
import { Provider } from "@ethersproject/providers";
/**
 * NOTE: you only need to pass one of: typedData, finalDigest, message
 */
export declare function verifyMessage({ provider, signer, message, typedData, finalDigest, signature, undeployedCallback, }: {
    provider: Provider;
    signer: string;
    message?: string | Uint8Array;
    typedData?: {
        domain: TypedDataDomain;
        types: Record<string, Array<TypedDataField>>;
        message: Record<string, any>;
    };
    finalDigest?: string;
    signature: string | Uint8Array;
    undeployedCallback?: (errorMessage: string, data: string, signature: string | Uint8Array) => boolean;
}): Promise<boolean>;
