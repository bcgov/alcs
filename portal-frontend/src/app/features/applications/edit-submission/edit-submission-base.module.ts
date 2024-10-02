import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../shared/shared.module';
import { ApplicationDetailsModule } from '../application-details/application-details.module';
import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog/change-application-type-dialog.component';
import { EditSubmissionComponent } from './edit-submission.component';
import { LandUseComponent } from './land-use/land-use.component';
import { OtherAttachmentsComponent } from './other-attachments/other-attachments.component';
import { OtherParcelsComponent } from './other-parcels/other-parcels.component';
import { DeleteParcelDialogComponent } from './parcel-details/delete-parcel/delete-parcel-dialog.component';
import { ParcelDetailsComponent } from './parcel-details/parcel-details.component';
import { ParcelEntryConfirmationDialogComponent } from './parcel-details/parcel-entry/parcel-entry-confirmation-dialog/parcel-entry-confirmation-dialog.component';
import { ParcelEntryComponent } from './parcel-details/parcel-entry/parcel-entry.component';
import { PrimaryContactComponent } from './primary-contact/primary-contact.component';
import { CoveProposalComponent } from './proposal/cove-proposal/cove-proposal.component';
import { CovenantTransfereeDialogComponent } from './proposal/cove-proposal/transferee-dialog/transferee-dialog.component';
import { ExclProposalComponent } from './proposal/excl-proposal/excl-proposal.component';
import { InclProposalComponent } from './proposal/incl-proposal/incl-proposal.component';
import { NaruProposalComponent } from './proposal/naru-proposal/naru-proposal.component';
import { NfuProposalComponent } from './proposal/nfu-proposal/nfu-proposal.component';
import { PfrsProposalComponent } from './proposal/pfrs-proposal/pfrs-proposal.component';
import { PofoProposalComponent } from './proposal/pofo-proposal/pofo-proposal.component';
import { RosoProposalComponent } from './proposal/roso-proposal/roso-proposal.component';
import { SubdProposalComponent } from './proposal/subd-proposal/subd-proposal.component';
import { TurProposalComponent } from './proposal/tur-proposal/tur-proposal.component';
import { ReviewAndSubmitComponent } from './review-and-submit/review-and-submit.component';
import { SubmitConfirmationDialogComponent } from './review-and-submit/submit-confirmation-dialog/submit-confirmation-dialog.component';
import { SelectGovernmentComponent } from './select-government/select-government.component';
import { SuccessComponent } from './success/success.component';
import { PrimaryContactConfirmationDialogComponent } from './primary-contact/primary-contact-confirmation-dialog/primary-contact-confirmation-dialog.component';
import { OtherAttachmentsUploadDialogComponent } from './other-attachments/other-attachments-upload-dialog/other-attachments-upload-dialog.component';
import { MatCard, MatCardHeader, MatCardModule } from '@angular/material/card';
import { ResidenceDialogComponent } from './proposal/naru-proposal/residence-dialog/residence-dialog.component';

@NgModule({
  declarations: [
    ParcelDetailsComponent,
    ParcelEntryComponent,
    ParcelEntryConfirmationDialogComponent,
    ChangeApplicationTypeDialogComponent,
    EditSubmissionComponent,
    DeleteParcelDialogComponent,
    SelectGovernmentComponent,
    LandUseComponent,
    OtherParcelsComponent,
    OtherAttachmentsComponent,
    OtherAttachmentsUploadDialogComponent,
    PrimaryContactComponent,
    PrimaryContactConfirmationDialogComponent,
    ReviewAndSubmitComponent,
    SubmitConfirmationDialogComponent,
    NfuProposalComponent,
    TurProposalComponent,
    SubdProposalComponent,
    RosoProposalComponent,
    PofoProposalComponent,
    PfrsProposalComponent,
    NaruProposalComponent,
    ResidenceDialogComponent,
    ExclProposalComponent,
    InclProposalComponent,
    CoveProposalComponent,
    CovenantTransfereeDialogComponent,
    SuccessComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgxMaskDirective,
    NgxMaskPipe,
    ApplicationDetailsModule,
    MatInputModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatTableModule,
    MatCardModule,
    RouterLink,
  ],
  exports: [
    ParcelDetailsComponent,
    ParcelEntryComponent,
    ParcelEntryConfirmationDialogComponent,
    ChangeApplicationTypeDialogComponent,
    EditSubmissionComponent,
    DeleteParcelDialogComponent,
    SelectGovernmentComponent,
    LandUseComponent,
    OtherParcelsComponent,
    OtherAttachmentsComponent,
    PrimaryContactComponent,
    PrimaryContactConfirmationDialogComponent,
    ReviewAndSubmitComponent,
    NfuProposalComponent,
    TurProposalComponent,
    SubdProposalComponent,
    RosoProposalComponent,
    PofoProposalComponent,
    PfrsProposalComponent,
    NaruProposalComponent,
    ExclProposalComponent,
    InclProposalComponent,
    CoveProposalComponent,
    CovenantTransfereeDialogComponent,
    SuccessComponent,
    ResidenceDialogComponent,
  ],
})
export class EditSubmissionBaseModule {}
