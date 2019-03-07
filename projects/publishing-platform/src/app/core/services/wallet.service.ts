import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Aes, Apis, ChainStore, FetchChain, key, PrivateKey, TransactionBuilder, TransactionHelper } from 'arcnet-js';

import { TransactionDetailObject } from '../models/classes';
import { Account } from './models/account';
import { CryptService } from './crypt.service';
import { AccountService } from './account.service';
import { ErrorService } from './error.service';
import { environment } from '../../../environments/environment';
import { HttpRpcService } from './httpRpc.service';


export const CoinName = 'PBQ';
export const CoinPrecision = 8;

@Injectable()
export class WalletService {
    public api;

    account = new Subject<Account>();
    private transactions: TransactionDetailObject[] = [];
    transactionsChanged = new Subject<TransactionDetailObject[]>();
    transferData;
    transferDataChanged = new Subject<any>();
    currentDaemonAddress = '';

    tabs = {
        'receive': 0,
        'transfer': 1,
        'transaction': 2,
        'security': 3
    };
    selectedTabIndex = this.tabs.receive;

    constructor(
        private httpRpcService: HttpRpcService,
        @Inject(PLATFORM_ID) private platformId: Object,
        private accountService: AccountService,
        private errorService: ErrorService
    ) {

    }

    initExternalWsService(daemonAddress = environment.daemon_address_first) {
        if (!Apis.inst || !this.api) {
            this.currentDaemonAddress = daemonAddress;
            try {
                this.api = Apis.instance(daemonAddress, true).init_promise
                    .then(res => {
                        // success
                    }, error => {
                        // error
                    });
            } catch (error) {
                console.log('WalletService init_promise error - ', error);
                return;
            }
        }
    }

    destroyExternalWsService() {
        Apis.close();
        this.api = '';
    }

    getTransactions(): TransactionDetailObject[] {
        return this.transactions.slice();
    }

    loadTransactions(accountId: string, from_date, to_date, blockId: string, limit: number): void {
        if (isPlatformBrowser(this.platformId)) {
            this.httpRpcService
                .call({
                    params: [
                        0,
                        'search_account_history',
                        [accountId, '-time', blockId, limit, from_date, to_date]
                    ]
                })
                .pipe(
                    map(transactions => transactions &&
                        transactions.map(transaction => new TransactionDetailObject(transaction))
                    )
                )
                .subscribe(transactions => {
                    if (transactions) {
                        // convert to objects
                        transactions.forEach((etr: TransactionDetailObject) => {
                            if (etr.m_timestamp.slice(-1) !== 'Z') {
                                etr.m_timestamp = etr.m_timestamp + 'Z';
                            }
                        });
                    }

                    this.transactions = transactions;
                    this.transactionsChanged.next(this.transactions.slice());
                });
        }
    }

