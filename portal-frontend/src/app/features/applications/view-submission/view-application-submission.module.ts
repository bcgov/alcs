import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../shared/shared.module';
import { ApplicationDetailsModule } from '../application-details/application-details.module';
import { AlcReviewComponent } from './alc-review/alc-review.component';
import { DecisionsComponent } from './alc-review/decisions/decisions.component';
import { SubmissionDocumentsComponent } from './alc-review/submission-documents/submission-documents.component';
import { LfngReviewComponent } from './lfng-review/lfng-review.component';
import { ViewApplicationSubmissionComponent } from './view-application-submission.component';

const routes: Routes = [
  {
    path: '',
    component: ViewApplicationSubmissionComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    ApplicationDetailsModule,
    NgxMaskDirective,
    NgxMaskPipe,
  ],
  declarations: [
    ViewApplicationSubmissionComponent,
    LfngReviewComponent,
    AlcReviewComponent,
    SubmissionDocumentsComponent,
    DecisionsComponent,
  ],
})
export class ViewApplicationSubmissionModule {}
