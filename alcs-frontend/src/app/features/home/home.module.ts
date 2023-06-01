import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AssignedTableComponent } from './assigned/assigned-table/assigned-table.component';
import { AssignedComponent } from './assigned/assigned.component';
import { SubtaskTableComponent } from './subtask/subtask-table/subtask-table.component';
import { SubtaskComponent } from './subtask/subtask.component';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
];

@NgModule({
  declarations: [HomeComponent, AssignedComponent, SubtaskComponent, SubtaskTableComponent, AssignedTableComponent],
  imports: [CommonModule, SharedModule.forRoot(), RouterModule.forChild(routes)],
  providers: [],
})
export class HomeModule {}
