import { Publication, PublicationOptions } from './publication';

export interface IPublications {
  owned?: Publication[];
  invitations?: Publication[];
  membership?: Publication[];
  requests?: Publication[];
}

export class Publications {
  owned?: Publication[];
  invitations?: Publication[];
  membership?: Publication[];
  requests?: Publication[];

  constructor(options?: IPublications) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (['requests', 'owned', 'membership', 'invitations'].includes(i)) {
          this[i] = options[i] && options[i].length ? options[i].map((data: PublicationOptions) => new Publication(data)) : [];
        } else {
          this[i] = options[i];
        }
      }
    }
  }
}
