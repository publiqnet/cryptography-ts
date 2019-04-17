import { BlockchainBlock } from './BlockchainBlock';

export interface SearchResponseOptions {
    object: any;
    type: string;
}

export class SearchResponse {
    object: any;
    type: string;

    constructor(options?: SearchResponseOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (i === 'type') {
                    if (options[i] === 'block') {
                        this.object = new BlockchainBlock(options.object);
                        this.type = options[i];
                    }
                }
            }
        }
    }
}
