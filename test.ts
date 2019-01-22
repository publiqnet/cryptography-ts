import { KeyPair } from './src/kay-pair';

const bk = "rebill bester concuss junk gushet dignity bisext ethics resever staid iatric bemata rabidly links alogism urlar"
export const keyPair = new KeyPair(bk);


const textJson = {"rtt":2,"creation":"2018-10-23 09:28:20","expiry":"2018-10-23 09:28:20","fee":{"rtt":0,"whole":0,"fraction":100},"action":{}}//{"rtt":23,"private_key":"5JaR5GUf5vsL1QLJXiLN9W4FgjP14HxUYKqKU5gmLbQPN3LDj8R","package":{"rtt":22,"master_key":"ARMEN","index":0,"public_key":"PBQ76Zv5QceNSLibecnMGEKbKo3dVFV6HRuDSuX59mJewJxHPhLwu","private_key":"5Kfu9216aabe2L942As4mGm91MC5RJKHP9tLWr5MMwcgVcRjFuz"}}
//
// fetch('http://example.com/movies.json')
//     .then(function(response) {
//         return response.json();
//     })
//     .then(function(myJson) {
//         console.log(JSON.stringify(myJson));
//     });


console.log('public key Base58  ====', keyPair.Ppublic.Base58);
console.log('private key Base58 ====', keyPair.Private.Base58);
keyPair.signMessage(JSON.stringify(textJson));
