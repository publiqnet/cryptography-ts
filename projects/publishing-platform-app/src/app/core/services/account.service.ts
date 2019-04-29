import { EventEmitter, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../../environments/environment';
import { CryptService } from './crypt.service';
import { Account, AccountOptions } from './models/account';
import { ErrorService } from './error.service';
import { Preference } from './models/preference';
import { AuthorStats, AuthorStatsOptions } from './models/authorStats';
// import { Apis, ChainStore, FetchChain, key, PrivateKey, TransactionBuilder } from 'arcnet-js';
import { HttpRpcService } from './httpRpc.service';
import { Subscriber } from './models/subscriber';

import { UtilsService } from 'shared-lib';
import { HttpHelperService, HttpMethodTypes } from 'helper-lib';


@Injectable()
export class AccountService {

  constructor(private http: HttpClient,
              @Inject(PLATFORM_ID) private platformId: Object,
              private httpRpcService: HttpRpcService,
              private httpHelperService: HttpHelperService,
              private errorService: ErrorService,
              private utilsService: UtilsService,
              private cryptService: CryptService,
              public translateService: TranslateService) {
  }

  public api;

  private accountInfoData: Account = null;
  public userFavouriteTagsKey = 'user_favourite_tags';
  public favouriteAuthorsKey = 'favourite_authors';

  // public oauthUrl = `${environment.oauth_backend}/api/user`;
  public userUrl = `${environment.backend}/api/user`;

  public accountUpdated$: BehaviorSubject<any> = new BehaviorSubject(null);
  public showTagList$: EventEmitter<any> = new EventEmitter();
  public showSearchBar$: EventEmitter<any> = new EventEmitter();
  public settingsSavedCloseDialog: EventEmitter<any> = new EventEmitter();
  private shortName: string;
  public brainKey: string;
  public code = '';
  public publicKey = '';
  public brainKeyEncrypted: string;
  public authors = new Map();
  currentDaemonAddress = '';

  private subscribers: Subscriber[];
  subscribersChanged = new Subject<Subscriber[]>();

  authorAccount: Account;
  authorAccountChanged = new Subject<Account>();

  followAuthor: String;
  followAuthorChanged = new Subject<String>();

  unFollowAuthor: String;
  unFollowAuthorChanged = new Subject<String>();

  confirmCode: any;
  confirmCodeChanged = new Subject<any>();

  registerData: any;
  registerDataChanged = new Subject<any>();

  resForStep2Data: any;
  resForStep2DataChanged = new Subject<any>();

  loginData: any;
  loginDataChanged = new Subject<any>();

  logoutData: any;
  logoutDataChanged = new Subject<any>();

  loginSessionData: any;
  loginSessionDataChanged = new Subject<any>();

  sendRecoverEmailData: any;
  sendRecoverEmailDataChanged = new Subject<any>();

  recoverData: any;
  recoverDataChanged = new Subject<any>();

  updateAccountData: any;
  updateAccountDataChanged = new Subject<any>();

  notifyTransferData: any;
  notifyTransferDataChanged = new Subject<any>();

  subscriptionData: Subscriber[];
  subscriptionDataChanged = new Subject<Subscriber[]>();

  balance = 0;
  balanceChanged = new ReplaySubject<number>();

  authorChannelsData: any;
  authorChannelsDataChanged = new Subject<any>();

  preferencesDataChanged = new Subject<any>();
  preferredArticleDataChanged = new Subject<any>();

  subscriptionPreferencesData: any;
  subscriptionPreferencesDataChanged = new Subject<any>();

  profileUpdating = false;
  profileUpdatingChanged = new Subject<any>();

  signedStringChanged = new Subject<any>();
  authorStatsDataChanged = new Subject<AuthorStats>();
  getAccountDataByTermChanged: Subject<Account[]> = new Subject<Account[]>();
  mySubscribersChanged: Subject<Subscriber[]> = new Subject<Subscriber[]>();
  isSubscribedByAuthorsChanged: Subject<string[]> = new Subject<string[]>();
  tempBrainKey = '';
  public stringToSign: number;

  static isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  getRpcAccount(): Account {
    return this.authorAccount;
  }

  public loadRpcAccount(idOrName: string): void {
    let targetObservable: Observable<any>;
    // if is clientside use websocket call, else use http
    if (isPlatformBrowser(this.platformId)) {
      let command: string;
      let param: any[];
      if (idOrName && idOrName.substr(0, 4) === '1.2.') {
        command = 'get_accounts';
        param = [[idOrName]];
      } else {
        command = 'get_account_by_name';
        param = [idOrName];
      }
      targetObservable = this.httpRpcService
        .call({
          params: [0, command, param]
        });
    } else {
      targetObservable = this.http.post(environment.daemon_https_address, {
        id: 0,
        method: 'call',
        params: [0, 'get_account', [idOrName]]
      });
    }

    //  queue the same callbacks regardless if it is http or websocket
    targetObservable
      .pipe(
        filter(account => account != 'undefined' || account != null),
        map(response => response.result || response),
        map(account => new Account(account)),
        take(1)
      )
      .subscribe(
        account => {
          this.authorAccount = account;
          this.authorAccountChanged.next(account);
        },
        error => this.errorService.handleError('loadRpcAccount', error)
      );

  }

  public getBalance() {
    return this.balance;
  }

  public unsetBalance() {
    this.balance = 0;
    this.balanceChanged.next(0);
  }

  public loadBalance(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.httpRpcService
        .call({
          params: [0, 'get_account_balances', [this.accountInfo.publicKey, ['1.3.0']]]
        })
        .subscribe(
          balance => {
            this.balance = balance[0].amount;
            this.balanceChanged.next(this.balance);
          },
          err =>
            this.errorService.handleError('load_balance_error', {
              status: 409,
              error: {message: 'load_balance_error'}
            })
        );
    }
  }

  auth(): String {
    return isPlatformBrowser(this.platformId)
      ? localStorage.getItem('auth')
      : null;
  }

  sendRecoverEmail(email: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const url: string = this.userUrl + '/check-email';
      this.http.post(url, {email}).subscribe(
        data => {
          this.sendRecoverEmailData = data;
          this.sendRecoverEmailDataChanged.next(data);
        },
        error => this.errorService.handleError('sendRecoverEmail', error, url)
      );
    }
  }

  accountAuthenticate(token: string): Observable<any> {
    const url = this.userUrl + `/authenticate`;
    return this.http.get(url, {headers: new HttpHeaders({'X-OAUTH-TOKEN': token})})
      .pipe(
        map((userInfo: any) => {
          this.SetAccountInfo = userInfo;
          localStorage.setItem('auth', userInfo.token);
          localStorage.setItem('encrypted_brain_key', this.brainKeyEncrypted);
          return userInfo;
        }))
      ;
  }

  getAccountByPublicKey(publicKey: string) {
    const authToken = localStorage.getItem('auth') ? localStorage.getItem('auth') : '';
    const url = this.userUrl + `/author-stats/${publicKey}`;

    this.http.get(url, {headers: new HttpHeaders({'X-API-TOKEN': authToken})})
      .pipe(
        filter(account => account != 'undefined' || account != null),
        // map(response => response.result || response),
        // map(account => new Account(account)),
        take(1)
      )
      .subscribe(
        account => {
          // this.authorAccount = account;
          // this.authorAccountChanged.next(account);
        },
        error => this.errorService.handleError('loadRpcAccount', error)
      );
  }

  private set SetAccountInfo(userInfo) {
    if (userInfo != null) {
      const data = (this.accountInfoData) ? this.accountInfoData : {};

      const accountCurrentInfo = {
        ...data,
        ...userInfo,
        token: (userInfo.hasOwnProperty('token')) ? userInfo.token : localStorage.getItem('auth')
      };

      this.accountInfoData = new Account(accountCurrentInfo);
    } else {
      this.accountInfoData = null;
    }

    // if (this.accountInfo.language) {
    //   localStorage.setItem('lang', this.accountInfo.language);
    //   this.translateService.use(this.accountInfo.language);
    // } else {
    //   this.changeLang('en');
    // }

    this.accountUpdated$.next(this.accountInfo);
  }

  public get accountInfo(): Account {
    return this.accountInfoData;
  }

  // setAccountInfo(userInfo) {
  //
  //   const data = (this.accountInfo) ? this.accountInfo : {};
  //
  //   this.accountInfo = {
  //     ...data,
  //     ...userInfo,
  //     balance: this.utilsService.calculateBalance(userInfo.whole, userInfo.fraction)
  //   };
  //
  //   this.accountInfo.token = (userInfo.hasOwnProperty('token')) ? userInfo.token : localStorage.getItem('auth');
  //
  //   this.accountInfo = new Account(this.accountInfo);
  //
  //   // this.loadBalance();
  //   // if (this.accountInfo.language) {
  //   //   localStorage.setItem('lang', this.accountInfo.language);
  //   //   this.translateService.use(this.accountInfo.language);
  //   // } else {
  //   //   this.changeLang('en');
  //   // }
  //
  //   this.accountUpdated$.next(this.accountInfo);
  //   return userInfo;
  // }

  getAuthenticateData() {
    return this.resForStep2Data ? this.resForStep2Data : '';
  }

  loginSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // if accountData is present, do not login again
    if (this.accountInfo) {
      return;
    }
    const authToken = localStorage.getItem('auth');
    if (!authToken) {
      this.errorService.handleError('loginSession', {
        status: 409,
        error: {message: 'invalid_session_id'}
      });
    }
    const url = this.userUrl;
    this.http
      .get(url, {headers: new HttpHeaders({'X-API-TOKEN': authToken})})
      .pipe(
        map((userInfo: any) => {
          this.SetAccountInfo = userInfo;
          this.brainKeyEncrypted = localStorage.getItem('encrypted_brain_key');
          return userInfo;
        })
      )
      .subscribe(
        data => {
          this.loginSessionData = data;
          this.loginSessionDataChanged.next(this.loginSessionData);
        },
        error => this.errorService.handleError('loginSession', error, url)
      );

  }

  loadAuthorSubscribers(accountName: string) {
    if (isPlatformBrowser(this.platformId)) {
      const url = this.userUrl + `/author-subscribers/${accountName}`;
      this.http.get(url)
        .pipe(
          filter(data => data != null),
          map((result: any[]) => result.length ? result.map(data => new Subscriber(data['subscriber'])) : [])
        )
        .subscribe((res: Subscriber[]) => {
            this.subscribers = res;
            this.subscribersChanged.next(this.subscribers);
          },
          error => this.errorService.handleError('loadAuthorSubscribers', error, url)
        );
    }
  }

  getSubscribers() {
    if (!this.subscribers || !this.subscribers.length) {
      return;
    }
    return this.subscribers.slice();
  }

  getSubscription(): void {
    if (
      (isPlatformBrowser(this.platformId) &&
        localStorage.getItem('auth') != null) ||
      ''
    ) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('invalid_session_id', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }
      const url = this.userUrl + '/subscription';
      this.http
        .get(url, {headers: new HttpHeaders({'X-API-TOKEN': authToken})})
        .pipe(
          filter(data => data != null),
          map((result: any) => {
            const subscriptions = [];
            result.map(obj => {
              if (obj['user']) {
                subscriptions.push(new Subscriber(obj['user']));
              }
              // if (obj['publication']) {
              //     obj['publication'] = new Publication(obj['publication']);
              // }
            });
            return subscriptions;
          })
        )
        .subscribe((res: any) => {
            this.subscriptionData = res;
            this.subscriptionDataChanged.next(this.subscriptionData);
          },
          error => this.errorService.handleError('getSubscription', error, url)
        );
    }
  }

  getSubscriptionAndPreferences(): void {
    if ((isPlatformBrowser(this.platformId) && localStorage.getItem('auth') != null) || '') {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('invalid_session_id', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }
      const url = this.userUrl + '/subscription-preferences';
      this.http
        .get(url, {headers: new HttpHeaders({'X-API-TOKEN': authToken})})
        .pipe(map(result => {
          // @ts-ignore
          return new Preference(result);
        }))
        .subscribe(
          (res: Preference) => {
            this.resetFavouriteAuthorsAndTags(res);
            this.subscriptionPreferencesData = res;
            this.subscriptionPreferencesDataChanged.next(this.subscriptionPreferencesData);
          },
          error => this.errorService.handleError('getSubscriptionAndPreferences', error, url)
        );
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.accountInfo.token;
      this.SetAccountInfo = null;
      localStorage.removeItem('auth');
      localStorage.removeItem('encrypted_brain_key');
      this.brainKey = '';

      localStorage.removeItem('for_adult');
      localStorage.setItem('lang', 'en');
      localStorage.removeItem(this.userFavouriteTagsKey);
      // this.publicKey = '';

      this.accountUpdated$.next(null);
      // this.unsetBalance();
      // this.logoutData = null;
      this.logoutDataChanged.next(null);

      // this.http
      //   .post(this.userUrl + '/signout', '', {
      //     headers: new HttpHeaders({'X-API-TOKEN': token})
      //   })
      //   .subscribe(
      //     () => {
      //     },
      //     error => this.errorService.handleError('logout', error)
      //   );
    }
  }

  loggedIn() {
    return this.accountInfo != null;
  }

  getAccount() {
    this.setShortName();
    return this.accountInfo;
  }

  initExternalWsService(daemonAddress = environment.daemon_address_first) {
    // if (!Apis.inst || !this.api) {
    //     this.currentDaemonAddress = daemonAddress;
    //     try {
    //         this.api = Apis.instance(daemonAddress, true).init_promise
    //             .then(res => {
    //                 // success
    //             }, error => {
    //                 // error
    //             });
    //     } catch (error) {
    //         console.log('WalletService init_promise error - ', error);
    //         return;
    //     }
    // }
  }

  destroyExternalWsService() {
    // Apis.close();
    this.api = '';
  }

  updateAccountEnd(newData) {
    const url = this.userUrl + '/update-account-step2';
    const authToken = localStorage.getItem('auth');
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    this.http.post(url, {first_name: newData.first_name, last_name: newData.last_name}, header)
      .pipe(
        map(updatedAccount => {
          this.SetAccountInfo = updatedAccount;
          // this.accountInfo.meta = JSON.parse(this.accountInfo.meta);
          this.accountUpdated$.next(this.accountInfo);
          this.loadBalance();

          return updatedAccount;
        })
      )
      .subscribe(
        (data: any) => {
          this.profileUpdating = false;
          this.profileUpdatingChanged.next(this.profileUpdating);

          this.updateAccountData = data;
          this.updateAccountDataChanged.next(this.updateAccountData);
        },
        error => {
          this.profileUpdating = false;
          this.profileUpdatingChanged.next(this.profileUpdating);
          return this.errorService.handleError('updateAccountEnd', error, url);
        }
      );
  }

  public blockchainUpdateAccount(data, password, newData) {
    const meta = data.result;
    if (isPlatformBrowser(this.platformId)) {
      this.initExternalWsService();

      try {
        // CryptService.brainKeyDecrypt(
        //     this.brainKeyEncrypted,
        //     password
        // ).subscribe(
        //     brainKey => {
        //         this.accountInfo.pKey = key.get_brainPrivateKey(brainKey).toWif();
        //
        //         // check private key
        //         if (!this.accountInfo.pKey) {
        //             this.errorService.handleError('need_private_key', {
        //                 status: 409,
        //                 error: {message: 'need_private_key'}
        //             });
        //             this.profileUpdating = false;
        //             this.profileUpdatingChanged.next(this.profileUpdating);
        //             return;
        //         }
        //
        //         const pKey = PrivateKey.fromWif(this.accountInfo.pKey);
        //
        //         this.api
        //             .then(apiRes => {
        //                 ChainStore.init()
        //                     .then(() => {
        //                         const CoinName = 'PBQ';
        //                         const sendAmount = {amount: 0, asset: CoinName};
        //                         Promise.all([
        //                             FetchChain('getAccount', this.accountInfo),
        //                             FetchChain('getAsset', sendAmount.asset)
        //                         ])
        //                             .then(res => {
        //                                 const [
        //                                     fAccount,
        //                                     feeAsset
        //                                 ] = res;
        //                                 if (!fAccount) {
        //                                     this.errorService.handleError(
        //                                         'not_found_author_account',
        //                                         {
        //                                             status: 409,
        //                                             error: {message: 'not_found_author_account'}
        //                                         }
        //                                     );
        //                                     this.profileUpdating = false;
        //                                     this.profileUpdatingChanged.next(this.profileUpdating);
        //                                     return;
        //                                 }
        //
        //                                 const tr = new TransactionBuilder();
        //                                 tr.add_type_operation('account_update', {
        //                                     fee: {
        //                                         amount: 0,
        //                                         asset_id: feeAsset.get('id')
        //                                     },
        //                                     account: fAccount.get('id'),
        //                                     meta: meta
        //                                 });
        //                                 tr.set_required_fees().then(() => {
        //                                     tr.add_signer(
        //                                         pKey,
        //                                         pKey.toPublicKey().toPublicKeyString()
        //                                     );
        //
        //                                     tr.broadcast((data) => {
        //                                         this.updateAccountEnd(newData);
        //                                     });
        //                                 });
        //                             })
        //                             .catch(reason => {
        //                                 this.errorService.handleError('account_update_failed', {
        //                                     status: 409,
        //                                     error: {message: 'account_update_failed'}
        //                                 });
        //                                 this.profileUpdating = false;
        //                                 this.profileUpdatingChanged.next(this.profileUpdating);
        //                                 return;
        //                             });
        //                     })
        //                     .catch(reason => {
        //                         this.destroyExternalWsService();
        //                         if (environment.daemon_address_second != this.currentDaemonAddress) {
        //                             this.initExternalWsService(environment.daemon_address_second);
        //                             this.blockchainUpdateAccount(data, password, newData);
        //                         } else {
        //                             this.errorService.handleError('account_update_failed', {
        //                                 status: 409,
        //                                 error: {message: 'account_update_failed'}
        //                             });
        //                             this.profileUpdating = false;
        //                             this.profileUpdatingChanged.next(this.profileUpdating);
        //                             return;
        //                         }
        //                     });
        //             })
        //             .catch(reason => {
        //                 this.errorService.handleError('account_update_failed', {
        //                     status: 409,
        //                     error: {message: 'account_update_failed'}
        //                 });
        //                 this.profileUpdating = false;
        //                 this.profileUpdatingChanged.next(this.profileUpdating);
        //                 return;
        //             });
        //     },
        //     err => {
        //         this.errorService.handleError('blockchainUpdateAccount', {
        //             status: 409,
        //             error: {message: 'blockchainUpdateAccount'}
        //         });
        //         this.profileUpdating = false;
        //         this.profileUpdatingChanged.next(this.profileUpdating);
        //     }
        // );
      } catch (err) {

        this.errorService.handleError('account_update_failed', {
          status: 409,
          error: {message: 'account_update_failed'}
        });
        this.profileUpdating = false;
        this.profileUpdatingChanged.next(this.profileUpdating);
        return;
      }
    }
  }

  public updateAccount(updateData): Observable<any>  {
    const url = this.userUrl;
    return this.httpHelperService.call(HttpMethodTypes.post, url, updateData)
      .pipe(
        map((userInfo: any) => {
          this.SetAccountInfo = userInfo;
          return userInfo;
        })
      );
  }

  public updateAccountOld(newData, password): void {
    if (isPlatformBrowser(this.platformId)) {
      this.profileUpdating = true;
      this.profileUpdatingChanged.next(this.profileUpdating);
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('loginSession', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
        this.profileUpdating = false;
        this.profileUpdatingChanged.next(this.profileUpdating);
      }
      const url = this.userUrl + '/update-account-step1';
      this.http
        .post(url, newData, {
          headers: new HttpHeaders({'X-API-TOKEN': authToken})
        })
        .subscribe(
          (data) => {
            this.blockchainUpdateAccount(data, password, newData);
          },
          error => this.errorService.handleError('updateAccount', error, url)
        );
    }
  }

  public uploadPhoto(file: File): Observable<any> {
    const authToken = localStorage.getItem('auth');
    if (!authToken) {
      this.errorService.handleError('loginSession', {
        status: 409,
        error: {message: 'invalid_session_id'}
      });
      return;
    }
    const formData = new FormData();
    formData.append('image', file, file.name);
    return this.http.post(this.userUrl + '/image', formData, {
      headers: new HttpHeaders({'X-API-TOKEN': authToken})
    });
  }

  public setShortName() {
    if (
      this.accountInfo &&
      this.accountInfo.firstName &&
      this.accountInfo.lastName
    ) {
      this.shortName = this.accountInfo.shortName = (
        this.accountInfo.firstName.charAt(0) +
        this.accountInfo.lastName.charAt(0)
      ).toUpperCase();
    }
  }

  public follow(username: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('loginSession', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }

      const url = this.userUrl + '/subscription';
      this.http
        .put(
          url,
          {username: username},
          {headers: new HttpHeaders({'X-API-TOKEN': authToken})}
        )
        .subscribe(
          res => {
            this.followAuthor = 'OK';
            this.followAuthorChanged.next(this.followAuthor);
          },
          error => this.errorService.handleError('follow', error, url)
        );
    }
  }

  public unfollow(username: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('loginSession', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }
      const url = this.userUrl + `/subscription/${username}`;
      this.http
        .delete(url, {
          headers: new HttpHeaders({'X-API-TOKEN': authToken})
        })
        .subscribe(
          res => {
            this.unFollowAuthor = 'OK';
            this.unFollowAuthorChanged.next(this.unFollowAuthor);
          },
          error => this.errorService.handleError('unfollow', error, url)
        );
    }
  }

  public notifyInTransfer(publicKey): void {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('loginSession', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }

      const url = this.userUrl + '/notify-transfer';
      this.http
        .post(
          url,
          {account: publicKey},
          {headers: new HttpHeaders({'X-API-TOKEN': authToken})}
        )
        .subscribe(
          result => {
            this.notifyTransferData = result;
            this.notifyTransferDataChanged.next(this.notifyTransferData);
          },
          error => this.errorService.handleError('notifyInTransfer', error, url)
        );
    }
  }

  resetAuthorData(idOrName: string) {
    if (this.authors.has(idOrName)) {
      this.authors.delete(idOrName);
    }
  }

  public loadChannels() {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('loginSession', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }

      const url = this.userUrl + `/channels`;
      this.http
        .get(url, {headers: new HttpHeaders({'X-API-TOKEN': authToken})})
        .subscribe(
          data => {
            this.authorChannelsData = data;
            this.authorChannelsDataChanged.next(this.authorChannelsData);
          },
          error => this.errorService.handleError('getChannelsError', error, url)
        );
    }
  }

  public changeLang(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
      if (this.accountInfo && this.accountInfo['language'] != lang) {
        const authToken = localStorage.getItem('auth');
        if (!authToken) {
          this.errorService.handleError('loginSession', {
            status: 409,
            error: {message: 'invalid_session_id'}
          });
          return;
        }
        const url = this.userUrl + `/set-language/${lang}`;
        this.http
          .post(url, '', {
            headers: new HttpHeaders({'X-API-TOKEN': authToken})
          })
          .subscribe(
            () => {
              this.accountInfo['language'] = lang;
              this.accountUpdated$.next(this.accountInfo);
            },
            error => this.errorService.handleError('changeLang', error, url)
          );
      }
    }
  }

  public getPreferences(): void {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('loginSession', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
        return;
      }
      const url = this.userUrl + '/preferences';
      this.http
        .get(url, {headers: new HttpHeaders({'X-API-TOKEN': authToken})})
        .pipe(map(result => {
          if (result) {
            // @ts-ignore
            return new Preference(result);
          }
        }))
        .subscribe((data: Preference) => {
            this.preferencesDataChanged.next(data);
          },
          error => this.errorService.handleError('getPreferences', error, url));
    }
  }

  public updatePreferredArticle(articleId): void {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('loginSession', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
        return;
      }
      const url = this.userUrl + `/preferred-article/${articleId}`;
      this.http
        .post(url, '', {headers: new HttpHeaders({'X-API-TOKEN': authToken})})
        .subscribe((data) => {
            this.preferredArticleDataChanged.next(data);
          },
          error => this.errorService.handleError('updatePreferredArticle', error, url));
    }
  }

  public resetFavouriteAuthorsAndTags(data) {
    if (data) {
      interface Map {
        [K: string]: number;
      }

      const updatedFavouriteTags: Map = {};
      const updatedFavouriteAuthors: Map = {};

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          data[key].forEach((item) => {
            if (item && item.hasOwnProperty('tag') && item['tag']) {
              updatedFavouriteTags[item['tag']] = item['count'] || 1;
            } else if (item && item.hasOwnProperty('author')) {
              updatedFavouriteAuthors[item['author']['username']] = item['count'] || 1;
            }
          });
          let storageKey;
          let favoritObject: Map = {};
          if (key === 'tags') {
            storageKey = this.userFavouriteTagsKey;
            favoritObject = updatedFavouriteTags;
          } else if (key === 'authors') {
            storageKey = this.favouriteAuthorsKey;
            favoritObject = updatedFavouriteAuthors;
          }

          if (Object.keys(favoritObject).length) {
            localStorage.setItem(storageKey, JSON.stringify(favoritObject));
          }
        }
      }
    }
  }

  public loadAuthorStats(authorId: string) {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth') ? localStorage.getItem('auth') : '';
      const url = this.userUrl + `/author-stats/${authorId}`;
      this.http.get(url, {headers: new HttpHeaders({'X-API-TOKEN': authToken})})
        .pipe(
          filter(data => data != null),
          map((data: AuthorStatsOptions) => new AuthorStats(data))
        )
        .subscribe((data: AuthorStats) => {
            this.authorStatsDataChanged.next(data);
          },
          error => this.errorService.handleError('loadAuthorStats', error, url));
    }
  }

  public getAccountByTerm(term, itemId, count, order = '-created') {
    if (isPlatformBrowser(this.platformId)) {
      this.httpRpcService
        .call({
          params: [
            0,
            'search_accounts',
            [term, order, itemId, count]
          ]
        })
        .pipe(
          filter(result => result != null),
          map((data: any[]) => {
            return data.map(obj => new Account(obj));
          })
        )
        .subscribe((data: Account[]) => {
            this.getAccountDataByTermChanged.next(data);
          },
          error => this.errorService.handleError('getAccountByTerm', error)
        );
    }
  }

  public searchAccount(term: string, itemId: string = '0.0.0', count: number = 10, order = '-created') {
    if (isPlatformBrowser(this.platformId)) {
      return this.httpRpcService
        .call({
          params: [
            0,
            'search_accounts',
            [term, order, itemId, count]
          ]
        })
        .pipe(
          filter(result => result != null),
          map(data => data.map(obj => new Account(obj)))
        );
    }
  }

  public getMySubscribers() {
    if (isPlatformBrowser(this.platformId)) {
      const url = this.userUrl + `/subscribers`;
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('loginSession', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
        return;
      }
      this.http.get(url, {headers: new HttpHeaders({'X-API-TOKEN': authToken})})
        .pipe(
          filter(data => data != null),
          map((result: any[]) => result.length ? result.map(data => new Subscriber(data['subscriber'])) : [])
        )
        .subscribe((mySubscribers: Subscriber[]) => {
            this.mySubscribersChanged.next(mySubscribers);
          },
          error => this.errorService.handleError('loadAuthorSubscribers', error, url)
        );
    }
  }

  public getIsSubscribedByAuthors(authorsList: string[]): void {
    if (isPlatformBrowser(this.platformId)) {
      const url = this.userUrl + `/is-subscribed`;
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('loginSession', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
        return;
      }
      this.http.post(url, {authors: authorsList}, {headers: new HttpHeaders({'X-API-TOKEN': authToken})})
        .pipe(
          filter(data => data != null)
        )
        .subscribe((subscriptions: string[]) => {
            this.isSubscribedByAuthorsChanged.next(subscriptions);
          },
          error => this.errorService.handleError('getIsSubscribedByAuthors', error, url)
        );
    }
  }

  checkPassword(password: string): boolean {
    return this.cryptService.checkPassword(this.brainKeyEncrypted, password);
  }

  searchAccountByTerm: (term: string) => Observable<Account[]> = (term: string) => {
    return this.httpHelperService.call(HttpMethodTypes.get, this.userUrl + `/search/${term}`)
      .pipe(map((accounts: AccountOptions[]) => accounts.map(account => new Account(account))));
  }
}
