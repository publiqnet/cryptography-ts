import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, CanActivateChild, GuardsCheckEnd, RouterEvent } from '@angular/router';

import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LanguageGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    this.router.events
      .pipe(
        filter((event: RouterEvent) => event instanceof GuardsCheckEnd),
        map(res => res.url),
        take(1)
      )
      .subscribe(url => {
        const lang = url.split('/')[1];
        if (['en', 'jp'].includes(lang)) {
          // isPlatformBrowser(this.platformId) && this.translateService.use(lang || 'en');
          this.router.navigate([url.replace(/\/[a-zA-Z]{2}/, '')]);
        } else {
          this.router.navigate(['/page-not-found']);
        }
      });
    return false;
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }
}
