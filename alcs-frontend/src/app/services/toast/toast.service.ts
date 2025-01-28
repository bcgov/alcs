import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  private TOAST_DURATION = 3000;
  private ACTION_TOAST_DURATION = 6000;

  showSuccessToast(text: string, action: string = '') {
    return this.snackBar.open(text, action, {
      duration: action ? this.ACTION_TOAST_DURATION : this.TOAST_DURATION,
      panelClass: 'success',
    });
  }

  showWarningToast(text: string, action: string = '') {
    return this.snackBar.open(text, action, {
      duration: action ? this.ACTION_TOAST_DURATION : this.TOAST_DURATION,
      panelClass: 'warning',
    });
  }

  showErrorToast(text: string, action: string = 'Dismiss') {
    return this.snackBar.open(text, action, {
      panelClass: 'error',
    });
  }

  showSuccessToastWithLink(text: string, action: string, link: string) {
    const snackBarRef = this.snackBar.open(text, action, {
      duration: action ? this.ACTION_TOAST_DURATION : this.TOAST_DURATION,
      panelClass: 'success',
    });

    snackBarRef.onAction().subscribe(() => {
      const url = new URL(link, window.location.origin);
      const route = url.pathname;
      const queryParams: { [key: string]: string } = {};
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      this.router.navigate([route], { queryParams });
    });
  }
}
