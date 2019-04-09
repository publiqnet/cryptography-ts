import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { ReportDialogComponent } from '../report-dialog/report-dialog.component';
import { SecurityDialogComponent } from '../security-dialog/security-dialog.component';
import { AdaptiveDialogComponent } from '../adaptive-dialog/adaptive-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { CoverEditDialogComponent } from '../cover-edit-dialog/cover-edit-dialog.component';
import { InputPasswordDialogComponent } from '../input-password-dialog/input-password-dialog.component';

@Injectable()
export class DialogService {
    constructor(public dialog: MatDialog, private translateService: TranslateService) {
    }

    public openConfirmDialog(title) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {});
        dialogRef.disableClose = true;
        dialogRef.componentInstance.title = title;

        return dialogRef.afterClosed();
    }

    public openInfoDialog(
        action: string,
        title = '',
        config = {},
        message = ''
    ) {
        const dialogRef = this.dialog.open(InfoDialogComponent, config);
        dialogRef.disableClose = true;
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.action = action;
        dialogRef.componentInstance.message = message;

        return dialogRef.afterClosed();
    }

    public openAdaptiveDialog(
        title: string,
        message: string,
        config = {}
    ) {
        const dialogRef = this.dialog.open(AdaptiveDialogComponent, config);
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;

        return dialogRef.afterClosed();
    }

    public openLoginDialog() {
        const dialogRef = this.dialog.open(LoginDialogComponent, {
            width: '500px'
        });
        dialogRef.disableClose = true;

        return dialogRef.afterClosed();
    }

    public openReportDialog() {
        const dialogRef = this.dialog.open(ReportDialogComponent, {});
        dialogRef.disableClose = true;

        return dialogRef.afterClosed();
    }

    public openSecurityDialog(action: string, title: string, message: string, dialogConfig = {}) {
        const dialogRef = this.dialog.open(SecurityDialogComponent, dialogConfig);
        dialogRef.disableClose = true;
        dialogRef.componentInstance.action = action;
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;

        return dialogRef.afterClosed();
    }

    public openInputPasswordDialog(action: string, title: string, message: string, dialogConfig = {}) {
        const dialogRef = this.dialog.open(InputPasswordDialogComponent, dialogConfig);
        dialogRef.disableClose = true;
        dialogRef.componentInstance.action = action;
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;

        return dialogRef.afterClosed();
    }

    openChannelNotAllowedDialog() {
        return this.openAdaptiveDialog(
            this.translateService.instant('core.choose_your_channel'),
            `${this.translateService.instant('core.dear_author')} <a class="main-site-url" href="/" target="_blank">${this.translateService.instant('core.homepage')}</a> ${this.translateService.instant('core.and_choose')}`,
            {maxWidth: '600px'}
        );
    }

    openCoverEditDialog(editData, dialogConfig = {}) {
        const dialogRef = this.dialog.open(CoverEditDialogComponent, {panelClass: 'full-width-dialog'});
        dialogRef.disableClose = true;
        dialogRef.componentInstance.editData = editData;

        return dialogRef.afterClosed();
    }
}
