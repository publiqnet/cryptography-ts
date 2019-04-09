export interface BoostOptions {
    budget?;
    ds_id?;
    id?;
    promo_agent?;
    sponsor?;
    valid_after?;
    valid_before?;
}

export class Boost {
    budget;
    ds_id;
    id;
    promo_agent;
    sponsor;
    valid_after;
    valid_before;

    constructor(options?: BoostOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                this[i] = options[i] ? options[i] : '';
            }
        }
    }
}



