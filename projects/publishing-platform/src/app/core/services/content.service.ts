import { EventEmitter, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { forkJoin, Observable, of, Subject } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { AccountService } from './account.service';
import { environment } from '../../../environments/environment';
import { Feedback } from './models/feedback';
import { ErrorService } from './error.service';
import { ChannelService } from './channel.service';
import { Account } from './models/account';
import { CryptService } from './crypt.service';
import { WalletService } from './wallet.service';

// import {
//   Aes,
//   Apis,
//   ChainStore,
//   FetchChain, key,
//   PrivateKey,
//   TransactionBuilder,
//   TransactionHelper
// } from 'arcnet-js';

export enum OrderOptions {
  author_desc = <any>'+author',
  rating_desc = <any>'+rating',
  view_desc = <any>'+view',
  numrating_desc = <any>'+numrating',
  created_desc = <any>'+created',
  published_desc = <any>'+published',
  author_asc = <any>'-author',
  rating_asc = <any>'-rating',
  view_asc = <any>'-view',
  numrating_asc = <any>'-numrating',
  created_asc = <any>'-created',
  published_asc = <any>'-published',
  default = <any>''
}

export const CoinName = 'PBQ';
export const CoinPrecision = 8;
export const asset_id = '1.3.0';

@Injectable()
export class ContentService {

  contentUrl = environment.backend + '/api/v1/content';
  feedbackUrl = environment.backend + '/api/v1/feedback';

  private feedback: Feedback;
  feedbackChanged = new Subject<Feedback>();

  private feedbackReportData: String = '';
  feedbackReportDataChanged = new Subject<String>();

  private feedbackLikeData: String = '';
  feedbackLikeDataChanged = new Subject<String>();

  private uploadMainPhotoData;
  uploadMainPhotoDataChanged = new Subject<any>();

  private uploadCroppedMainPhotoData;
  uploadCroppedMainPhotoDataChanged = new Subject<any>();

  private uploadListPhotoData;
  uploadListPhotoDataChanged = new Subject<any>();

  private submittedContentData;
  submittedContentChanged = new Subject<any>();

  private destroyContentData;
  destroyContentDataChanged = new Subject<any>();


  private articleUpLoading = false;
  articleUpLoadingChanged = new Subject<boolean>();

  private api;

  account = new Subject<Account>();

  public hideFooter$: EventEmitter<any> = new EventEmitter();

  public pendingProcess = new Subject();

  static generateTags(metaTags) {
    let result;
    if (typeof metaTags === 'string') {
      result = [{display: metaTags, value: metaTags}];
    } else if (Array.isArray(metaTags)) {
      result = metaTags.map(tag => {
        return {display: tag, value: tag};
      });
    } else if (typeof metaTags === 'undefined') {
      result = [];
    }
    return result;
  }

  constructor(
    private accountService: AccountService,
    private errorService: ErrorService,
    private http: HttpClient,
    private walletService: WalletService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private channelService: ChannelService
  ) {
  }

  cancelArticleBoosting(password: string, id: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.walletService.initExternalWsService();

      try {
        CryptService.brainKeyDecrypt(
          this.accountService.brainKeyEncrypted,
          password
        ).subscribe(
          // brainKey => {
          //   this.accountService.accountInfo.pKey = key.get_brainPrivateKey(brainKey).toWif();
          //
          //   if (!this.accountService.accountInfo.pKey) {
          //     this.errorService.handleError('need_private_key', {
          //       status: 409,
          //       error: {message: 'need_private_key'}
          //     });
          //     return;
          //   }
          //
          //   // const pKey = PrivateKey.fromWif(this.accountService.accountInfo.pKey);
          //
          //   // this.walletService.api
          //   //   .then(apiRes => {
          //   //     ChainStore.init()
          //   //       .then(() => {
          //   //         const boostData = {amount: 0, asset: CoinName};
          //   //         Promise.all([
          //   //           FetchChain('getAccount', this.accountService.accountInfo),
          //   //           FetchChain('getAsset', boostData.asset)
          //   //         ])
          //   //           .then(res => {
          //   //             const [
          //   //               sponsorAccount,
          //   //               pbqAsset
          //   //             ] = res;
          //   //
          //   //             const tr = new TransactionBuilder();
          //   //             // end_date
          //   //             tr.add_type_operation('cancel_promotion', {
          //   //               sponsor: sponsorAccount.get('id'),
          //   //               fee: {
          //   //                 amount: 0,
          //   //                 asset_id: pbqAsset.get('id')
          //   //               },
          //   //               id: id
          //   //             });
          //   //             tr.set_required_fees().then(() => {
          //   //               tr.add_signer(
          //   //                 pKey,
          //   //                 pKey.toPublicKey().toPublicKeyString()
          //   //               );
          //   //               tr.broadcast((data) => {
          //   //                 this.accountService.loadBalance();
          //   //                 this.pendingProcess.next(false);
          //   //                 // this.submittedContentChanged.next(this.submittedContentData);
          //   //                 // this.articleUpLoading = false;
          //   //               });
          //   //             });
          //   //           })
          //   //           .catch(reason => {
          //   //             this.errorService.handleError('transfer_failed', {
          //   //               status: 409,
          //   //               error: {message: 'transfer_failed'}
          //   //             });
          //   //             this.articleUpLoading = false;
          //   //             this.articleUpLoadingChanged.next(this.articleUpLoading);
          //   //             this.pendingProcess.next(false);
          //   //             return;
          //   //           });
          //   //       })
          //   //       .catch(reason => {
          //   //         this.walletService.destroyExternalWsService();
          //   //         if (environment.daemon_address_second != this.walletService.currentDaemonAddress) {
          //   //             this.walletService.initExternalWsService(environment.daemon_address_second);
          //   //             this.cancelArticleBoosting(password, id);
          //   //         } else {
          //   //             this.errorService.handleError('transfer_failed', {
          //   //                 status: 409,
          //   //                 error: {message: 'transfer_failed'}
          //   //             });
          //   //             this.articleUpLoading = false;
          //   //             this.articleUpLoadingChanged.next(this.articleUpLoading);
          //   //             this.pendingProcess.next(false);
          //   //             return;
          //   //         }
          //   //       });
          //   //   })
          //   //   .catch(reason => {
          //   //     this.errorService.handleError('transfer_failed', {
          //   //       status: 409,
          //   //       error: {message: 'transfer_failed'}
          //   //     });
          //   //     this.articleUpLoading = false;
          //   //     this.articleUpLoadingChanged.next(this.articleUpLoading);
          //   //     this.pendingProcess.next(false);
          //   //     return;
          //   //   });
          // },
          // err => {
          //   this.errorService.handleError('transfer-password-error', {
          //     status: 409,
          //     error: {message: 'password_error'}
          //   });
          //   this.articleUpLoading = false;
          //   this.pendingProcess.next(false);
          //   this.articleUpLoadingChanged.next(this.articleUpLoading);
          // }
        );
      } catch (MalformedURLException) {
        console.log('MalformedURLException');
        this.errorService.handleError('transfer_failed', {
          status: 409,
          error: {message: 'transfer_failed'}
        });
        this.articleUpLoading = false;
        this.pendingProcess.next(false);
        this.articleUpLoadingChanged.next(this.articleUpLoading);
        return;
      }
    }
  }


  articleBoost(
    password: string,
    dsId: string,
    boostData: any
  ): void {
    if (isPlatformBrowser(this.platformId)) {
      this.walletService.initExternalWsService();

      try {
        // CryptService.brainKeyDecrypt(
        //   this.accountService.brainKeyEncrypted,
        //   password
        // ).subscribe(
        //   brainKey => {
        //     this.accountService.accountInfo.pKey = key.get_brainPrivateKey(brainKey).toWif();
        //
        //     // check private key
        //     if (!this.accountService.accountInfo.pKey) {
        //       this.errorService.handleError('need_private_key', {
        //         status: 409,
        //         error: {message: 'need_private_key'}
        //       });
        //       // this.articleUpLoading = false;
        //       // this.articleUpLoadingChanged.next(this.articleUpLoading);
        //       return;
        //     }
        //
        //     const pKey = PrivateKey.fromWif(this.accountService.accountInfo.pKey);
        //
        //     this.walletService.api
        //       .then(apiRes => {
        //         ChainStore.init()
        //           .then(() => {
        //             const boostDataBudget = {amount: 0, asset: CoinName};
        //
        //             Promise.all([
        //               FetchChain('getAccount',  this.accountService.accountInfo.promoAccount),
        //               FetchChain('getAccount', this.accountService.accountInfo),
        //               FetchChain('getAsset', boostDataBudget.asset)
        //             ])
        //               .then(res => {
        //                 const [
        //                   promoAgentAccount,
        //                   sponserAccount,
        //                   pbqAsset
        //                 ] = res;
        //
        //                 if (!promoAgentAccount) {
        //                   this.errorService.handleError(
        //                     'not_found_author_account',
        //                     {
        //                       status: 409,
        //                       error: {message: 'not_found_author_account'}
        //                     }
        //                   );
        //                   // this.articleUpLoading = false;
        //                   // this.articleUpLoadingChanged.next(this.articleUpLoading);
        //                   return;
        //                 }
        //
        //                 const tr = new TransactionBuilder();
        //                 // end_date
        //                 tr.add_type_operation('promote_content', {
        //                   sponsor: sponserAccount.get('id'),
        //                   promo_agent: promoAgentAccount.get('id'),
        //                   ds_id: dsId,
        //                   fee: {
        //                     amount: 0,
        //                     asset_id: pbqAsset.get('id')
        //                   },
        //                   budget: {
        //                     amount: boostData.boostMoney,
        //                     asset_id: pbqAsset.get('id')
        //                   },
        //                   start_date: boostData.boostStartDate,
        //                   end_date: boostData.boostEndDate
        //                 });
        //                 tr.set_required_fees().then(() => {
        //                   tr.add_signer(
        //                     pKey,
        //                     pKey.toPublicKey().toPublicKeyString()
        //                   );
        //                   tr.broadcast((data) => {
        //                     this.accountService.loadBalance();
        //                     this.submittedContentChanged.next(this.submittedContentData);
        //                     this.articleUpLoading = false;
        //                     this.pendingProcess.next(false);
        //                   });
        //                 });
        //               })
        //               .catch(reason => {
        //                 this.errorService.handleError('transfer_failed', {
        //                   status: 409,
        //                   error: {message: 'transfer_failed'}
        //                 });
        //                 this.articleUpLoading = false;
        //                 this.articleUpLoadingChanged.next(this.articleUpLoading);
        //                 return;
        //               });
        //           })
        //           .catch(reason => {
        //             this.walletService.destroyExternalWsService();
        //             if (environment.daemon_address_second != this.walletService.currentDaemonAddress) {
        //               this.walletService.initExternalWsService(environment.daemon_address_second);
        //               this.articleBoost(password, dsId, boostData);
        //             } else {
        //                 this.errorService.handleError('transfer_failed', {
        //                     status: 409,
        //                     error: {message: 'transfer_failed'}
        //                 });
        //                 this.articleUpLoading = false;
        //                 this.articleUpLoadingChanged.next(this.articleUpLoading);
        //                 return;
        //             }
        //           });
        //       })
        //       .catch(reason => {
        //         this.errorService.handleError('transfer_failed', {
        //           status: 409,
        //           error: {message: 'transfer_failed'}
        //         });
        //         this.articleUpLoading = false;
        //         this.articleUpLoadingChanged.next(this.articleUpLoading);
        //         return;
        //       });
        //   },
        //   err => {
        //     this.errorService.handleError('transfer-password-error', {
        //       status: 409,
        //       error: {message: 'password_error'}
        //     });
        //     this.articleUpLoading = false;
        //     this.articleUpLoadingChanged.next(this.articleUpLoading);
        //   }
        // );
      } catch (MalformedURLException) {
        console.log('MalformedURLException');
        this.errorService.handleError('transfer_failed', {
          status: 409,
          error: {message: 'transfer_failed'}
        });
        this.articleUpLoading = false;
        this.articleUpLoadingChanged.next(this.articleUpLoading);
        return;
      }
    }
  }

  articleSubmit(
    password: string,
    meta: string,
    dsId: string,
    boostInfo?
  ): void {
    if (isPlatformBrowser(this.platformId)) {
      this.walletService.initExternalWsService();

      try {
        // CryptService.brainKeyDecrypt(
        //   this.accountService.brainKeyEncrypted,
        //   password
        // ).subscribe(
        //   brainKey => {
        //     this.accountService.accountInfo.pKey = key.get_brainPrivateKey(brainKey).toWif();
        //
        //     // check private key
        //     if (!this.accountService.accountInfo.pKey) {
        //       this.errorService.handleError('need_private_key', {
        //         status: 409,
        //         error: {message: 'need_private_key'}
        //       });
        //       this.articleUpLoading = false;
        //       this.articleUpLoadingChanged.next(this.articleUpLoading);
        //       return;
        //     }
        //
        //     // const pKey = PrivateKey.fromWif(this.accountService.accountInfo.pKey);
        //     //
        //     // this.walletService.api
        //     //   .then(apiRes => {
        //     //     ChainStore.init()
        //     //       .then(() => {
        //     //
        //     //         const sendAmount = {amount: 0, asset: CoinName};
        //     //         Promise.all([
        //     //           FetchChain('getAccount', this.accountService.accountInfo),
        //     //           FetchChain('getAsset', sendAmount.asset)
        //     //         ])
        //     //           .then(res => {
        //     //             const [
        //     //               fAccount,
        //     //               feeAsset
        //     //             ] = res;
        //     //             if (!fAccount) {
        //     //               this.errorService.handleError(
        //     //                 'not_found_author_account',
        //     //                 {
        //     //                   status: 409,
        //     //                   error: {message: 'not_found_author_account'}
        //     //                 }
        //     //               );
        //     //               this.articleUpLoading = false;
        //     //               this.articleUpLoadingChanged.next(this.articleUpLoading);
        //     //               return;
        //     //             }
        //     //
        //     //             const tr = new TransactionBuilder();
        //     //             tr.add_type_operation('content_submit', {
        //     //               fee: {
        //     //                 amount: 0,
        //     //                 asset_id: feeAsset.get('id')
        //     //               },
        //     //               author: fAccount.get('id'),
        //     //               ds_id: dsId,
        //     //               meta: meta
        //     //             });
        //     //             tr.set_required_fees().then(() => {
        //     //               tr.add_signer(
        //     //                 pKey,
        //     //                 pKey.toPublicKey().toPublicKeyString()
        //     //               );
        //     //               console.log('uw: start', new Date());
        //     //               tr.broadcast((data) => {
        //     //                 console.log('uw: end', new Date());
        //     //                 this.articleSubmitEnd(dsId, boostInfo && boostInfo.boostEnabled);
        //     //                 if (boostInfo && boostInfo.boostEnabled) {
        //     //                   this.articleBoost(password, dsId, boostInfo);
        //     //                 }
        //     //
        //     //               });
        //     //             });
        //     //           })
        //     //           .catch(reason => {
        //     //             this.errorService.handleError('transfer_failed', {
        //     //               status: 409,
        //     //               error: {message: 'transfer_failed'}
        //     //             });
        //     //             this.articleUpLoading = false;
        //     //             this.articleUpLoadingChanged.next(this.articleUpLoading);
        //     //             return;
        //     //           });
        //     //       })
        //     //       .catch(reason => {
        //     //         this.walletService.destroyExternalWsService();
        //     //         if (environment.daemon_address_second != this.walletService.currentDaemonAddress) {
        //     //           this.walletService.initExternalWsService(environment.daemon_address_second);
        //     //           this.articleSubmit(password, meta, dsId, boostInfo);
        //     //         } else {
        //     //             this.errorService.handleError('transfer_failed', {
        //     //                 status: 409,
        //     //                 error: {message: 'transfer_failed'}
        //     //             });
        //     //             this.articleUpLoading = false;
        //     //             this.articleUpLoadingChanged.next(this.articleUpLoading);
        //     //             return;
        //     //         }
        //     //       });
        //     //   })
        //     //   .catch(reason => {
        //     //     this.errorService.handleError('transfer_failed', {
        //     //       status: 409,
        //     //       error: {message: 'transfer_failed'}
        //     //     });
        //     //     this.articleUpLoading = false;
        //     //     this.articleUpLoadingChanged.next(this.articleUpLoading);
        //     //     return;
        //     //   });
        //   },
        //   err => {
        //     this.errorService.handleError('transfer-password-error', {
        //       status: 409,
        //       error: {message: 'password_error'}
        //     });
        //     this.articleUpLoading = false;
        //     this.articleUpLoadingChanged.next(this.articleUpLoading);
        //   }
        // );
      } catch (MalformedURLException) {
        console.log('MalformedURLException');
        this.errorService.handleError('transfer_failed', {
          status: 409,
          error: {message: 'transfer_failed'}
        });
        this.articleUpLoading = false;
        this.articleUpLoadingChanged.next(this.articleUpLoading);
        return;
      }
    }
  }

  articleSubmitEnd(dsId: string, boosted: boolean) {

    const url = this.contentUrl + `/upload-content-complete/${dsId}`;
    // upload-content-complete/{dsId}
    const authToken = localStorage.getItem('auth');
    const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
    console.log('upload-content-complete: start', new Date());
    this.http.post(url, {}, header).subscribe(
      (data: any) => {
        // const channelAuthors = this.channelService.getChannelAuthors();
        // const channel = this.channelService.channel || 'stage';
        // this.http.post('/api/updateMemoryCache', {channelAuthors, channel}).subscribe(res => {
        //   console.log(res);
        // }, err => {
        //   console.log(err);
        // });
        console.log('upload-content-complete: end', new Date());
        this.accountService.loadBalance();
        this.submittedContentData = data;
        if (!boosted) {
          this.submittedContentChanged.next(this.submittedContentData);
          this.articleUpLoading = false;
        }


        this.articleUpLoadingChanged.next(this.articleUpLoading);
      },
      error => {
        this.articleUpLoading = false;
        this.articleUpLoadingChanged.next(this.articleUpLoading);
        return this.errorService.handleError('submit', error, url);
      }
    );
  }

  submit(
    title: string,
    headline: string,
    tags,
    content,
    coverImageHash = '',
    listImageHash = '',
    forAdults: boolean,
    sourceOfMaterial: string,
    reference: string,
    contentId,
    origin: string,
    publicationSlug,
    password: string,
    boostInfo?
  ): void {
    if (isPlatformBrowser(this.platformId)) {
      this.articleUpLoading = true;
      this.articleUpLoadingChanged.next(this.articleUpLoading);

      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('submit', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }
      const header = {headers: new HttpHeaders({'X-API-TOKEN': authToken})};
      const channelId = this.channelService.channel
        ? this.channelService.channel
        : '';
      const data = {
        meta: {
          title: title,
          headline: headline,
          tags: tags,
          contentVersion: environment.currentVersion,
          image_hash: coverImageHash,
          thumbnail_hash: listImageHash,
          for_adults: forAdults,
          reference: reference,
          source_of_material: sourceOfMaterial,
          channel_id: channelId,
          origin: origin
        },
        content: {
          text: content
        },
        content_id: contentId,
        publication_slug: publicationSlug
      };
      const url = this.contentUrl + '/upload-content';
      //
      console.log('upload-content: start', new Date());
      this.http.post(url, data, header).subscribe(
        (data: any) => {
          console.log('upload-content: end', new Date());
          if (data.result) {
            this.articleSubmit(password, data.result.meta, data.result.ds_id, boostInfo);
          }
        },
        error => {
          this.errorService.handleError('submit', error, url);
          this.articleUpLoading = false;
          this.articleUpLoadingChanged.next(this.articleUpLoading);
        }
      );
    }
  }

  is_valid(content): boolean {
    if (typeof content.meta != 'object') {
      return false;
    }

    if (
      typeof content.meta.title != 'string' ||
      content.meta.title.length == 0
    ) {
      return false;
    }

    if (
      typeof content.meta.headline != 'string' ||
      content.meta.title.length == 0
    ) {
      return false;
    }

    return true;
  }

  public uploadMainPhoto(file, contentId, action): void {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('uploadMainPhoto', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('content_id', JSON.stringify(contentId));
      formData.append('action', action);
      const url = this.contentUrl + '/image';

      this.http
        .post(url, formData, {
          headers: new HttpHeaders({'X-API-TOKEN': authToken})
        })
        .subscribe(
          data => {
            this.uploadMainPhotoData = data;
            this.uploadMainPhotoDataChanged.next(this.uploadMainPhotoData);
          },
          error => this.errorService.handleError('uploadMainPhoto', error, url)
        );
    }
  }

  public uploadCroppedMainPhoto(file, contentId, coverImageUrl): void {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('uploadCroppedMainPhoto', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('content_id', JSON.stringify(contentId));
      formData.append('action', '4');
      formData.append('cover_image_url', coverImageUrl);
      const url = this.contentUrl + '/image';

      this.http
        .post(url, formData, {
          headers: new HttpHeaders({'X-API-TOKEN': authToken})
        })
        .subscribe(
          data => {
            this.uploadCroppedMainPhotoData = data;
            this.uploadCroppedMainPhotoDataChanged.next(this.uploadCroppedMainPhotoData);
          },
          error => this.errorService.handleError('uploadCroppedMainPhoto', error, url)
        );
    }
  }

  public uploadListPhoto(file, contentId, action): void {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('uploadListPhoto', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('content_id', JSON.stringify(contentId));
      formData.append('action', action);
      const url = this.contentUrl + '/image';

      this.http
        .post(url, formData, {
          headers: new HttpHeaders({'X-API-TOKEN': authToken})
        })
        .subscribe(
          data => {
            this.uploadListPhotoData = data;
            this.uploadListPhotoDataChanged.next(this.uploadListPhotoData);
          },
          error => this.errorService.handleError('uploadListPhoto', error, url)
        );
    }
  }

  public destroyContent(contentId): void {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = localStorage.getItem('auth');
      if (!authToken) {
        this.errorService.handleError('destroyContent', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }
      const url = this.contentUrl + '/destroy-content/' + contentId;

      this.http
        .delete(url, {headers: new HttpHeaders({'X-API-TOKEN': authToken})})
        .subscribe(
          data => {
            console.log('destroyContentData---OK');
            this.destroyContentData = data;
            this.destroyContentDataChanged.next(this.destroyContentData);
          },
          error => this.errorService.handleError('destroyContent', error, url)
        );
    }
  }

  getHomePageContent(channel, channelAuthors): Observable<any> {
    const contentData = [];
    return this.http.post(environment.daemon_https_address, {
      'id': 0,
      'method': 'call',
      'params': [0, 'search_content_ex_sponsored', ['', '', channelAuthors, '-published', '', '0.0.0', '', 5, 30]]
    }).pipe(
      flatMap((data: any) => {
        const ids = [];
        let nextContent = {};
        if (data && data.result) {
          data.result.map((content) => {
            ids.push(content.ds_id);
            if (typeof content.meta === 'undefined' || typeof content.meta.headline === 'undefined') {
              return false;
            }

            content.meta.tags = ContentService.generateTags(content.meta.tags);

            content.meta.displayTags = content.meta.tags.map(t => {
              if (t.display) {
                return t.display;
              } else if (t.name) {
                return t.name;
              }
            });

            if (content.full_account) {
              content.full_account = new Account(content.full_account);
            }

            ['options', 'owner', 'registrar', 'rights_to_publish', 'statistics'].forEach(e => (content.full_account && content.full_account.hasOwnProperty(e)) ? delete content.full_account[e] : '');
            ['version', 'headline', 'mimetype', 'source_of_material', 'reference', 'channel_id', 'gender'].forEach(e => (content.meta && content.meta.hasOwnProperty(e)) ? delete content.meta[e] : '');

            nextContent = {
              author: content.author,
              created: content.created,
              ds_id: content.ds_id,
              meta: content.meta,
              full_account: content.full_account
            };

            contentData.push(nextContent);
          });
          const viewCountUrl = environment.ds_backend + '/content/views';
          return forkJoin(of(contentData), this.http.post(viewCountUrl, {ids}));
        }
      })
    );
  }

  public addFeedbackReport(dsId, reasonId, authorPubliqId): void {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = this.getAccountToken();
      if (!authToken) {
        this.errorService.handleError('submit', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }

      const url = this.feedbackUrl;

      this.http
        .put(
          url,
          {
            ds_id: dsId,
            reason: reasonId,
            author_publiq_id: authorPubliqId
          },
          {headers: new HttpHeaders({'X-API-TOKEN': authToken})}
        )
        .subscribe(
          res => {
            if (res) {
              this.feedbackReportData = 'OK';
              this.feedbackReportDataChanged.next(this.feedbackReportData);
            } else {
              this.errorService.handleError(
                'addFeedbackLike',
                {
                  status: 409,
                  error: {message: 'add_feedback_report_error'}
                },
                url
              );
            }
          },
          error =>
            this.errorService.handleError('addFeedbackReport', error, url)
        );
    }
  }

  public addFeedbackLike(dsId, action, authorPubliqId): void {
    const authToken = this.getAccountToken();
    if (!authToken) {
      this.errorService.handleError('submit', {
        status: 409,
        error: {message: 'invalid_session_id'}
      });
    }

    const url = this.feedbackUrl + '/like';
    if (isPlatformBrowser(this.platformId)) {
      this.http
        .put(
          url,
          {
            ds_id: dsId,
            action: action,
            author_publiq_id: authorPubliqId
          },
          {headers: new HttpHeaders({'X-API-TOKEN': authToken})}
        )
        .subscribe(
          res => {
            if (res) {
              this.feedbackLikeData = 'OK';
              this.feedbackLikeDataChanged.next(this.feedbackLikeData);
            } else {
              this.errorService.handleError(
                'addFeedbackLike',
                {
                  status: 409,
                  error: {message: 'add_feedback_like_error'}
                },
                url
              );
            }
          },
          error => this.errorService.handleError('addFeedbackLike', error, url)
        );
    }
  }

  loadFeedback(dsId): void {
    if (isPlatformBrowser(this.platformId)) {
      const authToken = this.getAccountToken();
      if (!authToken) {
        this.errorService.handleError('submit', {
          status: 409,
          error: {message: 'invalid_session_id'}
        });
      }

      const url = this.feedbackUrl + '/get-impression-status/' + dsId;

      this.http
        .get(url, {headers: new HttpHeaders({'X-API-TOKEN': authToken})})
        .pipe(map(feedback => new Feedback(feedback)))
        .subscribe(
          res => {
            this.feedback = res;
            this.feedbackChanged.next(this.feedback);
          },
          error => this.errorService.handleError('loadFeedback', error, url)
        );
    }
  }

  getFeedback() {
    return this.feedback;
  }

  public getAccountToken() {
    return this.accountService.accountInfo &&
    this.accountService.accountInfo.token
      ? this.accountService.accountInfo.token
      : null;
  }

  getImage(imageUrl): Observable<Blob> {
    return this.http.get(imageUrl, {responseType: 'blob'});
  }
}
