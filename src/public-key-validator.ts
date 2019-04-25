import { decode } from 'bs58';
import { BaseKey } from './base-key';


export const validate = (keyTypePrefix, publicKey) => {
  if(!publicKey.startsWith(keyTypePrefix)){
    return false;
  }

  const base58PublicKey = publicKey.slice(keyTypePrefix.length);
  const bytesPublicKey = decode(base58PublicKey);
  const hexPublicKey = bytesPublicKey.toString('hex');

  if(hexPublicKey.length !== 74){
    return false;
  }

  const publicKeyPrefix = hexPublicKey.slice(0, 2);

  if(!(publicKeyPrefix === '02' || publicKeyPrefix === '03')){
    return false;
  }

  const publicKeyCor = hexPublicKey.slice(2, hexPublicKey.length - 8);
  const publicKeySuffix = hexPublicKey.slice(hexPublicKey.length - 8);

  if(BaseKey.toRIPEMD(`${publicKeyPrefix}${publicKeyCor}`).slice(0, 8) !== publicKeySuffix) {
    return false;
  }

  return true;

}
