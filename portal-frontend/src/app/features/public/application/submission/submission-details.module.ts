import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../../shared/shared.module';
import { SubmissionDetailsComponent } from './submission-details.component';
import { InclDetailsComponent } from './incl-details/incl-details.component';
import { NaruDetailsComponent } from './naru-details/naru-details.component';
import { NfuDetailsComponent } from './nfu-details/nfu-details.component';
import { ParcelComponent } from './parcel/parcel.component';
import { PfrsDetailsComponent } from './pfrs-details/pfrs-details.component';
import { PofoDetailsComponent } from './pofo-details/pofo-details.component';
import { RosoDetailsComponent } from './roso-details/roso-details.component';
import { SubdDetailsComponent } from './subd-details/subd-details.component';
import { TurDetailsComponent } from './tur-details/tur-details.component';
import { ExclDetailsComponent } from './excl-details/excl-details.component';

@NgModule({
  declarations: [
    ParcelComponent,
    SubmissionDetailsComponent,
    NfuDetailsComponent,
    TurDetailsComponent,
    SubdDetailsComponent,
    RosoDetailsComponent,
    PofoDetailsComponent,
    PfrsDetailsComponent,
    NaruDetailsComponent,
    ExclDetailsComponent,
    InclDetailsComponent,
  ],
  imports: [CommonModule, SharedModule, NgxMaskPipe],
  exports: [SubmissionDetailsComponent],
})
export class SubmissionDetailsModule {}
