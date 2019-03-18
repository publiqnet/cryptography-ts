import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { tap, filter, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from '../../core/services/account.service';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { CoinPrecision, WalletService } from '../../core/services/wallet.service';
import { ValidationService } from '../../core/validator/validator.service';
import { Broadcaster } from '../../broadcaster/broadcaster';

const PBQPower = 100000000;

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit, OnDestroy {
  account = '';
  memo = '';
  amount: any;
  balance: any = 0;
  transferFee = 0.005;
  transferForm: FormGroup;
  accountInfo;
  loading = false;
  amountErrorMessage = '';
  tempVal = '';
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private notificationService: NotificationService,
    protected errorService: ErrorService,
    private walletService: WalletService,
    private router: Router,
    public translateService: TranslateService,
    private broadcaster: Broadcaster
  ) {
  }

  ngOnInit(): void {
    this.accountInfo = this.accountService.accountInfo;
    this.buildForm();
    this.transferForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.account = data.account;
        this.amount = data.amount;
        this.memo = data.memo;
      });

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
          this.loading = false;
          if (['transfer-password-error', 'not_found_transfer_from_account',
            'not_found_transfer_to_account', 'transfer_failed'].includes(data.action)) {
            this.notificationService.error(data.message);
          } else {
            console.error(data.message);
          }
        }
      );

    this.walletService.transferDataChanged
      .pipe(
        tap(() => {
          this.loading = false;
        }),
        filter((result) => result),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
          const messages = this.translateService.instant('success');
          this.notificationService.success(messages['transfer_success']);
          this.broadcaster.broadcast('changeToTabTransactions');
          this.router.navigate(['/wallet']);
        }
      );

    this.accountService.notifyTransferDataChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe();

    // balance subscription
    this.balance = this.accountService.getBalance();
    this.accountService.balanceChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((balance: number) => (this.balance = balance));
  }

  buildForm() {
    this.transferForm = this.formBuilder.group({
      memo: new FormControl(this.memo),
      account: new FormControl('', [Validators.required]),
      amount: new FormControl(this.amount, {
        validators: [
          Validators.required,
          Validators.pattern(/^([+]?(?!00)[0-9]*\.?[0-9]{0,8})$/),
          this.validateAmount.bind(this)
        ],
        updateOn: 'change'
      }),
      password: new FormControl('', [Validators.required])
    });
  }

  validateAmount(control: FormControl) {
    const amount = control.value;
    let tmpArr;
    if (amount) {
      tmpArr = (amount + '').split('.');
    }

    if (
      amount <= 0 ||
      (tmpArr && tmpArr.length == 2 && tmpArr[1].length > 8) ||
      (tmpArr && tmpArr.length > 2)
    ) {
      return {
        invalidAmount: {
          parsedAmount: amount
        }
      };
    } else if (
      this.calcPBQ(amount) >
      this.balance - this.calcPBQ(this.transferFee)
    ) {
      const validationMessages = this.translateService.instant('error.validation');
      this.amountErrorMessage = validationMessages['ins_invalid_amount_error'];
      return {
        balanceExceeded: {
          parsedAmount: amount
        }
      };
    } else {
      this.amountErrorMessage = '';
    }
    return null;
  }

  calcPBQ(amount) {
    return amount * Math.pow(10, CoinPrecision);
  }

  validate(event: any) {
    if (event.type === 'keydown') {
      this.tempVal = event.target.value || '';
      return;
    }

    const result = ValidationService.validateDecimal(event, this.amount);

    if (!result) {
      this.amount = this.amount ? this.amount.replace(/[^0-9.]/i, '') : '';
      if (this.amount) {
        this.amount = parseFloat(this.amount);
      }
    }

    this.transferForm.patchValue({amount: this.amount});
  }

  transfer() {
    if (
      parseFloat(this.amount) <= 0 ||
      parseFloat(this.amount) > parseFloat(this.accountService.accountInfo.balance) / PBQPower
    ) {
      this.notificationService.error(
        this.errorService.getError('invalid_amount_error')
      );
      return;
    }

    if (this.accountInfo.username == this.account) {
      this.notificationService.error(
        this.errorService.getError('cant_transfer_in_same_account')
      );
      return;
    }

    this.loading = true;

    this.walletService.transfer(
      this.account,
      this.amount,
      this.memo,
      this.transferForm.value.password
    );
  }

  focusFunction() {
    this.amountErrorMessage = '';
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
