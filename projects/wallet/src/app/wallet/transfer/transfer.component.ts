import { Component, Inject, isDevMode, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CoinPrecision, WalletService } from '../../core/services/wallet.service';
// import { CoinPrecision } from '../../core/services/wallet.service';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { DialogService } from '../../core/services/dialog.service';
import { ValidationService } from '../../core/validator/validator.service';
import { CryptService } from '../../core/services/crypt.service';
import { UtilsService } from 'shared-lib';
// import { WsService } from '../../core/services/ws.service';


@Component({
    selector: 'app-transfer',
    templateUrl: './transfer.component.html',
    styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit, OnDestroy {
    public_key = '';
    memo = '';
    amount: any;
    balance: any = 0;
    transferFee = 0.01;
    public transferForm: FormGroup;
    public accountInfo;
    public loading = false;
    amountErrorMessage = '';
    globalProperties;

    private balanceSubscription: Subscription;
    private transferSubscription: Subscription;
    private errorEventEmiterSubscription: Subscription;
    private globalPropertiesSubscription: Subscription;

    constructor(private formBuilder: FormBuilder,
                private accountService: AccountService,
                private notificationService: NotificationService,
                protected errorService: ErrorService,
                private walletService: WalletService,
                private cryptService: CryptService,
                private router: Router,
                @Inject(PLATFORM_ID) private platformId: Object,
                private dialogService: DialogService) {
    }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            // this.accountService.loadBalance();

            this.accountInfo = this.accountService.accountInfo;
            this.buildForm();
            this.transferForm.valueChanges.subscribe(data => {
                this.public_key = data.public_key;
                this.amount = data.amount;
                this.memo = data.memo;
            });

            this.errorEventEmiterSubscription = this.errorService.errorEventEmiter.subscribe((data: ErrorEvent) => {
                if (data.action === 'transfer-password-error') {
                    this.loading = false;
                    this.notificationService.error(data.message);
                } else if (data.action === 'need_private_key') {
                    this.loading = false;
                    console.log(data.message);
                } else if (data.action === 'transfer_failed') {
                    this.loading = false;
                    this.notificationService.error(data.message);
                } else if (data.action === 'notifyInTransfer') {
                    this.loading = false;
                    console.log(data.message);
                } else if (data.action === 'load_balance_error') {
                    console.log('load_balance_error----', data.message);
                } else if (data.action === 'load_global_error') {
                    console.log('load_global_error----', data.message);
                } else if (data.action === 'loadRpcAccount') {
                    this.loading = false;
                    console.log('loadRpcAccount----', data.message);
                }
            });

            // this.transferSubscription = this.walletService.transferDataChanged.subscribe(data => {
            //     this.loading = false;
            //     this.notificationService.success('The transaction was successful');
            //     this.router.navigate(['/wallet/transactions']);
            // });

            // balance subscription
            // this.balance = this.accountService.getBalance();
            // this.balanceSubscription = this.accountService.balanceChanged.subscribe((balance: number) => (this.balance = balance));
            //
            // this.globalProperties = this.accountService.getGlobalProperties();
            // if (!this.globalProperties) {
            //     if (this.wsService.isWsConnectedData) {
            //         this.accountService.loadGlobalProperties();
            //     }
            // } else {
            //     this.transferFee = this.calcTransferPBQFee();
            // }
            //
            // this.globalPropertiesSubscription = this.accountService.globalPropertiesChanged.subscribe(data => {
            //     this.globalProperties = data;
            //     this.transferFee = this.calcTransferPBQFee();
            // });
        }

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

          // const comparedData = this.cryptService.compareCoins(this.accountService.accountInfo.balance - this.transferFee, amount);
          // debugger;
          // if ([0, 1].includes(comparedData)) {
          //   console.log(comparedData);
          // } else {
          //   return {
          //     invalidAmount: {
          //       parsedAmount: amount
          //     }
          //   };
          // }
        }
        // console.log(amountData, this.accountService.accountInfo.balance);


        // let tmpArr;
        // if (amount) {
        //     tmpArr = amount.split('.');
        // }
        //
        // if (amount <= 0 || (tmpArr && tmpArr.length == 2 && tmpArr[1].length > 8) || (tmpArr && tmpArr.length > 2)) {
        //     return {
        //         invalidAmount: {
        //             parsedAmount: amount
        //         }
        //     };
        // } else if (this.calcPBQ(amount) > this.balance - this.calcPBQ(this.transferFee)) {
        //     this.amountErrorMessage = this.errorService.getError('ins_invalid_amount_error');
        //     return {
        //         balanceExceeded: {
        //             parsedAmount: amount
        //         }
        //     };
        // } else {
        //     this.amountErrorMessage = '';
        // }
        return null;
    }

    validate(event: any) {
        ValidationService.decimal(event, this.transferForm.value.amount);

        if (this.transferForm.valid && (event.code === 'Enter' || event.code === 'NumpadEnter')) {
            this.openConfirmDialog();
        }
    }

    validateMemoText(event: any) {
        if (event.type === 'paste') {
            const value = event.clipboardData.getData('Text');
            if ((this.memo +  value).length > 200) {
                this.transferForm.value.memo = this.memo = (this.memo +  value).substr(0, 200);
                event.preventDefault();
            }
        }
        if (this.memo.length >= 200) {
            event.preventDefault();
        }
    }

    focusFunction() {
        this.amountErrorMessage = '';
    }

    transfer() {
        if (UtilsService.calcAmount(this.amount) <= 0 || UtilsService.calcAmount(this.amount) > (UtilsService.calcAmount(this.accountService.accountInfo.balance) - UtilsService.calcAmount(this.transferFee))) {
            this.notificationService.error(this.errorService.getError('invalid_amount_error'));
            return;
        }
        if (this.accountService.accountInfo.publicKey == this.public_key) {
            this.notificationService.error(this.errorService.getError('cant_transfer_in_same_account'));
            return;
        }

        this.loading = true;

        this.walletService.transfer(this.public_key, this.amount, this.memo)
          .subscribe(data => {
            const isValidData = this.cryptService.checkBlockChainResponse(data);
            if (isValidData.success) {
                this.loading = false;
                this.notificationService.success('The transaction was successful');
                this.router.navigate(['/wallet/transactions']);
            } else {
                this.errorService.handleError('transfer_failed', {status: 409, error: {message: 'transfer_failed'}});
            }
          }, error => {
            console.log('error', error);
          });
    }

    calcPBQ(amount) {
        return amount * Math.pow(10, CoinPrecision);
    }

    calcTransferPBQFee() {
        // const feeParameters = this.globalProperties.parameters;
        // const fee = (feeParameters &&
        //     feeParameters.current_fees &&
        //     feeParameters.current_fees.parameters &&
        //     feeParameters.current_fees.parameters[0] &&
        //     feeParameters.current_fees.parameters[0][1] &&
        //     feeParameters.current_fees.parameters[0][1].fee) ?
        //     feeParameters.current_fees.parameters[0][1].fee : 1000000;
        // return fee / Math.pow(10, CoinPrecision);
    }

    openConfirmDialog() {
        const message = `
            <div class="pbq-div">Are you sure you want to make this transaction?</div>
            <div class="pbq-divs"> <span>PBQ Amount: </span><span>${this.amount}</span> </div>
            <div class="pbq-divs"> <span>Recipient Public Key: </span><span>${this.public_key}</span></div>
            <div class="pbq-divs"> <span>Transaction Fee: </span><span>${this.transferFee} PBQ</span></div>
        `;
        this.dialogService.openConfirmDialog('transfer-confirmation', 'Confirm Your Transfer', message, {}).subscribe(data => {
            if (data) {
                this.transfer();
            }
        });
    }

    ngOnDestroy() {
        // if (isPlatformBrowser(this.platformId)) {
        //     this.transferSubscription.unsubscribe();
        //     this.balanceSubscription.unsubscribe();
        //     this.errorEventEmiterSubscription.unsubscribe();
        //     this.globalPropertiesSubscription.unsubscribe();
        // }
    }
}
