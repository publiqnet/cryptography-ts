import { Injectable } from '@angular/core';
import { KeyPair } from 'cryptography-ts';
import PubliqTransaction from 'blockchain-models-ts/bin/models/PubliqTransaction';
import PubliqFile from 'blockchain-models-ts/bin/models/PubliqFile';
import PubliqContentUnit from 'blockchain-models-ts/bin/models/PubliqContentUnit';
import { environment } from '../../../environments/environment';

KeyPair.setPublicKeyPrefix(environment.coinName);

@Injectable()
export class CryptService {

  constructor() {}

  getSignedData(brainKey: string, actionObj) {
    const now = new Date();
    const now_1h = new Date(now.getTime() + (60 * 60 * 1000));
    const keyPair = new KeyPair(brainKey);
    const transactionObj = new PubliqTransaction({
      creation: +now,
      expiry: +now_1h,
      fee: {
        whole: 0,
        fraction: 0
      },
      action: actionObj
    });
    return {
      signedJson: JSON.stringify(transactionObj.toJson()),
      signedString: keyPair.signMessage(JSON.stringify(transactionObj.toJson())),
      creation: Math.round(now.getTime() / 1000),
      expiry: Math.round(now_1h.getTime() / 1000),
    };
  }

  getSignetString(stringToSign, brainKey) {
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
      action: {}// transferObj,
    });
    const signedString = keyPair.signMessage(JSON.stringify(transactionObj.toJson()));
    return signedString;
  }


  getSignedFile(brainKey: string, fileUri: string) {
    const keyPair = new KeyPair(brainKey);
    const fileObj = new PubliqFile({
      uri: fileUri,
      authorAddresses: [keyPair.PpublicKey]
    });
    return this.getSignedData(brainKey, fileObj);
  }

  getSignUnit(brainKey: string, contentUri: string, contentId: number, channelAddress: string, fileUris: Array<String>) {
    const keyPair = new KeyPair(brainKey);
    const contentUnitObj = new PubliqContentUnit({
      uri: contentUri,
      contentId: contentId,
      authorAddresses: [keyPair.PpublicKey],
      channelAddress: channelAddress,
      fileUris: fileUris
    });
    return this.getSignedData(brainKey, contentUnitObj);
  }

  checkPassword(brainKeyEncrypted: string, password: string): boolean {
    return KeyPair.decryptBrainKeyByPassword(brainKeyEncrypted, password).isValid;
  }

  getDecryptedBrainKey(brainKeyEncrypted: string, password: string) {
    return KeyPair.decryptBrainKeyByPassword(brainKeyEncrypted, password).brainKey;
  }

  getPrivateKey(brainKey: string): string {
    const keyPair = new KeyPair(brainKey);
    return keyPair.Private.key;
  }
}
