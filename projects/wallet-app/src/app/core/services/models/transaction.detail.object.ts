import PubliqTransfer from 'blockchain-models-ts/bin/models/PubliqTransfer';
import { UtilsService } from 'shared-lib';

export class TransactionDetailObject {
  transactionHash: string;
  from: string;
  to: string;
  whole: number;
  fraction: number;
  feeWhole: number;
  feeFraction: number;
  message: string;
  amount: number;
  feeAmount: number;
  date: Date;
  type: number;

  constructor(transaction) {
    this.transactionHash = transaction.transactionHash;
    if (transaction.type == PubliqTransfer.Rtt) {
      this.from = transaction.transfer.from.address;
      this.to = transaction.transfer.to.address;
      this.whole = transaction.transfer.whole;
      this.fraction = transaction.transfer.fraction;
      this.message = transaction.transfer.message;
      this.amount = UtilsService.calculateBalance(this.whole, this.fraction);
    }

    this.feeWhole = transaction.feeWhole;
    this.feeFraction = transaction.feeFraction;
    this.feeAmount = UtilsService.calculateBalance(this.feeWhole, this.feeFraction);
    this.date = new Date(transaction.timeSigned * 1000);
    this.type = transaction.type;
  }
}
