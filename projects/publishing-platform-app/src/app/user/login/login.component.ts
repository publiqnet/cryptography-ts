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
      .subscribe(
      (data: ErrorEvent) => {
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

    this.oauthService.authenticate(this.loginForm.value.email, true) // TODO - change with oauth logic
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
