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
  showWarning = false;

  service: ApplicationDecisionConditionTypesService | NoticeofIntentDecisionConditionTypesService | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DecisionDialogDataInterface | undefined,
    private dialogRef: MatDialogRef<DecisionConditionTypesDialogComponent>,
  ) {
    this.service = data?.service;
    this.isEdit = !!data?.content;
    this.conditionTypeForm = new FormGroup({
      description: new FormControl(this.data?.content?.description ? this.data.content.description : '', [
        Validators.required,
      ]),
      label: new FormControl(this.data?.content?.label ? this.data.content.label : '', [Validators.required]),
      code: new FormControl(this.data?.content?.code ? this.data.content.code : '', [Validators.required]),
      isActive: new FormControl<boolean>(this.data && this.data.content ? this.data.content.isActive : true, [
        Validators.required,
      ]),
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
      isDateChecked: new FormControl(this.data?.content?.isDateChecked ? this.data.content.isDateChecked : false),
      isDateRequired: new FormControl(this.data?.content?.isDateRequired ? this.data.content.isDateRequired : false),
      dateType: new FormControl(this.data?.content?.isMultipleDateChecked ? 'multiple' : 'single'),
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
  }

  ngOnInit(): void {
    this.conditionTypeForm.valueChanges.subscribe(() => {
      this.showWarning = this.isEdit ? true : false;
    });
  }

  async onSubmit() {
    this.isLoading = true;

    const dto: ApplicationDecisionConditionTypeDto | NoticeofIntentDecisionConditionTypesService = {
      code: this.conditionTypeForm.get('code')?.value,
      label: this.conditionTypeForm.get('label')?.value,
      description: this.conditionTypeForm.get('description')?.value,
      isActive: this.conditionTypeForm.get('isActive')?.value,
      isAdministrativeFeeAmountChecked: this.conditionTypeForm.get('isAdministrativeFeeAmountChecked')?.value,
      isAdministrativeFeeAmountRequired: this.conditionTypeForm.get('isAdministrativeFeeAmountRequired')?.value,
      administrativeFeeAmount: this.conditionTypeForm.get('administrativeFeeAmount')?.value,
      isDateChecked: this.conditionTypeForm.get('isDateChecked')?.value,
      isDateRequired: this.conditionTypeForm.get('isDateRequired')?.value,
      isSingleDateChecked: this.conditionTypeForm.value.dateType === 'single' ? true : false,
      singleDateLabel:
        this.conditionTypeForm.value.dateType === 'single'
          ? this.conditionTypeForm.get('singleDateLabel')?.value
          : null,
      isMultipleDateChecked: this.conditionTypeForm.value.dateType === 'multiple' ? true : false,
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
