import { Publication } from './publication';

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
  requests?;

  constructor(options?: IPublications) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (i == 'owned') {
          this[i] = options[i] && options[i].length ? options[i].map(data => new Publication(data)) : [];
        } else {
          this[i] = options[i];
        }
      }
    }
  }
}