    transfer(
        account: string,
        amount: number,
        memo: string,
        password: string
    ): void {
        if (isPlatformBrowser(this.platformId)) {
            this.initExternalWsService();
            try {
                CryptService.brainKeyDecrypt(
                    this.accountService.brainKeyEncrypted,
                    password
                ).subscribe(
                    brainKey => {
                        this.accountService.accountInfo.pKey = key.get_brainPrivateKey(brainKey).toWif();

                        // check private key
                        if (!this.accountService.accountInfo.pKey) {
                            this.errorService.handleError('need_private_key', {
                                status: 409,
                                error: {message: 'need_private_key'}
                            });
                            return;
                        }

                        const pKey = PrivateKey.fromWif(this.accountService.accountInfo.pKey);
                        memo = memo ? memo : '';

                        this.api
                            .then(
                                apiRes => {
                                    ChainStore.init()
                                        .then(() => {
                                            const memoSender = this.accountService.accountInfo.username;
                                            // add precision
                                            amount = Math.floor(amount * Math.pow(10, CoinPrecision));
                                            const sendAmount = {amount, asset: CoinName};
                                            Promise.all([
                                                FetchChain('getAccount', this.accountService.accountInfo),
                                                FetchChain('getAccount', account),
                                                FetchChain('getAccount', memoSender),
                                                FetchChain('getAsset', sendAmount.asset),
                                                FetchChain('getAsset', sendAmount.asset)
                                            ])
                                                .then(res => {
                                                    const [
                                                        fAccount,
                                                        tAccount,
                                                        memoSenderAc,
                                                        sendAsset,
                                                        feeAsset
                                                    ] = res;
                                                    if (!fAccount) {
                                                        this.errorService.handleError(
                                                            'not_found_transfer_from_account',
                                                            {
                                                                status: 409,
                                                                error: {message: 'not_found_transfer_from_account'}
                                                            }
                                                        );
                                                        return;
                                                    }
                                                    if (!tAccount) {
                                                        this.errorService.handleError(
                                                            'not_found_transfer_to_account',
                                                            {
                                                                status: 409,
                                                                error: {message: 'not_found_transfer_to_account'}
                                                            }
                                                        );
                                                        return;
                                                    }
                                                    // Memos are optional, but if you have one you need to encrypt it here
                                                    // const memoFromKey = memoSenderAc.get("options").get("memo_key");
                                                    const memoFromKey = memoSenderAc
                                                        .get('owner')
                                                        .get('key_auths')
                                                        .get(0)
                                                        .get(0);
                                                    const memoToKey = tAccount
                                                        .get('owner')
                                                        .get('key_auths')
                                                        .get(0)
                                                        .get(0);
                                                    // const toMemoKey = tAccount.get('options').get('memo_key');
                                                    const nonce = TransactionHelper.unique_nonce_uint64();
                                                    const memo_object = {
                                                        from: memoFromKey,
                                                        to: memoToKey,
                                                        nonce,
                                                        message: Aes.encrypt_with_checksum(
                                                            pKey,
                                                            memoToKey,
                                                            nonce,
                                                            memo
                                                        )
                                                    };
                                                    const tr = new TransactionBuilder();
                                                    tr.add_type_operation('transfer', {
                                                        fee: {
                                                            amount: 0,
                                                            asset_id: feeAsset.get('id')
                                                        },
                                                        from: fAccount.get('id'),
                                                        to: tAccount.get('id'),
                                                        amount: {
                                                            amount: sendAmount.amount,
                                                            asset_id: sendAsset.get('id')
                                                        },
                                                        memo: memo_object
                                                    });
                                                    tr.set_required_fees().then(() => {
                                                        tr.add_signer(
                                                            pKey,
                                                            pKey.toPublicKey().toPublicKeyString()
                                                        );
                                                        tr.broadcast(() => {
                                                            this.accountService.loadBalance();
                                                            this.accountService.notifyInTransfer(account);
                                                            this.transferData = true;
                                                            this.transferDataChanged.next(this.transferData);
                                                        });
                                                    });
                                                })
                                                .catch(reason => {
                                                    this.destroyExternalWsService();
                                                    this.errorService.handleError('transfer_failed', {
                                                        status: 409,
                                                        error: {message: 'transfer_failed'}
                                                    });
                                                    return;
                                                });
                                        })
                                        .catch(reason => {
                                            this.destroyExternalWsService();
                                            if (environment.daemon_address_second != this.currentDaemonAddress) {
                                                this.initExternalWsService(environment.daemon_address_second);
                                                this.transfer(account, amount, memo, password);
                                            } else {
                                                this.errorService.handleError('transfer_failed', {
                                                    status: 409,
                                                    error: {message: 'transfer_failed'}
                                                });
                                                return;
                                            }
                                        });
                                })
                            .catch(reason => {
                                this.errorService.handleError('transfer_failed', {
                                    status: 409,
                                    error: {message: 'transfer_failed'}
                                });
                                return;
                            });
                    },
                    err => {
                        this.initExternalWsService(environment.daemon_address_second); //
                        this.errorService.handleError('transfer-password-error', {
                            status: 409,
                            error: {message: 'password_error'}
                        });
                    }
                );
            } catch (MalformedURLException) {
                this.destroyExternalWsService();
                console.log('MalformedURLException');
                this.errorService.handleError('transfer_failed', {
                    status: 409,
                    error: {message: 'transfer_failed'}
                });
                return;
            }
        }
    }
}
