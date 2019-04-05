import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../../core/services/models/account';

@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {
    accountId: String;

    constructor(private accountService: AccountService) {
    }

    ngOnInit() {
        // if coming from another page
        if (this.accountService.accountInfo) {
            this.accountId = this.accountService.accountInfo.publicKey;
        }

        // if the page is opened directly
        // this.accountService.accountUpdated$
        //     .filter(account => account !== null)
        //     .subscribe((acc: Account) => {
        //         this.accountId = acc.publicKey;
        //     });

    }
}
