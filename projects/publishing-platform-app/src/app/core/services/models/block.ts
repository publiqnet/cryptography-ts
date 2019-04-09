export interface BlockOptions {
  block_number;
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
      this.transactions = options.transactions;
    }
  }
}
