export interface AuthorStatsOptions {
    subscribersCount?: number;
    rating?: number;
    views?: number;
    articlesCount?: number;
    subscribed;
}

export class AuthorStats {
    subscribersCount?: number;
    rating?: number;
    views?: number;
    articlesCount?: number;
    subscribed;

    constructor(options?: AuthorStatsOptions) {
        this.subscribersCount = options.subscribersCount ? options.subscribersCount : 0;
        this.rating = options.rating ? options.rating : 0;
        this.views = options.views ? options.views : 0;
        this.articlesCount = options.articlesCount ? options.articlesCount : 0;
        this.subscribed = options.subscribed;
    }
}
