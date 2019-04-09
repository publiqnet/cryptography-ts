import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-report-dialog',
  templateUrl: 'report-dialog.component.html'
})
export class ReportDialogComponent {
  public reasons = {
    CONTENT_NOT_INTERESTED: 1,
    CONTENT_SPAM: 2,
    CONTENT_MATERIAL_FOR_ADULTS: 3,
    CONTENT_MISINFORMATION: 4,
    CONTENT_INSULT: 5
  };
  changedReason;

  constructor(
    public dialogRef: MatDialogRef<ReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCloseConfirm() {
    if (
      this.changedReason &&
      this.changedReason >= 1 &&
      this.changedReason <= 5
    ) {
      this.dialogRef.close(this.changedReason);
    }
  }

  onCloseCancel(): void {
    this.dialogRef.close(false);
  }
}
