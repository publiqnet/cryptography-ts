import { Publication, PublicationOptions } from './publication';

export interface IPublications {
  owned?;
  invitations?;
  membership?;
  requests?;
}

export class Publications {
  owned?: any[];
  invitations?;
  membership?;
  requests?: any[];

  constructor(options?: IPublications) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (['requests', 'owned'].includes(i)) {
          this[i] = options[i] && options[i].length ? options[i].map((data: PublicationOptions) => new Publication(data)) : [];
        } else {
          this[i] = options[i];
        }
      }
    }
  }
}
