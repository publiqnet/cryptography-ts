import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';

import { AccountService } from '../services/account.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-info-dialog',
  templateUrl: 'info-dialog.component.html',
  styleUrls: ['info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit {
  public title = '';
  public action = '';
  public message = '';
  public mainSiteUrl;

  constructor(
    public dialogRef: MatDialogRef<InfoDialogComponent>,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    public accountService: AccountService
  ) {}

  ngOnInit() {
    this.mainSiteUrl = environment.main_site_url;
    if (this.action && this.action == 'settings') {
      this.accountService.settingsSavedCloseDialog.subscribe(visibility => {
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
}
