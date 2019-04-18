import { Account } from './Account';

export interface TransferOptions {
  fraction: number;
  from: Account;
  message: string;
  to: Account;
  whole: number;
}

export class Transfer {
  fraction: number;
  from: Account;
  message: string;
  to: Account;
  whole: number;

  constructor(options?: TransferOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (['from', 'to'].includes(i)) {
          this[i] = new Account(options[i]);
        } else {
          this[i] = options[i];
        }
      }
    }
  }
}
