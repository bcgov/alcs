import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { CommissionerApplicationComponent } from './application/commissioner-application.component';
import { CommissionerPlanningReviewComponent } from './planning-review/commissioner-planning-review.component';
import { CommissionerDecisionsComponent } from './application/commissioner-decisions/commissioner-decisions.component';

const routes: Routes = [
  {
    path: 'application/:fileNumber',
    component: CommissionerApplicationComponent,
  },
  {
    path: 'planning-review/:fileNumber',
    component: CommissionerPlanningReviewComponent,
  },
];

@NgModule({
  declarations: [CommissionerApplicationComponent, CommissionerPlanningReviewComponent, CommissionerDecisionsComponent],
  imports: [CommonModule, SharedModule, PlanningReviewModule, RouterModule.forChild(routes), SharedModule],
})
export class CommissionerModule {}
