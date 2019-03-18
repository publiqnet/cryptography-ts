import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { ReplaySubject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from '../../core/services/account.service';
import { Router } from '@angular/router';
import { ErrorService, ErrorEvent } from '../../core/services/error.service';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit, OnDestroy {
  password = '';
  passwordVerified = false;
  showPrivateKeyOpened = false;
  showBackupRecoveryPhraseOpened = false;
  public brainKey;
  loading = false;
  account: Account;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(public accountService: AccountService,
              private router: Router,
              private errorService: ErrorService,
              private translateService: TranslateService,
              @Inject(PLATFORM_ID) private platformId: Object,
              private dialogService: DialogService) {

  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.accountService.accountInfo) {
        this.router.navigate(['/user/login']);
      } else {
        this.brainKey = this.accountService.accountInfo.brainKey;
      }

      this.accountService.accountUpdated$
        .pipe(
          filter(account => account),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(account => {
          this.account = account;
        });

      this.errorService.errorEventEmiter
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((error: ErrorEvent) => {
          if (error.action === 'sendRecoverEmail') {
            this.loading = false;
          }
        });
    }

  }

  showPrivateKey() {
    this.showPrivateKeyOpened = true;
    const dialogText = this.translateService.instant('dialog.security');
    this.dialogService.openSecurityDialog('show-private-key', dialogText['private_key_title'], dialogText['private_key_message'], {
      maxWidth: '600px',
      panelClass: 'modal-padding'
    })
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.showPrivateKeyOpened = false;
      });
  }

  showBackupRecoveryPhrase() {
    this.showBackupRecoveryPhraseOpened = true;
    const dialogText = this.translateService.instant('dialog.security');
    this.dialogService.openSecurityDialog('show-backup-recovery-phrase', dialogText['recovery_phrase_title'], dialogText['recovery_phrase_message'], {
      maxWidth: '600px',
      panelClass: 'modal-padding'
    })
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.showBackupRecoveryPhraseOpened = false;
      });
  }

  ngOnDestroy() {
    this.loading = false;
    this.passwordVerified = false;
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
