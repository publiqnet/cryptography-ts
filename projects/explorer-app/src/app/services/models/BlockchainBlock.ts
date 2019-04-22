import { Reward, RewardOptions } from './Reward';
import { Account } from './Account';
import { Transaction, TransactionOptions } from './Transaction';
import { Balance } from './Balance';
import { Transfer } from './Transfer';

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
    revordTotalAmount?: number;
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
    transfer: Transfer;
    timestamp: number;
    revordTotalAmount: number;

    constructor(options?: BlockchainBlockOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (['account'].includes(i)) {
                    this[i] = options[i] ? new Account(options[i]) : null;
                } else if (['rewards'].includes(i)) {

                    this[i] = options[i] ? options[i].map((revard: RewardOptions) => {
                        if (revard.rewardType == 'miner') {
                            this.revordTotalAmount = Number(revard.whole + '.' + revard.fraction);
                        }
                        return revard ? new Reward(revard) : null;
                    }) : null;

                } else if (['transactions'].includes(i)) {
                    this[i] = options[i] ? options[i].map((transaction: TransactionOptions) => new Transaction(transaction)) : [];
                } else if (['signTime'].includes(i)) {
                    const localDate = new Date(options[i] * 1000);
                    this[i] = new Date(localDate.valueOf() + localDate.getTimezoneOffset() * 60000);
                    this['timestamp'] = options[i];
                } else if (['size'].includes(i)) {
                    this[i] = (options[i] > 0) ? options[i] / 1024 : 0 ;
                } else if (['transfer'].includes(i)) {
                    this[i] = options[i] ? new Transfer(options[i]) : null;
                } else {
                    this[i] = options[i] ? options[i] : null;
                }
            }
        }
    }
}
