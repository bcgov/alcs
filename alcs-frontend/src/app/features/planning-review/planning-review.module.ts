import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PlanningReviewDetailService } from '../../services/planning-review/planning-review-detail.service';
import { SharedModule } from '../../shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { OverviewComponent } from './overview/overview.component';
import { childRoutes, PlanningReviewComponent } from './planning-review.component';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: PlanningReviewComponent,
    children: childRoutes,
  },
];

@NgModule({
  providers: [PlanningReviewDetailService],
  declarations: [PlanningReviewComponent, OverviewComponent, HeaderComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class PlanningReviewModule {}
