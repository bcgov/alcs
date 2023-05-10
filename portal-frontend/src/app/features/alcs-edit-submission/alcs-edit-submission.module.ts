import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateGuard } from '../../shared/guard/can-deactivate.guard';
import { SharedModule } from '../../shared/shared.module';
import { EditSubmissionBaseModule } from '../edit-submission/edit-submission-base.module';
import { AlcsEditSubmissionComponent } from './alcs-edit-submission.component';
import { ConfirmPublishDialogComponent } from './confirm-publish-dialog/confirm-publish-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: AlcsEditSubmissionComponent,
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: ':stepInd',
    component: AlcsEditSubmissionComponent,
    canDeactivate: [CanDeactivateGuard],
  },
];

@NgModule({
  declarations: [AlcsEditSubmissionComponent, ConfirmPublishDialogComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes), EditSubmissionBaseModule],
})
export class AlcsEditSubmissionModule {}
