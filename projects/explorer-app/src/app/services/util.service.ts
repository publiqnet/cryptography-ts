import { Injectable } from '@angular/core';
import PubliqTransfer from 'blockchain-models-ts/bin/models/PubliqTransfer';

@Injectable()
export class UtilService {

  constructor() {
  }

  isTransfer(transaction) {
    return transaction.type == PubliqTransfer.Rtt;
  }
}
