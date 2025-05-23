import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../../shared/shared.module';
import { NotificationDetailsComponent } from './notification-details.component';
import { ParcelComponent } from './parcel/parcel.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ParcelComponent, NotificationDetailsComponent],
  imports: [CommonModule, SharedModule, NgxMaskPipe, NgxMaskPipe, RouterModule],
  exports: [NotificationDetailsComponent],
})
export class NotificationDetailsModule {}
