import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ApplicationComponent } from './application.component';
import { NavComponent } from './nav/nav.component';
import { OverviewComponent } from './overview/overview.component';
import { ProcessingComponent } from './processing/processing.component';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: ApplicationComponent,
    children: [
      {
        path: '',
        component: OverviewComponent,
      },
      {
        path: 'processing',
        component: ProcessingComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [ApplicationComponent, NavComponent, OverviewComponent, ProcessingComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class ApplicationModule {}
