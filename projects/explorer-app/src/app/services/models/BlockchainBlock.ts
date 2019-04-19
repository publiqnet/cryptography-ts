import { Reward, RewardOptions } from './Reward';
import { Account } from './Account';
import { Transaction, TransactionOptions } from './Transaction';

export interface BlockchainBlockOptions {
    account: Account;
    confirmationsCount: number;
    fee: {whole: number, fraction: number};
    hash: string;
    number: number;
    previousBlockHash: string;
    rewards: Reward[];
    signTime: number;
    size: number;
    transactions: Transaction[];
    transactionsCount: number;
    transfer: {whole: number, fraction: number};
    timestamp: number;
}

export class BlockchainBlock {
    account: Account;
    confirmationsCount: number;
    fee: {whole: number, fraction: number};
    hash: string;
    number: number;
    previousBlockHash: string;
    rewards: Reward[];
    signTime: number;
    size: number;
    transactions: Transaction[];
    transactionsCount: number;
    transfer: {whole: number, fraction: number};
    timestamp: number;

    constructor(options?: BlockchainBlockOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (['account'].includes(i)) {
                    this[i] = options[i] ? new Account(options[i]) : null;
                } else if (['rewards'].includes(i)) {
                    this[i] = options[i] ? options[i].map((revard: RewardOptions) => new Reward(revard)) : '';
                } else if (['transactions'].includes(i)) {
                    this[i] = options[i] ? options[i].map((transaction: TransactionOptions) => new Transaction(transaction)) : [];
                } else if (['signTime'].includes(i)) {
                    const localDate = new Date(options[i] * 1000);
                    this[i] = new Date(localDate.valueOf() + localDate.getTimezoneOffset() * 60000);
                    this['timestamp'] = options[i];
                } else if (['size'].includes(i)) {
                    this[i] = (options[i] > 0) ? options[i] / 1024 : 0 ;
                } else {
                    this[i] = options[i] ? options[i] : null;
                }
            }
        }
    }
}
