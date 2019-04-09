import { environment } from '../../../../environments/environment';
import { Account } from './account';

export interface PublicationOptions {
    title: string;
    description: string;
    articles;
    cover: string;
    logo: string;
    socialImage?;
    publicationItem?;
    slug: string;
    color: string;
    membersCount: number;
    memberStatus: number;
    views: number;
    members: Account[];
    contributors?: Account[];
    editors?: Account[];
    invitations?: Account[];
    requests?: Account[];
    owner?: Account;
    inviter?: Account;
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
    articles;
    cover: string;
    logo: string;
    socialImage;
    publicationItem;
    slug: string;
    color: string;
    membersCount: number;
    memberStatus: number;
    views: number;
    members: Account[];
    contributors?: Account[];
    editors?: Account[];
    invitations?: Account[];
    requests?: Account[];
    owner?: Account;
    inviter: Account;

    constructor(options?: PublicationOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (['logo', 'cover'].includes(i)) {
                   this[i] = options[i] ? environment.backend + '/' + options[i] : '';
                } else if (i === 'color') {
                    this[i] = options[i] ? '#' + options[i] : '';
                } else if (['membersCount', 'memberStatus'].includes(i)) {
                    this[i] = options[i];
                } else if (['members', 'contributors', 'editors', 'invitations', 'requests'].includes(i)) {
                    this[i] = options[i] ? options[i].map(data => new Account(data)) : [];
                } else if (['owner', 'inviter'].includes(i)) {
                    this[i] = options[i] ? new Account(options[i]) : '';
                } else {
                    this[i] = options[i] ? options[i] : '';
                }
            }
        }
    }
}
