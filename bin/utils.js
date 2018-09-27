"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bs58_1 = require("bs58");
exports.hexStringToByteArray = function (hexStr) {
    return new Uint8Array(hexStr.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16);
    }));
};
exports.hexStringToBase58 = function (hexStr) {
    return bs58_1.encode(exports.hexStringToByteArray(hexStr));
};
exports.derToBase58 = function (der) {
    return bs58_1.encode(der);
};
