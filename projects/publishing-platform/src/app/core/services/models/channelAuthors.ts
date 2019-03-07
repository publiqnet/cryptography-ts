export interface ChannelAuthorsOptions {
    authors: any[];
    blacklistedAuthors: any[];
}

export class ChannelAuthors {
    authors: any[];
    blacklistedAuthors: any[];

    constructor(options?: ChannelAuthorsOptions) {
      this.authors = (options.authors && options.authors.length) ? options.authors : [];
      this.blacklistedAuthors = (options.blacklistedAuthors && options.blacklistedAuthors.length) ? options.blacklistedAuthors : [];
    }
}



