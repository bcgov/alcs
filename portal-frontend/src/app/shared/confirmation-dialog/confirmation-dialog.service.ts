import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, DialogData } from './confirmation-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  constructor(public dialog: MatDialog) {}

  openDialog(data: DialogData) {
    const result = new EventEmitter<boolean>();
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe((response) => {
      result.emit(response);
      result.complete();
    });

    return result;
  }
}
