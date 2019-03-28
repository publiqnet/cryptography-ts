import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';


import { AccountService } from './account.service';
import { ErrorEvent, ErrorService } from './error.service';
import { DialogService } from './dialog.service';
import { ChannelService } from './channel.service';


@Injectable()
export class AuthguardService implements CanActivate, CanActivateChild {
  loginSessionSubscription: Subscription = Subscription.EMPTY;
  errorHandleSubscription: Subscription = Subscription.EMPTY;
  constructor(
    private router: Router,
    private accountService: AccountService,
    private errorService: ErrorService,
    private dialogService: DialogService,
    private channelService: ChannelService,
    public t: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (isPlatformBrowser(this.platformId)) {
      return new Promise(resolve => {
        if (this.accountService.loggedIn()) {
          if (
            (state && state.url && state.url === '/content/newcontent') ||
            '/content/mycontent'
          ) {
            const channelAuthors = this.channelService.getChannelAuthors();
            if (
              channelAuthors.length > 0 &&
              this.accountService.accountInfo &&
              !channelAuthors.includes(this.accountService.accountInfo.publicKey)
            ) {
              this.dialogService
                .openChannelNotAllowedDialog()
                .subscribe(() => {
                  this.router.navigate(['/']);
                  return;
                });
              resolve(false);
              return;
            }
          }
          resolve(true);
          return;
        }

        const authToken = localStorage.getItem('auth')
          ? localStorage.getItem('auth')
          : null;
        if (!authToken) {
          resolve(false);
          this.router.navigate(['/user/login']);
          return;
        } else {
          this.accountService.loginSession();
          this.loginSessionSubscription = this.accountService.loginSessionDataChanged.subscribe(
            () => {
              if (
                (state && state.url && state.url === '/content/newcontent') ||
                '/content/mycontent'
              ) {
                const channelAuthors = this.channelService.getChannelAuthors();
                if (
                  channelAuthors.length > 0 &&
                  this.accountService.accountInfo &&
                  !channelAuthors.includes(this.accountService.accountInfo.publicKey)
                ) {
                  this.dialogService
                    .openChannelNotAllowedDialog()
                    .subscribe(() => {
                      this.router.navigate(['/']);
                      return;
                    });
                  resolve(false);
                  return;
                }
              }
              return resolve(true);
            }
          );

          this.errorHandleSubscription = this.errorService.errorEventEmiter.subscribe(
            (error: ErrorEvent) => {
              if (error.action === 'loginSession') {
                resolve(false);
                this.router.navigate(['/user/login']);
                localStorage.setItem('lang', 'en');
                return;
              }
            }
          );
        }
      });
    } else {
      return true;
    }
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }
}
