import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

const PBQPower = 100000000;

@Pipe({
  name: 'PBQ'
})
export class PbqPipe implements PipeTransform {
  constructor(private decimalPipe: DecimalPipe) {}

  transform(value: number) {
    return value ? value / PBQPower : 0;
    // return (value && value != null) ? this.decimalPipe.transform(value / PBQPower, '.0-8').replace(/[,]/, '') + ' PBQ' : '0 PBQ';
  }
}
