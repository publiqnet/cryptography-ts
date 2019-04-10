import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

import { Account } from '../../core/services/models/account';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { TransactionDetailObject } from '../../core/services/models/transaction.detail.object';
import { AccountService } from '../../core/services/account.service';
import { environment } from '../../../environments/environment';
import { WalletService } from '../../core/services/wallet.service';



@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy {

  readonly displayedColumns = ['id', 'from_to', 'date', 'total'];
  account: Account;
  loading = false;
  readonly explorerAddress = environment.explorerAddress;
  public seeMoreChecker = false;
  defaultLimit = 50;
  nextTransactionHash = '';

  dataSource: MatTableDataSource<TransactionDetailObject>;
  transactions: TransactionDetailObject[] = [];

  private unsubscribe$ = new ReplaySubject<void>(1);


  constructor(private accountService: AccountService,
              private walletService: WalletService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
    this.loading = this.transactions.length === 0;

    this.dataSource = new MatTableDataSource<TransactionDetailObject>(this.transactions);

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((error: ErrorEvent) => {
        if (error.action === 'transactions_not_found') {
          this.loading = false;
        }
      });

    this.accountService.accountUpdated$
      .pipe(
        filter(account => (account != null)),
        map(account => {
          this.account = account;
          return account;
        }),
        switchMap(params => {
          return this.walletService.loadTransactions(this.accountService.accountInfo.publicKey, '', this.defaultLimit);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.setTransactionData(data);
      });
  }

  calculateLastTransactionHash(transactions) {
    if (transactions.length >= this.defaultLimit) {
      const last = transactions.length - 1;
      if (transactions[last].transactionHash !== this.nextTransactionHash) {
        this.nextTransactionHash = transactions[last].transactionHash;
      }
    }
  }

  viewMore() {
    this.walletService.loadTransactions(this.accountService.accountInfo.publicKey, this.nextTransactionHash, this.defaultLimit)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.setTransactionData(data);
      });
  }

  setTransactionData(data) {
    this.seeMoreChecker = !!data.more;
    if (data.transactions && data.transactions.length > 0) {
      data.transactions = data.transactions.map(t => new TransactionDetailObject(t));
    }
    const transactions = data.transactions;
    if (transactions) {
      this.calculateLastTransactionHash(transactions);
      this.transactions = transactions;
      this.dataSource.data = this.dataSource.data.concat(transactions);
    } else {
      this.errorService.handleError('transactions_not_found', {
        status: 409,
        error: {message: 'transactions_not_found'}
      });
    }
    this.loading = false;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    this.dataSource.data = [];
    this.transactions = [];
  }

}
