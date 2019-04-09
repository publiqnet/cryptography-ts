import { UtilsService } from 'shared-lib';

export interface AccountOptions {
  options?;
  firstName?;
  lastName?;
  registrar?;
  rights_to_publish?;
  statistics?;
  publicKey?: string;
  token?: string;
  email?: string;
  language?: string;
  loggedIn?: boolean;
  nuxEditor?: boolean;
  balance?: number;
  fraction: number;
  whole: number;
}
export class Account {
  options;
  registrar;
  rights_to_publish;
  statistics;
  language: string;
  firstName: string;
  lastName: string;
  shortName: string;
  publicKey?: string;
  token?: string;
  email?: string;
  loggedIn?: boolean;
  nuxEditor?: boolean;
  balance?: number;
  fraction: number;
  whole: number;

  constructor(options?: AccountOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (['fraction', 'whole'].includes(i)) {
          this[i] = options[i];
        } else {
          this[i] = options[i] ? options[i] : '';
        }
      }
    }

    if (this.hasOwnProperty('whole') && this.hasOwnProperty('fraction')) {
      this.balance = UtilsService.getBalanceString(this.whole, this.fraction);
    }

    this.shortName = '';
    if (this.firstName || this.lastName) {
      if (this.firstName) {
        this.shortName = this.firstName.charAt(0);
      }
      if (this.lastName) {
        this.shortName += this.lastName.charAt(0);
      }
      this.shortName = this.shortName.toUpperCase();
    }
  }
}
