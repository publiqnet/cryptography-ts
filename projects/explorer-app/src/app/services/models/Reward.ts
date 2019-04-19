import { Account } from './Account';

export interface RewardOptions {
  account: Account;
  fraction: number;
  rewardType: string;
  whole: number;
}

export class Reward {
  account: Account;
  fraction: number;
  rewardType: string;
  whole: number;

  constructor(options?: RewardOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (['account'].includes(i)) {
          this[i] = options[i] ? new Account(options[i]) : null;
        } else {
          this[i] = options[i];
        }
      }
    }
  }
}
