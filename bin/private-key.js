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
var PrivateKey = /** @class */ (function (_super) {
    __extends(PrivateKey, _super);
    function PrivateKey(keyCoreHex) {
        var _this = _super.call(this) || this;
        _this.keyCoreHex = null;
        _this.keySuffix = null;
        _this.KeyCoreHex = keyCoreHex;
        _this.Key = "" + PrivateKey.Prefix + _this.keyCoreHex + _this.keySuffix;
        return _this;
        // console.log('private key cor', privateKeyCoreHex);
        // console.log('private key prefix', PrivateKey.Prefix);
        // console.log('private key suffix', this.keySuffix);
        // console.log('private key', this.key);
        // console.log('private key Base58', this.Base58);
    }
    Object.defineProperty(PrivateKey, "Prefix", {
        get: function () {
            return '80';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PrivateKey.prototype, "KeyCoreHex", {
        get: function () {
            return this.keyCoreHex;
        },
        set: function (keyCoreHex) {
            this.keyCoreHex = keyCoreHex;
            this.KeySuffix = this.keyCoreHex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PrivateKey.prototype, "KeySuffix", {
        set: function (keyCoreHex) {
            this.keySuffix = base_key_1.BaseKey.toSHA256(base_key_1.BaseKey.toSHA256("" + PrivateKey.Prefix + keyCoreHex)).slice(0, 8);
        },
        enumerable: true,
        configurable: true
    });
    return PrivateKey;
}(base_key_1.BaseKey));
exports.PrivateKey = PrivateKey;
