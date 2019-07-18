import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { OauthService } from 'helper-lib';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.css']
})
export class RecoverComponent implements OnInit, OnDestroy {

  public formView = 'recoverForm';
  public recoverForm: FormGroup;
  public brainKey = '';
  public loading = false;
  public brainKeyError = '';
  isPasswordMode: boolean;
  private stringToSign = '';

  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private accountService: AccountService,
              private errorService: ErrorService,
              private oauthService: OauthService,
              private FormBuilder: FormBuilder,
              private router: Router) {
  }

  ngOnInit() {
    this.buildForm();
    this.isPasswordMode = false;
    this.errorService.errorEventEmiter
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((error: ErrorEvent) => {
        if (error.action === 'recover') {
          this.loading = false;
          this.brainKeyError = this.errorService.getError('incorrect_recover_phrase');
        }
      });

    this.recoverForm.valueChanges.subscribe(newValues => {
      this.brainKeyError = '';
    });
  }

  private buildForm() {
    this.recoverForm = this.FormBuilder.group({
      brainKey: new FormControl('', [Validators.required])
    });
  }

  checkBrainKey() {
    this.loading = true;
    this.oauthService.recoverAuthenticate(this.recoverForm.value.brainKey)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(authData => {
        this.stringToSign = authData.stringToSign;
        this.brainKey = this.recoverForm.value.brainKey;
        this.isPasswordMode = true;
      }, error => this.errorService.handleError('recover', error));
  }

  ngOnDestroy() {
    this.brainKeyError = '';
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

  }
}
