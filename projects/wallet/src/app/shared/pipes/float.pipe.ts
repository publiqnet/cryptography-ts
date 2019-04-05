import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'float'
})
export class FloatPipe implements PipeTransform {

  transform(value: any): number {
    return parseFloat(value);
  }
}
