import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// import { key } from 'arcnet-js/lib/src/Key';

import { ValidationService } from '../../core/validator/validator.service';
import { AccountService } from '../../core/services/account.service';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { dictionary } from '../../core/dictionary/dictionary';

@Component({
  selector: 'app-brain-key',
  templateUrl: './brain-key.component.html',
  styleUrls: ['./brain-key.component.scss']
})
export class BrainKeyComponent implements OnInit, OnDestroy {
  // public brainKey: string;
  public registerForm: FormGroup;
  public loading = true;

  registerSubscription: Subscription = Subscription.EMPTY;
  errorEventEmitterSubscription: Subscription = Subscription.EMPTY;

  constructor(
    private FormBuilder: FormBuilder,
    public accountService: AccountService,
    public notificationService: NotificationService,
    private router: Router,
    private errorService: ErrorService,
    public t: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // this.accountService.brainKey = key.suggest_brain_key(dictionary);
    this.loading = false;
    this.buildForm();
    if (isPlatformBrowser(this.platformId)) {
      this.registerForm.valueChanges.subscribe(
        data => {},
        err => console.log(err)
      );

      this.errorEventEmitterSubscription = this.errorService.errorEventEmiter.subscribe(
        (data: ErrorEvent) => {
          if (data.action === 'register') {
            this.notificationService.error(data.message);
            this.loading = false;
          }
        }
      );

      this.registerSubscription = this.accountService.registerDataChanged.subscribe(
        res => {
          this.loading = false;
          this.router.navigate(['/']);
        }
      );
    }
  }

  register() {
    this.loading = true;
    this.accountService.register(this.registerForm.value.password);
  }

  private buildForm() {
    this.registerForm = this.FormBuilder.group(
      {
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
  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.errorEventEmitterSubscription.unsubscribe();
      this.registerSubscription.unsubscribe();
    }
  }
}
