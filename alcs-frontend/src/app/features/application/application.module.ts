import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationDetailService } from '../../services/application/application-detail.service';
import { InlineDatepickerComponent } from '../../shared/inline-datepicker/inline-datepicker.component';
import { SharedModule } from '../../shared/shared.module';
import { ApplicationDocumentComponent } from './application-document/application-document.component';
import { ApplicationMeetingDialogComponent } from './application-meeting/application-meeting-dialog/application-meeting-dialog.component';
import { ApplicationMeetingComponent } from './application-meeting/application-meeting.component';
import { ApplicationComponent, childRoutes } from './application.component';
import { DecisionComponent } from './decision/decision.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { InfoRequestDialogComponent } from './info-requests/info-rquest-dialog/info-request-dialog.component';
import { IntakeComponent } from './intake/intake.component';
import { OverviewComponent } from './overview/overview.component';
import { DecisionMeetingDialogComponent } from './review/decision-meeting-dialog/decision-meeting-dialog.component';
import { DecisionMeetingComponent } from './review/decision-meeting/decision-meeting.component';
import { ReviewComponent } from './review/review.component';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: ApplicationComponent,
    children: childRoutes,
  },
];

@NgModule({
  providers: [ApplicationDetailService],
  declarations: [
    ApplicationComponent,
    OverviewComponent,
    ReviewComponent,
    DecisionMeetingDialogComponent,
    DecisionMeetingComponent,
    ApplicationDocumentComponent,
    IntakeComponent,
    InlineDatepickerComponent,
    ApplicationMeetingComponent,
    ApplicationMeetingDialogComponent,
    DecisionComponent,
    InfoRequestsComponent,
    InfoRequestDialogComponent,
  ],
  imports: [CommonModule, SharedModule.forRoot(), RouterModule.forChild(routes)],
})
export class ApplicationModule {}
