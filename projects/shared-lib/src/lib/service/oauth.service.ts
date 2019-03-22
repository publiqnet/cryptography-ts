import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { KeyPair } from 'cryptography-ts';
import PubliqTransaction from 'blockchain-models-ts/bin/models/PubliqTransaction';
import { HttpHelperService, HttpMethodTypes } from './http-helper.service';

@Injectable({
  providedIn: 'root'
})
export class OauthService {

  private url: string;

  constructor(
    private httpHelper: HttpHelperService,
    @Inject('oauthUrl') url: string
  ) {
    if (!url) {
      throw new Error('OauthService: oauthUrl not valid');
    }

    this.url = `${url}/api/user`;
  }

  private static getSignetString(stringToSign, brainKey) {
    const now = new Date(new Date(stringToSign * 1000));
    const now_1h = new Date(now.getTime() + (60 * 1000));
    const keyPair = new KeyPair(brainKey);
    const transactionObj = new PubliqTransaction({
      creation: +now,
      expiry: +now_1h,
      fee: {
        whole: 0,
        fraction: 0
      },
      action: {},
    });
    return keyPair.signMessage(JSON.stringify(transactionObj.toJson()));
  }

  signup(email: string): Observable<any> {
    const url = this.url + '/signup';
    return this.httpHelper.customCall(HttpMethodTypes.put, url, {email});
  }

  signupConfirmation(code: string): Observable<{ stringToSign: number }> {
    const url = this.url + `/signup/confirmation/${code}`;
    return this.httpHelper.customCall(HttpMethodTypes.get, url);

  }

  signupComplete(stringToSign, code, password) {
    const keyPair = new KeyPair();
    const encryptedBrainKey = keyPair.getEncryptedBrainKeyByPassword(password);
    const publicKey = keyPair.PpublicKey;
    const signedString = OauthService.getSignetString(stringToSign, keyPair.BrainKey);

    const url = this.url + `/signup/complete`;

    return this.httpHelper.customCall(HttpMethodTypes.post, url, {
      confirmationCode: code,
      brainKey: encryptedBrainKey,
      publicKey: publicKey,
      signedString: signedString
    });
  }

  signinCheckCode(code: string): Observable<any> {
    const url = this.url + `/signin/check-code/${code}`;
    return this.httpHelper.customCall(HttpMethodTypes.get, url);
  }

  signinAuthenticate(email: string): Observable<any> {
    const url = this.url + `/signin/authenticate/${email}`;
    return this.httpHelper.customCall(HttpMethodTypes.get, url);
  }

  signinGetToken(encryptedBrainKey, stringToSign, code, password) {
    const brainKeyData = KeyPair.decryptBrainKeyByPassword(encryptedBrainKey, password);

    if (!brainKeyData.isValid) {
      return throwError('oauth_decrypt_brain_key');
    }

    const brainKey = brainKeyData.brainKey;
    const keyPair = new KeyPair(brainKey);
    const signedString = OauthService.getSignetString(stringToSign, keyPair.BrainKey);
    const url = this.url + `/signin/get-token`;

    return this.httpHelper.customCall(HttpMethodTypes.post, url, {
      code: code,
      signedString: signedString
    });
  }

  recoverAuthenticate(brainKey: string): Observable<{ stringToSign: any }> {
    const keyPair = new KeyPair(brainKey.trim());
    const publicKey = keyPair.PpublicKey;
    const url = this.url + `/recover/authenticate/${publicKey}`;
    return this.httpHelper.customCall(HttpMethodTypes.get, url);
  }

  recoverComplete(brainKey: string, stringToSign: number, password: string) {
    const keyPair = new KeyPair(brainKey);
    const encryptedBrainKey = keyPair.getEncryptedBrainKeyByPassword(password);
    const publicKey = keyPair.PpublicKey;
    const signedString = OauthService.getSignetString(stringToSign, keyPair.BrainKey);

    const url = this.url + '/recover/complete';

    return this.httpHelper.customCall(HttpMethodTypes.post, url, {
      brainKey: encryptedBrainKey,
      publicKey: publicKey,
      signedString: signedString
    });
  }
}
