import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AssignedComponent } from './assigned/assigned.component';
import { SubtaskTableComponent } from './subtask-table/subtask-table.component';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
];

@NgModule({
  declarations: [HomeComponent, AssignedComponent, SubtaskTableComponent],
  imports: [CommonModule, SharedModule.forRoot(), RouterModule.forChild(routes)],
  providers: [],
})
export class HomeModule {}
