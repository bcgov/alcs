import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../shared/shared.module';
import { NoticeOfIntentDetailsModule } from '../notice-of-intent-details/notice-of-intent-details.module';
import { AlcReviewComponent } from './alc-review/alc-review.component';
import { SubmissionDocumentsComponent } from './alc-review/submission-documents/submission-documents.component';
import { ViewNoticeOfIntentSubmissionComponent } from './view-notice-of-intent-submission.component';

const routes: Routes = [
  {
    path: '',
    component: ViewNoticeOfIntentSubmissionComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    NoticeOfIntentDetailsModule,
    NgxMaskDirective,
    NgxMaskPipe,
  ],
  declarations: [ViewNoticeOfIntentSubmissionComponent, AlcReviewComponent, SubmissionDocumentsComponent],
})
export class ViewNoticeOfIntentSubmissionModule {}
