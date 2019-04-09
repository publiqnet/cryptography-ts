import { Injectable } from '@angular/core';
import { ErrorService } from './error.service';
import { CryptService } from './crypt.service';
import { HttpHelperService, HttpMethodTypes, OauthService } from 'helper-lib';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export const CoinPrecision = 8;

@Injectable()
export class WalletService {

  public userUrl = `${environment.backend}/api/user`;

  constructor(
    private cryptService: CryptService,
    private oauthService: OauthService,
    private httpHelperService: HttpHelperService,
    private errorService: ErrorService
  ) {
  }

  // initExternalWsService() {
  //
  //     if (!Apis.inst || !this.api) {
  //         try {
  //             this.api = Apis.instance(environment.daemon_address, true).init_promise.then(res => {
  //                 // this.chainStore = ChainStore.init();
  //             });
  //         } catch (error) {
  //             this.errorService.handleError('init_external_ws_service', {status: 409, error: {message: 'init_external_ws_service'}});
  //             return;
  //         }
  //     }
  // }
  //
  // destroyExternalWsService() {
  //     Apis.close();
  //     this.api = '';
  // }
  //
  // getTransactions(): TransactionDetailObject[] {
  //     return this.transactions.slice();
  // }

  loadTransactions(publicKey, hash = '', limit = 50): Observable<any> {
    const url = `${this.userUrl}/${publicKey}/transactions/${limit}/${hash}`;
    return this.httpHelperService.customCall(HttpMethodTypes.get, url);
  }

  transfer(publicKey: string, amount: string, memo: string) {
    const signTransfer: any = this.cryptService.getSignTransfer(this.oauthService.brainKey, publicKey, amount, memo);

    return this.httpHelperService.customCall(HttpMethodTypes.post, environment.blockchain_api_url, signTransfer.toJson());
  }
}
