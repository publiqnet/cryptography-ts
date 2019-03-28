import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import { Account } from '../../core/services/models/account';
import { AccountService } from '../../core/services/account.service';
import { DialogService } from '../../core/services/dialog.service';


@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit, OnDestroy {
  @Input() accounts: Array<any>;
  @Input() hasSeparator: boolean;

  private currentAccount: Account;
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private accountService: AccountService,
              private dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    this.accountService.followAuthorChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        if (this.currentAccount && data == 'OK') {
          this.currentAccount['subscribing'] = 1;
        }
      });

    this.accountService.unFollowAuthorChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        if (this.currentAccount && data == 'OK') {
          this.currentAccount['subscribing'] = 0;
        }
      });
  }

  getAccountName(account: Account): string {
    let name = '';
    if (account.firstName && account.lastName) {
      name = account.firstName + ' ' + account.lastName;
    } else if (!account.firstName && !account.lastName) {
      name = account.publicKey;
    } else {
      name = (account.firstName ? account.firstName : '') + ' ' + (account.lastName ? account.lastName : '');
    }
    return name;
  }

  checkImageHashExist(account: Account) {
    return false;
    // const image = account.image_hash ? account.image_hash : '';
    // return !!(account && image && image !== '' && !image.startsWith('http://127.0.0.1') && image.indexOf('_thumb') !== -1);
  }

  follow(account: Account) {
    if (!this.accountService.loggedIn()) {
      this.openLoginDialog();
      return false;
    }
    this.currentAccount = account;
    this.accountService.follow(account.publicKey);
  }

  unfollow(account: Account) {
    if (!this.accountService.loggedIn()) {
      this.openLoginDialog();
      return false;
    }
    this.currentAccount = account;
    this.accountService.unfollow(account.publicKey);
  }

  private openLoginDialog() {
    this.dialogService.openLoginDialog().subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
