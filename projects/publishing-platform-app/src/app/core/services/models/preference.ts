export interface PreferenceOptions {
    tags?: any;
    articles?: any;
    authors?: any;
    subscriptions?: any;
}

export class Preference {
    tags?;
    articles?;
    authors?;
    subscriptions?: any;

    constructor(options?: PreferenceOptions) {
        this.tags = options.tags ? options.tags : [];
        this.articles = options.articles ? options.articles : [];
        this.authors = options.authors ? options.authors : [];
        this.subscriptions = options.subscriptions ? options.subscriptions : [];
    }
}
