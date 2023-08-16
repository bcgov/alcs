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
import { AdditionalInformationComponent } from './additional-information/additional-information.component';
import { NoticeOfIntentDetailsModule } from '../notice-of-intent-details/notice-of-intent-details.module';
import { DeleteStructureConfirmationDialogComponent } from './additional-information/delete-structure-confirmation-dialog/delete-structure-confirmation-dialog.component';
import { SoilRemovalConfirmationDialogComponent } from './additional-information/soil-removal-confirmation-dialog/soil-removal-confirmation-dialog.component';
import { EditSubmissionComponent } from './edit-submission.component';
import { LandUseComponent } from './land-use/land-use.component';
import { OtherAttachmentsComponent } from './other-attachments/other-attachments.component';
import { DeleteParcelDialogComponent } from './parcels/delete-parcel/delete-parcel-dialog.component';
import { ParcelDetailsComponent } from './parcels/parcel-details.component';
import { ParcelEntryConfirmationDialogComponent } from './parcels/parcel-entry/parcel-entry-confirmation-dialog/parcel-entry-confirmation-dialog.component';
import { ParcelEntryComponent } from './parcels/parcel-entry/parcel-entry.component';
import { PrimaryContactComponent } from './primary-contact/primary-contact.component';
import { PfrsProposalComponent } from './proposal/pfrs/pfrs-proposal.component';
import { PofoProposalComponent } from './proposal/pofo/pofo-proposal.component';
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
    PofoProposalComponent,
    PfrsProposalComponent,
    AdditionalInformationComponent,
    DeleteStructureConfirmationDialogComponent,
    SoilRemovalConfirmationDialogComponent,
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
    PofoProposalComponent,
    PfrsProposalComponent,
    AdditionalInformationComponent,
    ReviewAndSubmitComponent,
    SubmitConfirmationDialogComponent,
  ],
})
export class EditSubmissionBaseModule {}
