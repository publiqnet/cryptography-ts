import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { AccountService } from '../services/account.service';
import { NavigationEnd, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ErrorEvent, ErrorService } from '../services/error.service';
import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../../environments/environment';
import { WalletService } from '../services/wallet.service';
import { NotificationService } from '../services/notification.service';
import { OauthService } from 'helper-lib';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
    navTabView = '';
    account: any = null;

    logOutSubscription: Subscription;
    errorEventEmiterSubscription: Subscription;
    accountUpdatedSubscription: Subscription;

    constructor(private router: Router,
                private accountService: AccountService,
                @Inject(PLATFORM_ID) private platformId: Object,
                @Inject(DOCUMENT) private document: any,
                private walletService: WalletService,
                public oauthService: OauthService,
                private errorService: ErrorService,
                private notificationService: NotificationService) {
    }

    ngOnInit() {
        this.navView(this.router.url);
        this.router.events.filter(event => event instanceof NavigationEnd)
            .subscribe(result => this.navView(result['urlAfterRedirects']));

        if (isPlatformBrowser(this.platformId)) {

            this.errorEventEmiterSubscription = this.errorService.errorEventEmiter.subscribe((error: ErrorEvent) => {
                if (error.action === 'logout') {
                    console.log('logout-error----', error.message);
                } else if (error.action === 'load_balance_error') {
                    this.notificationService.error(this.errorService.getError('load_balance_error'));
                }
            });

            this.accountUpdatedSubscription = this.accountService.accountUpdated$.filter(result => result != null).subscribe(result => {
                this.account = result;
            });

            this.logOutSubscription = this.accountService.logoutDataChanged.subscribe(data => {
                this.account = null;
                this.router.navigate(['/user/login']);
            });
        }
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.errorEventEmiterSubscription.unsubscribe();
            this.accountUpdatedSubscription.unsubscribe();
            this.logOutSubscription.unsubscribe();
        }
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

    getShieldClass () {
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

    getLogo () {
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
}
