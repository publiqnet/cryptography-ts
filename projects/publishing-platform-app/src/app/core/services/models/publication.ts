import { environment } from '../../../../environments/environment';

export interface PublicationOptions {
  slug: string;
  title: string;
  description: string;
  cover: string;
  logo: string;
  color: string;
  memberStatus: number;
  subscribed: boolean;
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
        } else {
          this[i] = options[i] ? options[i] : '';
        }
      }
    }
  }
}
