export interface TransactionOptions {
    expiration?;
    extensions?;
    operation_results?;
    operations?;
    ref_block_num?;
    ref_block_prefix?;
    signatures?;
}

export class Transaction {
    expiration;
    extensions;
    operation_results;
    operations;
    ref_block_num;
    ref_block_prefix;
    signatures;

    constructor(options?: TransactionOptions) {
        if (options.expiration) {
            this.expiration = options.expiration;
        }
        if (options.extensions) {
            this.extensions = options.extensions;
        }
        if (options.operation_results) {
            this.operation_results = options.operation_results;
        }
        if (options.operations) {
            this.operations = options.operations;
        }
        if (options.ref_block_num) {
            this.ref_block_num = options.ref_block_num;
        }
        if (options.ref_block_prefix) {
            this.ref_block_prefix = options.ref_block_prefix;
        }
        if (options.signatures) {
            this.signatures = options.signatures;
        }
    }

}
