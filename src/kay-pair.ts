import { ec, rand } from 'elliptic';
import { derToBase58 } from './utils';
import { PrivateKey } from './private-key';
import { PublicKey } from './public-key';
import { wordsList } from './words';
import { Encryptor } from './encryptor';

import * as SHA256 from 'crypto-js/sha256';
import * as SHA512 from 'crypto-js/sha512';
import * as CryptoJS from 'crypto-js';

const secp256k1 = new ec('secp256k1');
const generatorPoint = secp256k1.g;

import * as BN from 'bn.js';

export class KeyPair {

  private publicKey: PublicKey;
  private privateKey: PrivateKey;
  private brainKey: string;
  private pureBrainKay: string;

  constructor(brainKeyPrefix?: string) {
    if (!brainKeyPrefix) {
      this.pureBrainKay = KeyPair.generateRandomText()
    } else {
      this.pureBrainKay = brainKeyPrefix;
    }

    const brainKey = KeyPair.createBrainKey(0, this.pureBrainKay);
    const privateCorKeyHex = KeyPair.encryptBrainKey(brainKey);
    const pubKeyCoordinates = generatorPoint.mul(privateCorKeyHex);
    const pubKeyXHex = pubKeyCoordinates.getX().toString('hex');
    const pubKeyYHex = pubKeyCoordinates.getY().toString('hex');

    this.publicKey = new PublicKey(pubKeyXHex, pubKeyYHex);
    this.privateKey = new PrivateKey(privateCorKeyHex);
    this.brainKey = brainKey;

  }

  public get PpublicKey(): string {
    return `${KeyPair.publicKeyPrefix}${this.publicKey.Base58}`;
  }

  public get BrainKey(): string {
    return this.pureBrainKay;
  }

  public get Ppublic(): PublicKey {
    return this.publicKey;
  }

  public get Private(): PrivateKey {
    return this.privateKey;
  }

  // static generateEntropy (suffix) {
  //   const text = `${KeyPair.generateRandomText()} ${suffix}`;
  //   // console.log('text ===',text.toUpperCase());
  //   return SHA256(SHA512(text.toUpperCase())).toString();
  // }

  public getEncryptedBrainKeyByPassword(password: string) {
    return KeyPair.encryptBrainKeyByPassword(this.pureBrainKay, password);
  }

  public signMessage(message) {
    const key = secp256k1.keyFromPrivate(this.privateKey.KeyCoreHex);
    const hash = CryptoJS.SHA256(message);
    const signature = key.sign(
      hash.toString(CryptoJS.enc.Hex)
    );

    return derToBase58(signature.toDER());
  }

  static publicKeyPrefix: string = '';
  static brainKeyLength: number = 16;

  static setPublicKeyPrefix(publicKeyPrefix = '') {
    this.publicKeyPrefix = publicKeyPrefix;
  }

  static setBrainKeyLangth(brainKeyLangth = 16) {
    this.brainKeyLength = brainKeyLangth;
  }

  static generateRandomText() {
    const random_seed = rand(this.brainKeyLength);
    const strArr = [];

    for (let i = 0; i < random_seed.length; i++) {
      const index = Math.round((1 / random_seed[i]) * (wordsList.length - 1));
      strArr.push(wordsList[index]);
    }

    return strArr.join(' ');
  }

  static createBrainKey(suffix, text = '') {
    // if (!text) {
    //   return `${KeyPair.generateRandomText()} ${suffix}`;
    // }
    //  ${suffix}
    return `${text} ${suffix}`;
  }

  static encryptBrainKeyByPassword(brainKey: string, password: string) {
    return CryptoJS.AES.encrypt(
      brainKey,
      password,
      { format: Encryptor.prototype }).toString();
  }

  static decryptBrainKeyByPassword(brainKey: string, password: string) {
      let returnObject = {
          isValid: false,
          brainKey: null
      };

      try {
          returnObject.brainKey = CryptoJS.AES.decrypt(
              brainKey,
              password,
              { format: Encryptor.prototype }).toString(CryptoJS.enc.Utf8);

          returnObject.isValid = true;
      } catch (e) {
          returnObject.brainKey = null;
          returnObject.isValid = false
      }

      return returnObject;
  }

  static encryptBrainKey(brainKey) {
    return SHA256(SHA512(brainKey)).toString();
  }
}
