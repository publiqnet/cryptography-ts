import { Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { AccountService } from '../../core/services/account.service';
import { ValidationService } from '../../core/validator/validator.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit, OnDestroy {
  @Input() brainKey: string;
  @Input() stringToSign: number;

  public formView = 'formView';
  public recoverForm: FormGroup;
  public errorMessage = '';

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private accountService: AccountService,
              private FormBuilder: FormBuilder,
              private router: Router,
              private errorService: ErrorService,
              @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    this.buildRecoverForm();
    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ErrorEvent) => {
      this.formView = 'formView';
      this.errorMessage = data.message;
    });

    this.accountService.recoverDataChanged.subscribe(() => {
      this.formView = 'success';

    });
  }

  recover() {
    if (this.recoverForm.invalid) {
      return;
    }

    this.formView = '';

    this.accountService.recoverSetNewPassword(this.brainKey, this.stringToSign, this.recoverForm.value.password)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(recoverData => {
      console.log('recoverData - ', recoverData);
    });
  }

  private buildRecoverForm() {
    this.recoverForm = this.FormBuilder.group({
      'password': new FormControl('', [Validators.required, ValidationService.passwordValidator]),
      'confirmPassword': new FormControl('', [Validators.required, ValidationService.passwordValidator]),
    }, {validator: ValidationService.passwordsEqualValidator});
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
