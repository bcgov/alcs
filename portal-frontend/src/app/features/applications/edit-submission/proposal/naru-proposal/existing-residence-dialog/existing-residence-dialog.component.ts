import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormExisingResidence } from '../naru-proposal.component';

@Component({
  selector: 'app-existing-residence-dialog',
  templateUrl: './existing-residence-dialog.component.html',
  styleUrl: './existing-residence-dialog.component.scss',
})
export class ExistingResidenceDialogComponent implements OnInit {
  floorArea = new FormControl<string | null>(null, [Validators.required]);
  description = new FormControl<string | null>(null, [Validators.required]);
  form = new FormGroup({
    floorArea: this.floorArea,
    description: this.description,
  });

  isSaving: boolean = false;
  existingResidence: FormExisingResidence = { floorArea: 0, description: '' };

  constructor(
    private dialogRef: MatDialogRef<ExistingResidenceDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      isEdit?: boolean;
      existingResidenceData?: FormExisingResidence;
    },
  ) {}

  ngOnInit(): void {
    if (this.data.existingResidenceData) {
      this.floorArea.setValue(this.data.existingResidenceData.floorArea!.toString());
      this.description.setValue(this.data.existingResidenceData.description!);
      this.existingResidence = { ...this.data.existingResidenceData };
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
