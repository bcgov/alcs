import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { PublicAlcReviewComponent } from './alc-review/alc-review.component';
import { PublicSubmissionDocumentsComponent } from './alc-review/submission-documents/submission-documents.component';
import { PublicNotificationComponent } from './public-notification.component';
import { AdditionalInformationComponent } from './submission/additional-information/additional-information.component';
import { ParcelComponent } from './submission/parcel/parcel.component';
import { ProposalDetailsComponent } from './submission/proposal-details/proposal-details.component';
import { SubmissionDetailsComponent } from './submission/submission-details.component';

const routes: Routes = [
  {
    path: ':fileId',
    component: PublicNotificationComponent,
  },
];

@NgModule({
  declarations: [
    PublicNotificationComponent,
    PublicAlcReviewComponent,
    PublicSubmissionDocumentsComponent,
    ParcelComponent,
    SubmissionDetailsComponent,
    ProposalDetailsComponent,
    AdditionalInformationComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatPaginatorModule,
    MatSortModule,
    RouterModule.forChild(routes),
    MatAutocompleteModule,
    MatTreeModule,
  ],
})
export class PublicNotificationModule {}
