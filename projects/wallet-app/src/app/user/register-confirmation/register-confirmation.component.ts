import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { Subscription } from 'rxjs/Subscription';
import { isPlatformBrowser } from '@angular/common';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';

@Component({
    selector: 'app-register-confirmation',
    templateUrl: './register-confirmation.component.html',
    styleUrls: ['./register-confirmation.component.scss']
})
export class RegisterConfirmationComponent implements OnInit, OnDestroy {

    public confirmed: boolean;
    confirmSubscription: Subscription;
    errorEventEmiterSubscription: Subscription;

    constructor(public activatedRoute: ActivatedRoute,
                public accountService: AccountService,
                public router: Router,
                @Inject(PLATFORM_ID) private platformId: Object,
                private errorService: ErrorService) {
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.activatedRoute.params.subscribe(params => {
                if (params.code && params.code.length === 32) {
                    // this.accountService.loadConfirm(params.code);
                } else {
                    this.router.navigate(['/page-not-found']);
                }
            });

            this.errorEventEmiterSubscription = this.errorService.errorEventEmiter.subscribe((data: ErrorEvent) => {
                if (data.action === 'loadConfirm') {
                    this.router.navigate(['/page-not-found']);
                    console.log(data.message);
                }
            });

            // this.confirmSubscription = this.accountService.confirmCodeChanged.subscribe(data => {
            //     this.confirmed = true;
            //     this.router.navigate(['/user/complete-registration']);
            // });
        }
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.confirmSubscription.unsubscribe();
            this.errorEventEmiterSubscription.unsubscribe();
        }

    }

}
