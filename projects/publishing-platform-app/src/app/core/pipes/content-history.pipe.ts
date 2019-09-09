import { Pipe, PipeTransform } from '@angular/core';
import { Content } from '../services/models/content';

@Pipe({
  name: 'contentHistory'
})

export class ContentHistoryPipe implements PipeTransform {

  transform(content: Content) {
    console.log(content);
    return content;
  }
}
