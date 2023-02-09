import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminComponent, childRoutes } from './admin.component';
import { HolidayDialogComponent } from './holiday/holiday-dialog/holiday-dialog.component';
import { HolidayComponent } from './holiday/holiday.component';
import { LocalGovernmentDialogComponent } from './local-government/dialog/local-government-dialog.component';
import { LocalGovernmentComponent } from './local-government/local-government.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: childRoutes,
  },
];
@NgModule({
  declarations: [
    AdminComponent,
    HolidayComponent,
    HolidayDialogComponent,
    LocalGovernmentComponent,
    LocalGovernmentDialogComponent,
  ],
  imports: [CommonModule, SharedModule.forRoot(), RouterModule.forChild(routes), MatPaginatorModule],
})
export class AdminModule {}
