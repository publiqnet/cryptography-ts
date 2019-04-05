import { Injectable } from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';

@Injectable()
export class DialogService {

    constructor(public dialog: MatDialog) {
    }

    public openConfirmDialog(action: string, title: string, message: string, dialogConfig = {}) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.disableClose = true;
        dialogRef.componentInstance.action = action;
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;

        return dialogRef.afterClosed();
    }
}
