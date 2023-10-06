import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { PublicAlcReviewComponent } from './alc-review/alc-review.component';
import { PublicDecisionsComponent } from './alc-review/decisions/decisions.component';
import { PublicSubmissionDocumentsComponent } from './alc-review/submission-documents/submission-documents.component';
import { PublicNoticeOfIntentComponent } from './public-notice-of-intent.component';
import { AdditionalInformationComponent } from './submission/additional-information/additional-information.component';
import { ParcelComponent } from './submission/parcel/parcel.component';
import { PfrsDetailsComponent } from './submission/pfrs-details/pfrs-details.component';
import { PofoDetailsComponent } from './submission/pofo-details/pofo-details.component';
import { RosoDetailsComponent } from './submission/roso-details/roso-details.component';
import { SubmissionDetailsComponent } from './submission/submission-details.component';

const routes: Routes = [
  {
    path: ':fileId',
    component: PublicNoticeOfIntentComponent,
  },
];

@NgModule({
  declarations: [
    PublicNoticeOfIntentComponent,
    PublicAlcReviewComponent,
    PublicSubmissionDocumentsComponent,
    PublicDecisionsComponent,
    ParcelComponent,
    SubmissionDetailsComponent,
    RosoDetailsComponent,
    PofoDetailsComponent,
    PfrsDetailsComponent,
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
export class PublicNoticeOfIntentModule {}
