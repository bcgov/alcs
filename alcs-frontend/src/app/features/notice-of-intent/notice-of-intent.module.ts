import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoticeOfIntentDetailService } from '../../services/notice-of-intent/notice-of-intent-detail.service';
import { SharedModule } from '../../shared/shared.module';
import { InfoRequestDialogComponent } from './info-requests/info-request-dialog/info-request-dialog.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { NoticeOfIntentMeetingDialogComponent } from './info-requests/notice-of-intent-meeting-dialog/notice-of-intent-meeting-dialog.component';
import { DecisionDialogComponent } from './decision/decision-dialog/decision-dialog.component';
import { DecisionComponent } from './decision/decision.component';
import { IntakeComponent } from './intake/intake.component';
import { childRoutes, NoticeOfIntentComponent } from './notice-of-intent.component';
import { OverviewComponent } from './overview/overview.component';
import { PreparationComponent } from './preparation/preparation.component';

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
    DecisionComponent,
    DecisionDialogComponent,
  ],
  imports: [SharedModule.forRoot(), RouterModule.forChild(routes)],
})
export class NoticeOfIntentModule {}
