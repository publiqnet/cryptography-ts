import { encode } from 'bs58';
import * as RMD160 from 'crypto-js/ripemd160';
import * as SHA256 from 'crypto-js/sha256';
import * as CryptoJS from 'crypto-js';


export class BaseKey {

    public set Key (hexKey) {
        this.key = hexKey;
    }

    public get Hex () {
      return this.key;
    }

    public get Base58 () {
        return BaseKey.toBase58(this.key);
    }

    protected key;

    static hexStringToByteArray (hexStr) {
        return new Uint8Array(hexStr.match(/[\da-f]{2}/gi).map( h => {
            return parseInt(h, 16);
        }));
    }

    static toSHA256 (hexStr) {
        return SHA256(CryptoJS.enc.Hex.parse(hexStr)).toString();
    }

    static toRIPEMD(hexStr) {
        return RMD160(CryptoJS.enc.Hex.parse(hexStr)).toString();
    }

    static toBase58 (hexStr) {
        return encode(BaseKey.hexStringToByteArray(hexStr));
    }
}
