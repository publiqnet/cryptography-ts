import { Transfer } from './Transfer';
import { Block } from './block';
import { Balance } from './Balance';

export interface TransactionOptions {
  feeFraction?: number;
  feeWhole?: number;
  timeSigned: any;
  transactionHash: string;
  transactionSize: number;
  timestamp?: any;
  block: Block;
  content: any;
  contentUnit: any;
  file: any;
  transfer: Transfer;
  isConfirmed: boolean;
  feeAmount?: Balance;
}

export class Transaction {
  feeFraction?: number;
  feeWhole?: number;
  timeSigned: any;
  transactionHash: string;
  transactionSize: number;
  timestamp?: any;
  block: Block;
  content: any;
  contentUnit: any;
  file: any;
  transfer: Transfer;
  isConfirmed: boolean;
  feeAmount?: Balance;


  constructor(options?: TransactionOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (i === 'timeSigned') {
          const localDate: any = new Date(options[i] * 1000);
          this[i] = new Date(localDate.valueOf() + localDate.getTimezoneOffset() * 60000);
          this['timestamp'] = options[i];
        } else if (['transfer'].includes(i)) {
          this[i] = options[i] ? new Transfer(options[i]) : null;
        } else if (['block'].includes(i)) {
          this[i] = options[i] ? new Block(options[i]) : null;
        } else if (['transactionSize'].includes(i)) {
          this[i] = (options[i] > 0) ? options[i] / 1024 : 0;
        } else {
          this[i] = options[i];
        }
      }
    }

    if (this.hasOwnProperty('feeWhole') && this.hasOwnProperty('feeFraction')) {
      this.feeAmount = new Balance({'whole': this.feeWhole, 'fraction': this.feeFraction});
    }
    this.isConfirmed = (this.block && this.block.hash) ? true : false;
  }
}
