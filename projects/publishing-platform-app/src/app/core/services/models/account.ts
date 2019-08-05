import { UtilsService } from 'shared-lib';
import { environment } from '../../../../environments/environment';

export interface AccountOptions {
  options?;
  firstName?;
  lastName?;
  shortName: string;
  fullName: string;
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
  fraction?: number;
  whole?: number;
  memberStatus?: number;
  image?: string;
  subscribersCount?: number;
  rating?: number;
  views?: number;
  articlesCount?: number;
  isSubscribed?;
  listView?: boolean;
  bio?: string;
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
  fullName: string;
  publicKey?: string;
  token?: string;
  email?: string;
  loggedIn?: boolean;
  nuxEditor?: boolean;
  balance?: number;
  fraction?: number;
  whole?: number;
  memberStatus?: number;
  image?: string;
  subscribersCount?: number;
  rating?: number;
  views?: number;
  articlesCount?: number;
  isSubscribed?;
  listView?: boolean;
  bio?: string;

  constructor(options?: AccountOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (['fraction', 'whole'].includes(i)) {
          this[i] = options[i];
        } else if (i === 'image') {
          this[i] = options[i] ? environment.backend + '/' + options[i] : '';
        } else if (i === 'listView') {
          this[i] = !!options[i];
        } else {
          this[i] = options[i];
        }
      }
    }

    if (this.hasOwnProperty('whole') && this.hasOwnProperty('fraction')) {
      this.balance = UtilsService.calculateBalance(this.whole, this.fraction);
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

    this.fullName = '';
    if (this.firstName && this.lastName) {
      this.fullName = this.firstName + ' ' + this.lastName;
    } else if (!this.firstName && !this.lastName) {
      this.fullName = '';
    } else {
      this.fullName = (this.firstName ? this.firstName : '') + ' ' + (this.lastName ? this.lastName : '');
      this.fullName.trim();
    }

  }
}
