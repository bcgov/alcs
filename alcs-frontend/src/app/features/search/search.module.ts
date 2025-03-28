import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ApplicationSearchTableComponent } from './application-search-table/application-search-table.component';
import { FileTypeFilterDropDownComponent } from './file-type-filter-drop-down/file-type-filter-drop-down.component';
import { PlanningReviewSearchTableComponent } from './planning-review-search-table/planning-review-search-table.component';
import { NoticeOfIntentSearchTableComponent } from './notice-of-intent-search-table/notice-of-intent-search-table.component';
import { NotificationSearchTableComponent } from './notification-search-table/notification-search-table.component';
import { SearchComponent } from './search.component';
import { InquirySearchTableComponent } from './inquiry-search-table/inquiry-search-table.component';
import { MatChipsModule } from '@angular/material/chips';
import { SpinnerStatusComponent } from './spinner-status/spinner-status.component';

const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
  },
];

@NgModule({
  declarations: [
    SearchComponent,
    ApplicationSearchTableComponent,
    NoticeOfIntentSearchTableComponent,
    PlanningReviewSearchTableComponent,
    NotificationSearchTableComponent,
    FileTypeFilterDropDownComponent,
    InquirySearchTableComponent,
    SpinnerStatusComponent,
  ],
  imports: [
    CommonModule,
    SharedModule.forRoot(),
    RouterModule.forChild(routes),
    MatTabsModule,
    MatPaginatorModule,
    MatTreeModule,
    MatChipsModule,
  ],
})
export class SearchModule {}
