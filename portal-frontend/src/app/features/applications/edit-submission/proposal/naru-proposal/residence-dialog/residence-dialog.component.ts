import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormExisingResidence, FormProposedResidence } from '../naru-proposal.component';

@Component({
    selector: 'app-residence-dialog',
    templateUrl: './residence-dialog.component.html',
    styleUrl: './residence-dialog.component.scss',
    standalone: false
})
export class ResidenceDialogComponent implements OnInit {
  floorArea = new FormControl<string | null>(null, [
    Validators.required,
    Validators.pattern(/^(?!0(\.0{1,2})?$)\d+(\.\d{1,2})?$/),
  ]);
  description = new FormControl<string | null>(null, [Validators.required]);
  form = new FormGroup({
    floorArea: this.floorArea,
    description: this.description,
  });

  isSaving: boolean = false;
  residence: FormExisingResidence | FormProposedResidence = { floorArea: 0, description: '', isExpanded: false };

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
      this.floorArea.setValue(
        this.data.residenceData.floorArea === 0 ? '' : this.data.residenceData.floorArea!.toString(),
      );
      this.description.setValue(this.data.residenceData.description!);
      this.residence = { ...this.data.residenceData };
      if (this.data.residenceData.floorArea === 0 || this.data.residenceData.description === '') {
        this.form.markAllAsTouched();
      }
    }
  }

  onSaveAdd() {
    if (this.form.valid) {
      this.residence.description = this.description.value!;
      this.residence.floorArea = Number(this.floorArea.value!);
      this.dialogRef.close({ isCancel: false, isEdit: this.data.isEdit, residence: this.residence });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close({ isCancel: true });
  }
}
