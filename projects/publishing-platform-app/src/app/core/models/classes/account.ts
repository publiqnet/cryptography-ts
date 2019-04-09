import { Subject } from 'rxjs';

export interface IAccount {
  id?: string;
  username?: string;
  pubKey?: string;
  passwordHint?: string;
  brainKey?: string;
  recoveryPhraseSeen?: boolean;
  recoveryPhrase?: string;
  token?: string;
  password?: string;
  email?: string;
  loggedIn?: boolean;
  isRecoveryPhraseSaved?: boolean;
  balance?: Subject<number>;
}

export class Account implements IAccount {
  id: string;
  username: string;
  pubKey: string;
  passwordHint: string;
  brainKey: string;
  recoveryPhraseSeen: boolean;
  recoveryPhrase: string;
  token: string;
  password: string;
  email: string;
  loggedIn: boolean;
  isRecoveryPhraseSaved: boolean;
  balance = new Subject<number>();

  constructor(account?: IAccount) {
    if (account) {
      this.update(account);
    }
  }

  update(account: IAccount) {
    Object.assign(this, account);
  }
}
