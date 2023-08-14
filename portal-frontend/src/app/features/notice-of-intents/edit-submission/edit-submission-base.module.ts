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
import { NoticeOfIntentDetailsModule } from '../notice-of-intent-details/notice-of-intent-details.module';
import { EditSubmissionComponent } from './edit-submission.component';
import { LandUseComponent } from './land-use/land-use.component';
import { OtherAttachmentsComponent } from './other-attachments/other-attachments.component';
import { DeleteParcelDialogComponent } from './parcels/delete-parcel/delete-parcel-dialog.component';
import { ParcelDetailsComponent } from './parcels/parcel-details.component';
import { ParcelEntryConfirmationDialogComponent } from './parcels/parcel-entry/parcel-entry-confirmation-dialog/parcel-entry-confirmation-dialog.component';
import { ParcelEntryComponent } from './parcels/parcel-entry/parcel-entry.component';
import { PrimaryContactComponent } from './primary-contact/primary-contact.component';
import { RosoProposalComponent } from './proposal/roso/roso-proposal.component';
import { ReviewAndSubmitComponent } from './review-and-submit/review-and-submit.component';
import { SubmitConfirmationDialogComponent } from './review-and-submit/submit-confirmation-dialog/submit-confirmation-dialog.component';
import { SelectGovernmentComponent } from './select-government/select-government.component';

@NgModule({
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
    NoticeOfIntentDetailsModule,
  ],
  declarations: [
    EditSubmissionComponent,
    ParcelDetailsComponent,
    ParcelEntryComponent,
    ParcelEntryConfirmationDialogComponent,
    DeleteParcelDialogComponent,
    PrimaryContactComponent,
    SelectGovernmentComponent,
    LandUseComponent,
    OtherAttachmentsComponent,
    RosoProposalComponent,
    ReviewAndSubmitComponent,
    SubmitConfirmationDialogComponent,
  ],
  exports: [
    EditSubmissionComponent,
    ParcelDetailsComponent,
    ParcelEntryComponent,
    ParcelEntryConfirmationDialogComponent,
    DeleteParcelDialogComponent,
    PrimaryContactComponent,
    SelectGovernmentComponent,
    LandUseComponent,
    OtherAttachmentsComponent,
    RosoProposalComponent,
    ReviewAndSubmitComponent,
    SubmitConfirmationDialogComponent,
  ],
})
export class EditSubmissionBaseModule {}
