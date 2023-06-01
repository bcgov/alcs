import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MTX_DATETIME_FORMATS } from '@ng-matero/extensions/core';
import { NoticeOfIntentDetailService } from '../../services/notice-of-intent/notice-of-intent-detail.service';
import { SharedModule } from '../../shared/shared.module';
import { DATE_FORMATS } from '../../shared/utils/date-format';
import { InfoRequestDialogComponent } from './info-requests/info-request-dialog/info-request-dialog.component';
import { InfoRequestsComponent } from './info-requests/info-requests.component';
import { NoticeOfIntentMeetingDialogComponent } from './info-requests/notice-of-intent-meeting-dialog/notice-of-intent-meeting-dialog.component';
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
  providers: [
    NoticeOfIntentDetailService,
    {
      provide: MTX_DATETIME_FORMATS,
      useValue: DATE_FORMATS,
    },
  ],
  declarations: [
    NoticeOfIntentComponent,
    OverviewComponent,
    IntakeComponent,
    InfoRequestsComponent,
    InfoRequestDialogComponent,
    PreparationComponent,
    NoticeOfIntentMeetingDialogComponent,
  ],
  imports: [SharedModule.forRoot(), RouterModule.forChild(routes)],
})
export class NoticeOfIntentModule {}
