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
  subscribers: Author[];
  owner: Author;
  editors: Author[];
  contributors: Author[];
  requests: Author[];
  invitations: Author[];
  hideCover: any;
  listView: string;
  views: number;
  membersCount: number;
  subscribersCount: number;
  tags: Array<string>;
  storiesCount: number;
  members: Array<Author>;
}

export class Publication {
  slug: string;
  title: string;
  description: string;
  cover: string;
  logo: string;
  color: string;
  subscribers: Author[];
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
  status: number = 0;
  storiesCount: number = 0;
  membersList: Array<object>;
  views: number = 0;
  membersCount: number = 0;
  subscribersCount: number = 0;
  tags: Array<string>;
  members: Array<Author>;
  constructor(options?: PublicationOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (['logo', 'cover'].includes(i)) {
          this[i] = options[i] ? environment.backend + '/' + options[i] : '';
        } else if (i === 'color') {
          this[i] = options[i] ? '#' + options[i] : '';
        } else if (['subscribed'].includes(i)) {
          this['following'] = options[i];
          this[i] = options[i];
        } else if ( i == 'memberStatus') {
          this['status'] = options[i];
          this[i] = options[i];
        } else if (['editors', 'contributors', 'requests', 'invitations', 'subscribers', 'members'].includes(i)) {
          options[i] = options[i].map(
            el => new Author(el)
          );
          this[i] = options[i];
        } else if (['inviter', 'owner'].includes(i)) {
          this[i] = new Author(options[i]);
        } else if (['storiesCount'].includes(i)) {
          this[i] = options[i] ? options[i] : 0;
        } else {
          this[i] = options[i];
        }
      }
    }
  }
}
