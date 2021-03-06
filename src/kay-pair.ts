import { ec, rand } from 'elliptic';
import * as MersenneTwister  from 'mersenne-twister';
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
  private static randomKey: number;

  constructor(brainKeyPrefix?: string) {
    if (!brainKeyPrefix) {
      this.pureBrainKay = KeyPair.generateRandomText()
    } else {
      this.pureBrainKay = brainKeyPrefix;
    }

    const brainKey = KeyPair.createBrainKey(0, this.pureBrainKay);
    const privateCorKeyHex = KeyPair.encryptBrainKey(brainKey);
    const pubKeyCoordinates = KeyPair.getPointCordinats(privateCorKeyHex); //generatorPoint.mul(privateCorKeyHex);
    const pubKeyXHex = pubKeyCoordinates.XHex;
    const pubKeyYHex = pubKeyCoordinates.YHex;

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
    // const key = secp256k1.keyFromPrivate(this.privateKey.KeyCoreHex);
    // const hash = CryptoJS.SHA256(message);
    // const signature = key.sign(
    //   hash.toString(CryptoJS.enc.Hex)
    // );
    const signature = KeyPair.signMessageBySecp256k1(this.privateKey.KeyCoreHex, message)
    return derToBase58(signature.toDER());
  }

  static publicKeyPrefix: string = '';
  static brainKeyLength: number = 16;


  static signMessageBySecp256k1 (privateKey, message) {
    const key = secp256k1.keyFromPrivate(privateKey);
    const hash = CryptoJS.SHA256(message);
    const signature = key.sign(
      hash.toString(CryptoJS.enc.Hex)
    );
    return signature;
  }

  static setPublicKeyPrefix(publicKeyPrefix = '') {
    this.publicKeyPrefix = publicKeyPrefix;
  }

  static setBrainKeyLangth(brainKeyLangth = 16) {
    this.brainKeyLength = brainKeyLangth;
  }

  public static setRandomKey(key: number) {
    this.randomKey = key;
  }

  public static getRandomKey(): number {
    return this.randomKey;
  }

  static generateRandomText() {
    const randomizer = new MersenneTwister(this.randomKey);
    // const random_seed = rand(wordsList.length);
    const strArr = [];

    for (let i = 0; i < this.brainKeyLength; i++) {
      const index = Math.round(randomizer.random()*(wordsList.length - 1));
      // const index = random_seed[r_index]
      //Math.round((1 / random_seed[i]) * (wordsList.length - 1));
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

          if(!returnObject.brainKey) {
              returnObject.isValid = false;
              returnObject.brainKey = null;
          } else {
              returnObject.isValid = true;
          }
      } catch (e) {
          returnObject.brainKey = null;
          returnObject.isValid = false
      }

      return returnObject;
  }

  static encryptBrainKey(brainKey) {
    return SHA256(SHA512(brainKey)).toString();
  }

  static getPointCordinats(privateCorKeyHex) {
    const pubKeyCoordinates = generatorPoint.mul(privateCorKeyHex);
    const getFullHexStr = (hexStr) => {
      let l = hexStr.length
      let fullHexStr = hexStr;
      for ( ; l < 64; l ++) {
          fullHexStr = `${0}${fullHexStr}`;
      }
      return fullHexStr;
    }

    const hexPoint = {
      XHex: getFullHexStr(pubKeyCoordinates.getX().toString('hex')),
      YHex:  getFullHexStr(pubKeyCoordinates.getY().toString('hex'))
    }

    return hexPoint;
  }
}
