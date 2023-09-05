import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ApplicationSearchTableComponent } from './application-search-table/application-search-table.component';
import { FileTypeFilterDropDownComponent } from './file-type-filter-drop-down/file-type-filter-drop-down.component';
import { NonApplicationSearchTableComponent } from './non-application-search-table/non-application-search-table.component';
import { NoticeOfIntentSearchTableComponent } from './notice-of-intent-search-table/notice-of-intent-search-table.component';
import { SearchComponent } from './search.component';

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
    NonApplicationSearchTableComponent,
    FileTypeFilterDropDownComponent,
  ],
  imports: [
    CommonModule,
    SharedModule.forRoot(),
    RouterModule.forChild(routes),
    MatTabsModule,
    MatPaginatorModule,
    MatTreeModule,
  ],
})
export class SearchModule {}
