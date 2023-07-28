import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { ApplicationDetailsComponent } from './application-details.component';
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
    ApplicationDetailsComponent,
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
  imports: [CommonModule, SharedModule],
  exports: [ApplicationDetailsComponent],
})
export class ApplicationDetailsModule {}
