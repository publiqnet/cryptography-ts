import { Publication, PublicationOptions } from './publication';
import { Author } from './author';

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
          options[i] = options[i].map(
            el => new Author(el)
          );
          this[i] = options[i] && options[i].length ? options[i].map((data: PublicationOptions) => new Publication(data)) : [];
        } else {
          this[i] = options[i];
        }
      }
    }
  }
}
