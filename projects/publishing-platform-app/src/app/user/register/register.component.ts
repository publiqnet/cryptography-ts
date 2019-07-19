import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OauthService } from 'helper-lib';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { AccountService } from '../../core/services/account.service';
import { NotificationService } from '../../core/services/notification.service';
import { ValidationService } from '../../core/validator/validator.service';
import { TokenCheckStatus } from '../../core/models/enumes/TokenCheckStatus';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  public authStep = TokenCheckStatus.Init;
  public registerForm: FormGroup;
  public formView = 'registerForm';
  public emailError = '';

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    private accountService: AccountService,
    private notificationService: NotificationService,
    private FormBuilder: FormBuilder,
    private errorService: ErrorService,
    private oauthService: OauthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit() {
    this.buildForm();
    this.registerForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
          this.emailError = '';
        },
        err => console.log(err)
      );

    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
          if (data.action === 'preRegister') {
            this.formView = 'registerForm';
            this.emailError = this.errorService.getError('email_error');
          }
        }
      );
  }

  get AuthStepStatusEnum() {
    return TokenCheckStatus;
  }

  register() {
    if (this.registerForm.invalid) {
      return;
    }

    this.formView = '';

    this.oauthService.authenticate(this.registerForm.value.email, true)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(oauthData => {
        if (oauthData.status == 204) {
          this.formView = 'successRegisterMessage';
        } else if (oauthData.status == 200) {
          this.formView = 'needLoginMessage';
        }
        this.authStep = TokenCheckStatus.Success;
      }, error => {
        this.errorService.handleError('preRegister', error);
      });
  }

  private buildForm() {
    this.registerForm = this.FormBuilder.group({
      email: new FormControl('', [
        Validators.required,
        ValidationService.emailValidator
      ])
    });
  }

  newRequest($event) {
    $event.preventDefault();
    this.registerForm.reset();
    this.authStep = TokenCheckStatus.Init;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
