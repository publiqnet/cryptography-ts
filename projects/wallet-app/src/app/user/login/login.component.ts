import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountService } from '../../core/services/account.service';
import { NotificationService } from '../../core/services/notification.service';
import { ValidationService } from '../../core/validator/validator.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { TokenCheckStatus } from '../../core/models/enumes/TokenCheckStatus';
import { OauthService } from 'helper-lib';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new ReplaySubject<void>(1);
  email: String = '';

  public loginForm: FormGroup;
  public authStep = TokenCheckStatus.Init;
  public hasErrors = false;
  public formView = 'loginForm';

  constructor(
    public accountService: AccountService,
    private oauthService: OauthService,
    public notificationService: NotificationService,
    private errorService: ErrorService,
    private router: Router,
    private FormBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    this.buildForm();
    this.loginForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.hasErrors = false;
        this.accountService.autoLogOut = false;
      }, err => console.log(err));

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
        if (data.action === 'login' || data.action === 'authenticate') {
          this.authStep = TokenCheckStatus.Loading;
          this.notificationService.error(data.message);
        } else if (data.action === 'preLogin') {
          this.authStep = TokenCheckStatus.Init;
          this.notificationService.error(data.message);
        }
      });
  }

  get AuthStepStatusEnum() {
    return TokenCheckStatus;
  }

  authenticate() {

    if (this.loginForm.invalid) {
      return;
    }

    this.formView = '';

    this.authStep = TokenCheckStatus.Loading;

    this.oauthService.authenticate(this.loginForm.value.email, true)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((oauthData) => {
        if (oauthData.status == 204) {
          this.formView = 'needRegisterMessage';
        } else if (oauthData.status == 200) {
          this.formView = 'successLoginMessage';
        }
        this.authStep = TokenCheckStatus.Success;
      }, error => {
        if (error.status == 409) {
          this.errorService.handleError('preLogin', {status: 409, error: {message: 'incorect_email'}});
        } else {
          this.errorService.handleError('preLogin', {status: 500, error: error.message});
        }
      });
  }

  validateForm() {
    this.hasErrors = this.loginForm.invalid;
  }

  private buildForm() {
    this.loginForm = this.FormBuilder.group({
      email: new FormControl('', [
        Validators.required,
        ValidationService.emailValidator
      ])
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}