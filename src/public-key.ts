import { BaseKey } from './base-key';

export class PublicKey extends BaseKey {

    private set KeyYHex (keyY) {
        this.keyYHex = keyY;
        this.KeyPrefix = this.keyYHex;
    }

    private set KeyXHex (keyX) {
        this.keyXHex = keyX;
        this.KeySuffix = this.keyXHex;
    }

    private set KeyPrefix (keyYHex) {
        this.keyPrefix = PublicKey.isOdd(keyYHex) ? '03' : '02';
    }

    private set KeySuffix(keyXHex) {
        this.keySuffix = BaseKey.toRIPEMD(`${this.keyPrefix}${keyXHex}`).slice(0, 8);
    }

    constructor(keyXHex, keyYHex) {
        super();
        this.KeyYHex = keyYHex;
        this.KeyXHex = keyXHex;

        this.Key = `${this.keyPrefix}${this.keyXHex}${this.keySuffix}`;

        // console.log('public key X', this.keyXHex);
        // console.log('public key y', this.keyYHex);
        // console.log('public key prefix', this.keyPrefix);
        // console.log('public key suffix', this.keySuffix);
        // console.log('public key', this.key);
        // console.log('public key Base58', this.Base58);
    }

    private keyYHex = null;
    private keyXHex = null;
    private keyPrefix = null;
    private keySuffix = null;

    static  isOdd (hexString) {
        const arr  = BaseKey.hexStringToByteArray(hexString);
        const last = arr[arr.length - 1];
        return parseInt(last + '', 10) % 2;
    }
}
