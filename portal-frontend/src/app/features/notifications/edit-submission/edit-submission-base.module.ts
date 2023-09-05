import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { SharedModule } from '../../../shared/shared.module';
import { EditSubmissionComponent } from './edit-submission.component';

@NgModule({
  imports: [CommonModule, SharedModule, NgxMaskDirective, NgxMaskPipe],
  declarations: [EditSubmissionComponent],
  exports: [EditSubmissionComponent],
})
export class EditSubmissionBaseModule {}
