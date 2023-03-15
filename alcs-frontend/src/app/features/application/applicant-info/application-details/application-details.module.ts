import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { SharedModule } from '../../../../shared/shared.module';
import { ApplicationDetailsComponent } from './application-details.component';
import { NfuDetailsComponent } from './nfu-details/nfu-details.component';
import { ParcelComponent } from './parcel/parcel.component';
import { TurDetailsComponent } from './tur-details/tur-details.component';

@NgModule({
  declarations: [ParcelComponent, ApplicationDetailsComponent, NfuDetailsComponent, TurDetailsComponent],
  imports: [CommonModule, SharedModule, NgxMaskPipe, NgxMaskDirective],
  exports: [ApplicationDetailsComponent],
  providers: [provideEnvironmentNgxMask()],
})
export class ApplicationDetailsModule {}
