import { encode } from 'bs58';
import * as RMD160 from 'crypto-js/ripemd160';
import * as SHA256  from 'crypto-js/sha256';
import * as CryptoJS from 'crypto-js';

var BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
// var bs58 = require('base-x')(BASE58);
import * as basex from 'base-x';
const bs58 = basex(BASE58_ALPHABET)

// const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
// import bs58 from 'base-x';
// const genBs58 = bs58(BASE58_ALPHABET);

export const hexStringToByteArray = hexStr => {
    return new Uint8Array(hexStr.match(/[\da-f]{2}/gi).map( h => {
        return parseInt(h, 16);
    }));
};

export const hexStringToBase58 = hexStr => {
    return encode(hexStringToByteArray(hexStr));
};


export const derToBase58 = der => {
    // console.log("1: ", encode(der))
    // console.log("2: ", bs58.encode(der))


    return  bs58.encode(der)//encode(der);
};
