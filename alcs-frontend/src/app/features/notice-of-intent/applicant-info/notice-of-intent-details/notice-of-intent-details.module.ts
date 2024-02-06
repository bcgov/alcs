import { CommonModule, NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../../shared/shared.module';
import { AdditionalInformationComponent } from './additional-information/additional-information.component';
import { NoticeOfIntentDetailsComponent } from './notice-of-intent-details.component';
import { ParcelComponent } from './parcel/parcel.component';
import { PfrsDetailsComponent } from './pfrs-details/pfrs-details.component';
import { PofoDetailsComponent } from './pofo-details/pofo-details.component';
import { RosoDetailsComponent } from './roso-details/roso-details.component';

@NgModule({
  declarations: [
    ParcelComponent,
    RosoDetailsComponent,
    PofoDetailsComponent,
    PfrsDetailsComponent,
    NoticeOfIntentDetailsComponent,
    AdditionalInformationComponent,
  ],
  imports: [CommonModule, SharedModule, NgxMaskPipe, MatProgressSpinnerModule, NgIf],
  exports: [NoticeOfIntentDetailsComponent],
})
export class NoticeOfIntentDetailsModule {}
