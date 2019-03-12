"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var elliptic_1 = require("elliptic");
var utils_1 = require("./utils");
var private_key_1 = require("./private-key");
var public_key_1 = require("./public-key");
var words_1 = require("./words");
var encryptor_1 = require("./encryptor");
var SHA256 = require("crypto-js/sha256");
var SHA512 = require("crypto-js/sha512");
var CryptoJS = require("crypto-js");
var secp256k1 = new elliptic_1.ec('secp256k1');
var generatorPoint = secp256k1.g;
var KeyPair = /** @class */ (function () {
    function KeyPair(brainKeyPrefix) {
        if (!brainKeyPrefix) {
            this.pureBrainKay = KeyPair.generateRandomText();
        }
        else {
            this.pureBrainKay = brainKeyPrefix;
        }
        var brainKey = KeyPair.createBrainKey(0, this.pureBrainKay);
        var privateCorKeyHex = KeyPair.encryptBrainKey(brainKey);
        var pubKeyCoordinates = generatorPoint.mul(privateCorKeyHex);
        var pubKeyXHex = pubKeyCoordinates.getX().toString('hex');
        var pubKeyYHex = pubKeyCoordinates.getY().toString('hex');
        this.publicKey = new public_key_1.PublicKey(pubKeyXHex, pubKeyYHex);
        this.privateKey = new private_key_1.PrivateKey(privateCorKeyHex);
        this.brainKey = brainKey;
    }
    Object.defineProperty(KeyPair.prototype, "PpublicKey", {
        get: function () {
            return "" + KeyPair.publicKeyPrefix + this.publicKey.Key;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyPair.prototype, "BrainKey", {
        get: function () {
            return this.pureBrainKay;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyPair.prototype, "Ppublic", {
        get: function () {
            return this.publicKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyPair.prototype, "Private", {
        get: function () {
            return this.privateKey;
        },
        enumerable: true,
        configurable: true
    });
    // static generateEntropy (suffix) {
    //   const text = `${KeyPair.generateRandomText()} ${suffix}`;
    //   // console.log('text ===',text.toUpperCase());
    //   return SHA256(SHA512(text.toUpperCase())).toString();
    // }
    KeyPair.prototype.getEncryptedBrainKeyByPassword = function (password) {
        return KeyPair.encryptBrainKeyByPassword(this.pureBrainKay, password);
    };
    KeyPair.prototype.signMessage = function (message) {
        var key = secp256k1.keyFromPrivate(this.privateKey.KeyCoreHex);
        var hash = CryptoJS.SHA256(message);
        var signature = key.sign(hash.toString(CryptoJS.enc.Hex));
        return utils_1.derToBase58(signature.toDER());
    };
    KeyPair.setPublicKeyPrefix = function (publicKeyPrefix) {
        if (publicKeyPrefix === void 0) { publicKeyPrefix = ''; }
        this.publicKeyPrefix = publicKeyPrefix;
    };
    KeyPair.setBrainKeyLangth = function (brainKeyLangth) {
        if (brainKeyLangth === void 0) { brainKeyLangth = 16; }
        this.brainKeyLength = brainKeyLangth;
    };
    KeyPair.generateRandomText = function () {
        var random_seed = elliptic_1.rand(this.brainKeyLength);
        var strArr = [];
        for (var i = 0; i < random_seed.length; i++) {
            var index = Math.round((1 / random_seed[i]) * (words_1.wordsList.length - 1));
            strArr.push(words_1.wordsList[index]);
        }
        return strArr.join(' ');
    };
    KeyPair.createBrainKey = function (suffix, text) {
        if (text === void 0) { text = ''; }
        // if (!text) {
        //   return `${KeyPair.generateRandomText()} ${suffix}`;
        // }
        //  ${suffix}
        return text + " " + suffix;
    };
    KeyPair.encryptBrainKeyByPassword = function (brainKey, password) {
        return CryptoJS.AES.encrypt(brainKey, password, { format: encryptor_1.Encryptor.prototype }).toString();
    };
    KeyPair.decryptBrainKeyByPassword = function (brainKey, password) {
        return CryptoJS.AES.decrypt(brainKey, password, { format: encryptor_1.Encryptor.prototype }).toString(CryptoJS.enc.Utf8);
    };
    KeyPair.encryptBrainKey = function (brainKey) {
        return SHA256(SHA512(brainKey)).toString();
    };
    KeyPair.publicKeyPrefix = '';
    KeyPair.brainKeyLength = 16;
    return KeyPair;
}());
exports.KeyPair = KeyPair;
