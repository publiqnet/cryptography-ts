import { Transaction, TransactionOptions } from './Transaction';

export interface TransactionResponseOptions {
    transactions: Transaction[];
    more: number;
}

export class TransactionResponse {
    transactions: Transaction[];
    more: boolean;

    constructor(options?: TransactionResponseOptions) {
        this.transactions = options['transactions'] ? options['transactions'].map((transaction: TransactionOptions) => new Transaction(transaction)) : [];
        this.more = options['more'] ? true : false;
    }
}
