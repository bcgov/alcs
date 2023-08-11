import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../shared/shared.module';
import { EditSubmissionComponent } from './edit-submission.component';
import { DeleteParcelDialogComponent } from './parcels/delete-parcel/delete-parcel-dialog.component';
import { ParcelDetailsComponent } from './parcels/parcel-details.component';
import { ParcelEntryConfirmationDialogComponent } from './parcels/parcel-entry/parcel-entry-confirmation-dialog/parcel-entry-confirmation-dialog.component';
import { ParcelEntryComponent } from './parcels/parcel-entry/parcel-entry.component';

@NgModule({
  declarations: [
    EditSubmissionComponent,
    ParcelDetailsComponent,
    ParcelEntryComponent,
    ParcelEntryConfirmationDialogComponent,
    DeleteParcelDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgxMaskDirective,
    NgxMaskPipe,
    MatInputModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatTableModule,
  ],
  exports: [
    EditSubmissionComponent,
    ParcelDetailsComponent,
    ParcelEntryComponent,
    ParcelEntryConfirmationDialogComponent,
    DeleteParcelDialogComponent,
  ],
})
export class EditSubmissionBaseModule {}
