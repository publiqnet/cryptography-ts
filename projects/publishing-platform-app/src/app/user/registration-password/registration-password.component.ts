import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from '../../core/services/account.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../core/validator/validator.service';
import { TokenCheckStatus } from '../../core/models/enumes/TokenCheckStatus';
import { OauthService } from 'helper-lib';

@Component({
  selector: 'app-registration-password',
  templateUrl: './registration-password.component.html',
  styleUrls: ['./registration-password.component.scss']
})
export class RegistrationPasswordComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new ReplaySubject<void>(1);
  public configForm: FormGroup;
  public tokenCheckStatus = TokenCheckStatus.Init;
  public token;
  public stringToSign;

  constructor(
    private formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public accountService: AccountService,
    public oauthService: OauthService,
    private errorService: ErrorService,
    public t: TranslateService
  ) {
  }

  ngOnInit() {
    this.buildForm();
    this.activatedRoute.params
      .pipe(
        filter(params => params.code),
        switchMap(params => {
          this.token = params.code;
          return this.oauthService.signupConfirmation(params.code);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(result => {
        this.stringToSign = result.stringToSign;
        this.tokenCheckStatus = TokenCheckStatus.Success;
      }, error => {
        this.router.navigate(['/page-not-found']);
      });

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
        if (data.action === 'loadConfirm') {
          this.router.navigate(['/page-not-found']);
        }
      });
  }

  get TokenCheckStatusEnum() {
    return TokenCheckStatus;
  }

  private buildForm() {
    this.registerPasswordForm = this.formBuilder.group({
        password: new FormControl('', [
          Validators.required,
          ValidationService.passwordValidator
        ]),
        confirmPassword: new FormControl('', [
          Validators.required,
          ValidationService.passwordValidator
        ])
      },
      { validator: ValidationService.passwordsEqualValidator }
    );
  }

  onSubmit() {
    this.tokenCheckStatus = TokenCheckStatus.Loading;
    this.oauthService.signupComplete(this.stringToSign, this.token, this.configForm.value.password)
      .pipe(
        switchMap((data: any) => {
          this.accountService.brainKeyEncrypted = data.brainKey;
          return this.accountService.accountAuthenticate(data.token);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(data => {
        this.router.navigate(['/']);
      }, (err) => {
        this.tokenCheckStatus = TokenCheckStatus.Error;
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
