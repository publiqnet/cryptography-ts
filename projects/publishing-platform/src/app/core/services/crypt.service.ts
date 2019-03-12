import { Injectable } from '@angular/core';

// import { Signature, key } from 'arcnet-js';
import { Observable } from 'rxjs';
import { Buffer } from 'buffer';
import * as CryptoJS from 'crypto-js';

import { CryptoJSAesJson } from '../../shared/aes-json/aes-json';


@Injectable()
export class CryptService {
  static brainKeyDecrypt(brainKey, password) {
    return Observable.create(observer => {
      const messageSender = CryptoJS.AES.decrypt(brainKey, password, {
        format: CryptoJSAesJson.prototype
      }).toString(CryptoJS.enc.Utf8);
      if (!messageSender) {
        observer.error(messageSender);
      }
      observer.next(messageSender);
      observer.complete();
    });
  }

  static brainKeyEncrypt(brainKey, password) {
    return CryptoJS.AES.encrypt(brainKey, password, {
      format: CryptoJSAesJson.prototype
    }).toString();
  }

  static generatePrivateKey(brainKey) {
      debugger;
    // return key.get_brainPrivateKey(brainKey);
  }

  static generatePublicKey(privkey) {
    const publicKey = privkey.toPublicKey();
    return publicKey.toString();
  }

  static stringToHash(signString) {
    return CryptoJS.SHA256('' + signString).toString();
  }

  static hashToSign(stringHash, privkey) {
    // return Signature.signBufferSha256(
    //   new Buffer(stringHash, 'hex'),
    //   privkey
    // ).toHex();
  }

  static verifySignature(stringSignature, stringHash, pubKeyString) {
    // const recPubKey = Signature.fromBuffer(
    //   new Buffer(stringSignature, 'hex')
    // ).recoverPublicKey(new Buffer(stringHash, 'hex'));
    // return recPubKey.toString() === pubKeyString;
  }

  static restorePublicKey(stringSignature, stringHash) {
    // const recPubKey = Signature.fromBuffer(
    //   new Buffer(stringSignature, 'hex')
    // ).recoverPublicKey(new Buffer(stringHash, 'hex'));
    // return recPubKey.toString();
  }

  static md5(key: string): string {
    return CryptoJS.MD5(key).toString();
  }

  // static generateBrainKey() {
  //   return key.suggest_brain_key(dictionary);
  // }

  constructor() {}
}
