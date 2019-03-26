import { environment } from '../../../../environments/environment';

export interface PublicationOptions {
    title: string;
    description: string;
    members: any[];
    articles;
    inviter;
    cover;
    logo;
    socialImage?;
    publicationItem?;
    id?: number;
    slug: string;
    color: string;
    owner: any;
}

export interface PublicationSubscribersResponse {
    subscriber: {
        firstName: string;
        id: number;
        lastName: string;
        publiqId: string;
        username: string;
    };
}

export class Publication {
    title;
    description;
    members: any[];
    articles;
    inviter;
    cover;
    logo;
    id;
    socialImage;
    publicationItem;
    slug: string;
    color: string;
    owner: any;
    constructor(options?: PublicationOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (['logo', 'cover'].includes(i)) {
                   this[i] = options[i] ? environment.backend + '/' + options[i] : '';
                } else if (i === 'color') {
                    this[i] = options[i] ? '#' + options[i] : '';
                } else {
                    this[i] = options[i] ? options[i] : '';
                }
            }
        }
    }
}
