import { Component, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ValidationService } from '../../core/validator/validator.service';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { OauthService } from 'helper-lib';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  public registerForm: FormGroup;
  public formView = 'registerForm';
  public hasErrors = false;

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
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
          this.hasErrors = false;
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
            this.notificationService.error(data.message);
          }
        }
      );
  }

  register() {
    if (this.registerForm.invalid) {
      return;
    }

    this.formView = '';

    // @ts-ignore
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
      }, error => {
        if (error.status == 409) {
          this.errorService.handleError('preRegister', {status: 409, error: {message: 'incorect_email'}});
        } else {
          this.errorService.handleError('preRegister', {status: 500, error: error.message});
        }
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

  validateForm() {
    this.hasErrors = this.registerForm.invalid;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
