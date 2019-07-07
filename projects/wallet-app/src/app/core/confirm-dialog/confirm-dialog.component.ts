import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CryptService } from '../services/crypt.service';
import { AccountService } from '../services/account.service';
import { ErrorService } from '../services/error.service';
import { OauthService } from 'helper-lib';


@Component({
  selector: 'app-confirm-dialog',
  templateUrl: 'confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {

  public title = '';
  public action = '';
  public message = '';

  protected password;
  loading = false;
  passwordVerified = false;
  recoveryPhrasechecking = false;
  decriptedPrivateKey: string;
  passError = '';
  incorrectRecoverPhrase = '';

  public decryptedBrainKey: string;
  decryptedBrainKeySplited;
  public checkingPhrasesArray = [];
  chuckedBrainKeyArray = [];
  chuckSize = 4;
  confirmClicked = false;

  @ViewChild('firstInput', {static: false}) private firstInput;
  @ViewChild('secondInput', {static: false}) private secondInput;
  @ViewChild('thirdInput', {static: false}) private thirdInput;
  @ViewChild('fourthInput', {static: false}) private fourthInput;

  checkingFormGroup: FormGroup;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              public accountService: AccountService,
              public oauthService: OauthService,
              public cryptService: CryptService,
              private errorService: ErrorService,
              private _formBuilder: FormBuilder) {
  }

  ngOnInit() {

    this.checkingFormGroup = this._formBuilder.group({
      first: ['', Validators.required],
      second: ['', Validators.required],
      third: ['', Validators.required],
      fourth: ['', Validators.required]
    });

    if (this.action && this.action == 'fast-backup-recovery-phrase') {
      this.fastDecryptBK();
    }
  }

  onCloseCancel() {
    this.dialogRef.close(false);
    return false;
  }

  onCloseConfirm() {
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
    if (this.cryptService.checkPassword(this.accountService.brainKeyEncrypted, this.password)) {
      const brainKey = this.cryptService.getDecryptedBrainKey(this.accountService.brainKeyEncrypted, this.password);
      this.decriptedPrivateKey = this.cryptService.getPrivateKey(brainKey);
    }

    if (this.decriptedPrivateKey) {
      this.passwordVerified = true;
    } else {
      this.passError = this.errorService.getError('password_error');
      this.passwordVerified = false;
    }
  }

  decryptPK() {
    if (this.cryptService.checkPassword(this.accountService.brainKeyEncrypted, this.password)) {
      const brainKey = this.cryptService.getDecryptedBrainKey(this.accountService.brainKeyEncrypted, this.password);
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

  decryptBK() {
    if (this.cryptService.checkPassword(this.accountService.brainKeyEncrypted, this.password)) {
      this.decryptedBrainKey = this.cryptService.getDecryptedBrainKey(this.accountService.brainKeyEncrypted, this.password);

      this.decryptedBrainKeySplited = this.decryptedBrainKey.split(' ');
      if (Array.isArray(this.decryptedBrainKeySplited)) {
        this.chuckedBrainKeyArray = [];
        let nextChunckedList;
        let randomPhrasekey;
        for (let i = 0; i < this.decryptedBrainKeySplited.length; i += this.chuckSize) {
          nextChunckedList = this.decryptedBrainKeySplited.slice(i, this.chuckSize + i);
          const rand = nextChunckedList[Math.floor(Math.random() * nextChunckedList.length)];
          this.decryptedBrainKeySplited.map((k, v) => (rand == k) ? randomPhrasekey = v : '');
          this.checkingPhrasesArray.push(randomPhrasekey);
          this.chuckedBrainKeyArray.push(nextChunckedList);
        }
        this.checkingPhrasesArray = this.shuffle(this.checkingPhrasesArray);
        this.passwordVerified = this.recoveryPhrasechecking = true;
        this.loading = false;
      }
    } else {
      this.passError = this.errorService.getError('password_error');
      this.passwordVerified = false;
    }
  }

  fastDecryptBK() {
    const brainKey = this.oauthService.brainKey;
    this.decryptedBrainKey = brainKey;
    this.decryptedBrainKeySplited = brainKey.split(' ');
    if (Array.isArray(this.decryptedBrainKeySplited)) {
      this.chuckedBrainKeyArray = [];
      let nextChunckedList;
      let randomPhrasekey;
      for (let i = 0; i < this.decryptedBrainKeySplited.length; i += this.chuckSize) {
        nextChunckedList = this.decryptedBrainKeySplited.slice(i, this.chuckSize + i);
        const rand = nextChunckedList[Math.floor(Math.random() * nextChunckedList.length)];
        this.decryptedBrainKeySplited.map((k, v) => (rand == k) ? randomPhrasekey = v : '');
        this.checkingPhrasesArray.push(randomPhrasekey);
        this.chuckedBrainKeyArray.push(nextChunckedList);
      }
      this.checkingPhrasesArray = this.shuffle(this.checkingPhrasesArray);
      this.passwordVerified = this.recoveryPhrasechecking = true;
      this.loading = false;
    }
  }

  shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      const index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      const temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }

    return array;
  }

  onSubmit() {
    this.loading = true;
    if (this.checkingFormGroup.valid) {
      const firstInputIndex = this.firstInput.nativeElement.getAttribute('index');
      const secondInputIndex = this.secondInput.nativeElement.getAttribute('index');
      const thirdInputIndex = this.thirdInput.nativeElement.getAttribute('index');
      const fourthInputIndex = this.fourthInput.nativeElement.getAttribute('index');

      if ((this.decryptedBrainKeySplited[firstInputIndex].trim() == this.checkingFormGroup.value.first.trim())
        && (this.decryptedBrainKeySplited[secondInputIndex].trim() == this.checkingFormGroup.value.second.trim())
        && (this.decryptedBrainKeySplited[thirdInputIndex].trim() == this.checkingFormGroup.value.third.trim())
        && (this.decryptedBrainKeySplited[fourthInputIndex].trim() == this.checkingFormGroup.value.fourth.trim())
      ) {
        this.oauthService.setBrainKeySaved(this.oauthService.brainKey)
          .pipe(
            takeUntil(this.unsubscribe$)
          )
          .subscribe(data => {
            this.decryptedBrainKey = '';
            this.onCloseConfirm();
          });
      } else {
        this.incorrectRecoverPhrase = this.errorService.getError('incorrect_recover_phrase');
        this.loading = false;
      }
    }
  }

  confirmChanged(e) {
    if (e.target.checked) {
      this.confirmClicked = true;
    } else {
      this.confirmClicked = false;
    }
  }

  public keyupFunc(event: KeyboardEvent, callBackFunc: string): void {
    this.focusFunction();
    if ((event.code === 'Enter' || event.code === 'NumpadEnter') && !this.passwordValidator() && callBackFunc !== '') {
      this[callBackFunc]();
    }
  }

  confirmRecoveyPhraseSeen() {
    this.oauthService.setBrainKeySeen(this.oauthService.brainKey)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
      this.decryptedBrainKey = '';
      this.onCloseConfirm();
    });
  }

  setPrivateKeySaved() {
    this.oauthService.setPrivateKeySaved(this.oauthService.brainKey)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
      this.onCloseConfirm();
    });
  }

  ngOnDestroy() {
    this.confirmClicked = false;

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
