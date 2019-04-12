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
    revision?;
    origin?;
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

    constructor(options?: ContentOptions) {
        if (options.author) {
            this.author = options.author;
        }
        if (options.content) {
            this.content = options.content;
        }
        if (options.created) {
            this.created = options.created;
        }
        if (options.published) {
            this.published = options.published;
        }
        if (options.ds_id) {
            this.ds_id = options.ds_id;
        }
        if (options.id) {
            this.id = options.id;
        }
        if (options.meta) {
            this.meta = options.meta;
        }
        if (options.full_account) {
            this.full_account = options.full_account;
        }
        if (options.num_ratings) {
            this.num_ratings = options.num_ratings;
        }
        if (options.sum_rating) {
            this.sum_rating = options.sum_rating;
        }
        if (options.view_count) {
            this.view_count = options.view_count;
        }
        if (options.viewcount) {
            this.view_count = options.view_count;
        }
        if (options.revision) {
            this.revision = options.revision;
        }
        if (options.origin) {
            this.origin = options.origin;
        }
    }
}
