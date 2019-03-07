import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

import { debounceTime } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { ValidationService } from '../../core/validator/validator.service';

@Component({
    selector: 'app-control-message',
    templateUrl: './control-message.component.html'
})

export class ControlMessagesComponent implements OnChanges {
    @Input() control: FormControl;
    errorMessage = '';

    constructor(private translationService: TranslateService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.control.currentValue && changes.control.currentValue != 'undefined') {
            changes.control.currentValue.valueChanges
                .pipe(debounceTime(400))
                .subscribe(val => {
                    this.getError();
                });
        }
    }

    getError() {
        for (const propertyName in this.control.errors) {
          if (this.control.errors.hasOwnProperty(propertyName) && this.control.dirty) {
                const validationMessages = this.translationService.instant('error.validation');
                const key = ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
                return this.errorMessage = validationMessages[key];
            }
        }
        return this.errorMessage = null;
    }
}
