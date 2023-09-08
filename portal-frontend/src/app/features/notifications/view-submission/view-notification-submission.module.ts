import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../shared/shared.module';
import { NotificationDetailsModule } from '../notification-details/notification-details.module';
import { AlcReviewComponent } from './alc-review/alc-review.component';
import { SubmissionDocumentsComponent } from './alc-review/submission-documents/submission-documents.component';
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
  declarations: [ViewNotificationSubmissionComponent, AlcReviewComponent, SubmissionDocumentsComponent],
})
export class ViewNotificationSubmissionModule {}
