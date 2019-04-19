import { UtilsService } from 'shared-lib';

export interface BalanceOptions {
    fraction: number;
    whole: number;
    balance: number;
}

export class Balance {
    fraction: number;
    whole: number;
    balance: number;

    constructor(options?: BalanceOptions) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                this[i] = options[i];
            }
        }
        this.balance = UtilsService.calculateBalance(this.whole, this.fraction);
    }
}
