import { Injectable } from '@angular/core';
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
    private httpHelperService: HttpHelperService
  ) {
  }

  loadTransactions(publicKey, hash = '', limit = 50, rtt = null): Observable<any> {
    const url = `${this.userUrl}/${publicKey}/transactions/${rtt}/${limit}/${hash}`;
    return this.httpHelperService.customCall(HttpMethodTypes.get, url);
  }

  transfer(publicKey: string, amount: string, memo: string): Observable<any> {
    const signTransfer: any = this.cryptService.getSignTransfer(this.oauthService.brainKey, publicKey, amount, memo);

    return this.httpHelperService.customCall(HttpMethodTypes.post, environment.blockchain_api_url, signTransfer.toJson());
  }
}
