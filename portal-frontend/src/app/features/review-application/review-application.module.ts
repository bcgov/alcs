import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoDataComponent } from '../../shared/no-data/no-data.component';
import { SharedModule } from '../../shared/shared.module';
import { ReviewApplicationComponent } from './review-application.component';
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
    component: ReviewApplicationComponent,
  },
];

@NgModule({
  declarations: [
    ReviewApplicationComponent,
    ReviewContactInformationComponent,
    ReviewOcpComponent,
    ReviewZoningComponent,
    ReviewResolutionComponent,
    ReviewAttachmentsComponent,
    ReviewSubmitComponent,
    ReviewSubmitFngComponent,
    NoDataComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class ReviewApplicationModule {}
