import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { AccountService } from './core/services/account.service';
import { UserIdleService } from './core/models/angular-user-idle/user-idle.service';
import { NotificationService, NotificationTypeList } from './core/services/notification.service';
import { ErrorService } from './core/services/error.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { WalletService } from './core/services/wallet.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styles: []
})
export class AppComponent implements OnInit, OnDestroy {

    routerSubscription: Subscription;
    private actionClass: string;

    constructor(private router: Router,
                private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
                @Inject(PLATFORM_ID) private platformId: Object,
                private userIdle: UserIdleService,
                private walletService: WalletService,
                private errorService: ErrorService,
                private notificationService: NotificationService,
                private accountService: AccountService,
                private snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this.routerSubscription = this.router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe(event => {
                if (isPlatformBrowser(this.platformId)) {
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                }
            });

        if (isPlatformBrowser(this.platformId)) {
            // Start watching for user inactivity.
            this.userIdle.startWatching();

            // Start watching when user idle is starting.
            this.userIdle.onTimerStart().subscribe(count => {});

            // Start watch when time is up.
            this.userIdle.onTimeout().subscribe(() => {
                // if (this.accountService.loggedIn()) {
                //     this.accountService.automaticallyLoggedOut = true;
                //     this.accountService.logout();
                // }
            });

            this.notificationService.message.subscribe(data => {
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
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, <MatSnackBarConfig>{
            duration: 5000,
            extraClasses: [this.actionClass]
        });
    }


    ngOnDestroy() {
    }
}

