import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortname'
})
export class ShortNamePipe implements PipeTransform {
  transform(value: {}, firstNameKey?: string, lastNameKey?: string): string {
    let result = '';
    const fKey = firstNameKey || 'firstName';
    const lKey = lastNameKey || 'lastName';

    if (value[fKey]) {
      result += value[fKey].charAt(0);
    }

    if (value[lKey]) {
      result += value[lKey].charAt(0);
    }

    return result.toUpperCase();
  }
}
