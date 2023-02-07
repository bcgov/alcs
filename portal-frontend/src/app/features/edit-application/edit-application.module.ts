import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../shared/shared.module';
import { ApplicationDetailsModule } from '../application-details/application-details.module';
import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog/change-application-type-dialog.component';
import { EditApplicationComponent } from './edit-application.component';
import { LandUseComponent } from './land-use/land-use.component';
import { NfuProposalComponent } from './nfu/nfu-proposal/nfu-proposal.component';
import { OtherAttachmentsComponent } from './other-attachments/other-attachments.component';
import { OtherParcelsComponent } from './other-parcels/other-parcels.component';
import { ApplicationOwnerDialogComponent } from './parcel-details/application-owner-dialog/application-owner-dialog.component';
import { ApplicationOwnersDialogComponent } from './parcel-details/application-owners-dialog/application-owners-dialog.component';
import { DeleteParcelDialogComponent } from './parcel-details/delete-parcel/delete-parcel-dialog.component';
import { ParcelDetailsComponent } from './parcel-details/parcel-details.component';
import { ParcelEntryComponent } from './parcel-details/parcel-entry/parcel-entry.component';
import { ParcelOwnersComponent } from './parcel-details/parcel-owners/parcel-owners.component';
import { ReviewAndSubmitComponent } from './review-and-submit/review-and-submit.component';
import { SelectGovernmentComponent } from './select-government/select-government.component';

const routes: Routes = [
  {
    path: '',
    component: EditApplicationComponent,
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
    LandUseComponent,
    NfuProposalComponent,
    OtherParcelsComponent,
    OtherAttachmentsComponent,
    ReviewAndSubmitComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    NgxMaskDirective,
    NgxMaskPipe,
    ApplicationDetailsModule,
  ],
})
export class EditApplicationModule {}
