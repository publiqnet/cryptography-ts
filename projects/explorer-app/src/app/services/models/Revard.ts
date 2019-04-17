import { Account } from './Account';

export interface RevardOptions {
  account: Account;
  fraction: number;
  rewardType: string;
  whole: number;
}

export class Revard {
  account: Account;
  fraction: number;
  rewardType: string;
  whole: number;

  constructor(options?: RevardOptions) {
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
