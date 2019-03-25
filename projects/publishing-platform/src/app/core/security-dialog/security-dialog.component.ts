import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { MatDialogRef } from '@angular/material';

// import { CryptService } from '../services/crypt.service';
import { AccountService } from '../services/account.service';
import { ErrorService } from '../services/error.service';
import { KeyPair } from 'cryptography-ts';
import { throwError } from 'rxjs';

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
    const brainKeyData = KeyPair.decryptBrainKeyByPassword(brainKeyEncrypted, this.password);

    if (brainKeyData.isValid) {
      const brainKey = brainKeyData.brainKey;
      const keyPair = new KeyPair(brainKey);
      this.decriptedPrivateKey = keyPair.Private.key;
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
    const brainKeyData = KeyPair.decryptBrainKeyByPassword(brainKeyEncrypted, this.password);

    if (brainKeyData.isValid) {
      this.decryptedBrainKey = brainKeyData.brainKey;
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
