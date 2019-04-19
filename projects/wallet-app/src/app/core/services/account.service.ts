import { Injectable } from '@angular/core';
import { HttpHelperService, HttpMethodTypes } from 'helper-lib';
import { Account } from './models/account';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserIdleService } from '../models/angular-user-idle/user-idle.service';
import { UtilsService } from 'shared-lib';

@Injectable()
export class AccountService {

  constructor(
    private httpHelperService: HttpHelperService,
    private userIdle: UserIdleService
  ) {}

  private accountInfoData: Account = null;
  public userUrl = `${environment.backend}/api/user`;

  public brainKeyEncrypted: string;
  public autoLogOut = false;

  public accountUpdated$: BehaviorSubject<any> = new BehaviorSubject(null);
  logoutDataChanged = new Subject<any>();

  private set SetAccountInfo(userInfo) {
    if (userInfo != null) {
      const data = (this.accountInfoData) ? this.accountInfoData : {};

      const accountCurrentInfo = {
        ...data,
        ...userInfo,
        token: (userInfo.hasOwnProperty('token')) ? userInfo.token : ''
      };

      this.autoLogOut = false;
      this.accountInfoData = new Account(accountCurrentInfo);
    } else {
      this.accountInfoData = null;
    }

    this.accountUpdated$.next(this.accountInfo);
  }

  public get accountInfo(): Account {
    return this.accountInfoData;
  }

  accountAuthenticate(token: string): Observable<any> {
    const url = this.userUrl + `/authenticate`;
    return this.httpHelperService.customCall(HttpMethodTypes.get, url, null, [ { key: 'X-OAUTH-TOKEN', value: token } ])
      .pipe(
        map((userInfo: any) => {
          this.SetAccountInfo = userInfo;
          this.userIdle.resetTimer();
          return userInfo;
        }))
      ;
  }

  checkBalanceUpdate() {
    if (this.accountInfo && this.accountInfo.publicKey) {
      const url = this.userUrl + `/${this.accountInfo.publicKey}/balance`;
      this.httpHelperService.customCall(HttpMethodTypes.get, url)
        .subscribe(balanceInfo => {
          if (balanceInfo.hasOwnProperty('whole') && balanceInfo.hasOwnProperty('fraction')) {
            const currentActiveBalance = UtilsService.getBalanceString(balanceInfo.whole, balanceInfo.fraction);
            if (this.accountInfo.balance != currentActiveBalance) {
              this.accountInfo.balance = currentActiveBalance;
              this.accountUpdated$.next(this.accountInfo);
            }
          }
        });
    }
  }

  logout() {
      this.SetAccountInfo = null;
      this.brainKeyEncrypted = '';
      this.accountUpdated$.next(null);
      this.logoutDataChanged.next(null);
  }

  loggedIn() {
    return this.accountInfoData != null;
  }
}
