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

import { Subscription } from 'rxjs';

import { AccountService } from '../../core/services/account.service';
import { ValidationService } from '../../core/validator/validator.service';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerSuccess = false;

  public registerForm: FormGroup;
  private errorMessages: string;
  private conditionsWarning: string;
  public formView = 'registerForm';

  preRegisterSubscription: Subscription = Subscription.EMPTY;
  errorEventEmitterSubscription: Subscription = Subscription.EMPTY;

  constructor(
    private accountService: AccountService,
    private notificationService: NotificationService,
    private FormBuilder: FormBuilder,
    private errorService: ErrorService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.buildForm();
    if (isPlatformBrowser(this.platformId)) {
      this.registerForm.valueChanges.subscribe(
        data => {
          this.errorMessages = '';
          this.conditionsWarning = '';
        },
        err => console.log(err)
      );

      this.errorEventEmitterSubscription = this.errorService.errorEventEmiter.subscribe(
        (data: ErrorEvent) => {
          if (data.action === 'preRegister') {
            this.formView = 'registerForm';
            this.notificationService.error(data.message);
          }
        }
      );

      this.preRegisterSubscription = this.accountService.preRegisterDataChanged.subscribe(
        () => (this.formView = 'successMessage')
      );
    }
  }

  register() {
    if (this.registerForm.invalid) {
      return;
    }
    this.formView = '';
    this.accountService.preRegister(this.registerForm.value.email);
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
    if (isPlatformBrowser(this.platformId)) {
      this.preRegisterSubscription.unsubscribe();
      this.errorEventEmitterSubscription.unsubscribe();
    }
  }
}
