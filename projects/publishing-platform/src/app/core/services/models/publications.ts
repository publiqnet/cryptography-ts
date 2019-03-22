export interface IPublications {
  owned?;
  invitations?;
  membership?;
  requests?;
}

export class Publications {
  owned?;
  invitations?;
  membership?;
  requests?;

  constructor(options?: IPublications) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        this[i] = options[i];
      }
    }
  }
}
