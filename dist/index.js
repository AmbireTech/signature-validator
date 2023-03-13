"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.verifyMessage = void 0;
var ethers_1 = require("ethers");
var VALIDATOR_1271_ABI = [
    "function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)",
];
/**
 * NOTE: you only need to pass one of: typedData, finalDigest, message
 */
function verifyMessage(_a) {
    var provider = _a.provider, signer = _a.signer, message = _a.message, typedData = _a.typedData, finalDigest = _a.finalDigest, signature = _a.signature, undeployedCallback = _a.undeployedCallback;
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (message) {
                        finalDigest = ethers_1.utils.hashMessage(message);
                    }
                    else if (typedData) {
                        finalDigest = ethers_1.ethers.utils._TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.message);
                    }
                    else if (!finalDigest) {
                        throw Error("Missing one of the properties: message, unPrefixedMessage, typedData or finalDigest");
                    }
                    return [4 /*yield*/, eip1271Check(provider, signer, finalDigest, signature)];
                case 1:
                    // 1st try: Getting code from deployed smart contract to call 1271 isValidSignature.
                    // eip1271 check should be the prioritary option in the logic for 2 reasons:
                    // - eip1271 could potentially also be a valid ecrecover signature
                    // - Future-proof implementation of Account Abstraction
                    if (_b.sent())
                        return [2 /*return*/, true];
                    // 2nd try: elliptic curve signature (EOA)
                    if (addrMatching(recoverAddress(finalDigest, signature), signer))
                        return [2 /*return*/, true];
                    // Last attempt, for undeployed smart contract with custom logic
                    if (undeployedCallback) {
                        try {
                            if (undeployedCallback(signer, finalDigest, signature))
                                return [2 /*return*/, true];
                        }
                        catch (e) {
                            throw new Error("undeployedCallback error: " + e.message);
                        }
                    }
                    return [2 /*return*/, false];
            }
        });
    });
}
exports.verifyMessage = verifyMessage;
// Address recovery wrapper
var recoverAddress = function (hash, signature) {
    try {
        return ethers_1.ethers.utils.recoverAddress(hash, signature);
    }
    catch (_a) {
        return false;
    }
};
// Comparing addresses. targetAddr is already checked upstream
var addrMatching = function (recoveredAddr, targetAddr) {
    if (recoveredAddr === false)
        return false;
    if (!ethers_1.ethers.utils.isAddress(recoveredAddr))
        throw new Error("Invalid recovered address: " + recoveredAddr);
    return recoveredAddr.toLowerCase() === targetAddr.toLowerCase();
};
// EIP 1271 check
var eip1271Check = function (web3CompatibleProvider, signer, hash, signature) { return __awaiter(void 0, void 0, void 0, function () {
    var ethersProvider, code, contract;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (ethers_1.ethers.providers.Provider.isProvider(web3CompatibleProvider)) {
                    ethersProvider = web3CompatibleProvider;
                }
                else {
                    ethersProvider = new ethers_1.ethers.providers.Web3Provider(web3CompatibleProvider);
                }
                return [4 /*yield*/, ethersProvider.getCode(signer)];
            case 1:
                code = _a.sent();
                if (!(code && code !== "0x")) return [3 /*break*/, 3];
                contract = new ethers_1.ethers.Contract(signer, VALIDATOR_1271_ABI, ethersProvider);
                return [4 /*yield*/, contract.isValidSignature(hash, signature)];
            case 2: return [2 /*return*/, (_a.sent()) === "0x1626ba7e"];
            case 3: return [2 /*return*/, false];
        }
    });
}); };
