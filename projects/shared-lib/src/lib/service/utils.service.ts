import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  calculateBalance(whole, fraction, fractionCoif = 100000000) {
    let balance = `${whole}`;
    if (fraction) {
      const _fraction = fraction / fractionCoif;
      balance = `${whole + _fraction}`;
    }
    return balance;
  }
}
