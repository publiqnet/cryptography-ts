import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  static coinPrecision = 8;

  constructor() { }

  public static calculateBalance(whole: number, fraction: number, fractionCoif = Math.pow(10, this.coinPrecision)): number {
    let balance = whole;
    if (fraction) {
      const _fraction = fraction / fractionCoif;
      balance = whole + _fraction;
    }
    return balance;
  }

  public static calcAmount(amount, fractionCoif = Math.pow(10, this.coinPrecision)) {
    return amount * fractionCoif;
  }

  public static getBalanceString (whole: number, fraction: number) {
    let balance;
    if (fraction) {
      balance = `${whole}.${fraction}`;
    } else {
      balance = `${whole}.000`;
    }
    return balance;
  }
}
