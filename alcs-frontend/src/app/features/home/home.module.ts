import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AgrologistComponent } from './agrologist/agrologist.component';
import { AssignedComponent } from './assigned/assigned.component';
import { AuditSubtasksComponent } from './audit/audit-subtasks.component';
import { GisSubtasksComponent } from './gis/gis-subtasks.component';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
];

@NgModule({
  declarations: [HomeComponent, AssignedComponent, GisSubtasksComponent, AuditSubtasksComponent, AgrologistComponent],
  imports: [CommonModule, SharedModule.forRoot(), RouterModule.forChild(routes)],
  providers: [],
})
export class HomeModule {}
