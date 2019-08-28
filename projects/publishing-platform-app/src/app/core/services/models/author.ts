import { environment } from 'projects/publishing-platform-app/src/environments/environment';

export interface AuthorOptions {
    address: string;
    firstName: string;
    lastName: string;
    image: any;
    memberStatus?: number;
    publicKey: string;
}

export class Author {
    address: string;
    slug: string;
    first_name: string;
    image: any;
    last_name: string;
    firstName: string;
    lastName: string;
    memberStatus?: number;
    publicKey: string;
    constructor(options?: AuthorOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (i == 'lastName') {
                    this['last_name'] = options[i] ? options[i] : '';
                } else if (i == 'firstName') {
                    this['first_name'] = options[i] ? options[i] : '';
                } else if (i == 'publicKey') {
                    this['slug'] = options[i] ? options[i] : '';
                    this[i] = options[i] ? options[i] : '';
                } else if (['image'].includes(i)) {
                    this[i] = (options[i] && options[i].indexOf('https://') !== 0) ? environment.backend + '/' + options[i] : options[i];
                } else {
                    this[i] = options[i] ? options[i] : '';
                }
            }
        }
    }
}
