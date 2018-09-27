import { BaseKey } from './base-key';

export class PrivateKey extends BaseKey {

    static  get Prefix () {
        return '80';
    }

    private keyCoreHex = null;
    private keySuffix = null;

    public set KeyCoreHex (keyCoreHex) {
        this.keyCoreHex = keyCoreHex;
        this.KeySuffix = this.keyCoreHex;
    }

    public get KeyCoreHex () {
      return this.keyCoreHex;
    }

    private set KeySuffix (keyCoreHex) {
        this.keySuffix = BaseKey.toSHA256(
            BaseKey.toSHA256(
                `${PrivateKey.Prefix}${keyCoreHex}`
            )).slice(0, 8);
    }

    constructor (keyCoreHex) {
        super();
        this.KeyCoreHex = keyCoreHex;

        this.Key = `${PrivateKey.Prefix}${this.keyCoreHex}${this.keySuffix}`;

        // console.log('private key cor', privateKeyCoreHex);
        // console.log('private key prefix', PrivateKey.Prefix);
        // console.log('private key suffix', this.keySuffix);
        // console.log('private key', this.key);
        // console.log('private key Base58', this.Base58);
    }
}
