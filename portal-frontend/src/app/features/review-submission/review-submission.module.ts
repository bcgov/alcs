import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { CanDeactivateGuard } from '../../shared/guard/can-deactivate.guard';
import { SharedModule } from '../../shared/shared.module';
import { ReturnApplicationDialogComponent } from './return-application-dialog/return-application-dialog.component';
import { ReviewSubmissionComponent } from './review-submission.component';
import { ReviewAttachmentsComponent } from './review-attachments/review-attachments.component';
import { ReviewContactInformationComponent } from './review-contact-information/review-contact-information.component';
import { ReviewOcpComponent } from './review-ocp/review-ocp.component';
import { ReviewResolutionComponent } from './review-resolution/review-resolution.component';
import { ReviewSubmitFngComponent } from './review-submit-fng/review-submit-fng.component';
import { ReviewSubmitComponent } from './review-submit/review-submit.component';
import { ReviewZoningComponent } from './review-zoning/review-zoning.component';

const routes: Routes = [
  {
    path: '',
    component: ReviewSubmissionComponent,
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: ':stepInd',
    component: ReviewSubmissionComponent,
    canDeactivate: [CanDeactivateGuard],
  },
];

@NgModule({
  declarations: [
    ReviewSubmissionComponent,
    ReviewContactInformationComponent,
    ReviewOcpComponent,
    ReviewZoningComponent,
    ReviewResolutionComponent,
    ReviewAttachmentsComponent,
    ReviewSubmitComponent,
    ReviewSubmitFngComponent,
    ReturnApplicationDialogComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes), NgxMaskDirective, NgxMaskPipe],
})
export class ReviewSubmissionModule {}
