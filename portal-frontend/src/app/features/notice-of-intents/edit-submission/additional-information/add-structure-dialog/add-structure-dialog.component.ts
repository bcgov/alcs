import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProposedStructure } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { pairwise } from 'rxjs';

@Component({
    selector: 'add-structure-dialog',
    templateUrl: './add-structure-dialog.component.html',
    styleUrls: ['./add-structure-dialog.component.scss'],
    standalone: false
})
export class AddStructureDialogComponent {
  area = new FormControl<string | null>(null, [
    Validators.required,
    Validators.pattern(/^(?!0(\.0{1,2})?$)\d+(\.\d{1,2})?$/),
  ]);
  type = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    area: this.area,
    type: this.type,
  });

  isLoading = false;

  structureTypeOptions: any = [];

  showTypeChangeWarning: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      structureId?: string;
      isEdit?: boolean;
      structureData: ProposedStructure | undefined;
    },
    private dialogRef: MatDialogRef<AddStructureDialogComponent>,
  ) {
    this.type.valueChanges.pipe(pairwise()).subscribe(([oldType, newType]) => {
      this.showTypeChangeWarning = !!data.isEdit && oldType !== newType;
    });

    if (data?.structureData?.options) {
      this.structureTypeOptions = data.structureData.options;
    }
    if (data.isEdit) {
      const editArea = data.structureData?.area ? data.structureData?.area.toString() : '';
      const editType = data.structureData?.options?.find((x: any) => x.value === data.structureData?.type);
      this.area.setValue(editArea);
      this.type.setValue(editType ? editType.value : '');
      this.form.controls.area.markAsTouched();
      this.form.controls.type.markAsTouched();
    }
  }

  compareSelected(o1: string, o2: string) {
    if (o2) {
      return (o1 === o2);
    } else {
      return false;
    }
  }

  async onSubmit() {
    if (!this.form.valid) {
      return;
    }
    this.isLoading = true;
    const dto: ProposedStructure = {
      area: Number(this.area.value!),
      type: this.structureTypeOptions.find((v: any) => v.value === this.type.value!).value,
    };
    this.isLoading = false;
    this.dialogRef.close({
      isEditing: this.data.isEdit,
      structureId: this.data.structureId,
      dto,
    });
  }

  onCancel() {
    this.dialogRef.close({ isCancel: true });
  }
}
