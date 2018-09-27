"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_key_1 = require("./base-key");
var PublicKey = /** @class */ (function (_super) {
    __extends(PublicKey, _super);
    function PublicKey(keyXHex, keyYHex) {
        var _this = _super.call(this) || this;
        _this.keyYHex = null;
        _this.keyXHex = null;
        _this.keyPrefix = null;
        _this.keySuffix = null;
        _this.KeyYHex = keyYHex;
        _this.KeyXHex = keyXHex;
        _this.Key = "" + _this.keyPrefix + _this.keyXHex + _this.keySuffix;
        return _this;
        // console.log('public key X', this.keyXHex);
        // console.log('public key y', this.keyYHex);
        // console.log('public key prefix', this.keyPrefix);
        // console.log('public key suffix', this.keySuffix);
        // console.log('public key', this.key);
        // console.log('public key Base58', this.Base58);
    }
    Object.defineProperty(PublicKey.prototype, "KeyYHex", {
        set: function (keyY) {
            this.keyYHex = keyY;
            this.KeyPrefix = this.keyYHex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PublicKey.prototype, "KeyXHex", {
        set: function (keyX) {
            this.keyXHex = keyX;
            this.KeySuffix = this.keyXHex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PublicKey.prototype, "KeyPrefix", {
        set: function (keyYHex) {
            this.keyPrefix = PublicKey.isOdd(keyYHex) ? '03' : '02';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PublicKey.prototype, "KeySuffix", {
        set: function (keyXHex) {
            this.keySuffix = base_key_1.BaseKey.toRIPEMD("" + this.keyPrefix + keyXHex).slice(0, 8);
        },
        enumerable: true,
        configurable: true
    });
    PublicKey.isOdd = function (hexString) {
        var arr = base_key_1.BaseKey.hexStringToByteArray(hexString);
        var last = arr[arr.length - 1];
        return parseInt(last + '', 10) % 2;
    };
    return PublicKey;
}(base_key_1.BaseKey));
exports.PublicKey = PublicKey;
