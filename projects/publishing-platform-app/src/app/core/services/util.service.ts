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

  static getCookie(name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length == 2) {
      return parts.pop().split(';').shift();
    }
  }

  static setRedirectUrl(url) {
      const now = new Date();
      const time = now.getTime();
      const expireTime = time + 1200000;
      now.setTime(expireTime);
      document.cookie = `redirectUrl=${url};expires=` + now.toUTCString() + ';path=/';
  }

  static removeCookie (name) {
    document.cookie = name + '=; Max-Age=0; path=/;';
  }

  routerChangeHelper(route: string, slug: any) {
    if (UtilService.ROUTESLIST[route]) {
      this.router.navigate([`/${UtilService.ROUTESLIST[route]}/${slug}`]);
    } else {
      this.router.navigate(['/page-not-found']);
    }
  }
}
