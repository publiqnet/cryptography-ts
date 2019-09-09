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
    boosted: boolean;
    publication: string;
    boosts?: [];
    tags?: any;
}

export class Content {
    uri: string;
    title: string;
    text: string;
    cover: any;
    contentId: any;
    files: [];
    published: string;
    views: number = 0;
    author: Author;
    image: string;
    tags = [];
    view_count: number = 0;
    publication = null;
    boosted: boolean;
    boosts: [];
    previousVersions: [];

    constructor(options?: ContentOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (i == 'author' && options[i]) {
                    this[i] = new Author(options[i]);
                } else if (i == 'cover' && options[i] && options[i].url) {
                    this.image = options[i].url;
                    this[i] = options[i] ? options[i] : '';
                } else if (i == 'views' && options[i]) {
                    this.views = options[i];
                    this.view_count = this.views;
                } else if (i == 'previousVersions') {
                  this[i] = (options[i] && options[i].length) ? options[i] : [];
                } else if (i == 'tags') {
                    this[i] = (options[i] && options[i].length) ? options[i].map(tag => tag['name']) : [];
                } else {
                    this[i] = options[i] ? options[i] : '';
                }
            }
        }
    }
}
