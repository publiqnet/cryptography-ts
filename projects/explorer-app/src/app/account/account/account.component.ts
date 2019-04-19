import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ReplaySubject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { SearchResponse } from '../../services/models/SearchResponse';
import { Transaction, TransactionOptions } from '../../services/models/Transaction';
import { Account } from '../../services/models/Account';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styles: []
})
export class AccountComponent implements OnInit, OnDestroy {
  @Input() account?: Account;
  private unsubscribe$ = new ReplaySubject<void>(1);
  transactions: Transaction[];

  constructor(private route: ActivatedRoute, private apiService: ApiService) {
  }

  ngOnInit() {
    if (!this.account) {
      this.route.params
        .pipe(
          switchMap((params: { address: string }) => this.apiService.search(params.address)),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: SearchResponse) => this.AccountData = data.object);
    } else {
      this.AccountData = this.account;
    }
  }

  set AccountData(account: Account) {
    this.account = account;
    this.transactions = (this.account.transactions && this.account.transactions.length > 0)
      ? this.account.transactions.map((transaction: TransactionOptions) => new Transaction(transaction)) : [];
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
