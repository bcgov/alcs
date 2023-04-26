import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  private TOAST_DURATION = 3000;
  private ACTION_TOAST_DURATION = 6000;

  showSuccessToast(text: string, action: string = '') {
    return this.snackBar.open(text, action, {
      duration: action ? this.ACTION_TOAST_DURATION : this.TOAST_DURATION,
      horizontalPosition: 'right',
      panelClass: 'success',
      verticalPosition: 'top',
    });
  }

  showWarningToast(text: string, action: string = '') {
    return this.snackBar.open(text, action, {
      duration: action ? this.ACTION_TOAST_DURATION : this.TOAST_DURATION,
      horizontalPosition: 'right',
      panelClass: 'warning',
      verticalPosition: 'top',
    });
  }

  showErrorToast(text: string, action: string = 'Dismiss') {
    return this.snackBar.open(text, action, {
      horizontalPosition: 'right',
      panelClass: 'error',
      verticalPosition: 'top',
    });
  }
}
