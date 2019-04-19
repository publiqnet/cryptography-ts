import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Transaction } from '../../services/models/Transaction';
import { ApiService } from '../../services/api.service';
import { filter, takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { TransactionResponse } from '../../services/models/TransactionResponse';

@Component({
  selector: 'app-account-transaction-list',
  templateUrl: './account-transaction-list.component.html',
  styles: []
})
export class AccountTransactionListComponent implements OnInit, OnDestroy {

  @Input() transactions: Transaction[];
  @Input() ownerAddress: string;
  @Input() amountShown?: boolean;
  blockInfiniteScroll = false;
  seeMoreChecker = false;
  lastTransactionHash = '';
  loadingBlocks = true;
  transactionsLimit = 10;
  transactionsFrom = 0;
  hasBeenLoaded: boolean;
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private route: ActivatedRoute, private apiService: ApiService) {
  }

  ngOnInit() {
    // this.apiService.getTransactions(null, this.transactionsLimit)
    //   .pipe(
    //     filter((data: any) => data != null),
    //     takeUntil(this.unsubscribe$)
    //   )
    //   .subscribe((data: TransactionResponse) => {
    //     this.seeMoreChecker = data.more;
    //     this.transactionsData = data.transactions;
    //   });
  }

  set transactionsData(transactions: Transaction[]) {
    this.transactions = transactions;
    this.calculateLastTransactionHash(this.transactions);
  }

  seeMore() {
    this.blockInfiniteScroll = true;
    this.seeMoreChecker = true;
    this.transactionsFrom = this.transactionsFrom + 10;
    this.apiService.getTransactions(this.lastTransactionHash, this.transactionsLimit)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: TransactionResponse) => {
        this.seeMoreChecker = data.more;
        this.setTransactionsData(data.transactions);
      });
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
