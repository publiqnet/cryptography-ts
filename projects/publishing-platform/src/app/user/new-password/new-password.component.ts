import { Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { ValidationService } from '../../core/validator/validator.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorEvent, ErrorService } from '../../core/services/error.service';

@Component({
    selector: 'app-new-password',
    templateUrl: './new-password.component.html',
    styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit, OnDestroy {
    @Input() brainKey: string;
    @Input() stringToSign: number;

    public formView = 'formView';
    public mailForm: FormGroup;
    public recoverForm: FormGroup;
    public errorMessage = '';

    recoverSubscription = Subscription.EMPTY;
    errorEventEmiterSubscription = Subscription.EMPTY;
    authenticateSubscription = Subscription.EMPTY;

    constructor(private accountService: AccountService,
                private FormBuilder: FormBuilder,
                private router: Router,
                private errorService: ErrorService,
                @Inject(PLATFORM_ID) private platformId: Object) {
    }

    ngOnInit() {
            this.buildRecoverForm();
            this.errorEventEmiterSubscription = this.errorService.errorEventEmiter.subscribe((data: ErrorEvent) => {
                this.formView = 'formView';
                this.errorMessage = data.message;
            });

            this.recoverSubscription = this.accountService.recoverDataChanged.subscribe(() => {
                this.formView = 'success';

            });
        // }
    }

    recover() {
        if (this.recoverForm.invalid) {
            return;
        }

        this.formView = '';

        this.accountService.recoverSetNewPassword(this.brainKey, this.stringToSign, this.recoverForm.value.password).subscribe(recoverData => {
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
            this.recoverSubscription.unsubscribe();
            this.errorEventEmiterSubscription.unsubscribe();
            this.authenticateSubscription.unsubscribe();
    }
}
