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
  hideCover: any;
  listView: string;
}

export class Publication {
  slug: string;
  title: string;
  description: string;
  cover: string;
  logo: string;
  color: string;
  subscribers: number;
  memberStatus: number;
  subscribed: boolean;
  following: boolean;
  owner: Author;
  editors: Author[];
  contributors: Author[];
  requests: Author[];
  invitations: Author[];
  hideCover: any;
  listView: any;
  inviter: object;
  // TODO: Add `status` parameter to backend response
  status: number = 0;
  storiesCount: number;
  membersList: Array<object>;

  constructor(options?: PublicationOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (['logo', 'cover'].includes(i)) {
          this[i] = options[i] ? environment.backend + '/' + options[i] : '';
        } else if (i === 'color') {
          this[i] = options[i] ? '#' + options[i] : '';
        } else if (['memberStatus', 'subscribed'].includes(i)) {
          this['following'] = options[i];
          this[i] = options[i];
        } else if (i == 'editors') {
          options[i] = options[i].map(
            el => new Author(el)
          );
          this[i] = options[i];
        } else {
          this[i] = options[i] ? options[i] : '';
        }
      }
    }
  }
}
