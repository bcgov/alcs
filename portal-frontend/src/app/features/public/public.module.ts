import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PublicAlcReviewComponent } from './application/alc-review/alc-review.component';
import { PublicDecisionsComponent } from './application/alc-review/decisions/decisions.component';
import { PublicSubmissionDocumentsComponent } from './application/alc-review/submission-documents/submission-documents.component';
import { PublicLfngReviewComponent } from './application/lfng-review/lfng-review.component';
import { PublicApplicationComponent } from './application/public-application.component';
import { SubmissionDetailsModule } from './application/submission/submission-details.module';
import { ApplicationSearchTableComponent } from './search/application-search-table/application-search-table.component';
import { FileTypeFilterDropDownComponent } from './search/file-type-filter-drop-down/file-type-filter-drop-down.component';
import { NoticeOfIntentSearchTableComponent } from './search/notice-of-intent-search-table/notice-of-intent-search-table.component';
import { NotificationSearchTableComponent } from './search/notification-search-table/notification-search-table.component';
import { PublicSearchComponent } from './search/public-search.component';
import { SearchListComponent } from './search/search-list/search-list.component';

const routes: Routes = [
  {
    path: '',
    component: PublicSearchComponent,
  },
  {
    path: 'application/:fileId',
    component: PublicApplicationComponent,
  },
];

@NgModule({
  declarations: [
    PublicSearchComponent,
    NotificationSearchTableComponent,
    NoticeOfIntentSearchTableComponent,
    ApplicationSearchTableComponent,
    FileTypeFilterDropDownComponent,
    SearchListComponent,
    PublicApplicationComponent,
    PublicLfngReviewComponent,
    PublicAlcReviewComponent,
    PublicSubmissionDocumentsComponent,
    PublicDecisionsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatPaginatorModule,
    MatSortModule,
    RouterModule.forChild(routes),
    MatAutocompleteModule,
    MatTreeModule,
    SubmissionDetailsModule,
  ],
})
export class PublicModule {}
