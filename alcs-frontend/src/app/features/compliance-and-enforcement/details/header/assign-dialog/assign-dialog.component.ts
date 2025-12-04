import { Component, Inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../../../../services/toast/toast.service';
import { ComplianceAndEnforcementSubmitterService } from '../../../../../services/compliance-and-enforcement/submitter/submitter.service';
import { SubmitterComponent } from '../../../submitter/submitter.component';
import { InitialSubmissionType } from '../../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { UserDto } from '../../../../../services/user/user.dto';
import { UserService } from '../../../../../services/user/user.service';

interface DialogResult {
  saved: boolean;
  officerUuid?: string | null;
}

@Component({
    selector: 'app-assign-dialog',
    templateUrl: './assign-dialog.component.html',
    styleUrls: ['./assign-dialog.component.scss'],
    standalone: false
})
export class ComplianceAndEnforcementAssignDialogComponent {
  isSaving = false;

  form = new FormGroup({});
  officerList = new FormControl<string | null>(null);

  @ViewChild(SubmitterComponent) submitterComponent?: SubmitterComponent;

  officers?: UserDto[];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      assigneeUuid: string;
    },
    private readonly dialogRef: MatDialogRef<ComplianceAndEnforcementAssignDialogComponent>,
    private readonly toastService: ToastService,
    private readonly userService: UserService,
  ) {}

  ngOnInit() {
    this.loadOfficers();
  }

  async loadOfficers() {
    try {
      this.officers = await this.userService.getComplianceAndEnforcementOfficers();
      this.officerList.setValue(this.data.assigneeUuid);
    } catch (e) {
      console.error(e);
      this.toastService.showErrorToast('Failed to load Compliance and Enforcement Officers');
    }
  }

  async close() {
    this.dialogRef.close({ saved: false } as DialogResult);
  }

  async addSubmitter() {
    this.dialogRef.close({ saved: true, officerUuid: this.officerList.value } as DialogResult);
  }

  onClearClick(event: any) {
    event.stopPropagation();
    this.officerList.setValue(null);
  }
}
