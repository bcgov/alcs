import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../shared/shared.module';
import { ApplicationDetailsModule } from '../application-details/application-details.module';
import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog/change-application-type-dialog.component';
import { EditSubmissionComponent } from './edit-submission.component';
import { LandUseComponent } from './land-use/land-use.component';
import { OtherAttachmentsComponent } from './other-attachments/other-attachments.component';
import { OtherParcelConfirmationDialogComponent } from './other-parcels/other-parcel-confirmation-dialog/other-parcel-confirmation-dialog.component';
import { OtherParcelsComponent } from './other-parcels/other-parcels.component';
import { ApplicationCrownOwnerDialogComponent } from './parcel-details/application-crown-owner-dialog/application-crown-owner-dialog.component';
import { ApplicationOwnerDialogComponent } from './parcel-details/application-owner-dialog/application-owner-dialog.component';
import { ApplicationOwnersDialogComponent } from './parcel-details/application-owners-dialog/application-owners-dialog.component';
import { DeleteParcelDialogComponent } from './parcel-details/delete-parcel/delete-parcel-dialog.component';
import { ParcelDetailsComponent } from './parcel-details/parcel-details.component';
import { ParcelEntryConfirmationDialogComponent } from './parcel-details/parcel-entry/parcel-entry-confirmation-dialog/parcel-entry-confirmation-dialog.component';
import { ParcelEntryComponent } from './parcel-details/parcel-entry/parcel-entry.component';
import { ParcelOwnersComponent } from './parcel-details/parcel-owners/parcel-owners.component';
import { PrimaryContactComponent } from './primary-contact/primary-contact.component';
import { NfuProposalComponent } from './proposal/nfu-proposal/nfu-proposal.component';
import { PofoProposalComponent } from './proposal/pofo-proposal/pofo-proposal.component';
import { RosoProposalComponent } from './proposal/roso-proposal/roso-proposal.component';
import { SoilTableComponent } from './proposal/soil-table/soil-table.component';
import { SubdProposalComponent } from './proposal/subd-proposal/subd-proposal.component';
import { TurProposalComponent } from './proposal/tur-proposal/tur-proposal.component';
import { ReviewAndSubmitComponent } from './review-and-submit/review-and-submit.component';
import { SelectGovernmentComponent } from './select-government/select-government.component';

@NgModule({
  declarations: [
    ParcelDetailsComponent,
    ParcelEntryComponent,
    ParcelEntryConfirmationDialogComponent,
    ChangeApplicationTypeDialogComponent,
    EditSubmissionComponent,
    DeleteParcelDialogComponent,
    SelectGovernmentComponent,
    ParcelOwnersComponent,
    ApplicationOwnersDialogComponent,
    ApplicationOwnerDialogComponent,
    ApplicationCrownOwnerDialogComponent,
    LandUseComponent,
    OtherParcelsComponent,
    OtherAttachmentsComponent,
    PrimaryContactComponent,
    ReviewAndSubmitComponent,
    OtherParcelConfirmationDialogComponent,
    NfuProposalComponent,
    TurProposalComponent,
    SubdProposalComponent,
    RosoProposalComponent,
    PofoProposalComponent,
    SoilTableComponent,
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
  ],
  exports: [
    ParcelDetailsComponent,
    ParcelEntryComponent,
    ParcelEntryConfirmationDialogComponent,
    ChangeApplicationTypeDialogComponent,
    EditSubmissionComponent,
    DeleteParcelDialogComponent,
    SelectGovernmentComponent,
    ParcelOwnersComponent,
    ApplicationOwnersDialogComponent,
    ApplicationOwnerDialogComponent,
    ApplicationCrownOwnerDialogComponent,
    LandUseComponent,
    OtherParcelsComponent,
    OtherAttachmentsComponent,
    PrimaryContactComponent,
    ReviewAndSubmitComponent,
    OtherParcelConfirmationDialogComponent,
    NfuProposalComponent,
    TurProposalComponent,
    SubdProposalComponent,
    RosoProposalComponent,
    PofoProposalComponent,
    SoilTableComponent,
  ],
})
export class EditSubmissionBaseModule {}
