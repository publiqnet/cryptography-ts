import { ec, rand } from 'elliptic';
import { derToBase58 } from './utils';
import { PrivateKey } from './private-key';
import { PublicKey } from './public-key';
import { wordsList } from './words';

import * as SHA256 from 'crypto-js/sha256';
import * as SHA512 from 'crypto-js/sha512';
import * as CryptoJS from 'crypto-js';

const secp256k1 = new ec('secp256k1');
const generatorPoint = secp256k1.g;


import * as BN from 'bn.js';

export class KeyPair {

    public get Ppublic (): PublicKey {
        return this.publicKey;
    }

    public get Private (): PrivateKey {
        return this.privateKey;
    }

    public get BrainKey (): string {
      return this.brainKey;
    }

    constructor( brainKeyPrefix ?: string ) {
        const brainKey = KeyPair.createBrainKey(0, brainKeyPrefix);

        const privateCorKeyHex = KeyPair.encryptBrainKey(brainKey);
        // KeyPair.generateEntropy(0);

        const pubKeyCoordinates = generatorPoint.mul(privateCorKeyHex);
        const pubKeyXHex = pubKeyCoordinates.getX().toString('hex');
        const pubKeyYHex = pubKeyCoordinates.getY().toString('hex');

        this.publicKey = new PublicKey(pubKeyXHex, pubKeyYHex);
        this.privateKey = new PrivateKey(privateCorKeyHex);
        this.brainKey = brainKey;

    }

    // static generateEntropy (suffix) {
    //   const text = `${KeyPair.generateRandomText()} ${suffix}`;
    //   // console.log('text ===',text.toUpperCase());
    //   return SHA256(SHA512(text.toUpperCase())).toString();
    // }

    private publicKey: PublicKey ;
    private privateKey: PrivateKey ;
    private brainKey: string;

    static generateRandomText () {
        const random_seed = rand(10);
        const strArr = [ ];

        for (let i = 0; i < random_seed.length; i++) {
            const index = Math.round((1 / random_seed[i]) * (wordsList.length - 1));
          strArr.push(wordsList[index]);
        }

        return strArr.join(' ');
    }

    static createBrainKey(suffix, text = '') {
      if (!text) {
        return `${KeyPair.generateRandomText()} ${suffix}`;
      }
      //  ${suffix}
      return `${text} ${suffix}`;
    }

    static encryptBrainKey(brainKey) {
      return SHA256(SHA512(brainKey)).toString();
    }

    public signMessage (message) {
      const key = secp256k1.keyFromPrivate(this.privateKey.KeyCoreHex);
      const hash = CryptoJS.SHA256(message);
      const signature = key.sign(
        hash.toString(CryptoJS.enc.Hex)
     );

      console.log('signature base 58 :', derToBase58(signature.toDER()));

      return derToBase58(signature.toDER());
    }
}
