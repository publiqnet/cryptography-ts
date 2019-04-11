import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { ClipboardService } from 'ngx-clipboard';
import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {
    accountId: String;

    constructor(private accountService: AccountService,
                private notificationService: NotificationService,
                private _clipboardService: ClipboardService) {
    }

    ngOnInit() {
        if (this.accountService.accountInfo) {
            this.accountId = this.accountService.accountInfo.publicKey;
        }
    }

    copy(text: string) {
      this._clipboardService.copyFromContent(text);
      this.notificationService.success('Copied');
    }
}
