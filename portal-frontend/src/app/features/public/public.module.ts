import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
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
    path: 'application',
    loadChildren: () => import('./application/public-application.module').then((m) => m.PublicApplicationModule),
  },
  {
    path: 'notice-of-intent',
    loadChildren: () =>
      import('./notice-of-intent/public-notice-of-intent.module').then((m) => m.PublicNoticeOfIntentModule),
  },
  {
    path: 'notification',
    loadChildren: () => import('./notification/public-notification.module').then((m) => m.PublicNotificationModule),
  },
];

@NgModule({
  declarations: [
    PublicSearchComponent,
    NotificationSearchTableComponent,
    NoticeOfIntentSearchTableComponent,
    ApplicationSearchTableComponent,
    SearchListComponent,
  ],
  imports: [CommonModule, SharedModule, MatPaginatorModule, MatSortModule, RouterModule.forChild(routes)],
})
export class PublicModule {}
