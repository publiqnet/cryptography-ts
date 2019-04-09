import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ValidationService } from '../../core/validator/validator.service';
import 'rxjs/add/operator/debounceTime';
import { ErrorService } from '../../core/services/error.service';

@Component({
    selector: 'app-control-message',
    templateUrl: './control-message.component.html'
})

export class ControlMessagesComponent implements OnChanges {
    @Input() control: FormControl;
    errorMessage = '';

    constructor(private errorService: ErrorService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.control.currentValue && changes.control.currentValue != 'undefined') {
            changes.control.currentValue.valueChanges.debounceTime(400).subscribe(val => {
                this.getError();
            });
        }
    }

    getError() {
        for (const propertyName in this.control.errors) {
            if (this.control.errors.hasOwnProperty(propertyName) && this.control.dirty) {
                return this.errorMessage = ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
            }
        }
        return this.errorMessage = null;
    }
}
