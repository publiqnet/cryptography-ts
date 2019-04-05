import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { CryptService } from '../services/crypt.service';
import { AccountService } from '../services/account.service';
import { ErrorService } from '../services/error.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OauthService } from 'helper-lib';

const ESCAPE_KEYCODE = 27;

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
  // setBrainKeySubscription: Subscription;

  public decryptedBrainKey: string;
  decryptedBrainKeySplited;
  public checkingPhrasesArray = [];
  chuckedBrainKeyArray = [];
  chuckSize = 4;
  confirmClicked = false;

  @ViewChild('firstInput') private firstInput;
  @ViewChild('secondInput') private secondInput;
  @ViewChild('thirdInput') private thirdInput;
  @ViewChild('fourthInput') private fourthInput;

  checkingFormGroup: FormGroup;

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


    // this.setBrainKeySubscription = this.accountService.brainKeySavedDataChanged.subscribe(data => {
    //     this.decryptedBrainKey = '';
    //     this.onCloseConfirm();
    // });
    //
    // this.accountService.brainKeySeenDataChanged.subscribe(data => {
    //     this.onCloseConfirm();
    // });

    if (this.action && this.action == 'fast-backup-recovery-phrase') {
      this.fastDecryptBK();
    }
  }

  // @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
  // if (event.keyCode === ESCAPE_KEYCODE) {
  //     this.onCloseCancel();
  // }
  // }

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

    // try {
    //     const authData = this.accountService.getAuthenticateData();
    //     CryptService.brainKeyDecrypt(authData.brainKey, this.password).subscribe(brainKey => {
    //         const privateKey = CryptService.generatePrivateKey(brainKey);
    //         this.decriptedPrivateKey = privateKey.toWif();
    //         if (this.decriptedPrivateKey) {
    //             this.passwordVerified = true ;
    //         } else {
    //             this.passError = this.errorService.getError('password_error');
    //             this.passwordVerified = false;
    //         }
    //     });
    //
    // } catch (MalformedURLException) {
    //     this.passError = this.errorService.getError('password_error');
    //     this.passwordVerified = false;
    //     this.loading = false;
    // }
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

    // const brainKey = this.oauthService.brainKey;
    // this.decryptedBrainKey = brainKey;
    // this.decryptedBrainKeySplited = brainKey.split(' ');
    // if (Array.isArray(this.decryptedBrainKeySplited)) {
    //   this.chuckedBrainKeyArray = [];
    //   let nextChunckedList;
    //   let randomPhrasekey;
    //   for (let i = 0; i < this.decryptedBrainKeySplited.length; i += this.chuckSize) {
    //     nextChunckedList = this.decryptedBrainKeySplited.slice(i, this.chuckSize + i);
    //     const rand = nextChunckedList[Math.floor(Math.random() * nextChunckedList.length)];
    //     this.decryptedBrainKeySplited.map((k, v) => (rand == k) ? randomPhrasekey = v : '');
    //     this.checkingPhrasesArray.push(randomPhrasekey);
    //     this.chuckedBrainKeyArray.push(nextChunckedList);
    //   }
    //   this.checkingPhrasesArray = this.shuffle(this.checkingPhrasesArray);
    //   this.passwordVerified = this.recoveryPhrasechecking = true;
    //   this.loading = false;
    // }

    // try {
    //     this.loading = true;
    //     const authData = this.accountService.getAuthenticateData();
    //     CryptService.brainKeyDecrypt(authData.brainKey, this.password).subscribe(brainKey => {
    //             this.decryptedBrainKey = brainKey;
    //             this.decryptedBrainKeySplited = brainKey.split(' ');
    //             if (Array.isArray(this.decryptedBrainKeySplited)) {
    //                 this.chuckedBrainKeyArray = [];
    //                 let nextChunckedList;
    //                 let randomPhrasekey;
    //                 for (let i = 0; i < this.decryptedBrainKeySplited.length; i += this.chuckSize) {
    //                     nextChunckedList = this.decryptedBrainKeySplited.slice(i, this.chuckSize + i);
    //                     const rand = nextChunckedList[Math.floor(Math.random() * nextChunckedList.length)];
    //                     this.decryptedBrainKeySplited.map((k, v) => (rand == k) ? randomPhrasekey = v : '');
    //                     this.checkingPhrasesArray.push(randomPhrasekey);
    //                     this.chuckedBrainKeyArray.push(nextChunckedList);
    //                 }
    //                 this.checkingPhrasesArray = this.shuffle(this.checkingPhrasesArray);
    //                 this.passwordVerified = this.recoveryPhrasechecking = true;
    //                 this.loading = false;
    //             }
    //         }, error => {
    //             this.passError = this.errorService.getError('password_error');
    //         }
    //     );
    // } catch (MalformedURLException) {
    //     this.passError = this.errorService.getError('password_error');
    //     this.loading = false;
    // }
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
    console.log('action: ', this.action, this.oauthService.brainKey);
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
        this.oauthService.setBrainKeySaved(this.oauthService.brainKey).subscribe(data => {
          this.decryptedBrainKey = '';
          this.onCloseConfirm();
        });
      } else {
        this.incorrectRecoverPhrase = this.errorService.getError('incorrect_recover_phrase');
        console.log('incorrectRecoverPhrase', this.incorrectRecoverPhrase);
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
    this.oauthService.setBrainKeySeen(this.oauthService.brainKey).subscribe(data => {
      console.log(data);
      this.decryptedBrainKey = '';
      this.onCloseConfirm();

      // this.accountInfo.brainKeySaved = true;
      // this.accountInfo.brainKeySeen = true;
      // this.decryptedBrainKey = '';
      // this.accountUpdated.next(this.accountInfo);
      // this.brainKeySavedDataChanged.next(data);
    });
  }

  setPrivateKeySaved() {
    this.oauthService.setPrivateKeySaved(this.oauthService.brainKey).subscribe(data => {
      this.onCloseConfirm();
    });
  }

  ngOnDestroy() {
    this.confirmClicked = false;
    // this.setBrainKeySubscription.unsubscribe();

  }
}
