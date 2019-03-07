import { Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Account } from '../../core/services/models/account';
import { AccountService } from '../../core/services/account.service';
import { DialogService } from '../../core/services/dialog.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit, OnDestroy {
    @Input() accounts: Array<any>;

    @Input() hasSeparator: boolean;
    private currentAccount: Account;
    private subscriptions: Subscription = new Subscription();

    constructor(private accountService: AccountService,
                private dialogService: DialogService,
                @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.subscriptions.add(
                this.accountService.followAuthorChanged.subscribe(data => {
                    console.log('followAuthorChanged --- ', data);
                    if (this.currentAccount && data == 'OK') {
                        this.currentAccount['subscribing'] = 1;
                    }
                })
            );

            this.subscriptions.add(
                this.accountService.unFollowAuthorChanged.subscribe(data => {
                    console.log('unFollowAuthorChanged --- ', data);
                    if (this.currentAccount && data == 'OK') {
                        this.currentAccount['subscribing'] = 0;
                    }
                })
            );
        }
    }

    getAccountName(account: Account): string {
        let name = '';
        if (account.firstName && account.lastName) {
            name = account.firstName + ' ' + account.lastName;
        } else if (!account.firstName && !account.lastName) {
            name = account.name;
        } else {
            name = (account.firstName ? account.firstName : '') + ' ' + (account.lastName ? account.lastName : '');
        }
        return name;
    }

    checkImageHashExist(account: Account) {
        const meta = account.meta ? account.meta : '';
        const image = meta.image_hash ? meta.image_hash : '';
        return !!(account && meta && image && image !== '' && !image.startsWith('http://127.0.0.1') && image.indexOf('_thumb') !== -1);
    }

    follow(account: Account) {
        if (!this.accountService.loggedIn()) {
            this.openLoginDialog();
            return false;
        }
        this.currentAccount = account;
        this.accountService.follow(account.name);
    }

    unfollow(account: Account) {
        if (!this.accountService.loggedIn()) {
            this.openLoginDialog();
            return false;
        }
        this.currentAccount = account;
        this.accountService.unfollow(account.name);
    }

    private openLoginDialog() {
        this.dialogService.openLoginDialog().subscribe(() => {});
    }

    ngOnDestroy(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.subscriptions.unsubscribe();
        }
    }

}
