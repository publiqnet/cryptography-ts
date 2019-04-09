import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'pubTitle'
})
export class PubTitlePipe implements PipeTransform {

  transform(value: string) {
    if (value) {
      if (value.split(' ')[0] && value.split(' ')[1] ) {
        return value.split(' ')[0][0].trim().toLocaleUpperCase() + value.split(' ')[1][0].trim().toLocaleUpperCase();
      } else {
        return value[0].toUpperCase();
      }
    } else {
      return value[0].toUpperCase();
    }
  }
}
