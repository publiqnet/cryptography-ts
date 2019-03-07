import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from '../../core/services/account.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';

@Component({
    selector: 'app-register-confirmation',
    templateUrl: './register-confirmation.component.html',
    styleUrls: ['./register-confirmation.component.scss']
})
export class RegisterConfirmationComponent implements OnInit, OnDestroy {
    public confirmed: boolean;
    confirmSubscription: Subscription = Subscription.EMPTY;
    errorEventEmitterSubscription: Subscription = Subscription.EMPTY;

    constructor(
        public activatedRoute: ActivatedRoute,
        public accountService: AccountService,
        public router: Router,
        @Inject(PLATFORM_ID) private platformId: Object,
        private errorService: ErrorService,
        public t: TranslateService
    ) {
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.activatedRoute.params.subscribe(params => {
                if (params.code && params.code.length === 32) {
                    this.accountService.loadConfirm(params.code);
                } else {
                    this.router.navigate(['/page-not-found']);
                }
            });

            this.errorEventEmitterSubscription = this.errorService.errorEventEmiter.subscribe((data: ErrorEvent) => {
                    if (data.action === 'loadConfirm') {
                        this.router.navigate(['/page-not-found']);
                    }
                }
            );

            this.confirmSubscription = this.accountService.confirmCodeChanged.subscribe(
                data => {
                    this.confirmed = true;
                    this.router.navigate(['/user/complete-registration']);
                }
            );
        }
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.confirmSubscription.unsubscribe();
            this.errorEventEmitterSubscription.unsubscribe();
        }
    }
}
