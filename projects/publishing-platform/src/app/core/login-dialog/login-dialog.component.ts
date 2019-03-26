import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NotificationService } from '../services/notification.service';
import { AccountService } from '../services/account.service';
import { ValidationService } from '../validator/validator.service';
import { ErrorEvent, ErrorService } from '../services/error.service';
import { TokenCheckStatus } from '../models/enumes/TokenCheckStatus';
import { OauthService } from 'shared-lib';

@Component({
  selector: 'app-login-dialog',
  templateUrl: 'login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new ReplaySubject<void>(1);
  email: String = '';

  public loginForm: FormGroup;
  private errorMessages: string;
  private conditionsWarning: string;
  public authStep = TokenCheckStatus.Init;

  constructor(
    private accountService: AccountService,
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
      .subscribe(data => {
          this.errorMessages = '';
          this.conditionsWarning = '';
        },
        err => console.log(err)
      );

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
        if (data.action === 'login' || data.action === 'authenticate') {
          this.authStep = TokenCheckStatus.Loading;
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

    this.authStep = TokenCheckStatus.Loading;

    this.oauthService.signinAuthenticate(this.loginForm.value.email)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(userData => {
        this.authStep = TokenCheckStatus.Success;
      }, error => {
        console.log('error - ', error);
      });
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
