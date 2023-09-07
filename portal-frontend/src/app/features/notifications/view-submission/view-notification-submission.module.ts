import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../shared/shared.module';
import { NotificationDetailsModule } from '../notification-details/notification-details.module';
import { ViewNotificationSubmissionComponent } from './view-notification-submission.component';

const routes: Routes = [
  {
    path: '',
    component: ViewNotificationSubmissionComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    NgxMaskDirective,
    NgxMaskPipe,
    NotificationDetailsModule,
  ],
  declarations: [ViewNotificationSubmissionComponent],
})
export class ViewNotificationSubmissionModule {}
