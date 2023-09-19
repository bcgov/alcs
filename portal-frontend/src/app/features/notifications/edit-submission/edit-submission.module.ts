import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';
import { NgxMaskPipe } from 'ngx-mask';
import { CanDeactivateGuard } from '../../../shared/guard/can-deactivate.guard';
import { SharedModule } from '../../../shared/shared.module';
import { NotificationDetailsModule } from '../notification-details/notification-details.module';
import { EditSubmissionComponent } from './edit-submission.component';
import { OtherAttachmentsComponent } from './other-attachments/other-attachments.component';
import { DeleteParcelDialogComponent } from './parcels/delete-parcel/delete-parcel-dialog.component';
import { ParcelDetailsComponent } from './parcels/parcel-details.component';
import { ParcelEntryConfirmationDialogComponent } from './parcels/parcel-entry/parcel-entry-confirmation-dialog/parcel-entry-confirmation-dialog.component';
import { ParcelEntryComponent } from './parcels/parcel-entry/parcel-entry.component';
import { PrimaryContactComponent } from './primary-contact/primary-contact.component';
import { ChangeSurveyPlanConfirmationDialogComponent } from './proposal/change-survey-plan-confirmation-dialog/change-survey-plan-confirmation-dialog.component';
import { ProposalComponent } from './proposal/proposal.component';
import { ReviewAndSubmitComponent } from './review-and-submit/review-and-submit.component';
import { SubmitConfirmationDialogComponent } from './review-and-submit/submit-confirmation-dialog/submit-confirmation-dialog.component';
import { SelectGovernmentComponent } from './select-government/select-government.component';
import { StepComponent } from './step.partial';
import { TransfereeDialogComponent } from './transferees/transferee-dialog/transferee-dialog.component';
import { TransfereesComponent } from './transferees/transferees.component';

const routes: Routes = [
  {
    path: '',
    component: EditSubmissionComponent,
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: ':stepInd',
    component: EditSubmissionComponent,
    canDeactivate: [CanDeactivateGuard],
  },
];

@NgModule({
  declarations: [
    StepComponent,
    EditSubmissionComponent,
    ParcelDetailsComponent,
    ParcelEntryComponent,
    ParcelEntryConfirmationDialogComponent,
    DeleteParcelDialogComponent,
    TransfereesComponent,
    TransfereeDialogComponent,
    PrimaryContactComponent,
    SelectGovernmentComponent,
    ProposalComponent,
    OtherAttachmentsComponent,
    ReviewAndSubmitComponent,
    SubmitConfirmationDialogComponent,
    ChangeSurveyPlanConfirmationDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    NgxMaskPipe,
    NotificationDetailsModule,
  ],
})
export class EditSubmissionModule {}
