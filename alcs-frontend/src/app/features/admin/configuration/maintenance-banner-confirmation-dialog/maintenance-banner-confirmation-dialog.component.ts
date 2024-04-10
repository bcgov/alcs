import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-maintenance-banner-confirmation-dialog',
  templateUrl: './maintenance-banner-confirmation-dialog.component.html',
  styleUrls: ['./maintenance-banner-confirmation-dialog.component.scss'],
})
export class MaintenanceBannerConfirmationDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    protected data: {
      message: string;
    },
  ) {}
}
