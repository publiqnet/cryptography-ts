import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { KeyPair } from 'cryptography-ts';
import PubliqTransaction from 'blockchain-models-ts/bin/models/PubliqTransaction';

@Injectable({
  providedIn: 'root'
})
export class OauthService {

  private url: string;

  constructor(
    private http: HttpClient,
    @Inject('oauthUrl') url: string
  ) {
    if (!url) {
      throw new Error('OauthService: oauthUrl not valid');
    }

    this.url = `${url}/api/user`;
  }

  private getSignetString(stringToSign, brainKey) {
    const now = new Date(new Date(stringToSign * 1000));
    const now_1h = new Date(now.getTime() + (1 * 60 * 1000));
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
    const signedString = keyPair.signMessage(JSON.stringify(transactionObj.toJson()));
    return signedString;
  }

  signup(email: string): Observable<any> {
    const url = this.url + '/signup';
    return this.http.put(url, {email});
  }

  signupConfirmation(code: string): Observable<{ stringToSign: number }> {
    const url = this.url + `/signup/confirmation/${code}`;
    return this.http.get <{ stringToSign: number }>(url);
  }

  signupComplete(stringToSign, code, password) {
    const keyPair = new KeyPair();
    const encryptedBrainKey = keyPair.getEncryptedBrainKeyByPassword(password);
    const publicKey = keyPair.PpublicKey;
    const signedString = this.getSignetString(stringToSign, keyPair.BrainKey);

    const url = this.url + `/signup/complete`;

    return this.http.post(url, {
      confirmationCode: code,
      brainKey: encryptedBrainKey,
      publicKey: publicKey,
      signedString: signedString
    });
  }

  signinCheckCode(code: string): Observable<any> {
    const url = this.url + `/signin/check-code/${code}`;
    return this.http.get(url);
  }

  signinAuthenticate(email: string): Observable<any> {
    const url = this.url + `/signin/authenticate/${email}`;
    return this.http.get(url);
  }

  signinGetToken(encryptedBrainKey, stringToSign, code, password) {
    const brainKeyData = KeyPair.decryptBrainKeyByPassword(encryptedBrainKey, password);

    if (!brainKeyData.isValid) {
      return throwError('oauth_decrypt_brain_key');
    }

    const brainKey = brainKeyData.brainKey;
    const keyPair = new KeyPair(brainKey);
    const signedString = this.getSignetString(stringToSign, keyPair.BrainKey);
    const url = this.url + `/signin/get-token`;

    return this.http.post(url, {
      code: code,
      signedString: signedString
    });
  }

  recoverAuthenticate(brainKey: string): Observable<{ stringToSign: any }> {
    const keyPair = new KeyPair(brainKey.trim());
    const publicKey = keyPair.PpublicKey;
    const url = this.url + `/recover/authenticate/${publicKey}`;
    return this.http.get <{ stringToSign: any }>(url);
  }

  recoverComplete(brainKey: string, stringToSign: number, password: string) {
    const keyPair = new KeyPair(brainKey);
    const encryptedBrainKey = keyPair.getEncryptedBrainKeyByPassword(password);
    const publicKey = keyPair.PpublicKey;
    const signedString = this.getSignetString(stringToSign, keyPair.BrainKey);

    const url = this.url + '/recover/complete';
    return this.http.post(url, {
      brainKey: encryptedBrainKey,
      publicKey: publicKey,
      signedString: signedString
    });
  }
}
