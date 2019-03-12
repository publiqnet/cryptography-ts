import * as CryptoJS from 'crypto-js';

export class Encryptor {

    constructor() {}

    stringify(cipherParams) {
        const j = {ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)};
        if (cipherParams.iv) {
            j['iv'] = cipherParams.iv.toString();
        }
        if (cipherParams.salt) {
            j['s'] = cipherParams.salt.toString();
        }
        return JSON.stringify(j);
    }

    parse(jsonStr) {
        const j = JSON.parse(jsonStr);
        const cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(j.ct)});
        if (j.iv) {
            cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv);
        }
        if (j.s) {
            cipherParams.salt = CryptoJS.enc.Hex.parse(j.s);
        }
        return cipherParams;
    }
}
