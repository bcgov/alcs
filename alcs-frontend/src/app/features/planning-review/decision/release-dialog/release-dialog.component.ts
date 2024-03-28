import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-release-dialog',
  templateUrl: './release-dialog.component.html',
  styleUrls: ['./release-dialog.component.scss'],
})
export class ReleaseDialogComponent {
  constructor(
    public matDialogRef: MatDialogRef<ReleaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {}

  onRelease() {
    this.matDialogRef.close(true);
  }
}
