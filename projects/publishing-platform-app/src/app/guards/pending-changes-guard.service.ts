import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { DialogService } from '../core/services/dialog.service';

export interface ComponentCanDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class PendingChangesGuard
  implements CanDeactivate<ComponentCanDeactivate> {
  constructor(private dialogService: DialogService, private translationService: TranslateService) {}

  canDeactivate(component: ComponentCanDeactivate) {
    if (!component.canDeactivate()) {
      const messages = this.translationService.instant('dialog.confirm');
      return this.dialogService
        .openConfirmDialog(messages['pending_change_title'])
        .pipe(
          map(result => {
            return !!result;
          })
        );
    }
    return true;
  }
}
