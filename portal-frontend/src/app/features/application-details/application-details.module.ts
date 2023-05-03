import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../shared/shared.module';
import { ApplicationDetailsComponent } from './application-details.component';
import { NfuDetailsComponent } from './nfu-details/nfu-details.component';
import { ParcelComponent } from './parcel/parcel.component';
import { RosoDetailsComponent } from './roso-details/roso-details.component';
import { SubdDetailsComponent } from './subd-details/subd-details.component';
import { TurDetailsComponent } from './tur-details/tur-details.component';

@NgModule({
  declarations: [
    ParcelComponent,
    ApplicationDetailsComponent,
    NfuDetailsComponent,
    TurDetailsComponent,
    SubdDetailsComponent,
    RosoDetailsComponent,
  ],
  imports: [CommonModule, SharedModule, NgxMaskPipe],
  exports: [ApplicationDetailsComponent, RosoDetailsComponent],
})
export class ApplicationDetailsModule {}
