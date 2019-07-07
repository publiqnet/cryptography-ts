import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { isPlatformBrowser } from '@angular/common';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { AccountService } from './core/services/account.service';
import { UserIdleService } from './core/models/angular-user-idle/user-idle.service';
import { NotificationService, NotificationTypeList } from './core/services/notification.service';
import { ErrorService } from './core/services/error.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { WalletService } from './core/services/wallet.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {

  private actionClass: string;
  public isBrowser = false;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private router: Router,
              private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
              @Inject(PLATFORM_ID) private platformId: Object,
              private userIdle: UserIdleService,
              private walletService: WalletService,
              private errorService: ErrorService,
              private notificationService: NotificationService,
              public accountService: AccountService,
              private snackBar: MatSnackBar,
              public translate: TranslateService) {
  }

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.translate.use('en');
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(event => {
        if (this.isBrowser) {
          document.body.scrollTop = document.documentElement.scrollTop = 0;
        }
      });

    this.idleInit();


    this.notificationService.message
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        if (data.type === NotificationTypeList.success) {
          this.actionClass = 'notification-success';
        } else if (data.type === NotificationTypeList.error) {
          this.actionClass = 'notification-error';
        } else if (data.type === NotificationTypeList.info) {
          this.actionClass = 'notification-info';
        } else if (data.type === NotificationTypeList.warning) {
          this.actionClass = 'notification-warning';
        }

        this.openSnackBar(data.message, '');
      });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, <MatSnackBarConfig>{
      duration: 5000,
      extraClasses: [this.actionClass]
    });
  }

  private idleInit() {
    if (this.isBrowser) {
      // Start watching for user inactivity.
      this.userIdle.startWatching();

      // Start watching when user idle is starting.
      this.userIdle.onTimerStart().subscribe(count => {
      });

      // Start watch when time is up.
      this.userIdle.onTimeout().subscribe(() => {
        if (this.accountService.loggedIn()) {
          this.accountService.autoLogOut = true;
          this.accountService.logout();
        }
      });
    }
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

