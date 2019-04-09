import { Boost } from './boost';

export enum PageOptions {
    homepageTagStories = <any>'homepageTagStories',
    homepageAuthorStories = <any>'homepageAuthorStories',
    default = <any>''
}

export interface ContentOptions {
    author?;
    content?;
    created?;
    published?;
    ds_id?;
    id?;
    meta?;
    full_account?;
    num_ratings?;
    sum_rating?;
    view_count?;
    viewcount?;
    publication?;
    revision?;
    origin?;
    boosted?;
    boosts?: Boost[];
}

export class Content {
    author;
    content;
    created;
    published;
    ds_id;
    id;
    meta;
    full_account;
    num_ratings;
    sum_rating;
    view_count;
    viewcount;
    revision;
    origin;
    publication;
    boosted;
    boosts: Boost[];

    constructor(options?: ContentOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (i === 'boosted') {
                    this[i] = options[i];
                } else {
                    this[i] = options[i] ? options[i] : '';
                }
            }
        }
    }
}
