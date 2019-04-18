import { Transfer } from './Transfer';

export interface TransactionOptions {
  feeFraction: number;
  feeWhole: number;
  timeSigned: any;
  transactionHash: string;
  transactionSize: number;
  timestamp?: any;
  block: any;
  content: any;
  contentUnit: any;
  file: any;
  transfer: Transfer;
}

export class Transaction {
  feeFraction: number;
  feeWhole: number;
  timeSigned: any;
  transactionHash: string;
  transactionSize: number;
  timestamp?: any;
  block: any;
  content: any;
  contentUnit: any;
  file: any;
  transfer: Transfer;


  constructor(options?: TransactionOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (i === 'timeSigned') {
          const localDate: any = new Date(options[i] * 1000);
          this[i] = new Date(localDate.valueOf() + localDate.getTimezoneOffset() * 60000);
          this['timestamp'] = options[i];
        } else if (['transfer'].includes(i)) {
          this[i] = options[i] ? new Transfer(options[i]) : null;
        } else if (['transactionSize'].includes(i)) {
          this[i] = (options[i] > 0) ? options[i] / 1024 : 0;
        } else {
          this[i] = options[i];
        }
      }
    }
  }
}
