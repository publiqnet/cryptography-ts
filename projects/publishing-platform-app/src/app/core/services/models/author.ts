
export interface AuthorOptions {
    address: string;
    firstName: string;
    lastName: string;
    image: any;
}

export class Author {
    address: string;
    slug: string;
    first_name: string;
    image: any;
    last_name: string;

    constructor(options?: AuthorOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (i == 'lastName') {
                    this['last_name'] = options[i] ? options[i] : '';
                } else if (i == 'firstName') {
                    this['first_name'] = options[i] ? options[i] : '';
                } else if (i == 'address') {
                    this['slug'] = options[i] ? options[i] : '';
                    this[i] = options[i] ? options[i] : '';
                } else {
                    this[i] = options[i] ? options[i] : '';
                }
            }
        }
    }
}
