import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { CanDeactivateGuard } from '../../shared/guard/can-deactivate.guard';
import { SharedModule } from '../../shared/shared.module';
import { ApplicationDetailsModule } from '../application-details/application-details.module';
import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog/change-application-type-dialog.component';
import { EditApplicationComponent } from './edit-application.component';
import { LandUseComponent } from './land-use/land-use.component';
import { NfuProposalComponent } from './proposal/nfu-proposal/nfu-proposal.component';
import { OtherAttachmentsComponent } from './other-attachments/other-attachments.component';
import { OtherParcelsComponent } from './other-parcels/other-parcels.component';
import { ApplicationCrownOwnerDialogComponent } from './parcel-details/application-crown-owner-dialog/application-crown-owner-dialog.component';
import { ApplicationOwnerDialogComponent } from './parcel-details/application-owner-dialog/application-owner-dialog.component';
import { ApplicationOwnersDialogComponent } from './parcel-details/application-owners-dialog/application-owners-dialog.component';
import { DeleteParcelDialogComponent } from './parcel-details/delete-parcel/delete-parcel-dialog.component';
import { ParcelDetailsComponent } from './parcel-details/parcel-details.component';
import { ParcelEntryComponent } from './parcel-details/parcel-entry/parcel-entry.component';
import { ParcelOwnersComponent } from './parcel-details/parcel-owners/parcel-owners.component';
import { PrimaryContactComponent } from './primary-contact/primary-contact.component';
import { SubdProposalComponent } from './proposal/subd-proposal/subd-proposal.component';
import { ReviewAndSubmitComponent } from './review-and-submit/review-and-submit.component';
import { SelectGovernmentComponent } from './select-government/select-government.component';
import { OtherParcelConfirmationDialogComponent } from './other-parcels/other-parcel-confirmation-dialog/other-parcel-confirmation-dialog.component';
import { TurProposalComponent } from './proposal/tur-proposal/tur-proposal.component';

const routes: Routes = [
  {
    path: '',
    component: EditApplicationComponent,
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: ':stepInd',
    component: EditApplicationComponent,
    canDeactivate: [CanDeactivateGuard],
  },
];

@NgModule({
  declarations: [
    ParcelDetailsComponent,
    ParcelEntryComponent,
    ChangeApplicationTypeDialogComponent,
    EditApplicationComponent,
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
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
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
})
export class EditApplicationModule {}
