"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bs58_1 = require("bs58");
var RMD160 = require("crypto-js/ripemd160");
var SHA256 = require("crypto-js/sha256");
var CryptoJS = require("crypto-js");
var BaseKey = /** @class */ (function () {
    function BaseKey() {
    }
    Object.defineProperty(BaseKey.prototype, "Key", {
        get: function () {
            return this.key;
        },
        set: function (hexKey) {
            this.key = hexKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseKey.prototype, "Hex", {
        get: function () {
            return this.key;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseKey.prototype, "Base58", {
        get: function () {
            return BaseKey.toBase58(this.key);
        },
        enumerable: true,
        configurable: true
    });
    BaseKey.hexStringToByteArray = function (hexStr) {
        return new Uint8Array(hexStr.match(/[\da-f]{2}/gi).map(function (h) {
            return parseInt(h, 16);
        }));
    };
    BaseKey.toSHA256 = function (hexStr) {
        return SHA256(CryptoJS.enc.Hex.parse(hexStr)).toString();
    };
    BaseKey.toRIPEMD = function (hexStr) {
        return RMD160(CryptoJS.enc.Hex.parse(hexStr)).toString();
    };
    BaseKey.toBase58 = function (hexStr) {
        return bs58_1.encode(BaseKey.hexStringToByteArray(hexStr));
    };
    return BaseKey;
}());
exports.BaseKey = BaseKey;
