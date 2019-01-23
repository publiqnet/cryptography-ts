"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bs58_1 = require("bs58");
var BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
// var bs58 = require('base-x')(BASE58);
var basex = require("base-x");
var bs58 = basex(BASE58_ALPHABET);
// const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
// import bs58 from 'base-x';
// const genBs58 = bs58(BASE58_ALPHABET);
exports.hexStringToByteArray = function (hexStr) {
    return new Uint8Array(hexStr.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16);
    }));
};
exports.hexStringToBase58 = function (hexStr) {
    return bs58_1.encode(exports.hexStringToByteArray(hexStr));
};
exports.derToBase58 = function (der) {
    // console.log("1: ", encode(der))
    // console.log("2: ", bs58.encode(der))
    return bs58.encode(der); //encode(der);
};
