import { encode } from 'bs58';
import * as RMD160 from 'crypto-js/ripemd160';
import * as SHA256  from 'crypto-js/sha256';
import * as CryptoJS from 'crypto-js';

export const hexStringToByteArray = hexStr => {
    return new Uint8Array(hexStr.match(/[\da-f]{2}/gi).map( h => {
        return parseInt(h, 16);
    }));
};

export const hexStringToBase58 = hexStr => {
    return encode(hexStringToByteArray(hexStr));
};


export const derToBase58 = der => {
    return encode(der);
};
