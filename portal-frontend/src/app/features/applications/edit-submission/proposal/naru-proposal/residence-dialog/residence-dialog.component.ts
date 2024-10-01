import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormExisingResidence, FormProposedResidence } from '../naru-proposal.component';

@Component({
  selector: 'app-residence-dialog',
  templateUrl: './residence-dialog.component.html',
  styleUrl: './residence-dialog.component.scss',
})
export class ResidenceDialogComponent implements OnInit {
  floorArea = new FormControl<string | null>(null, [Validators.required]);
  description = new FormControl<string | null>(null, [Validators.required]);
  form = new FormGroup({
    floorArea: this.floorArea,
    description: this.description,
  });

  isSaving: boolean = false;
  existingResidence: FormExisingResidence = { floorArea: 0, description: '', isExpanded: false };

  constructor(
    private dialogRef: MatDialogRef<ResidenceDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      isEdit?: boolean;
      isExisting?: boolean;
      residenceData?: FormExisingResidence | FormProposedResidence;
    },
  ) {}

  ngOnInit(): void {
    if (this.data.residenceData) {
      this.floorArea.setValue(this.data.residenceData.floorArea!.toString());
      this.description.setValue(this.data.residenceData.description!);
      this.existingResidence = { ...this.data.residenceData };
    }
  }

  onSaveAdd() {
    if (this.form.valid) {
      this.existingResidence.description = this.description.value!;
      this.existingResidence.floorArea = Number(this.floorArea.value!);
      this.dialogRef.close({ isCancel: false, isEdit: this.data.isEdit, existingResidence: this.existingResidence });
    }
  }

  onCancel() {
    this.dialogRef.close({ isCancel: true });
  }
}
