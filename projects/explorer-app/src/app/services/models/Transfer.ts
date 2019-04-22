import { Account } from './Account';
import { Balance } from './Balance';

export interface TransferOptions {
  fraction?: number;
  from: Account;
  message: string;
  to: Account;
  whole?: number;
  amount?: Balance;
}

export class Transfer {
  fraction?: number;
  from: Account;
  message: string;
  to: Account;
  whole: number;
  amount?: Balance;

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

    if (this.hasOwnProperty('whole') && this.hasOwnProperty('fraction')) {
      this.amount = new Balance({'whole': this.whole, 'fraction': this.fraction});
    }
  }
}
