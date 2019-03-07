import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { Subscription } from 'rxjs';

import { NotificationService } from '../services/notification.service';
import { AccountService } from '../services/account.service';
import { ValidationService } from '../validator/validator.service';
import { ErrorEvent, ErrorService } from '../services/error.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: 'login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit, OnDestroy {
  email: String = '';

  public loginForm: FormGroup;
  private errorMessages: string;
  private conditionsWarning: string;
  public formSubmitted = false;

  authenticateSubscription: Subscription = Subscription.EMPTY;
  loginSubscription: Subscription = Subscription.EMPTY;
  errorEventEmitterSubscription: Subscription = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private accountService: AccountService,
    public notificationService: NotificationService,
    private router: Router,
    private FormBuilder: FormBuilder,
    private errorService: ErrorService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.buildForm();

    if (isPlatformBrowser(this.platformId)) {
      this.loginForm.valueChanges.subscribe(
        data => {
          this.errorMessages = '';
          this.conditionsWarning = '';
        },
        err => console.log(err)
      );

      this.errorEventEmitterSubscription = this.errorService.errorEventEmiter.subscribe(
        (data: ErrorEvent) => {
          if (data.action === 'login' || data.action === 'authenticate') {
            this.formSubmitted = false;
            this.notificationService.error(data.message);
          }
        }
      );

      this.authenticateSubscription = this.accountService.resForStep2DataChanged.subscribe(
        resForStep2 => {
          this.accountService.login(
            this.loginForm.value.email,
            this.loginForm.value.password,
            resForStep2
          );
        }
      );

      this.loginSubscription = this.accountService.loginDataChanged.subscribe(
        user => {
          this.formSubmitted = false;
          this.dialogRef.close(true);
        }
      );
    }
  }

  authenticate() {
    if (this.loginForm.invalid) {
      return;
    }
    this.formSubmitted = true;
    this.accountService.authenticate(this.loginForm.value.email);
  }

  private buildForm() {
    this.loginForm = this.FormBuilder.group({
      email: new FormControl('', [
        Validators.required,
        ValidationService.emailValidator
      ]),
      password: new FormControl('', [Validators.required])
    });
  }

  onCloseCancel() {
    this.dialogRef.close(false);
    return false;
  }

  recover() {
    this.router.navigate(['/user/recover']);
    return this.onCloseCancel();
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.errorEventEmitterSubscription.unsubscribe();
      this.authenticateSubscription.unsubscribe();
      this.loginSubscription.unsubscribe();
    }
  }
}
