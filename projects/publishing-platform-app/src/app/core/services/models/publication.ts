export interface PublicationOptions {
    title: string;
    description: string;
    members;
    articles;
    inviter;
    cover;
    logo;
    socialImage?;
    publicationItem?;
    id?: number;
    slug: string;
}

export interface PublicationResponse {
    name: string;
    description: string;
    coverImage;
    logoImage;
    articles;
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
    members;
    articles;
    inviter;
    cover;
    logo;
    id;
    socialImage;
    publicationItem;
    slug: string;

    constructor(options?: PublicationOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                this[i] = options[i] ? options[i] : '';
            }
        }
    }
}
