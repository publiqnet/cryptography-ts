import { Component, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

import { Subscription } from 'rxjs';

import { AccountService } from '../../core/services/account.service';
import { NotificationService } from '../../core/services/notification.service';
import { ValidationService } from '../../core/validator/validator.service';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    email: String = '';

    public loginForm: FormGroup;
    private errorMessages: string;
    private conditionsWarning: string;
    public formSubmitted = false;

    authenticateSubscription: Subscription = Subscription.EMPTY;
    loginSubscription: Subscription = Subscription.EMPTY;
    errorEventEmitterSubscription: Subscription = Subscription.EMPTY;

    constructor(
        private accountService: AccountService,
        public notificationService: NotificationService,
        private errorService: ErrorService,
        private router: Router,
        private FormBuilder: FormBuilder,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit() {
        this.buildForm();

        if (isPlatformBrowser(this.platformId)) {
            this.loginForm.valueChanges.subscribe(
                data => {
                    this.errorMessages = '';
                    this.conditionsWarning = '';
                },
                err => console.log(err)
            );

            this.errorEventEmitterSubscription = this.errorService.errorEventEmiter.subscribe(
                (data: ErrorEvent) => {
                    if (data.action === 'login' || data.action === 'authenticate') {
                        this.formSubmitted = false;
                        this.notificationService.error(data.message);
                    }
                }
            );

            this.authenticateSubscription = this.accountService.resForStep2DataChanged.subscribe(
                resForStep2 => {
                    this.accountService.login(
                        this.loginForm.value.email,
                        this.loginForm.value.password,
                        resForStep2
                    );
                }
            );

            this.loginSubscription = this.accountService.loginDataChanged.subscribe(
                user => {
                    this.formSubmitted = false;
                    this.accountService.loadBalance();
                    this.router.navigate(['/']);
                }
            );
        }
    }

    authenticate() {
        if (this.loginForm.invalid) {
            return;
        }
        this.formSubmitted = true;
        this.accountService.authenticate(this.loginForm.value.email);
    }

    private buildForm() {
        this.loginForm = this.FormBuilder.group({
            email: new FormControl('', [
                Validators.required,
                ValidationService.emailValidator
            ]),
            password: new FormControl('', [Validators.required])
        });
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.errorEventEmitterSubscription.unsubscribe();
            this.authenticateSubscription.unsubscribe();
            this.loginSubscription.unsubscribe();
        }
    }
}
