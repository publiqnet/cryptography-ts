/**
 * Created by vaz on 9/19/17.
 */
import { Pbq } from './pbq/pbq';

export interface BlockOptions {
    block_number;
    block_id;
    extensions;
    miner;
    miner_signature;
    previous;
    timestamp;
    transaction_merkle_root;
    transactions;
}

export class Block {
    block_number;
    block_id;
    extensions;
    miner;
    miner_signature;
    previous;
    timestamp;
    transaction_merkle_root;
    transactions;

    constructor(options?: BlockOptions) {
        if (options.block_number) {
            this.block_number = options.block_number;
        }
        if (options.extensions) {
            this.extensions = options.extensions;
        }
        if (options.block_id) {
            this.block_id = options.block_id;
        }
        if (options.miner) {
            this.miner = options.miner;
        }
        if (options.miner_signature) {
            this.miner_signature = options.miner_signature;
        }
        if (options.previous) {
            this.previous = options.previous;
        }
        if (options.timestamp) {
            this.timestamp = options.timestamp;
        }
        if (options.transaction_merkle_root) {
            this.transaction_merkle_root = options.transaction_merkle_root;
        }
        if (options.transactions) {
            options.transactions.map((res) => {
                if (res.operations) {
                    res.operations.map((operation) => {

                        // set from and to if operation is transfer type
                        if (operation[0] === 0) {
                            operation[1].from = operation[1].memo['from'];
                            operation[1].to = operation[1].memo['to'];
                        }

                        if (operation[1].fee) {
                            operation[1].fee = new Pbq(this.parseAmountToNumber(operation[1].fee.amount));
                        }

                        if (operation[1].amount) {
                            operation[1].amount = new Pbq(this.parseAmountToNumber(operation[1].amount.amount));
                        }

                        if (operation[1].options && operation[1].options.price_per_subscribe) {
                            operation[1].options.price_per_subscribe.amount = new Pbq(this.parseAmountToNumber(operation[1].options.price_per_subscribe.amount));
                        }

                        if (operation[1].meta) {
                            operation[1].meta = JSON.parse(operation[1].meta);
                        }
                    });
                }
            });

            this.transactions = options.transactions;
        }
    }

    parseAmountToNumber(amount) {
        if (amount instanceof String && amount.indexOf('"') !== -1) {
            amount = amount.substr(1, amount.length - 2);
        }

        return amount;
    }
}
