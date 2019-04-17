
export interface AccountOptions {
    address;
}

export class Account {
    address;

    constructor(options?: AccountOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                this[i] = options[i];
            }
        }
    }
}
