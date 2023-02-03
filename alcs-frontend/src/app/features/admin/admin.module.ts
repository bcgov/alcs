import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminComponent, childRoutes } from './admin.component';
import { StatHolidayComponent } from './stat-holiday/stat-holiday.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: childRoutes,
  },
];
@NgModule({
  declarations: [AdminComponent, StatHolidayComponent],
  imports: [CommonModule, SharedModule.forRoot(), RouterModule.forChild(routes), MatPaginatorModule],
})
export class AdminModule {}
