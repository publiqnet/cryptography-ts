import { Publication } from './publication';
import { Author } from './author';

export interface SearchOptions {
  publication?: Publication;
  article?: [];
  authors?: Author;
}

export class Search {
  publication: Publication;
  article: [];
  authors: Author;
}
