import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class UtilService {
  static ROUTESLIST = {
    'content': 's',
    'account': 'a',
    'publication': 'p',
    'tag': 't'
  };

  constructor(
    private router: Router,
  ) {
  }
  routerChangeHelper(route: string, slug: any) {
    if (UtilService.ROUTESLIST[route]) {
      this.router.navigate([`/${UtilService.ROUTESLIST[route]}/${slug}`]);
    } else {
      this.router.navigate(['/page-not-found']);
    }
  }
}
