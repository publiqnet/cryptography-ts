import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';


import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../../core/services/models/account';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-search-account',
  templateUrl: './search-account.component.html',
  styleUrls: ['./search-account.component.scss']
})
export class SearchAccountComponent implements OnInit, OnDestroy {
  public filteredAccounts: Account[];
  public loadedAccounts: Account[];
  private searchTerm = '';
  public loading = true;
  public hasChanges = false;

  private unsubscribe$ = new ReplaySubject<void>(1);
  private startFromBlock = '0.0.0';
  private accountsDefaultCount = 10;
  public seeMoreChecker = false;
  public seeMoreLoading = false;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object,
    private errorService: ErrorService,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.hasChanges = false;
      this.activatedRoute.params
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(params => {
          if (params['term'] !== 'undefined') {
            this.resetFilter();
            this.searchTerm = params['term'];
            this.accountService.getAccountByTerm(this.searchTerm, this.startFromBlock, this.accountsDefaultCount + 1);
          } else {
            this.router.navigate(['/']);
            return;
          }
        });

      this.errorService.errorEventEmiter
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: ErrorEvent) => {
          if (['getAccountByTerm', 'getIsSubscribedByAuthors'].includes(data.action)) {
            console.log(data.message);
          } else if (['follow', 'unfollow'].includes(data.action)) {
            this.notificationService.error(data.message);
          }
        });

      this.accountService.accountUpdated$
        .pipe(
          filter(data => data != null),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
          let accountsArray = this.loadedAccounts;
          if (this.filteredAccounts.length > this.loadedAccounts.length) {
            accountsArray = this.filteredAccounts;
          }

          if (accountsArray && accountsArray.length) {
            const accounts = [];
            accountsArray.forEach((account: Account) => {
              accounts.push(account.name);
            });

            this.accountService.getIsSubscribedByAuthors(accounts);
          }
        });

      this.accountService.isSubscribedByAuthorsChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((result: string[]) => {
          if (this.loadedAccounts && this.loadedAccounts.length) {
            const accounts = (this.filteredAccounts[0]['subscribing'] == undefined) ? this.filteredAccounts : this.loadedAccounts;
            result.forEach((subscriber: any) => {
              accounts.forEach((account: Account) => {
                if (this.accountService.accountInfo && (account.name == this.accountService.accountInfo.name)) {
                  account['subscribing'] = -1;
                } else if (account.name == subscriber) {
                  account['subscribing'] = 1;
                } else if (account['subscribing'] == undefined) {
                  account['subscribing'] = 0;
                }
              });
            });
          }
        });

      this.accountService.getAccountDataByTermChanged
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((accounts: any[]) => {

          const loadedAccountLength = accounts.length;
          if (loadedAccountLength > this.accountsDefaultCount) {
            const lastIndex = loadedAccountLength - 1;
            if (accounts[lastIndex].id !== this.startFromBlock) {
              this.startFromBlock = accounts[lastIndex].id;
              accounts.pop();
            }
          }
          this.loadedAccounts = accounts;

          if (this.accountService.loggedIn()) {
            const data = [];
            this.loadedAccounts.forEach((account: Account) => {
              data.push(account.name);
            });

            this.accountService.getIsSubscribedByAuthors(data);
          }

          this.filteredAccounts = (this.filteredAccounts && this.filteredAccounts.length) ? this.filteredAccounts.concat(this.loadedAccounts) : this.loadedAccounts;
          this.seeMoreChecker = (loadedAccountLength > this.accountsDefaultCount)/* && (this.authorStories.length < this.authorStats.articlesCount)*/;
          this.loading = false;
          this.hasChanges = true;
          this.seeMoreLoading = false;
        });
    }
  }

  seeMore() {
    this.seeMoreLoading = true;
    this.accountService.getAccountByTerm(this.searchTerm, this.startFromBlock, this.accountsDefaultCount + 1);
  }

  resetFilter() {
    this.filteredAccounts = [];
    this.loadedAccounts = [];
    this.startFromBlock = '0.0.0';
    this.loading = true;
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.hasChanges = false;
      this.accountService.getAccountDataByTermChanged.next([]);
      this.startFromBlock = '0.0.0';

      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }
}
