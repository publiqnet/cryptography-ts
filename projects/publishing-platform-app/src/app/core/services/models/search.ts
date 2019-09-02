import { Publication } from './publication';
import { Author } from './author';
import { Content } from './content';

export interface SearchOptions {
  publication?: Publication[];
  article?: Content[];
  authors?: Author[];
}

export class Search {
  publication: Publication[];
  article: Content[];
  authors: Author[];
  totalCount: number = 0;

  constructor(options?: SearchOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (i === 'publication' && options[i] && options[i].length) {
          this[i] = options[i].map(pub => new Publication(pub));
        } else if (i === 'article' && options[i] && options[i].length) {
          this[i] = options[i].map(content => new Content(content));
        } else if (i === 'authors' && options[i] && options[i].length) {
          this[i] = options[i].map(authorData => new Author(authorData));
        } else {
          this[i] = options[i] ? options[i] : '';
        }

        if (this[i] && this[i].length) {
          this.totalCount += this[i].length;
        }
      }
    }
  }
}


