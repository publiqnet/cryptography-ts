import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';

import { ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { AccountService } from '../../core/services/account.service';
import { environment } from '../../../environments/environment';
import { WalletService } from '../../core/services/wallet.service';
import { TransactionDetailObject } from '../../core/models/classes';
import { Account } from '../../core/services/models/account';
import { ValidationService } from '../../core/validator/validator.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy {
  readonly displayedColumns = ['id', 'name', 'from_to', 'total'];
  account: Account;
  loading = false;
  readonly explorerAddress = environment.explorerAddress;
  private memoDecrypted = false;

  private defaultTransactionsCount = 50;
  private firstBlock = '0.0.0';
  private startFromBlock = '0.0.0';
  public seeMoreChecker = false;
  public seeMoreLoading = false;

  filterForm: FormGroup;
  filterFormFields = {
    from_date: '',
    to_date: ''
  };
  fromDateUnix = 0;
  toDateUnix = 0;
  minDate;
  maxDate;
  maxPosibleDate;

  dataSource: MatTableDataSource<TransactionDetailObject>;
  transactions: TransactionDetailObject[] = [];
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    private accountService: AccountService,
    private walletService: WalletService,
    private FormBuilder: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit() {
    this.maxDate = new Date();
    this.maxPosibleDate = new Date();

    this.buildForm();
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
          if (data && data.from_date) {
            this.minDate = data.from_date;
          }
          if (data && data.to_date) {
            this.maxDate = data.to_date;
          }
        },
        err => console.log(err)
      );

    this.loading = this.transactions.length === 0;

    this.dataSource = new MatTableDataSource<TransactionDetailObject>(
      this.transactions
    );

    this.accountService.accountUpdated$
      .pipe(
        filter(account => account != null),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(account => {
        this.account = account;
      });

    this.walletService.loadTransactions(
      this.account.name,
      this.fromDateUnix,
      this.toDateUnix,
      this.startFromBlock,
      this.defaultTransactionsCount + 1
    );

    this.walletService.transactionsChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((transactions: TransactionDetailObject[]) => {
          if (transactions.length > this.defaultTransactionsCount) {
            const lastIndex = transactions.length - 1;
            if (transactions[lastIndex].id !== this.startFromBlock) {
              this.startFromBlock = transactions[lastIndex].id;
              transactions.pop();
            }
          }

          this.memoDecrypted = false;
          this.loading = false;

          this.seeMoreChecker = transactions.length >= this.defaultTransactionsCount;
          this.dataSource.data =
            transactions && transactions.length
              ? this.dataSource.data.concat(transactions)
              : [];
          this.transactions = this.transactions.concat(transactions);

          this.seeMoreLoading = false;

        }
      );

    this.dataSource
      .connect()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: TransactionDetailObject[]) => {
        if (data && data.length) {
          setTimeout(() => {
            data.forEach((tr: TransactionDetailObject) => {
              if (!tr.m_memo_decrypted && this.account.pKey) {
                tr.m_memo_decrypted = tr.m_memo.getMessage(this.account);
              }
            });
          }, 1000);
        }
      });
  }

  private buildForm() {
    this.filterForm = this.FormBuilder.group({
        from_date: new FormControl(this.filterFormFields.from_date, []),
        to_date: new FormControl(this.filterFormFields.to_date, [])
      },
      {validator: ValidationService.requireOneDate}
    );
  }

  _filter() {
    this.fromDateUnix = this.filterForm.value.from_date ? moment(this.filterForm.value.from_date, 'YYYY.MM.DD').startOf('day').unix() : 0;
    this.toDateUnix = this.filterForm.value.to_date ? moment(this.filterForm.value.to_date, 'YYYY.MM.DD').endOf('day').unix() : 0;
    this.loading = true;
    this.transactions = [];
    this.dataSource.data = [];
    this.walletService.loadTransactions(
      this.account.name,
      this.fromDateUnix,
      this.toDateUnix,
      this.firstBlock,
      this.defaultTransactionsCount + 1
    );
  }

  resetFilter() {
    this.filterFormFields = {from_date: '', to_date: ''};
    this.buildForm();
    this.loading = true;
    this.fromDateUnix = 0;
    this.toDateUnix = 0;
    this.transactions = [];
    this.dataSource.data = [];
    this.walletService.loadTransactions(
      this.account.name,
      this.fromDateUnix,
      this.toDateUnix,
      this.firstBlock,
      this.defaultTransactionsCount + 1
    );

    this.minDate = '';
    this.maxDate = new Date();
  }

  viewMore() {
    this.seeMoreLoading = true;
    this.walletService.loadTransactions(
      this.account.name,
      this.fromDateUnix,
      this.toDateUnix,
      this.startFromBlock,
      this.defaultTransactionsCount + 1
    );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.dataSource.data = [];
    this.transactions = [];
    this.seeMoreLoading = false;
    this.walletService.transactionsChanged.next([]);
    this.startFromBlock = '0.0.0';
  }
}
