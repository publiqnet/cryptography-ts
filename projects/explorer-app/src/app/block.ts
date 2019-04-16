
export interface BlockOptions {
    confirmationsCount;
    hash;
    number;
    signTime;
    size;
    transactionsCount;
}

export class Block {
    confirmationsCount;
    hash;
    number;
    signTime;
    size;
    transactionsCount;

    constructor(options?: BlockOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (['transactionsCount', 'confirmationsCount'].includes(i)) {
                    this[i] = options[i];
                } else if (['signTime'].includes(i)) {
                    const localDate = new Date(options[i] * 1000);
                    this[i] = new Date(localDate.valueOf() + localDate.getTimezoneOffset() * 60000);
                    this['timestamp'] = options[i];
                } else if (['size'].includes(i)) {
                    this[i] = (options[i] > 0) ? options[i] / 1024 : 0 ;
                } else {
                    this[i] = options[i] ? options[i] : '';
                }
            }
        }
    }
}
