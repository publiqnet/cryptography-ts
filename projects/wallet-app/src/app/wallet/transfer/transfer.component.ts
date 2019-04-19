import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import PubliqNotEnoughBalance from 'blockchain-models-ts/bin/models/PubliqNotEnoughBalance';

import { AccountService } from '../../core/services/account.service';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { CoinPrecision, WalletService } from '../../core/services/wallet.service';
import { DialogService } from '../../core/services/dialog.service';
import { ValidationService } from '../../core/validator/validator.service';
import { CryptService } from '../../core/services/crypt.service';
import { UtilsService } from 'shared-lib';
import { Account } from '../../core/services/models/account';


@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit, OnDestroy {
  public_key = '';
  memo = '';
  messageLength = 80;
  amount: any;
  balance: any = 0;
  transferFee = 0;
  public transferForm: FormGroup;
  public accountInfo: Account;
  public loading = false;
  amountErrorMessage = '';
  receiveTab = true;
  transferTab = false;
  @ViewChild('accordionTab') accordionTabRef: ElementRef;
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private formBuilder: FormBuilder,
              private accountService: AccountService,
              private notificationService: NotificationService,
              protected errorService: ErrorService,
              private walletService: WalletService,
              private cryptService: CryptService,
              private dialogService: DialogService) {
  }

  ngOnInit(): void {
    this.accountInfo = this.accountService.accountInfo;
    this.buildForm();
    this.transferForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.public_key = data.public_key;
        this.amount = data.amount;
        this.memo = data.memo;
      });

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
        if (['transfer-password-error', 'need_private_key', 'transfer_failed',
          'notifyInTransfer', 'load_balance_error', 'load_global_error', 'loadRpcAccount', 'your_balance_is_not_enough'].includes(data.action)) {
          this.loading = false;
          this.notificationService.error(data.message);
        }
      });
  }

  buildForm() {
    this.transferForm = this.formBuilder.group({
      'memo': new FormControl(this.memo),
      'public_key': new FormControl('', [Validators.required]),
      'amount': new FormControl(this.amount, {
        validators: [
          Validators.required,
          Validators.pattern(/^([0-9]+\.?[0-9]{0,8})$/),
          this.validateAmount.bind(this),
        ],
        updateOn: 'change'
      })
    });
  }

  onActiveAccordion() {
    this.receiveTab = !this.receiveTab;
    this.transferTab = false;
  }

  onActiveAccordion1() {
    this.receiveTab = false;
    this.transferTab = !this.transferTab;
    this.accordionTabRef.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });

  }

  validateAmount(control: FormControl) {
    const amount = control.value;
    if (amount) {
      if (amount <= 0) {
        return {
          invalidAmount: {
            parsedAmount: amount
          }
        };
      } else if (UtilsService.calcAmount(amount) > (UtilsService.calcAmount(this.accountService.accountInfo.balance) - UtilsService.calcAmount(this.transferFee))) {
        this.amountErrorMessage = this.errorService.getError('ins_invalid_amount_error');
        return {
          invalidAmount: {
            parsedAmount: amount
          }
        };
      } else {
        this.amountErrorMessage = '';
      }
    }
    return null;
  }

  validate(event: any) {
    ValidationService.decimal(event, this.transferForm.value.amount);

    if (this.transferForm.valid && (event.code === 'Enter' || event.code === 'NumpadEnter')) {
      this.onSubmit();
    }
  }

  validateMemoText(event: any) {
    if (event.type === 'paste') {
      const value = event.clipboardData.getData('Text');
      if ((this.memo + value).length > this.messageLength) {
        this.transferForm.value.memo = this.memo = (this.memo + value).substr(0, this.messageLength);
        event.preventDefault();
      }
    }
    if (this.memo.length >= this.messageLength) {
      event.preventDefault();
    }
  }

  focusFunction() {
    this.amountErrorMessage = '';
  }

  transfer() {
    if (UtilsService.calcAmount(this.amount) <= 0 || UtilsService.calcAmount(this.amount) >
      (UtilsService.calcAmount(this.accountService.accountInfo.balance) - UtilsService.calcAmount(this.transferFee))) {
      this.notificationService.error(this.errorService.getError('invalid_amount_error'));
      return;
    }
    if (this.accountService.accountInfo.publicKey == this.public_key) {
      this.notificationService.error(this.errorService.getError('cant_transfer_in_same_account'));
      return;
    }

    this.loading = true;

    this.walletService.transfer(this.public_key, this.amount, this.memo)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        const isValidData = this.cryptService.checkBlockChainResponse(data);
        if (isValidData.success) {
          this.loading = false;
          this.notificationService.success('The transaction was successful');
          this.transferTab = false;
        } else {
          if (isValidData.data instanceof PubliqNotEnoughBalance) {
            this.errorService.handleError('your_balance_is_not_enough', {status: 409, error: {message: 'your_balance_is_not_enough'}});
          } else {
            this.errorService.handleError('transfer_failed', {status: 409, error: {message: 'transfer_failed'}});
          }
        }
      }, error => {
        console.log('error', error);
      });
  }

  onSubmit() {
    const message = `
            <div class="pbq-divs address"> <span>Recipient address: </span><span>${this.public_key}</span></div>
            <div class="pbq-divs short"> <span>Amount: </span><span>${this.amount} PBQ</span></div>
            <div class="pbq-divs short"> <span>Transaction fee: </span><span>${this.transferFee} PBQ</span></div>
            <div class="pbq-divs"> <span>Message: </span><span>${this.memo}</span></div>
        `;
    this.dialogService.openConfirmDialog('transfer-confirmation', 'Confirm Your Transfer', message, {})
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        if (data) {
          this.transfer();
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
