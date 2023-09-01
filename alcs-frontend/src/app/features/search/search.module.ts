import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SearchComponent } from './search.component';
import { ApplicationSearchTableComponent } from './application-search-table/application-search-table.component';
import { NoticeOfIntentSearchTableComponent } from './notice-of-intent-search-table/notice-of-intent-search-table.component';

const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
  },
];

@NgModule({
  declarations: [SearchComponent, ApplicationSearchTableComponent, NoticeOfIntentSearchTableComponent],
  imports: [CommonModule, SharedModule.forRoot(), RouterModule.forChild(routes), MatTabsModule, MatPaginatorModule],
})
export class SearchModule {}
