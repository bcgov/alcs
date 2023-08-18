import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../shared/shared.module';
import { NoticeOfIntentDetailsComponent } from './notice-of-intent-details.component';
import { ParcelComponent } from './parcel/parcel.component';
import { PfrsDetailsComponent } from './pfrs-details/pfrs-details.component';
import { PofoDetailsComponent } from './pofo-details/pofo-details.component';
import { RosoDetailsComponent } from './roso-details/roso-details.component';
import { AdditionalInformationComponent } from './additional-information/additional-information.component';

@NgModule({
  declarations: [
    ParcelComponent,
    RosoDetailsComponent,
    PofoDetailsComponent,
    PfrsDetailsComponent,
    NoticeOfIntentDetailsComponent,
    AdditionalInformationComponent,
  ],
  imports: [CommonModule, SharedModule, NgxMaskPipe],
  exports: [NoticeOfIntentDetailsComponent],
})
export class NoticeOfIntentDetailsModule {}
