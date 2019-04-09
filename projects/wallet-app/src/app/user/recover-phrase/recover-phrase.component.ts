import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { DialogService } from '../../core/services/dialog.service';
import { OauthService } from 'helper-lib';
import { ClipboardService } from 'ngx-clipboard';
import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-recover',
    templateUrl: './recover-phrase.component.html',
    styleUrls: ['./recover-phrase.component.scss']
})
export class RecoverPhraseComponent implements OnInit, OnDestroy {
    password = '';
    passwordVerified = false;
    showPrivateKeyOpened = false;
    showBackupRecoveryPhraseOpened = false;
    public firstTimeFullBackuped = true;
    decryptedBrainKeySplited: string;
    public decryptedBrainKey: string;
    public brainKey;
    loading = false;
    securityStatusName = '0/2';
    account;

    errorEventEmiterSubscription: Subscription;

    constructor(public accountService: AccountService,
                public oauthService: OauthService,
                private router: Router,
                private notificationService: NotificationService,
                private _clipboardService: ClipboardService,
                private errorService: ErrorService,
                private dialogService: DialogService) {

    }

    ngOnInit() {
        if (!this.accountService.loggedIn()) {
            this.router.navigate(['/user/login']);
        }

        this.accountService.accountUpdated$.filter(account => account).subscribe(account => {
            this.account = account;
        });

        this.errorEventEmiterSubscription = this.errorService.errorEventEmiter.subscribe((error: ErrorEvent) => {
            if (error.action === 'sendRecoverEmail') {
                this.loading = false;
                console.log('logout-error----', error.message);
            }
        });

        if (this.oauthService.privateKeySaved && this.oauthService.brainKeySaved) {
          this.firstTimeFullBackuped = false;
        }
    }

    openLaterConfirmPopup() {
        this.dialogService.openConfirmDialog('later-seen-confirmation', 'Recovery Phrase',
            '', {
            maxWidth: '480px',
            panelClass: 'modal-padding'
        });
    }

    backupPrivateKeyPopup() {
        this.dialogService.openConfirmDialog('backup-private-key', 'Backup Private Key', 'Enter your password to see your <b>Private Key</b>', {
            maxWidth: '600px',
            panelClass: 'modal-padding'
        });
    }

    backupRecoveryPhrasePopup() {
        this.dialogService.openConfirmDialog('backup-recovery-phrase', 'Backup Recovery Phrase', 'Enter your password to see your <b>Recovery Phrase</b>', {
            maxWidth: '600px',
            panelClass: 'modal-padding'
        });
    }

    getSecurityClass () {
        let currentSecurityClass = '';

        if (this.account) {
            if (this.oauthService.privateKeySaved && this.oauthService.brainKeySaved) {
                this.securityStatusName = '2/2';
                currentSecurityClass = 'high';
            } else if (this.oauthService.privateKeySaved || this.oauthService.brainKeySaved) {
                this.securityStatusName = '1/2';
                currentSecurityClass = 'middle';
            }
        }

        return 'security-level ' + currentSecurityClass;
    }

    showPrivateKey () {
        this.showPrivateKeyOpened = true;
        this.dialogService.openConfirmDialog('show-private-key', 'Private Key', 'Enter your password to see your <b>Private Key</b>', {
            maxWidth: '600px',
            panelClass: 'modal-padding'
        }).subscribe(data => {
            this.showPrivateKeyOpened = false;
        });
    }

    showBackupRecoveryPhrase () {
        this.showBackupRecoveryPhraseOpened = true;
        this.dialogService.openConfirmDialog('show-backup-recovery-phrase', 'Recovery Phrase', 'Enter your password to see your <b>Recovery Phrase</b>', {
            maxWidth: '600px',
            panelClass: 'modal-padding'
        }).subscribe(data => {
            this.showBackupRecoveryPhraseOpened = false;
        });
    }

    backupFastRecoveryPhrasePopup () {
        this.dialogService.openConfirmDialog('fast-backup-recovery-phrase', 'Backup Recovery Phrase', '', {
            maxWidth: '600px',
            panelClass: 'modal-padding'
        });
    }

    copy(text: string) {
      this._clipboardService.copyFromContent(text);
      this.notificationService.success('Copied');
    }

    ngOnDestroy() {
        this.loading = false;
        this.decryptedBrainKeySplited = '';
        this.passwordVerified = false;
        this.errorEventEmiterSubscription.unsubscribe();
    }
}