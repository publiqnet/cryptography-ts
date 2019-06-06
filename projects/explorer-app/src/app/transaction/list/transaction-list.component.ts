import { Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Transaction } from '../../services/models/Transaction';
import { ApiService } from '../../services/api.service';
import { ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { TransactionResponse } from '../../services/models/TransactionResponse';
import { isPlatformBrowser } from '@angular/common';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
  styles: []
})
export class TransactionListComponent implements OnInit, OnDestroy {

  @Input() loadOnScroll = true;
  @Input() transactionsLimit = 10;

  transactions: Transaction[];
  blockInfiniteScroll = false;
  seeMoreChecker = false;
  lastTransactionHash = '';
  loadingBlocks = true;
  transactionsFrom = 0;
  hasBeenLoaded: boolean;
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private route: ActivatedRoute,
              private utilService: UtilService,
              private apiService: ApiService,
              private router: Router,
              @Inject(PLATFORM_ID) private platformId: Object
              ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.apiService.getTransactions(null, this.transactionsLimit)
        .pipe(
          filter((data: any) => data != null),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((data: TransactionResponse) => {
          this.seeMoreChecker = data.more;
          this.transactionsData = data.transactions;
        });
    }
  }

  set transactionsData(transactions: Transaction[]) {
    this.transactions = transactions;
    this.calculateLastTransactionHash(this.transactions);
    this.loadingBlocks = false;
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

  redirect($event, page, param) {
    $event.preventDefault();
    this.transactions = null;
    this.router.navigate([`/${page}/${param}`]);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
