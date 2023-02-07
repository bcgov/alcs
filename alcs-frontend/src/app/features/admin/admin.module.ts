import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminComponent, childRoutes } from './admin.component';
import { HolidayDialogComponent } from './holiday/holiday-dialog/holiday-dialog.component';
import { HolidayComponent } from './holiday/holiday.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: childRoutes,
  },
];
@NgModule({
  declarations: [AdminComponent, HolidayComponent, HolidayDialogComponent],
  imports: [CommonModule, SharedModule.forRoot(), RouterModule.forChild(routes), MatPaginatorModule],
})
export class AdminModule {}
