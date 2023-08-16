import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../../shared/shared.module';
import { NoticeOfIntentDetailsComponent } from './notice-of-intent-details.component';
import { ParcelComponent } from './parcel/parcel.component';
import { RosoAdditionalInformationComponent } from './roso-details/roso-additional-information/roso-additional-information.component';
import { RosoDetailsComponent } from './roso-details/roso-details.component';

@NgModule({
  declarations: [
    ParcelComponent,
    RosoDetailsComponent,
    NoticeOfIntentDetailsComponent,
    RosoAdditionalInformationComponent,
  ],
  imports: [CommonModule, SharedModule, NgxMaskPipe],
  exports: [NoticeOfIntentDetailsComponent],
})
export class NoticeOfIntentDetailsModule {}
