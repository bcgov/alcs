import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MTX_DATETIME_FORMATS } from '@ng-matero/extensions/core';
import { NoticeOfIntentDetailService } from '../../services/notice-of-intent/notice-of-intent-detail.service';
import { SharedModule } from '../../shared/shared.module';
import { DATE_FORMATS } from '../../shared/utils/date-format';
import { IntakeComponent } from './intake/intake.component';
import { childRoutes, NoticeOfIntentComponent } from './notice-of-intent.component';
import { OverviewComponent } from './overview/overview.component';

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
  declarations: [NoticeOfIntentComponent, OverviewComponent, IntakeComponent],
  imports: [SharedModule.forRoot(), RouterModule.forChild(routes)],
})
export class NoticeOfIntentModule {}
