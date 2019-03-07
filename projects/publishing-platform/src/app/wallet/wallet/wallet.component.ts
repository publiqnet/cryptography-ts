import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Subscription } from 'rxjs';

import { Broadcaster } from '../../broadcaster/broadcaster';
import { WalletService } from '../../core/services/wallet.service';

@Component({
    selector: 'app-wallet',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit, OnDestroy {
    broadcasterSubscription: Subscription = Subscription.EMPTY;

    constructor(private broadcaster: Broadcaster,
                @Inject(PLATFORM_ID) private platformId: Object,
                public walletService: WalletService) {
    }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.broadcasterSubscription = this.broadcaster
                .on<any>('changeToTabTransactions')
                .subscribe(data => {
                    this.walletService.selectedTabIndex = this.walletService.tabs.transaction;
                });
        }
    }

    onLinkClick(event) {
        this.walletService.selectedTabIndex = event.index;
    }


    ngOnDestroy(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.broadcasterSubscription.unsubscribe();
            this.walletService.selectedTabIndex = this.walletService.tabs.receive;
        }
    }
}
