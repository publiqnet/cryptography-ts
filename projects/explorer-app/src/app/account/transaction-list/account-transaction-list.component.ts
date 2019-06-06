import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Transaction } from '../../services/models/Transaction';
import { Account } from '../../services/models/Account';
import { ApiService } from '../../services/api.service';
import { TransactionResponse } from '../../services/models/TransactionResponse';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-account-transaction-list',
  templateUrl: './account-transaction-list.component.html',
  styleUrls: ['./account-transaction-list.component.css']
})
export class AccountTransactionListComponent implements OnInit, OnChanges, OnDestroy {

  @Input() transactions: Transaction[];
  @Input() account: Account;
  @Input() amountShown?: boolean;
  blockInfiniteScroll = false;
  seeMoreChecker = true;
  lastTransactionHash = '';
  loadingBlocks = false;
  transactionsLimit = 10;
  hasBeenLoaded: boolean;
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private router: Router,
              private utilService: UtilService,
              private apiService: ApiService) {
  }

  ngOnInit() {
    if (!this.account || !this.account.address) {
      this.router.navigate(['/page-not-found']);
    }

    if (!this.transactions) {
      this.apiService.getAccountTransactions(this.account.address, null, this.transactionsLimit)
        .pipe(
          filter((data: any) => data != null),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: TransactionResponse) => {
          this.seeMoreChecker = data.more;
          this.transactionsData = data.transactions;
        });
    } else {
      this.calculateLastTransactionHash(this.transactions);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('transactions')) {
      this.lastTransactionHash = '';
      this.seeMoreChecker = changes.account.currentValue.moreTransactions;
      this.transactionsData = changes.transactions.currentValue;
    }
  }

  set transactionsData(transactions: Transaction[]) {
    this.transactions = transactions;
    this.calculateLastTransactionHash(this.transactions);
  }

  seeMore() {
    if (!this.lastTransactionHash || !this.account.address) {
      return;
    }
    this.blockInfiniteScroll = true;
    this.seeMoreChecker = true;
    this.loadingBlocks = true;
    this.apiService.getAccountTransactions(this.account.address, this.lastTransactionHash, this.transactionsLimit)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: TransactionResponse) => {
        this.seeMoreChecker = data.more;
        this.setTransactionsData(data.transactions);
      }, () => this.loadingBlocks = false);
  }

  setTransactionsData(transactions: Transaction[]) {
    this.transactions = this.transactions.concat(transactions);
    this.calculateLastTransactionHash(transactions);
    this.hasBeenLoaded = true;
    this.loadingBlocks = false;
    this.blockInfiniteScroll = false;
  }

  calculateLastTransactionHash(transactions: Transaction[]) {
    if (transactions.length >= this.transactionsLimit) {
      const last = transactions.length - 1;
      if (transactions[last].transactionHash !== this.lastTransactionHash) {
        this.lastTransactionHash = transactions[last].transactionHash;
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
