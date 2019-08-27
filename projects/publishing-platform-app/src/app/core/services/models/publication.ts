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
  // TODO: Add `status` parameter to backend response
  status: number = 0;
  storiesCount: number;
  membersList: Array<object>;
  views: number = 0;
  membersCount: number = 0;
  subscribersCount: number = 0;
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
        } else if (['editors', 'contributors', 'requests', 'invitations', 'subscirbers'].includes(i)) {
          options[i] = options[i].map(
            el => new Author(el)
          );
          this[i] = options[i];
        } else if (['inviter', 'owner'].includes(i)) {
          this[i] =  new Author(options[i]);
        } else {
          this[i] = options[i];
        }
      }
    }
  }
}
