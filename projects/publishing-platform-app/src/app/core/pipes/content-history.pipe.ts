import { Pipe, PipeTransform } from '@angular/core';
import { Content } from '../services/models/content';

@Pipe({
  name: 'contentHistory'
})

export class ContentHistoryPipe implements PipeTransform {

  transform(content: Content) {
    if (content) {
      content['slug'] = content['uri'];
      content['slug'] = content['published'];
      content['history'] = content['previousVersions'];
      if (content['history'] && content['history'].length) {
        content['history'].forEach(nextHistory => {
          nextHistory['slug'] =  nextHistory['uri'];
          nextHistory['updated'] =  nextHistory['published'];
        });
      }
    }
    return content;
  }
}
