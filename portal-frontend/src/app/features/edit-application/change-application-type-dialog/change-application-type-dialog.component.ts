import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-application-type-dialog',
  templateUrl: './change-application-type-dialog.component.html',
  styleUrls: ['./change-application-type-dialog.component.scss'],
})
export class ChangeApplicationTypeDialogComponent implements OnInit {
  constructor(private dialogRef: MatDialogRef<ChangeApplicationTypeDialogComponent>) {}

  ngOnInit(): void {}

  async onCancel() {
    this.dialogRef.close();
  }

  async onSubmit() {
    console.log('submit');
    this.onCancel();
  }
}
