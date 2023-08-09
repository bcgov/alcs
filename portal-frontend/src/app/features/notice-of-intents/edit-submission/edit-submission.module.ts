import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { EditSubmissionComponent } from './edit-submission.component';

const routes: Routes = [
  {
    path: '',
    component: EditSubmissionComponent,
  },
];

@NgModule({
  declarations: [EditSubmissionComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class EditSubmissionModule {}
