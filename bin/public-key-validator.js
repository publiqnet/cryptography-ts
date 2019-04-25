"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bs58_1 = require("bs58");
var base_key_1 = require("./base-key");
exports.validate = function (keyTypePrefix, publicKey) {
    if (!publicKey.startsWith(keyTypePrefix)) {
        return false;
    }
    var base58PublicKey = publicKey.slice(keyTypePrefix.length);
    var bytesPublicKey = bs58_1.decode(base58PublicKey);
    var hexPublicKey = bytesPublicKey.toString('hex');
    if (hexPublicKey.length !== 74) {
        return false;
    }
    var publicKeyPrefix = hexPublicKey.slice(0, 2);
    if (!(publicKeyPrefix === '02' || publicKeyPrefix === '03')) {
        return false;
    }
    var publicKeyCor = hexPublicKey.slice(2, hexPublicKey.length - 8);
    var publicKeySuffix = hexPublicKey.slice(hexPublicKey.length - 8);
    if (base_key_1.BaseKey.toRIPEMD("" + publicKeyPrefix + publicKeyCor).slice(0, 8) !== publicKeySuffix) {
        return false;
    }
    return true;
};
