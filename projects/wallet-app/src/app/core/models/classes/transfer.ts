
export interface ITransfer {
    sendTo: string;
    amount: number;
    memo?: string;
}

export class Transfer implements ITransfer {
    constructor(public sendTo: string = '',
                public amount: number = 0,
                public memo?: string) {
    }
}
