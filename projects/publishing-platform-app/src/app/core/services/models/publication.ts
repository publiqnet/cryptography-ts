import { environment } from '../../../../environments/environment';
import { Author } from './author';

export interface PublicationOptions {
  slug: string;
  title: string;
  description: string;
  cover: string;
  logo: string;
  color: string;
  memberStatus: number;
  subscribers: any;
  owner: Author;
  editors: Author[];
  contributors: Author[];
  requests: Author[];
  invitations: Author[];
}

export class Publication {
  slug: string;
  title: string;
  description: string;
  cover: string;
  logo: string;
  color: string;
  memberStatus: number;
  subscribers: any;
  owner: Author;
  editors: Author[];
  contributors: Author[];
  requests: Author[];
  invitations: Author[];
  constructor(options?: PublicationOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (['cover', 'logo'].includes(i)) {
          this[i] = (options[i] && options[i].indexOf('https://') !== 0) ? environment.backend + '/' + options[i] : options[i];
        } else {
          this[i] = options[i] ? options[i] : '';
        }
      }
    }
  }
}
