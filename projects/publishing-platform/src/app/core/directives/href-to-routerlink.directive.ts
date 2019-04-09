import {
  Directive,
  ElementRef,
  HostListener,
  Input
} from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[appHrefToRouterLink]'
})
export class HrefToRouterLinkDirective {
  constructor(private el: ElementRef, private router: Router) { }

  @Input() overrideCallback: () => {};

  @HostListener('click', ['$event'])
  onClick(event) {
    if (event.target.tagName === 'A') {
      this.router.navigate([event.target.getAttribute('href')]);
      event.preventDefault();
      event.stopPropagation();
      if (this.overrideCallback) {
        this.overrideCallback();
      }
    } else {
      return;
    }
  }
}
