import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../shared/shared.module';
import { NotificationDetailsComponent } from './notification-details.component';
import { ParcelComponent } from './parcel/parcel.component';
import { ProposalDetailsComponent } from './proposal-details/proposal-details.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [ParcelComponent, ProposalDetailsComponent, NotificationDetailsComponent],
  imports: [CommonModule, SharedModule, NgxMaskPipe, RouterModule],
  exports: [NotificationDetailsComponent],
})
export class NotificationDetailsModule {}
