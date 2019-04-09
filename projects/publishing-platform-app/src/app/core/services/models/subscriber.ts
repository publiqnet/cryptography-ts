
export interface SubscriberOptions {
    firstName?: string ;
    lastName?: string;
    image?: string;
    username: string;

}

export class Subscriber {
    firstName?: string ;
    lastName?: string;
    image?: string;
    username: string;

    constructor(options?: SubscriberOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                this[i] = options[i] ? options[i] : '';
            }
        }
    }
}
