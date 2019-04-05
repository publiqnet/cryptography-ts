import { Pipe, PipeTransform } from '@angular/core';

const PBQPower = 100000000;

@Pipe({
    name: 'PBQ'
})
export class PbqPipe implements PipeTransform {

    constructor() {
    }

    transform(value: number) {
      return (value) ? value / PBQPower : 0;
    }
}
