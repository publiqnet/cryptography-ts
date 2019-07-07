import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountService } from '../services/account.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-newstory-submission2',
  templateUrl: 'newstory-submission2.component.html',
  styleUrls: ['newstory-submission2.component.scss']
})
export class NewstorySubmission2Component implements OnInit, OnDestroy {
  public title = '';
  public action = '';
  public message = '';
  public mainSiteUrl;
  public boostMoney = 50;
  public total = this.boostMoney + 0.005;
  public priceOneDay = 50;
  private boostTime = 1;
  private unsubscribe$ = new ReplaySubject<void>(1);


  constructor(
    public dialogRef: MatDialogRef<NewstorySubmission2Component>,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
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

  selectBoostTime(e) {
    this.boostTime = +e;
    this.updateTotal();
  }

  updateTotal() {
    this.priceOneDay = +(this.boostMoney / this.boostTime).toFixed(3);
    this.total = this.boostMoney + 0.005;
  }

  onCloseConfirm() {
    const start = +(new Date(new Date().toISOString()).getTime() / 1000).toFixed() + 300;
    const end = start + this.boostTime * 86400;
    this.dialogRef.close({
      boostOwner: this.accountService.accountInfo.publicKey,
      boostStartDate: start,
      boostEndDate: end,
      boostMoney: this.boostMoney * 100000000
    });
    return true;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
