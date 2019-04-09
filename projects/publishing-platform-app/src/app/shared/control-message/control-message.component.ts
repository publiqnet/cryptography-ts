import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

import { debounceTime, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { ValidationService } from '../../core/validator/validator.service';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-control-message',
  templateUrl: './control-message.component.html'
})

export class ControlMessagesComponent implements OnChanges, OnDestroy {
  @Input() control: FormControl;
  errorMessage = '';
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(private translationService: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.control.currentValue && changes.control.currentValue != 'undefined') {
      changes.control.currentValue.valueChanges
        .pipe(
          debounceTime(400),
          takeUntil(this.unsubscribe$)
        )
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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
