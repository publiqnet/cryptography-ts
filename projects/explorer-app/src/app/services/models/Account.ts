import { Balance } from './Balance';
import { UtilsService } from 'shared-lib';

export interface AccountOptions {
  address: string;
  whole: number;
  fraction: number;
  balance: number;
  moreRewards?: number;
  moreTransactions?: number;
  transactions: any[];
  rewards: any[];
  initialReward?: Balance;
  minerReward: Balance;
  feeReward: Balance;
}

export class Account {
  address: string;
  whole: number;
  fraction: number;
  balance: number;
  moreRewards?: number;
  moreTransactions?: number;
  transactions: any[];
  rewards: any[];
  initialReward?: Balance;
  minerReward: Balance;
  feeReward: Balance;

  constructor(options?: AccountOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (['initialReward', 'feeReward', 'feeReward'].includes(i)) {
          this[i] = new Balance(options[i]);
        } else {
          this[i] = options[i];
        }
      }
    }

    if (this.hasOwnProperty('whole') && this.hasOwnProperty('fraction')) {
      this.balance = UtilsService.calculateBalance(this.whole, this.fraction);
    }
  }
}
