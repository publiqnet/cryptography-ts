import { Author } from './author';

export interface DraftOptions { // todo delete
  slug: any;
  id: any;
  author: Author;
  created: string;
  updated: string;
  title: string;
  tags: Array<string>;
  image: string;
  publication: any;
  view_count: string;
  contentUris?: object;
  content?: string;
}

export class Draft {
  slug: any;
  id: any;
  author: Author;
  created: string;
  published: string;
  title: string;
  tags: Array<string>;
  image: string;
  publication: any;
  view_count: string;
  contentUris: object;
  content: string;
  description: string;
  constructor(options?: DraftOptions) {
    for (const i in options) {
      if (options.hasOwnProperty(i)) {
        if (i == 'id') {
          this['slug'] = options[i] ? options[i] : '';
          this[i] = options[i] ? options[i] : '';
        } else if (i == 'content') {
          this['description'] = options[i] ? options[i].replace(/(<([^>]+)>)/ig, '') : '';
          this[i] = options[i] ? options[i] : '';
        } else if (i == 'updated') {
          this['published'] = options[i] ? options[i] : '';
          this[i] = options[i] ? options[i] : '';
        } else {
          this[i] = options[i] ? options[i] : '';
        }
      }
    }
  }
}

