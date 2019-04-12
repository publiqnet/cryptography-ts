
import { Pbq } from '../../pbq/pbq';
import { OperationType } from '../../shared/pipes/operation-name/operation-name.pipe';
import { UrlObject } from '../../url-object/url-object';
import isObject from 'lodash-es/isObject';

export interface TransactionEncryptedMemoOptions {
    from?;
    message?;
    nonce?;
    to?;
}

export class TransactionEncryptedMemo {
    from: string | UrlObject;
    message: string;
    nonce: string;
    to: string | UrlObject;

    constructor(options?: TransactionEncryptedMemoOptions) {
        if (options.from) {
            this.from = new UrlObject(options.from, '/block/account/');
        }
        if (options.message) {
            this.message = options.message;
        }
        if (options.nonce) {
            this.nonce = options.nonce;
        }
        if (options.to) {
            this.to = new UrlObject(options.to, '/block/account/');
        }
    }
}

export interface AccountHistoryOptions {
    id?;
    m_from_account?;
    m_operation_type?;
    m_str_description?;
    m_timestamp?;
    m_to_account?;
    m_transaction_amount?;
    m_transaction_encrypted_memo?;
    m_transaction_fee?;
}
export class AccountHistory {
    id: string;
    m_from_account;
    m_operation_type;
    m_str_description;
    m_timestamp;
    m_to_account;
    m_transaction_amount;
    m_transaction_encrypted_memo;
    m_transaction_fee;

    constructor(options?: AccountHistoryOptions) {
        if (options.id) {
            this.id = options.id;
        }
        if (options.m_from_account) {
            this.m_from_account = options.m_from_account;
        }
        if ('m_operation_type' in options) {
            this.m_operation_type = options.m_operation_type;
        }
        if (options.m_str_description) {
            this.m_str_description = options.m_str_description;
        }

        if (options.m_timestamp) {
            this.m_timestamp = options.m_timestamp;
        }

        if (options.m_to_account) {
            this.m_to_account = options.m_to_account;
        }

        if (options.m_transaction_amount) {
            this.m_transaction_amount = options.m_transaction_amount;
        }

        if (options.m_transaction_encrypted_memo) {
            if (isObject(options.m_transaction_encrypted_memo)) {
                this.m_transaction_encrypted_memo = new TransactionEncryptedMemo(options.m_transaction_encrypted_memo);
            } else {
                this.m_transaction_encrypted_memo = options.m_transaction_encrypted_memo;
            }
        }

        if (options.m_transaction_fee) {
            this.m_transaction_fee = options.m_transaction_fee;
        }

        if (options.m_transaction_amount) {
            options.m_transaction_amount.amount = new Pbq(this.parseAmountToNumber(options.m_transaction_amount.amount));
        }
        if (options.m_transaction_fee) {
            options.m_transaction_fee.amount = new Pbq(this.parseAmountToNumber(options.m_transaction_fee.amount));
        }

        switch (options.m_operation_type) {
            case OperationType.transfer:
                if (options.m_from_account) {
                    this.m_from_account = new UrlObject(options.m_from_account, '/block/account/');
                }
                if (options.m_to_account) {
                    this.m_to_account = new UrlObject(options.m_to_account, '/block/account/');
                }
                break;
            case OperationType.account_create:
                if (options.m_from_account) {
                    this.m_from_account = new UrlObject(options.m_from_account, '/block/account/');
                }
                if (options.m_to_account) {
                    this.m_to_account = new UrlObject(options.m_to_account, '/block/account/');
                }
                break;
            case OperationType.content_submit:
            case OperationType.content_submit_second:
            case OperationType.content_buy:
            case OperationType.content_rate:
            case OperationType.subscription:
                break;
        }
    }

    parseAmountToNumber(amount) {
        if (amount instanceof String && amount.indexOf('"') !== -1) {
            amount = amount.substr(1, amount.length - 2);
        }

        return amount;
    }
}
