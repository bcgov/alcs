import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoticeOfIntentDetailService } from '../../services/notice-of-intent/notice-of-intent-detail.service';
import { SharedModule } from '../../shared/shared.module';
import { ApplicantInfoComponent } from './applicant-info/applicant-info.component';
import { NoticeOfIntentDetailsModule } from './applicant-info/notice-of-intent-details/notice-of-intent-details.module';
import { DocumentUploadDialogComponent } from './documents/document-upload-dialog/document-upload-dialog.component';
import { NoiDocumentsComponent } from './documents/documents.component';
import { InfoRequestDialogComponent } from './info-requests/info-request-dialog/info-request-dialog.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { NoticeOfIntentMeetingDialogComponent } from './info-requests/notice-of-intent-meeting-dialog/notice-of-intent-meeting-dialog.component';
import { IntakeComponent } from './intake/intake.component';
import { childRoutes, NoticeOfIntentComponent } from './notice-of-intent.component';
import { OverviewComponent } from './overview/overview.component';
import { EditModificationDialogComponent } from './post-decision/edit-modification-dialog/edit-modification-dialog.component';
import { PostDecisionComponent } from './post-decision/post-decision.component';
import { ParcelPrepComponent } from './proposal/parcel-prep/parcel-prep.component';
import { PreparationComponent } from './proposal/preparation/preparation.component';
import { ProposalComponent } from './proposal/proposal.component';
import { SoilProposalComponent } from './proposal/soil/soil.component';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: NoticeOfIntentComponent,
    children: childRoutes,
  },
];

@NgModule({
  providers: [NoticeOfIntentDetailService],
  declarations: [
    NoticeOfIntentComponent,
    OverviewComponent,
    IntakeComponent,
    InfoRequestsComponent,
    InfoRequestDialogComponent,
    PreparationComponent,
    NoticeOfIntentMeetingDialogComponent,
    PostDecisionComponent,
    EditModificationDialogComponent,
    NoiDocumentsComponent,
    DocumentUploadDialogComponent,
    ApplicantInfoComponent,
    ProposalComponent,
    ParcelPrepComponent,
    SoilProposalComponent,
  ],
  imports: [SharedModule.forRoot(), RouterModule.forChild(routes), NoticeOfIntentDetailsModule],
})
export class NoticeOfIntentModule {}
