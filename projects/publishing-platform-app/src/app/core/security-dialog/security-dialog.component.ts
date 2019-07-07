import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

import { CryptService } from '../services/crypt.service';
import { AccountService } from '../services/account.service';
import { ErrorService } from '../services/error.service';

const ESCAPE_KEYCODE = 27;

@Component({
  selector: 'app-security-dialog',
  templateUrl: 'security-dialog.component.html',
  styleUrls: ['./security-dialog.component.css']
})
export class SecurityDialogComponent implements OnInit, OnDestroy {

  public title = '';
  public action = '';
  public message = '';

  protected password;
  passwordVerified = false;
  decriptedPrivateKey: string;
  passError = '';
  incorrectRecoverPhrase = '';

  public decryptedBrainKey: string;

  constructor(public dialogRef: MatDialogRef<SecurityDialogComponent>,
              public accountService: AccountService,
              public cryptService: CryptService,
              private errorService: ErrorService) {
  }

  ngOnInit() {
  }

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    // if (event.keyCode === ESCAPE_KEYCODE) {
    //     this.onCloseCancel();
    // }
  }

  onCloseCancel() {
    this.passwordVerified = false;
    this.dialogRef.close(false);
    return false;
  }

  onCloseConfirm() {
    this.passwordVerified = false;
    this.dialogRef.close(true);
    return true;
  }

  passwordValidator() {
    if (this.password) {
      return false;
    } else {
      return true;
    }
  }

  generatePrivateKey() {
    this.decryptPK(this.accountService.brainKeyEncrypted);
  }

  decryptPK(brainKeyEncrypted) {
    if (this.cryptService.checkPassword(brainKeyEncrypted, this.password)) {
      const brainKey = this.cryptService.getDecryptedBrainKey(brainKeyEncrypted, this.password);
      this.decriptedPrivateKey = this.cryptService.getPrivateKey(brainKey);
    }

    if (this.decriptedPrivateKey) {
      this.passwordVerified = true;
    } else {
      this.passError = this.errorService.getError('password_error');
      this.passwordVerified = false;
    }
  }

  focusFunction() {
    this.passError = '';
    this.incorrectRecoverPhrase = '';
  }

  generateBK() {
    this.decryptBK(this.accountService.brainKeyEncrypted);
  }

  decryptBK(brainKeyEncrypted) {
    if (this.cryptService.checkPassword(brainKeyEncrypted, this.password)) {
      this.decryptedBrainKey = this.cryptService.getDecryptedBrainKey(brainKeyEncrypted, this.password);
      this.passwordVerified = true;
    } else {
      this.passError = this.errorService.getError('password_error');
      this.passwordVerified = false;
    }
  }

  public keyupFunc(event: KeyboardEvent, callBackFunc: string): void {
    this.focusFunction();
    if ((event.code === 'Enter' || event.code === 'NumpadEnter') && !this.passwordValidator() && callBackFunc !== '') {
      this[callBackFunc]();
    }
  }

  ngOnDestroy() {
    this.passwordVerified = false;
  }
}
