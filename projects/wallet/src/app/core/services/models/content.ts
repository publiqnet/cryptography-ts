export interface ContentOptions {
    author?;
    created?;
    ds_id?;
    id?;
    meta?;
    num_ratings?;
    sum_rating?;
    view_count?;
}

export class Content {
    author;
    created;
    ds_id;
    id;
    meta;
    num_ratings;
    sum_rating;
    view_count;

    constructor(options?: ContentOptions) {
        if (options.author) {
            this.author = options.author;
        }
        if (options.created) {
            this.created = options.created;
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
        if (options.num_ratings) {
            this.num_ratings = options.num_ratings;
        }
        if (options.sum_rating) {
            this.sum_rating = options.sum_rating;
        }
        if (options.view_count) {
            this.view_count = options.view_count;
        }

    }

}
