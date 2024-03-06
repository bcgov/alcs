import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PlanningReviewComponent } from './planning-review.component';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: PlanningReviewComponent,
  },
];

@NgModule({
  declarations: [PlanningReviewComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class PlanningReviewModule {}
