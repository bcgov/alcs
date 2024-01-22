import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateGuard } from '../../../shared/guard/can-deactivate.guard';
import { SharedModule } from '../../../shared/shared.module';
import { EditSubmissionBaseModule } from './edit-submission-base.module';
import { EditSubmissionComponent } from './edit-submission.component';
import { StepComponent } from './step.partial';
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
  {
    path: 'success',
    component: SuccessComponent,
  },
  {
    path: '',
    component: EditSubmissionComponent,
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: ':stepInd',
    component: EditSubmissionComponent,
    canDeactivate: [CanDeactivateGuard],
  },
];

@NgModule({
  declarations: [StepComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes), EditSubmissionBaseModule],
})
export class EditSubmissionModule {}
