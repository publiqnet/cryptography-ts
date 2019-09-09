import { Injectable } from '@angular/core';
import { KeyPair } from 'cryptography-ts';
import PubliqTransaction from 'blockchain-models-ts/bin/models/PubliqTransaction';
import PubliqFile from 'blockchain-models-ts/bin/models/PubliqFile';
import PubliqContentUnit from 'blockchain-models-ts/bin/models/PubliqContentUnit';
import { environment } from '../../../environments/environment';
import PubliqSponsorContentUnit from 'blockchain-models-ts/bin/models/PubliqSponsorContentUnit';
import PubliqCancelSponsorContentUnit from 'blockchain-models-ts/bin/models/PubliqCancelSponsorContentUnit';
import { UtilsService } from 'shared-lib';

KeyPair.setPublicKeyPrefix(environment.coinName);

@Injectable()
export class CryptService {

  constructor() {}

  getSignBoost(fromBrainKey: string, uri: string, amount: number, hours: number) {
    const keyPair = new KeyPair(fromBrainKey);
    const fromPublicKey = keyPair.PpublicKey;

    const now = new Date();
    const now_1h = new Date(now.getTime() + (60 * 60 * 1000));

    const amountData = this.amountStringToWholeFraction(amount);

    const boostObj =  new PubliqSponsorContentUnit( {
      sponsorAddress: fromPublicKey,
      uri: uri,
      startTimePoint: +now,
      hours: hours,
      amount: amountData,
    });

    const transactionObj = new PubliqTransaction({
      creation: +now,
      expiry: +now_1h,
      fee: {
        whole: 0, fraction: 0
      },
      action: boostObj
    });

    return keyPair.signMessage(JSON.stringify(transactionObj.toJson()));
  }

  getSignCancelBoost(fromBrainKey: string, uri: string, transactionHash: string) {
    const keyPair = new KeyPair(fromBrainKey);
    const fromPublicKey = keyPair.PpublicKey;

    const now = new Date();
    const now_1h = new Date(now.getTime() + (60 * 60 * 1000));

    const boostObj =  new PubliqCancelSponsorContentUnit( {
      sponsorAddress: fromPublicKey,
      uri: uri,
      transactionHash: transactionHash
    });

    const transactionObj = new PubliqTransaction({
      creation: +now,
      expiry: +now_1h,
      fee: {
        whole: 0, fraction: 0
      },
      action: boostObj
    });

    return keyPair.signMessage(JSON.stringify(transactionObj.toJson()));
  }

  amountStringToWholeFraction(amountString) {
    const fractionCoif = 100000000;
    const amountArr = ('' + amountString).split('.');
    const whole = amountArr[0] ? +amountArr[0] : 0;
    let fraction = 0;
    if (amountArr[1]) {
      const x = UtilsService.multFloats((+('0.' + amountArr[1])), fractionCoif);
      fraction = parseInt(x + '', 10);
    }

    return {
      whole,
      fraction
    };
  }

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
      creation: Math.floor(now.getTime() / 1000),
      expiry: Math.floor(now_1h.getTime() / 1000),
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
    return keyPair.Private.Base58;
  }
}
