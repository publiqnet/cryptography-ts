import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../core/validator/validator.service';
import { takeUntil } from 'rxjs/operators';
import { TokenCheckStatus } from '../../core/models/enumes/TokenCheckStatus';
import { OauthService } from 'helper-lib';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new ReplaySubject<void>(1);
  public loginForm: FormGroup;
  public emailError = '';
  public authStep = TokenCheckStatus.Init;
  public loading = false;
  public formView = 'loginForm';
  constructor(
    private FormBuilder: FormBuilder,
    private oauthService: OauthService,
    private errorService: ErrorService
  ) {
  }

  ngOnInit() {
    this.buildForm();
    this.loginForm.statusChanges
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
      () => this.emailError = ''
    );

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((error: ErrorEvent) => {
        console.log(error);
        if (error.action === 'login') {
          this.emailError = this.errorService.getError('email_error');
        }
      });
  }

  get AuthStepStatusEnum() {
    return TokenCheckStatus;
  }

  signIn() {
    if (this.loginForm.invalid) {
      return;
    }
    this.oauthService.authenticate(this.loginForm.value.email, true)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(oauthData => {
          this.formView = '';
        if (oauthData.status == 204) {
          // needRegister
          this.formView = 'needRegisterMessage';
        } else if (oauthData.status == 200) {
          // successLogin
          this.formView = 'successLoginMessage';
        }
        this.authStep = TokenCheckStatus.Success;
      }, error => this.errorService.handleError('login', error)
      );
  }

  private buildForm() {
    this.loginForm = this.FormBuilder.group({
      email: new FormControl('', [Validators.required, ValidationService.emailValidator])
    });
  }

  newRequest($event) {
    $event.preventDefault();
    this.loginForm.reset();
    this.authStep = TokenCheckStatus.Init;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
