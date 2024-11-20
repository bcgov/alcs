import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDecisionConditionTypesService } from '../../../../services/application/application-decision-condition-types/application-decision-condition-types.service';
import { DecisionDialogDataInterface } from '../decision-dialog-data.interface';
import { NoticeofIntentDecisionConditionTypesService } from '../../../../services/notice-of-intent/notice-of-intent-decision-condition-types/notice-of-intent-decision-condition-types.service';

@Component({
  selector: 'app-decision-condition-types-dialog',
  templateUrl: './decision-condition-types-dialog.component.html',
  styleUrls: ['./decision-condition-types-dialog.component.scss'],
})
export class DecisionConditionTypesDialogComponent {
  description = '';
  label = '';
  code = '';

  isLoading = false;
  isEdit = false;
  service: ApplicationDecisionConditionTypesService | NoticeofIntentDecisionConditionTypesService | undefined;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DecisionDialogDataInterface | undefined,
    private dialogRef: MatDialogRef<DecisionConditionTypesDialogComponent>,
  ) {
    this.service = data?.service;
    if (data?.content) {
      this.description = data.content.description;
      this.label = data.content.label;
      this.code = data.content.code;
    }
    this.isEdit = !!data;
  }

  async onSubmit() {
    this.isLoading = true;

    const dto = {
      code: this.code,
      label: this.label,
      description: this.description,
    };
    if (!this.service) return;
    if (this.isEdit) {
      await this.service.update(this.code, dto);
    } else {
      await this.service.create(dto);
    }
    this.isLoading = false;
    this.dialogRef.close(true);
  }
}
