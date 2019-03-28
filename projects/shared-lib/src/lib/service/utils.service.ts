import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  public static calculateBalance(whole: number, fraction: number, fractionCoif = 100000000): number {
    let balance = whole;
    if (fraction) {
      const _fraction = fraction / fractionCoif;
      balance = whole + _fraction;
    }
    return balance;
  }
}
