import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CryptService } from '../../core/services/crypt.service';
import { ValidationService } from '../../core/validator/validator.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';


@Component({
    selector: 'app-brain-key',
    templateUrl: './brain-key.component.html',
    styleUrls: ['./brain-key.component.scss']
})
export class BrainKeyComponent implements OnInit, OnDestroy {

    // public brainKey: string;
    public registerForm: FormGroup;
    public loading = true;

    registerSubscription: Subscription;
    errorEventEmiterSubscription: Subscription;

    constructor(private FormBuilder: FormBuilder,
                public accountService: AccountService,
                public notificationService: NotificationService,
                private router: Router,
                private errorService: ErrorService,
                @Inject(PLATFORM_ID) private platformId: Object) {
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            // this.accountService.brainKey = CryptService.generateBrainKey();
            this.loading = false;
            this.buildForm();
            this.registerForm.valueChanges.subscribe(data => {}, err => console.log(err));

            this.errorEventEmiterSubscription = this.errorService.errorEventEmiter.subscribe((data: ErrorEvent) => {
                if (data.action === 'register') {
                    this.notificationService.error(data.message);
                }
            });

            // this.registerSubscription = this.accountService.registerDataChanged.subscribe(res => {
            //     this.loading = false;
            //     this.router.navigate(['/user/recover-phrase']);
            // });
            //
            // if (this.accountService.loggedIn()) {
            //     this.router.navigate(['/page-not-found']);
            //     return false;
            // }
        }
    }

    register() {
        this.loading = true;
        // this.accountService.register(this.registerForm.value.password);
    }

    private buildForm() {
        this.registerForm = this.FormBuilder.group({
            'password': new FormControl('', [Validators.required, ValidationService.passwordValidator]),
            'confirmPassword': new FormControl('', [Validators.required, ValidationService.passwordValidator]),
        }, {validator: ValidationService.passwordsEqualValidator});
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            this.errorEventEmiterSubscription.unsubscribe();
            this.registerSubscription.unsubscribe();
        }
    }

}
