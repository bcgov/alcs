import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationDecisionConditionTypeDto,
  DateLabel,
} from '../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionConditionTypesService } from '../../../../services/application/application-decision-condition-types/application-decision-condition-types.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DecisionDialogDataInterface } from '../decision-dialog-data.interface';
import { NoticeofIntentDecisionConditionTypesService } from '../../../../services/notice-of-intent/notice-of-intent-decision-condition-types/notice-of-intent-decision-condition-types.service';

@Component({
  selector: 'app-decision-condition-types-dialog',
  templateUrl: './decision-condition-types-dialog.component.html',
  styleUrls: ['./decision-condition-types-dialog.component.scss'],
})
export class DecisionConditionTypesDialogComponent {
  conditionTypeForm: FormGroup;

  isLoading = false;
  isEdit = false;

  service: ApplicationDecisionConditionTypesService | NoticeofIntentDecisionConditionTypesService | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DecisionDialogDataInterface | undefined,
    private dialogRef: MatDialogRef<DecisionConditionTypesDialogComponent>,
  ) {
    this.service = data?.service;
    this.conditionTypeForm = new FormGroup({
      description: new FormControl(this.data?.content?.description ? this.data.content.description : '', [
        Validators.required,
      ]),
      label: new FormControl(this.data?.content?.label ? this.data.content.label : '', [Validators.required]),
      code: new FormControl(this.data?.content?.code ? this.data.content.code : '', [Validators.required]),
      isComponentToConditionChecked: new FormControl(
        this.data?.content?.isComponentToConditionChecked ? this.data.content.isComponentToConditionChecked : true,
      ),
      isDescriptionChecked: new FormControl(
        this.data?.content?.isDescriptionChecked ? this.data.content.isDescriptionChecked : true,
      ),
      isAdministrativeFeeAmountChecked: new FormControl(
        this.data?.content?.isAdministrativeFeeAmountChecked
          ? this.data.content.isAdministrativeFeeAmountChecked
          : false,
      ),
      isAdministrativeFeeAmountRequired: new FormControl(
        this.data?.content?.isAdministrativeFeeAmountRequired
          ? this.data.content.isAdministrativeFeeAmountRequired
          : false,
      ),
      administrativeFeeAmount: new FormControl(
        this.data?.content?.administrativeFeeAmount ? this.data.content.administrativeFeeAmount : '',
      ),
      isSingleDateChecked: new FormControl(
        this.data?.content?.isSingleDateChecked ? this.data.content.isSingleDateChecked : false,
      ),
      isSingleDateRequired: new FormControl(
        this.data?.content?.isSingleDateRequired ? this.data.content.isSingleDateRequired : false,
      ),
      singleDateLabel: new FormControl(
        this.data?.content?.singleDateLabel ? this.data.content.singleDateLabel : DateLabel.DUE_DATE,
      ),
      isSecurityAmountChecked: new FormControl(
        this.data?.content?.isSecurityAmountChecked ? this.data.content.isSecurityAmountChecked : false,
      ),
      isSecurityAmountRequired: new FormControl(
        this.data?.content?.isSecurityAmountRequired ? this.data.content.isSecurityAmountRequired : false,
      ),
    });

    this.conditionTypeForm.get('isComponentToConditionChecked')?.disable();
    this.conditionTypeForm.get('isDescriptionChecked')?.disable();

    this.isEdit = !!data?.content;
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
    if (!this.service) return;
    if (this.isEdit) {
      await this.service.update(dto.code, dto);
    } else {
      await this.service.create(dto);
    }
    this.isLoading = false;
    this.dialogRef.close(true);
  }
}
