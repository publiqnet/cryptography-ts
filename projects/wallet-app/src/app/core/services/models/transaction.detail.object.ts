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

  constructor(transaction) {
    this.transactionHash = transaction.transactionHash;
    this.from = transaction.transfer.from.address;
    this.to = transaction.transfer.to.address;
    this.whole = transaction.transfer.whole;
    this.fraction = transaction.transfer.fraction;
    this.message = transaction.transfer.message;

    this.feeWhole = transaction.feeWhole;
    this.feeFraction = transaction.feeFraction;

    this.amount = UtilsService.calculateBalance(this.whole, this.fraction);
    this.feeAmount = UtilsService.calculateBalance(this.feeWhole, this.feeFraction);
    this.date = new Date(transaction.timeSigned * 1000);
  }
}
