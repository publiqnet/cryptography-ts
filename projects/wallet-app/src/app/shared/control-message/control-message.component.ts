import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

import { debounceTime, takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

import { ValidationService } from '../../core/validator/validator.service';


@Component({
    selector: 'app-control-message',
    templateUrl: './control-message.component.html'
})

export class ControlMessagesComponent implements OnInit, OnChanges, OnDestroy {
    @Input() control: FormControl;
    errorMessage = '';
    private unsubscribe$ = new ReplaySubject<void>(1);

    constructor() {
    }

    ngOnInit() {
        if (this.control && this.control.errors) {
            this.getError(false);
        }
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

    getError(checkDirty = true) {
        for (const propertyName in this.control.errors) {
            if (this.control.errors.hasOwnProperty(propertyName) && ((checkDirty) ? this.control.dirty : true)) {
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
