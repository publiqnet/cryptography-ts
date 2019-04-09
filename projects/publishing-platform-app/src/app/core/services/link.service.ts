import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class LinkService {

  constructor(@Inject(DOCUMENT) private document: Document) {
  }

  updateLinks(config) {
    const head = this.document.querySelector('head');
    if (config.css) {
      const fileRef = this.document.createElement('link');
      fileRef.setAttribute('rel', 'stylesheet');
      fileRef.setAttribute('type', 'text/css');
      fileRef.setAttribute('href', config.css);
      head.appendChild(fileRef);
    }
    if (config.icon32 && config.icon16) {
      const fav32 = this.document.getElementById('fav32');
      const fav16 = this.document.getElementById('fav16');
      fav32.setAttribute('href', config.icon32);
      fav16.setAttribute('href', config.icon16);
    }
    if (config.appleTouchIcon) {
      const appleTouchIcon = this.document.getElementById('appleTouchIcon');
      appleTouchIcon.setAttribute('href', config.appleTouchIcon);
    }
  }
}
