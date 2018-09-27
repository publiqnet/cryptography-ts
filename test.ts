import { KeyPair } from './src/kay-pair';

const bk = "rebill bester concuss junk gushet dignity bisext ethics resever staid iatric bemata rabidly links alogism urlar"
export const keyPair = new KeyPair(bk);


const textJson = {"rtt":6,"creation":"2018-09-25 18:14:09","expiry":"2018-09-25 19:14:09","fee":{"rtt":0,"whole":0,"fraction":0},"action":{"rtt":3,"from":"PBQ6R499bpDZeLnS11yBFv1PbkY4QmyvjNfPmC3JpcD5z5Urdt5rP","to":"PBQ77CSp8YAnhX35MP5aJVs5cegfy2UqKfne4duLpLdYcwoqrumMW","amount":{"rtt":0,"whole":2,"fraction":0}}}

console.log('public key Base58  ====', keyPair.Ppublic.Base58);
console.log('private key Base58 ====', keyPair.Private.Base58);
keyPair.signMessage(JSON.stringify(textJson))
