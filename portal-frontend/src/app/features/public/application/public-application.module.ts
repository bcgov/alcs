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
import { PublicLfngReviewComponent } from './lfng-review/lfng-review.component';
import { PublicApplicationComponent } from './public-application.component';
import { CoveDetailsComponent } from './submission/cove-details/cove-details.component';
import { ExclDetailsComponent } from './submission/excl-details/excl-details.component';
import { InclDetailsComponent } from './submission/incl-details/incl-details.component';
import { NaruDetailsComponent } from './submission/naru-details/naru-details.component';
import { NfuDetailsComponent } from './submission/nfu-details/nfu-details.component';
import { ParcelComponent } from './submission/parcel/parcel.component';
import { PfrsDetailsComponent } from './submission/pfrs-details/pfrs-details.component';
import { PofoDetailsComponent } from './submission/pofo-details/pofo-details.component';
import { RosoDetailsComponent } from './submission/roso-details/roso-details.component';
import { SubdDetailsComponent } from './submission/subd-details/subd-details.component';
import { SubmissionDetailsComponent } from './submission/submission-details.component';
import { TurDetailsComponent } from './submission/tur-details/tur-details.component';

const routes: Routes = [
  {
    path: ':fileId',
    component: PublicApplicationComponent,
  },
];

@NgModule({
  declarations: [
    PublicApplicationComponent,
    PublicLfngReviewComponent,
    PublicAlcReviewComponent,
    PublicSubmissionDocumentsComponent,
    PublicDecisionsComponent,
    ParcelComponent,
    SubmissionDetailsComponent,
    NfuDetailsComponent,
    TurDetailsComponent,
    SubdDetailsComponent,
    RosoDetailsComponent,
    PofoDetailsComponent,
    PfrsDetailsComponent,
    NaruDetailsComponent,
    ExclDetailsComponent,
    InclDetailsComponent,
    CoveDetailsComponent,
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
export class PublicApplicationModule {}
