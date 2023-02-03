import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminComponent, childRoutes } from './admin.component';
import { StatHolidayComponent } from './stat-holiday/stat-holiday.component';
import { HolidayDialogComponent } from './stat-holiday/holiday-dialog/holiday-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: childRoutes,
  },
];
@NgModule({
  declarations: [AdminComponent, StatHolidayComponent, HolidayDialogComponent],
  imports: [CommonModule, SharedModule.forRoot(), RouterModule.forChild(routes), MatPaginatorModule],
})
export class AdminModule {}
