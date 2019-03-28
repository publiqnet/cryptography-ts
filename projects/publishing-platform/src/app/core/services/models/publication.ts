import { environment } from '../../../../environments/environment';

export interface PublicationOptions {
    title: string;
    description: string;
    members: any[];
    articles;
    inviter;
    cover: string;
    logo: string;
    socialImage?;
    publicationItem?;
    slug: string;
    color: string;
    membersCount: number;
    memberStatus: number;
    views: number;
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
    title: string;
    description: string;
    members: any[];
    articles;
    inviter;
    cover: string;
    logo: string;
    socialImage;
    publicationItem;
    slug: string;
    color: string;
    membersCount: number;
    memberStatus: number;
    views: number;

    constructor(options?: PublicationOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (['logo', 'cover'].includes(i)) {
                   this[i] = options[i] ? environment.backend + '/' + options[i] : '';
                } else if (i === 'color') {
                    this[i] = options[i] ? '#' + options[i] : '';
                } else if (['membersCount', 'memberStatus'].includes(i)) {
                    this[i] = options[i];
                } else if (this.hasOwnProperty(i)) {
                    this[i] = options[i] ? options[i] : '';
                }
            }
        }
    }
}
