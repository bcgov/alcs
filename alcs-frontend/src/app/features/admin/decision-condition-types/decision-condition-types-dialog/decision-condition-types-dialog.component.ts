import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationDecisionConditionTypeDto,
  DateLabel,
} from '../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionConditionTypesService } from '../../../../services/application/application-decision-condition-types/application-decision-condition-types.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-decision-condition-types-dialog',
  templateUrl: './decision-condition-types-dialog.component.html',
  styleUrls: ['./decision-condition-types-dialog.component.scss'],
})
export class DecisionConditionTypesDialogComponent {
  conditionTypeForm: FormGroup;

  isLoading = false;
  isEdit = false;
  staticDisabled = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDecisionConditionTypeDto | undefined,
    private dialogRef: MatDialogRef<DecisionConditionTypesDialogComponent>,
    private decisionConditionTypesService: ApplicationDecisionConditionTypesService,
  ) {
    this.conditionTypeForm = new FormGroup({
      description: new FormControl(this.data?.description ? this.data?.description : '', [Validators.required]),
      label: new FormControl(this.data?.label ? this.data.label : '', [Validators.required]),
      code: new FormControl(this.data?.code ? this.data.code : '', [Validators.required]),
      isComponentToConditionChecked: new FormControl(
        this.data?.isComponentToConditionChecked ? this.data?.isComponentToConditionChecked : true,
      ),
      isDescriptionChecked: new FormControl(this.data?.isDescriptionChecked ? this.data.isDescriptionChecked : true),
      isAdministrativeFeeAmountChecked: new FormControl(
        this.data?.isAdministrativeFeeAmountChecked ? this.data?.isAdministrativeFeeAmountChecked : false,
      ),
      isAdministrativeFeeAmountRequired: new FormControl(
        this.data?.isAdministrativeFeeAmountRequired ? this.data.isAdministrativeFeeAmountRequired : false,
      ),
      administrativeFeeAmount: new FormControl(
        this.data?.administrativeFeeAmount ? this.data?.administrativeFeeAmount : '',
      ),
      isSingleDateChecked: new FormControl(this.data?.isSingleDateChecked ? this.data.isSingleDateChecked : false),
      isSingleDateRequired: new FormControl(this.data?.isSingleDateRequired ? this.data.isSingleDateRequired : false),
      singleDateLabel: new FormControl(this.data?.singleDateLabel ? this.data.singleDateLabel : DateLabel.DUE_DATE),
      isSecurityAmountChecked: new FormControl(
        this.data?.isSecurityAmountChecked ? this.data.isSecurityAmountChecked : false,
      ),
      isSecurityAmountRequired: new FormControl(
        this.data?.isSecurityAmountRequired ? this.data.isSecurityAmountRequired : false,
      ),
    });

    this.conditionTypeForm.get('isComponentToConditionChecked')?.disable();
    this.conditionTypeForm.get('isDescriptionChecked')?.disable();

    this.isEdit = !!data;
  }

  async onSubmit() {
    this.isLoading = true;

    const dto: ApplicationDecisionConditionTypeDto = {
      code: this.conditionTypeForm.get('code')?.value,
      label: this.conditionTypeForm.get('label')?.value,
      description: this.conditionTypeForm.get('description')?.value,
      isAdministrativeFeeAmountChecked: this.conditionTypeForm.get('isAdministrativeFeeAmountChecked')?.value,
      isAdministrativeFeeAmountRequired: this.conditionTypeForm.get('isAdministrativeFeeAmountRequired')?.value,
      administrativeFeeAmount: this.conditionTypeForm.get('administrativeFeeAmount')?.value,
      isSingleDateChecked: this.conditionTypeForm.get('isSingleDateChecked')?.value,
      isSingleDateRequired: this.conditionTypeForm.get('isSingleDateRequired')?.value,
      singleDateLabel: this.conditionTypeForm.get('singleDateLabel')?.value,
      isSecurityAmountChecked: this.conditionTypeForm.get('isSecurityAmountChecked')?.value,
      isSecurityAmountRequired: this.conditionTypeForm.get('isSecurityAmountRequired')?.value,
    };

    if (this.isEdit) {
      await this.decisionConditionTypesService.update(dto.code, dto);
    } else {
      await this.decisionConditionTypesService.create(dto);
    }
    this.isLoading = false;
    this.dialogRef.close(true);
  }
}
