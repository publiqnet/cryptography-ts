import { Author } from './author';

export enum PageOptions {
    homepageTagStories = <any>'homepageTagStories',
    homepageAuthorStories = <any>'homepageAuthorStories',
    default = <any>''
}

export interface ContentOptions {
    uri: string;
    title: string;
    text: string;
    cover: any;
    contentId?: any;
    files: [];
    published: string;
    author: any;
    publication: string;
}

export class Content {
    uri: string;
    title: string;
    text: string;
    cover: any;
    contentId: any;
    files: [];
    published: string;
    author: Author;
    image: string;
    tags = [
        '2017',
        'DEVELOPER',
        'FULLSTACK'
    ];
    view_count = '1K';
    publication = null;

    constructor(options?: ContentOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (i == 'author' && options[i]) {
                    this[i] = new Author(options[i]);
                } else if (i == 'cover' && options[i] && options[i].url) {
                    this.image = options[i].url;
                } else {
                    this[i] = options[i] ? options[i] : '';
                }
            }
        }
    }
}
