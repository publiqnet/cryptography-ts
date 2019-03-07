import { Subject } from 'rxjs';

export interface AccountOptions {
  id?;
  name?;
  options?;
  meta?;
  owner?;
  registrar?;
  rights_to_publish?;
  statistics?;
  top_n_control_flags?;
  username?: string;
  pKey?: string;
  pubKey?: string;
  passwordHint?: string;
  brainKey?: string;
  recoveryPhraseSeen?: boolean;
  recoveryPhrase?: string;
  token?: string;
  password?: string;
  email?: string;
  language?: string;
  loggedIn?: boolean;
  isRecoveryPhraseSaved?: boolean;
  balance?: Subject<number>;
}
export class Account {
  id: string;
  name: string;
  meta: any;
  options;
  owner;
  registrar;
  rights_to_publish;
  statistics;
  top_n_control_flags;
  language: string;

  firstName: string;
  lastName: string;

  shortName: string;
  username?: string;
  pKey?: string;
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

  constructor(options?: AccountOptions) {
    if (options.id) {
      this.id = options.id;
    }
    if (options.name) {
      this.name = options.name;
    }
    if (options.options) {
      this.options = options.options;
    }
    if (options.owner) {
      this.owner = options.owner;
    }

    if (options.meta) {
      this.meta =
        options.meta && this.IsJsonString(options.meta)
          ? JSON.parse(options.meta)
          : options.meta;
    }

    if (options.registrar) {
      this.registrar = options.registrar;
    }

    if (options.rights_to_publish) {
      this.rights_to_publish = options.rights_to_publish;
    }

    if (options.statistics) {
      this.statistics = options.statistics;
    }

    if (options.top_n_control_flags) {
      this.top_n_control_flags = options.top_n_control_flags;
    }

    this.language = options && options.language ? options.language : '';

    if (this.meta != undefined) {
      this.firstName = this.meta.first_name;
      this.lastName = this.meta.last_name;
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

  IsJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
