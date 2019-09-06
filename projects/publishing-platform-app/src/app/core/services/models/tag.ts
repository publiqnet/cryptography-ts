export interface TagOptions {
    name: string;
}

export  class Tag {
    name: string;
    text: string;
    slug: string;

    constructor(options?: TagOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                this[i] = options[i] ? options[i] : '';
                this.slug = this[i];
                this.text = this[i];
            }
        }
    }
}
