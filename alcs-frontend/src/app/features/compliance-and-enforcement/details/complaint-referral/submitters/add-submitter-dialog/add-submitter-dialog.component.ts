import { Component, Inject, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../../../../../services/toast/toast.service';
import { ComplianceAndEnforcementSubmitterService } from '../../../../../../services/compliance-and-enforcement/submitter/submitter.service';
import { SubmitterComponent } from '../../../../submitter/submitter.component';
import { firstValueFrom } from 'rxjs';
import { InitialSubmissionType } from '../../../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';

@Component({
  selector: 'app-add-submitter-dialog',
  templateUrl: './add-submitter-dialog.component.html',
  styleUrls: ['./add-submitter-dialog.component.scss'],
})
export class AddSubmitterDialogComponent {
  isSaving = false;

  form = new FormGroup({});

  @ViewChild(SubmitterComponent) submitterComponent?: SubmitterComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileUuid: string;
      initialSubmissionType: InitialSubmissionType;
      service: ComplianceAndEnforcementSubmitterService;
    },
    private readonly dialogRef: MatDialogRef<AddSubmitterDialogComponent>,
    private readonly toastService: ToastService,
  ) {}

  async close() {
    this.dialogRef.close(false);
  }

  async addSubmitter() {
    this.isSaving = true;
    const [_, dto] = this.submitterComponent?.$changes.getValue() ?? [];

    try {
      await firstValueFrom(this.data?.service.create({ ...dto, fileUuid: this.data?.fileUuid }));

      this.dialogRef.close(true);
      this.toastService.showSuccessToast('Submitter added');
    } catch (error) {
      console.error(error);
      this.toastService.showErrorToast('Failed adding submitter');
    }
    this.isSaving = false;
  }

  registerFormGroup({ name, formGroup }: { name: string; formGroup: FormGroup }) {
    this.form.addControl(name, formGroup);
  }
}
