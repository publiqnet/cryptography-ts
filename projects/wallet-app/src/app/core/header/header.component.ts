import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { interval, ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { ErrorEvent, ErrorService } from '../services/error.service';
import { WalletService } from '../services/wallet.service';
import { NotificationService } from '../services/notification.service';
import { OauthService } from 'helper-lib';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  navTabView = '';
  account: any = null;
  fixedNav: boolean;
  checkBalanceUpdate;
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private router: Router,
              public accountService: AccountService,
              @Inject(PLATFORM_ID) private platformId: Object,
              @Inject(DOCUMENT) private document: any,
              private walletService: WalletService,
              public translateService: TranslateService,
              public oauthService: OauthService,
              private errorService: ErrorService,
              private notificationService: NotificationService) {
  }

  @HostListener('window:scroll', ['$event'])

  onWindowScroll(e) {
    if (isPlatformBrowser(this.platformId) && (this.router.url === '/wallet/transfer' || this.router.url === '/user/recover-phrase')) {
      // console.log(this.router.url);
      if ( window.pageYOffset > 60) {
        const element = document.getElementById('header');
        element.classList.add('fixed-header');
      } else {
        const element = document.getElementById('header');
        element.classList.remove('fixed-header');
      }
    }
  }

  ngOnInit() {
    this.navView(this.router.url);
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(result => this.navView(result['urlAfterRedirects']));

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((error: ErrorEvent) => {
        if (error.action === 'logout') {
          console.log('logout-error----', error.message);
        } else if (error.action === 'load_balance_error') {
          this.notificationService.error(this.errorService.getError('load_balance_error'));
        }
      });

    this.accountService.accountUpdated$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(result => {
        if (result) {
          this.account = result;
          if (!this.checkBalanceUpdate) {
            this.checkBalanceUpdate = interval(1 * 60 * 1000).subscribe(data => this.accountService.checkBalanceUpdate());
          }
        } else {
          if (this.checkBalanceUpdate) {
            this.checkBalanceUpdate.unsubscribe();
          }
        }
      });

    this.accountService.logoutDataChanged
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.account = null;
        this.router.navigate(['/user/login']);
      });
  }

  navView(url) {
    if (url === '/user/login') {
      this.navTabView = 'login';
    } else if (url === '/user/register') {
      this.navTabView = 'register';
    } else {
      this.navTabView = '';
    }
  }

  getShieldClass() {
    let currentSecurityClass = '';

    if (this.account) {
      if (this.oauthService.privateKeySaved && this.oauthService.brainKeySaved) {
        currentSecurityClass = '';
      } else if (!this.oauthService.privateKeySaved || !this.oauthService.brainKeySaved) {
        currentSecurityClass = 'shield-red';
      }
    }

    return 'icon icon-shield ' + currentSecurityClass;
  }

  getLogo() {
    if (isPlatformBrowser(this.platformId)) {
      return this.isNotDemo() ? 'assets/publiq.svg' : 'assets/stage-publiq.svg';
    }
  }

  isNotDemo() {
    if (isPlatformBrowser(this.platformId)) {
      return this.document.location.hostname.substring(0, 6) === 'wallet';
    }
  }

  signout(e) {
    e.preventDefault();
    this.accountService.logout();
  }

  useLang(lang) {
    if (this.translateService.currentLang != lang) {
      this.translateService.use(lang);
    }
  }

  ngOnDestroy() {
    if (this.checkBalanceUpdate) {
      this.checkBalanceUpdate.unsubscribe();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
