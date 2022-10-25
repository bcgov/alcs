import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MtxNativeDatetimeModule, MTX_DATETIME_FORMATS } from '@ng-matero/extensions/core';
import { MtxDatetimepickerModule } from '@ng-matero/extensions/datetimepicker';
import { ApplicationDetailService } from '../../services/application/application-detail.service';
import { InlineDatepickerComponent } from '../../shared/inline-datepicker/inline-datepicker.component';
import { SharedModule } from '../../shared/shared.module';
import { TimelineComponent } from '../../shared/timeline/timeline.component';
import { DATE_FORMATS } from '../../shared/utils/date-format';
import { ApplicationDocumentComponent } from './application-document/application-document.component';
import { ApplicationHeaderComponent } from './application-header/application-header.component';
import { ApplicationMeetingDialogComponent } from './application-meeting/application-meeting-dialog/application-meeting-dialog.component';
import { ApplicationMeetingComponent } from './application-meeting/application-meeting.component';
import { CreateApplicationMeetingDialogComponent } from './application-meeting/create-application-meeting-dialog/create-application-meeting-dialog.component';
import { ApplicationComponent, childRoutes } from './application.component';
import { DecisionDialogComponent } from './decision/decision-dialog/decision-dialog.component';
import { DecisionComponent } from './decision/decision.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { InfoRequestDialogComponent } from './info-requests/info-rquest-dialog/info-request-dialog.component';
import { IntakeComponent } from './intake/intake.component';
import { OverviewComponent } from './overview/overview.component';
import { InlineReviewOutcomeComponent } from './post-decision/inline-review-outcome/inline-review-outcome.component';
import { PostDecisionComponent } from './post-decision/post-decision.component';
import { DecisionMeetingDialogComponent } from './review/decision-meeting-dialog/decision-meeting-dialog.component';
import { DecisionMeetingComponent } from './review/decision-meeting/decision-meeting.component';
import { ReviewComponent } from './review/review.component';
import { PostDecisionDialogComponent } from './post-decision/post-decision-dialog/post-decision-dialog.component';

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
    ApplicationHeaderComponent,
    OverviewComponent,
    ReviewComponent,
    DecisionMeetingDialogComponent,
    DecisionMeetingComponent,
    ApplicationDocumentComponent,
    IntakeComponent,
    InlineDatepickerComponent,
    ApplicationMeetingComponent,
    ApplicationMeetingDialogComponent,
    CreateApplicationMeetingDialogComponent,
    DecisionComponent,
    InfoRequestsComponent,
    InfoRequestDialogComponent,
    TimelineComponent,
    DecisionDialogComponent,
    PostDecisionComponent,
    InlineReviewOutcomeComponent,
    PostDecisionDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule.forRoot(),
    RouterModule.forChild(routes),
    MtxDatetimepickerModule,
    MtxNativeDatetimeModule,
  ],
})
export class ApplicationModule {}
