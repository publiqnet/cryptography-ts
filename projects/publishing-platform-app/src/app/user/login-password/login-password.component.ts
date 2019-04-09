import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { filter, flatMap, switchMap, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from '../../core/services/account.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TokenCheckStatus } from '../../core/models/enumes/TokenCheckStatus';
import { NotificationService } from '../../core/services/notification.service';
import { OauthService } from 'helper-lib';

@Component({
  selector: 'app-login-password',
  templateUrl: './login-password.component.html',
  styleUrls: ['./login-password.component.scss']
})
export class LoginPasswordComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new ReplaySubject<void>(1);
  public configForm: FormGroup;
  public tokenCheckStatus = TokenCheckStatus.Init;
  public encryptedBrainKey;
  public token;
  public stringToSign;


  constructor(
    private formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public accountService: AccountService,
    public oauthService: OauthService,
    private errorService: ErrorService,
    public notificationService: NotificationService,
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
          return this.oauthService.signinCheckCode(params.code);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(result => {
        this.stringToSign = result.stringToSign;
        this.encryptedBrainKey = result.brainKey;
        this.accountService.brainKeyEncrypted = this.encryptedBrainKey;
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
          } else if (data.action === 'login' || data.action === 'authenticate') {
            this.notificationService.error(data.message);
          }
        }
      );
  }

  get TokenCheckStatusEnum() {
    return TokenCheckStatus;
  }

  private buildForm() {
    this.configForm = this.formBuilder.group({
        password: new FormControl('', [
          Validators.required
        ])
      }
    );
  }

  onSubmit() {
    this.tokenCheckStatus = TokenCheckStatus.Loading;
    this.oauthService.signinGetToken(this.encryptedBrainKey, this.stringToSign, this.token, this.configForm.value.password)
      .pipe(
        switchMap((data: any) => this.accountService.accountAuthenticate(data.token)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(authData => {
        this.router.navigate(['/']);
      }, (err) => {
        this.tokenCheckStatus = TokenCheckStatus.Error;
        this.errorService.handleError('login', {status: 404});
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
