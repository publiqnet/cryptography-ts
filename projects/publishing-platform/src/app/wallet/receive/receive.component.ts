import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AccountService } from '../../core/services/account.service';
import { Broadcaster } from '../../broadcaster/broadcaster';

@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit, OnDestroy {
    accountId: String;
    accountUpdatedSubscription: Subscription = Subscription.EMPTY;

    constructor(
        private accountService: AccountService,
        @Inject(PLATFORM_ID) private platformId: Object,
        private broadcaster: Broadcaster
    ) {
    }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            // if coming from another page
            const account = this.accountService.getAccount();
            if (account) {
                this.accountId = account.username;
            }

            // if the page is opened directly
            this.accountUpdatedSubscription = this.accountService.accountUpdated$
                .pipe(filter(result => result != null))
                .subscribe(acc => {
                    this.accountId = acc.username;
                });
        }
    }

    showTabTransactions() {
        this.broadcaster.broadcast('changeToTabTransactions');
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.accountUpdatedSubscription.unsubscribe();
        }
    }
}
