export interface ITransfer {
  sendTo: string;
  amount: number;
  memo?: string;
}

export class Transfer implements ITransfer {
  constructor(
    public sendTo = '',
    public amount = 0,
    public memo?: string
  ) {}
}
