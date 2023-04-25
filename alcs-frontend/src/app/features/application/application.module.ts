import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { RouterModule, Routes } from '@angular/router';
import { MtxNativeDatetimeModule, MTX_DATETIME_FORMATS } from '@ng-matero/extensions/core';
import { MtxDatetimepickerModule } from '@ng-matero/extensions/datetimepicker';
import { ApplicationDetailService } from '../../services/application/application-detail.service';
import { InlineDatepickerComponent } from '../../shared/inline-datepicker/inline-datepicker.component';
import { SharedModule } from '../../shared/shared.module';
import { TimelineComponent } from '../../shared/timeline/timeline.component';
import { DATE_FORMATS } from '../../shared/utils/date-format';
import { ApplicantInfoComponent } from './applicant-info/applicant-info.component';
import { ApplicationDetailsModule } from './applicant-info/application-details/application-details.module';
import { ApplicationMeetingDialogComponent } from './application-meeting/application-meeting-dialog/application-meeting-dialog.component';
import { ApplicationMeetingComponent } from './application-meeting/application-meeting.component';
import { CreateApplicationMeetingDialogComponent } from './application-meeting/create-application-meeting-dialog/create-application-meeting-dialog.component';
import { ApplicationComponent, childRoutes } from './application.component';
import { DecisionDialogComponent } from './decision/decision-v1/decision-dialog/decision-dialog.component';
import { DecisionV1Component } from './decision/decision-v1/decision.component';
import { DecisionComponent } from './decision/decision.component';
import { DocumentUploadDialogComponent } from './documents/document-upload-dialog/document-upload-dialog.component';
import { DocumentsComponent } from './documents/documents.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { InfoRequestDialogComponent } from './info-requests/info-rquest-dialog/info-request-dialog.component';
import { IntakeComponent } from './intake/intake.component';
import { LfngInfoComponent } from './lfng-info/lfng-info.component';
import { OverviewComponent } from './overview/overview.component';
import { EditModificationDialogComponent } from './post-decision/edit-modification-dialog/edit-modification-dialog.component';
import { EditReconsiderationDialogComponent } from './post-decision/edit-reconsideration-dialog/edit-reconsideration-dialog.component';
import { InlineReviewOutcomeComponent } from './post-decision/inline-review-outcome/inline-review-outcome.component';
import { PostDecisionComponent } from './post-decision/post-decision.component';
import { NfuProposalComponent } from './proposal/nfu/nfu.component';
import { ProposalComponent } from './proposal/proposal.component';
import { SubdProposalComponent } from './proposal/subd/subd.component';
import { DecisionMeetingDialogComponent } from './review/decision-meeting-dialog/decision-meeting-dialog.component';
import { DecisionMeetingComponent } from './review/decision-meeting/decision-meeting.component';
import { ReviewComponent } from './review/review.component';
import { StaffJournalNoteInputComponent } from './staff-journal/staff-journal-note-input/staff-journal-note-input.component';
import { StaffJournalNoteComponent } from './staff-journal/staff-journal-note/staff-journal-note.component';
import { StaffJournalComponent } from './staff-journal/staff-journal.component';
import { DecisionV2Component } from './decision/decision-v2/decision-v2.component';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: ApplicationComponent,
    children: childRoutes,
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
    InlineDatepickerComponent,
    ApplicationMeetingComponent,
    ApplicationMeetingDialogComponent,
    CreateApplicationMeetingDialogComponent,
    DecisionV1Component,
    InfoRequestsComponent,
    InfoRequestDialogComponent,
    TimelineComponent,
    DecisionDialogComponent,
    PostDecisionComponent,
    InlineReviewOutcomeComponent,
    EditReconsiderationDialogComponent,
    EditModificationDialogComponent,
    ApplicantInfoComponent,
    LfngInfoComponent,
    DocumentsComponent,
    DocumentUploadDialogComponent,
    StaffJournalComponent,
    StaffJournalNoteComponent,
    StaffJournalNoteInputComponent,
    ProposalComponent,
    NfuProposalComponent,
    SubdProposalComponent,
    DecisionComponent,
    DecisionV2Component,
  ],
  imports: [
    SharedModule.forRoot(),
    RouterModule.forChild(routes),
    MtxDatetimepickerModule,
    MtxNativeDatetimeModule,
    MatCheckboxModule,
    ApplicationDetailsModule,
    MatSortModule,
  ],
})
export class ApplicationModule {}
