import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '../../shared/shared.module';
import { SearchComponent } from './search.component';

@NgModule({
  declarations: [SearchComponent],
  imports: [CommonModule, SharedModule.forRoot(), MatTabsModule, MatTableModule, MatPaginatorModule],
})
export class SearchModule {}
