import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountService } from '../services/account.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-newstory-submission2',
  templateUrl: 'newstory-submission.component.html',
  styleUrls: ['newstory-submission.component.scss']
})
export class NewstorySubmissionComponent implements OnInit, OnDestroy {
  public title = '';
  public action = '';
  public message = '';
  public mainSiteUrl;
  public boostEnabled: boolean;
  public boostMoney = 50;
  public total = this.boostMoney + 0.005 + 0.001;
  public priceOneDay = 50;
  private boostTime = 1;

  private unsubscribe$ = new ReplaySubject<void>(1);


  constructor(
    public dialogRef: MatDialogRef<NewstorySubmissionComponent>,
    private router: Router,
    public accountService: AccountService,
    @Inject(MAT_DIALOG_DATA) public data: any
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


  selectBoostTime(e) {
    this.boostTime = +e;
    this.updateTotal();
  }

  updateTotal() {
    this.priceOneDay = +(this.boostMoney / this.boostTime).toFixed(3);
    this.total = this.boostMoney + 0.005;
  }


  onCloseCancel() {
    this.dialogRef.close(false);
    return false;
  }

  onCloseConfirm() {
    const start = +(new Date(new Date().toISOString()).getTime() / 1000).toFixed() + 300;
    const end = start + this.boostTime * 86400;
    this.dialogRef.close({
      boostEnabled: this.boostEnabled,
      boostOwner: this.accountService.accountInfo,
      boostStartDate: start,
      boostEndDate: end,
      boostMoney: this.boostMoney * 100000000
    });
    return true;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
