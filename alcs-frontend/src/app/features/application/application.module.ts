import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ApplicationComponent } from './application.component';
import { NavComponent } from './nav/nav.component';
import { OverviewComponent } from './overview/overview.component';
import { ProcessingComponent } from './processing/processing.component';
import { DecisionMeetingDialogComponent } from './review/decision-meeting-dialog/decision-meeting-dialog.component';
import { DecisionMeetingComponent } from './review/decision-meeting/decision-meeting.component';
import { ReviewComponent } from './review/review.component';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: ApplicationComponent,
    children: [
      {
        path: '',
        component: OverviewComponent,
      },
      {
        path: 'processing',
        component: ProcessingComponent,
      },
      {
        path: 'review',
        component: ReviewComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    ApplicationComponent,
    NavComponent,
    OverviewComponent,
    ProcessingComponent,
    ReviewComponent,
    DecisionMeetingDialogComponent,
    DecisionMeetingComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class ApplicationModule {}
