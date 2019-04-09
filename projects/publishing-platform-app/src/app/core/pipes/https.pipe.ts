import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'HTTPS'
})
export class HttpsPipe implements PipeTransform {
  transform(url): string {
    return url.match('^http://') ? url.replace('http://', 'https://') : url;
  }
}
