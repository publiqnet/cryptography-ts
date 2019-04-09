import {
  Component,
  OnDestroy,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

import { ReplaySubject, Subscription } from 'rxjs';

import { AccountService } from '../../core/services/account.service';
import { ValidationService } from '../../core/validator/validator.service';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { takeUntil } from 'rxjs/operators';
import { OauthService } from 'helper-lib';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  public registerForm: FormGroup;
  private errorMessages: string;
  private conditionsWarning: string;
  public formView = 'registerForm';

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

    this.oauthService.signup(this.registerForm.value.email)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(oauthData => {
        this.formView = 'successMessage';
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

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
