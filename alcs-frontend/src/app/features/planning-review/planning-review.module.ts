import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanningReviewDetailService } from '../../services/planning-review/planning-review-detail.service';
import { SharedModule } from '../../shared/shared.module';
import { DocumentsComponent } from './documents/documents.component';
import { HeaderComponent } from './header/header.component';
import { OverviewComponent } from './overview/overview.component';
import { childRoutes, PlanningReviewComponent } from './planning-review.component';
import { CreatePlanningReferralDialogComponent } from './referrals/create/create-planning-referral-dialog.component';
import { ReferralComponent } from './referrals/referral.component';
import { EditMeetingDialogComponent } from './review/edit-meeting-dialog/edit-meeting-dialog.component';
import { EvidentiaryRecordComponent } from './review/evidentiary-record/evidentiary-record.component';
import { ReviewComponent } from './review/review.component';
import { ScheduleComponent } from './review/schedule/schedule';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: PlanningReviewComponent,
    children: childRoutes,
  },
];

@NgModule({
  providers: [PlanningReviewDetailService],
  declarations: [
    PlanningReviewComponent,
    OverviewComponent,
    HeaderComponent,
    DocumentsComponent,
    ReferralComponent,
    CreatePlanningReferralDialogComponent,
    EvidentiaryRecordComponent,
    ReviewComponent,
    ScheduleComponent,
    EditMeetingDialogComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes), CdkDropList, CdkDrag],
  exports: [HeaderComponent, EvidentiaryRecordComponent],
})
export class PlanningReviewModule {}
