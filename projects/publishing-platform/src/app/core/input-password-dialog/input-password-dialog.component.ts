import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { MatDialogRef } from '@angular/material';

import { CryptService } from '../services/crypt.service';
import { AccountService } from '../services/account.service';
import { ErrorService } from '../services/error.service';

const ESCAPE_KEYCODE = 27;

@Component({
  selector: 'app-input-password-dialog',
  templateUrl: 'input-password-dialog.component.html',
  styleUrls: ['./input-password-dialog.component.css']
})
export class InputPasswordDialogComponent implements OnInit, OnDestroy {

  public title = '';
  public action = '';
  public message = '';

  protected password;
  passwordVerified = false;
  decriptedPrivateKey: string;
  passError = '';
  incorrectRecoverPhrase = '';

  public decryptedBrainKey: string;

  constructor(public dialogRef: MatDialogRef<InputPasswordDialogComponent>,
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

  onConfirmPassword() {
    if (this.accountService.checkPassword(this.password)) {
      this.dialogRef.close({password: this.password});
      this.passwordVerified = true;
    } else {
      this.passError = this.errorService.getError('password_error');
      this.passwordVerified = false;
    }
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

  // decryptPK(brainKeyEncrypted) {
  //   try {
  //     // CryptService.brainKeyDecrypt(brainKeyEncrypted, this.password).subscribe(brainKey => {
  //     //     const privateKey = CryptService.generatePrivateKey(brainKey);
  //     //     this.decriptedPrivateKey = privateKey.toWif();
  //     //     if (this.decriptedPrivateKey) {
  //     //       this.dialogRef.close({password: this.password});
  //     //         this.passwordVerified = true;
  //     //     } else {
  //     //         this.passError = this.errorService.getError('password_error');
  //     //         this.passwordVerified = false;
  //     //     }
  //     // }, error => {
  //     //     this.passError = this.errorService.getError('password_error');
  //     //     this.passwordVerified = false;
  //     // });
  //
  //   } catch (MalformedURLException) {
  //     this.passError = this.errorService.getError('password_error');
  //     this.passwordVerified = false;
  //   }
  // }

  focusFunction() {
    this.passError = '';
    this.incorrectRecoverPhrase = '';
  }

  generateBK() {
    this.decryptBK(this.accountService.brainKeyEncrypted);
  }

  decryptBK(brainKeyEncrypted) {
    try {
      // CryptService.brainKeyDecrypt(brainKeyEncrypted, this.password).subscribe(brainKey => {
      //         if (brainKey) {
      //           this.dialogRef.close({password: this.password});
      //             this.decryptedBrainKey = brainKey;
      //             this.passwordVerified = true;
      //         }
      //     }, error => {
      //         this.passError = this.errorService.getError('password_error');
      //         this.passwordVerified = false;
      //     }
      // );

    } catch (MalformedURLException) {
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
