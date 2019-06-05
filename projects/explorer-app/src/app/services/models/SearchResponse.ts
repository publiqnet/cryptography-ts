import { BlockchainBlock } from './BlockchainBlock';
import { Transaction } from './Transaction';
import { Account } from './Account';

export interface SearchResponseOptions {
    object: any;
    type: any;
}

export class SearchResponse {
    object: any;
    type: any;

    constructor(options?: SearchResponseOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (i === 'type') {
                    if (options[i] === 'block') {
                        this.object = new BlockchainBlock(options.object);
                        this.type = options[i];
                    } else if (options[i] === 'transaction') {
                        this.object = new Transaction(options.object);
                        this.type = options[i];
                    } else if (options[i] === 'account') {
                        this.object = new Account(options.object);
                        this.type = options[i];
                    }
                }
            }
        }
    }
}
