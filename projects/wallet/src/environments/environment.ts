// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {
//   production: false,
//   backend: 'http://192.168.20.115:8004',
//   oauth_backend: 'http://192.168.20.115:8001',
//   explorerAddress: 'https://explorer.publiq.network',
//   blockchain_api_url: 'https://north.publiq.network/publiq/api',
//   auto_logout_time: 300
// };

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

export const environment = {
  production: true,
  backend: 'https://stage-mainnet-wallet-api.publiq.network',
  oauth_backend: 'https://stage-mainnet-oauth.publiq.network',
  explorerAddress: 'https://explorer.publiq.network',
  blockchain_api_url: 'https://north.publiq.network/publiq/api',
  auto_logout_time: 300
};
