import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MTX_DATETIME_FORMATS } from '@ng-matero/extensions/core';
import { ApplicationDetailService } from '../../services/application/application-detail.service';
import { SharedModule } from '../../shared/shared.module';
import { DATE_FORMATS } from '../../shared/utils/date-format';
import { ApplicantInfoComponent } from './applicant-info/applicant-info.component';
import { ApplicationDetailsModule } from './applicant-info/application-details/application-details.module';
import { ApplicationMeetingDialogComponent } from './application-meeting/application-meeting-dialog/application-meeting-dialog.component';
import { ApplicationMeetingComponent } from './application-meeting/application-meeting.component';
import { CreateApplicationMeetingDialogComponent } from './application-meeting/create-application-meeting-dialog/create-application-meeting-dialog.component';
import { appChildRoutes, ApplicationComponent } from './application.component';
import { DecisionModule } from './decision/decision.module';
import { DocumentUploadDialogComponent } from './documents/document-upload-dialog/document-upload-dialog.component';
import { DocumentsComponent } from './documents/documents.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { InfoRequestDialogComponent } from './info-requests/info-rquest-dialog/info-request-dialog.component';
import { IntakeComponent } from './intake/intake.component';
import { LfngInfoComponent } from './lfng-info/lfng-info.component';
import { OverviewComponent } from './overview/overview.component';
import { UncancelApplicationDialogComponent } from './overview/uncancel-application-dialog/uncancel-application-dialog.component';
import { EditModificationDialogComponent } from './post-decision/edit-modification-dialog/edit-modification-dialog.component';
import { EditReconsiderationDialogComponent } from './post-decision/edit-reconsideration-dialog/edit-reconsideration-dialog.component';
import { PostDecisionComponent } from './post-decision/post-decision.component';
import { InclProposalComponent } from './proposal/incl/incl.component';
import { NaruProposalComponent } from './proposal/naru/naru.component';
import { NfuProposalComponent } from './proposal/nfu/nfu.component';
import { ParcelPrepComponent } from './proposal/parcel-prep/parcel-prep.component';
import { ProposalComponent } from './proposal/proposal.component';
import { ExclProposalComponent } from './proposal/excl/excl.component';
import { SoilProposalComponent } from './proposal/soil/soil.component';
import { SubdProposalComponent } from './proposal/subd/subd.component';
import { DecisionMeetingDialogComponent } from './review/decision-meeting-dialog/decision-meeting-dialog.component';
import { DecisionMeetingComponent } from './review/decision-meeting/decision-meeting.component';
import { ReviewComponent } from './review/review.component';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: ApplicationComponent,
    children: appChildRoutes,
  },
];

@NgModule({
  providers: [
    ApplicationDetailService,
    {
      provide: MTX_DATETIME_FORMATS,
      useValue: DATE_FORMATS,
    },
  ],
  declarations: [
    ApplicationComponent,
    OverviewComponent,
    ReviewComponent,
    DecisionMeetingDialogComponent,
    DecisionMeetingComponent,
    IntakeComponent,
    ApplicationMeetingComponent,
    ApplicationMeetingDialogComponent,
    CreateApplicationMeetingDialogComponent,
    InfoRequestsComponent,
    InfoRequestDialogComponent,
    PostDecisionComponent,
    EditReconsiderationDialogComponent,
    EditModificationDialogComponent,
    ApplicantInfoComponent,
    LfngInfoComponent,
    DocumentsComponent,
    DocumentUploadDialogComponent,
    ProposalComponent,
    NfuProposalComponent,
    SubdProposalComponent,
    SoilProposalComponent,
    ExclProposalComponent,
    NaruProposalComponent,
    InclProposalComponent,
    ParcelPrepComponent,
    UncancelApplicationDialogComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes), ApplicationDetailsModule, DecisionModule],
})
export class ApplicationModule {}
