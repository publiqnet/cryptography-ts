import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountService } from '../services/account.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-info-dialog',
  templateUrl: 'info-dialog.component.html',
  styleUrls: ['info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit, OnDestroy {
  public title = '';
  public action = '';
  public message = '';
  public mainSiteUrl;
  private unsubscribe$ = new ReplaySubject<void>(1);

  constructor(
    public dialogRef: MatDialogRef<InfoDialogComponent>,
    public accountService: AccountService
  ) {
  }

  ngOnInit() {
    this.mainSiteUrl = environment.main_site_url;
    if (this.action && this.action == 'settings') {
      this.accountService.settingsSavedCloseDialog
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(visibility => {
          if (visibility) {
            this.dialogRef.close(true);
            return false;
          }
        });
    }
  }

  onCloseCancel() {
    this.dialogRef.close(false);
    return false;
  }

  onCloseConfirm() {
    this.dialogRef.close(true);
    return true;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
