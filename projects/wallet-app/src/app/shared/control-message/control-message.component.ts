import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

import { debounceTime, takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

import { ValidationService } from '../../core/validator/validator.service';


@Component({
    selector: 'app-control-message',
    templateUrl: './control-message.component.html'
})

export class ControlMessagesComponent implements OnChanges, OnDestroy {
    @Input() control: FormControl;
    errorMessage = '';
    private unsubscribe$ = new ReplaySubject<void>(1);

    constructor() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.control.currentValue && changes.control.currentValue != 'undefined') {
            changes.control.currentValue.valueChanges
              .pipe(
                debounceTime(400),
                takeUntil(this.unsubscribe$)
              )
              .subscribe(() => this.getError());
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

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
