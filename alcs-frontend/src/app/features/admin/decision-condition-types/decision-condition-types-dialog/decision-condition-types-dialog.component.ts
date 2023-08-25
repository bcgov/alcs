import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDecisionConditionTypeDto } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionConditionTypesService } from '../../../../services/application/application-decision-condition-types/application-decision-condition-types.service';

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDecisionConditionTypeDto | undefined,
    private dialogRef: MatDialogRef<DecisionConditionTypesDialogComponent>,
    private decisionConditionTypesService: ApplicationDecisionConditionTypesService
  ) {
    if (data) {
      this.description = data.description;
      this.label = data.label;
      this.code = data.code;
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

    if (this.isEdit) {
      await this.decisionConditionTypesService.update(this.code, dto);
    } else {
      await this.decisionConditionTypesService.create(dto);
    }
    this.isLoading = false;
    this.dialogRef.close(true);
  }
}
