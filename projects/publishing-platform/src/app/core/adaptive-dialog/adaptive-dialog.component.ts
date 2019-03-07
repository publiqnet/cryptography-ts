import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-adaptive-dialog',
  templateUrl: 'adaptive-dialog.component.html',
  styleUrls: ['adaptive-dialog.component.scss']
})
export class AdaptiveDialogComponent {
  title = '';
  message = '';
  onCloseCancel = () => {
    this.dialogRef.close(false);
    return false;
  }
  onCloseConfirm = () => {
    this.dialogRef.close(true);
    return true;
  }

  constructor(public dialogRef: MatDialogRef<AdaptiveDialogComponent>) { }
}
