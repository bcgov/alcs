import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationDecisionConditionDto,
  ApplicationDecisionConditionTypeDto,
  DateLabel,
  DateType,
} from '../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionConditionTypesService } from '../../../../services/application/application-decision-condition-types/application-decision-condition-types.service';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { DecisionDialogDataInterface } from '../decision-dialog-data.interface';
import { NoticeofIntentDecisionConditionTypesService } from '../../../../services/notice-of-intent/notice-of-intent-decision-condition-types/notice-of-intent-decision-condition-types.service';
import {
  NoticeOfIntentDecisionConditionDto,
  NoticeOfIntentDecisionConditionTypeDto,
} from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { ApplicationDecisionConditionService } from '../../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition.service';
import { NoticeOfIntentDecisionConditionService } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';
import { catchError, debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { codeExistsValidator } from '../../../../shared/validators/code-exists-validator';

enum ValidationFields {
  Dates,
  AdminFee,
  SecurityAmount,
}

@Component({
  selector: 'app-decision-condition-types-dialog',
  templateUrl: './decision-condition-types-dialog.component.html',
  styleUrls: ['./decision-condition-types-dialog.component.scss'],
})
export class DecisionConditionTypesDialogComponent {
  // Reference for use in templates
  DateType = DateType;

  conditionTypeForm: FormGroup;

  isLoading = false;
  isEdit = false;
  showWarning = false;
  isSingleDateDeafult = false;

  service: ApplicationDecisionConditionTypesService | NoticeofIntentDecisionConditionTypesService | undefined;
  conditionService: ApplicationDecisionConditionService | NoticeOfIntentDecisionConditionService | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DecisionDialogDataInterface | undefined,
    private dialogRef: MatDialogRef<DecisionConditionTypesDialogComponent>,
  ) {
    this.isLoading = true;
    this.service = data?.service;
    this.conditionService = data?.conditionService;
    this.isEdit = !!data?.content;
    this.conditionTypeForm = new FormGroup({
      description: new FormControl(this.data?.content?.description ? this.data.content.description : '', [
        Validators.required,
      ]),
      label: new FormControl(this.data?.content?.label ? this.data.content.label : '', [Validators.required]),
      code: new FormControl(this.data?.content?.code ? this.data.content.code : '', [
        Validators.required,
        codeExistsValidator(this.data?.existingCodes ? this.data.existingCodes : []),
      ]),
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
        [],
        [this.conditionAsyncValidator(ValidationFields.AdminFee)],
      ),
      isAdministrativeFeeAmountRequired: new FormControl(
        this.data?.content?.isAdministrativeFeeAmountRequired
          ? this.data.content.isAdministrativeFeeAmountRequired
          : false,
      ),
      administrativeFeeAmount: new FormControl(
        this.data?.content?.administrativeFeeAmount ? this.data.content.administrativeFeeAmount : '',
        []
      ),
      isDateChecked: new FormControl(
        this.data?.content?.isDateChecked ? this.data.content.isDateChecked : false,
        [],
        [this.conditionAsyncValidator(ValidationFields.Dates)],
      ),
      isDateRequired: new FormControl(this.data?.content?.isDateRequired ? this.data.content.isDateRequired : false),
      dateType: new FormControl(this.data?.content?.dateType),
      singleDateLabel: new FormControl(
        this.data?.content?.singleDateLabel ? this.data.content.singleDateLabel : DateLabel.DUE_DATE,
      ),
      isSecurityAmountChecked: new FormControl(
        this.data?.content?.isSecurityAmountChecked ? this.data.content.isSecurityAmountChecked : false,
        [],
        [this.conditionAsyncValidator(ValidationFields.SecurityAmount)],
      ),
      isSecurityAmountRequired: new FormControl(
        this.data?.content?.isSecurityAmountRequired ? this.data.content.isSecurityAmountRequired : false,
      ),

    });

    if (this.isEdit) {
      this.conditionTypeForm.get('code')?.disable();
    }

    if (!this.data?.content?.isDateChecked && !this.data?.content?.dateType) {
      this.isSingleDateDeafult = true;
    }

    this.conditionTypeForm.get('isComponentToConditionChecked')?.disable();
    this.conditionTypeForm.get('isDescriptionChecked')?.disable();
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.conditionTypeForm.valueChanges.subscribe(() => {
      this.showWarning = this.isEdit ? true : false;
    });
  }

  async onSubmit() {
    this.isLoading = true;

    const dto: ApplicationDecisionConditionTypeDto | NoticeOfIntentDecisionConditionTypeDto = {
      code: this.conditionTypeForm.get('code')?.value,
      label: this.conditionTypeForm.get('label')?.value,
      description: this.conditionTypeForm.get('description')?.value,
      isActive: this.conditionTypeForm.get('isActive')?.value,
      isAdministrativeFeeAmountChecked: this.conditionTypeForm.get('isAdministrativeFeeAmountChecked')?.value,
      isAdministrativeFeeAmountRequired: this.conditionTypeForm.get('isAdministrativeFeeAmountRequired')?.value,
      administrativeFeeAmount: this.conditionTypeForm.get('administrativeFeeAmount')?.value,
      isDateChecked: this.conditionTypeForm.get('isDateChecked')?.value,
      isDateRequired: this.conditionTypeForm.get('isDateRequired')?.value,
      dateType: this.conditionTypeForm.get('dateType')?.value,
      singleDateLabel:
        this.conditionTypeForm.get('dateType')?.value === DateType.SINGLE
          ? this.conditionTypeForm.get('singleDateLabel')?.value
          : null,
      isSecurityAmountChecked: this.conditionTypeForm.get('isSecurityAmountChecked')?.value,
      isSecurityAmountRequired: this.conditionTypeForm.get('isSecurityAmountRequired')?.value,
    };

    if (this.conditionTypeForm.get('administrativeFeeAmount')?.value !== '') {
      dto.administrativeFeeAmount = this.conditionTypeForm.get('administrativeFeeAmount')?.value;
    }
    if (!dto.isAdministrativeFeeAmountChecked) {
      dto.administrativeFeeAmount = null;
    }
    if (!this.service) return;
    if (this.isEdit) {
      await this.service.update(dto.code, dto);
    } else {
      await this.service.create(dto);
    }
    this.isLoading = false;
    this.dialogRef.close(true);
  }

  conditionAsyncValidator(field: ValidationFields): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      return of(control.value).pipe(
        debounceTime(300),
        switchMap(async () => {
          if (!this.conditionService) {
            throw Error('Condition service not found');
          }
          // prevents the message flash by setting isLoading while fetching codes.
          this.isLoading = true;
          const result = await this.conditionService.fetchByTypeCode(this.conditionTypeForm.controls['code'].value);
          this.isLoading = false;
          return result;
        }),
        map((conditions) =>
          {
            switch (field) {
              case ValidationFields.Dates:
                return !control.value && conditions && this.hasAnyDates(conditions) ? { hasConditions: true } : null;
              case ValidationFields.AdminFee:
                  return !control.value && conditions && this.hasAdminFee(conditions) ? { hasConditions: true } : null;
              case ValidationFields.SecurityAmount:
                return !control.value && conditions && this.hasSecurityAmount(conditions) ? { hasConditions: true } : null;
              default:
                return null;
            }
          },
        ),
        catchError((e) => of({ hasConditions: true })),
      );
    };
  }

  hasAnyDates(
    conditions: Partial<ApplicationDecisionConditionDto>[] | Partial<NoticeOfIntentDecisionConditionDto>[],
  ): boolean {
    return conditions.some((condition) => condition.dates && condition.dates.length > 0);
  }

  hasAdminFee(
    conditions: Partial<ApplicationDecisionConditionDto>[] | Partial<NoticeOfIntentDecisionConditionDto>[],
  ): boolean {
    return conditions.map((c) => c.administrativeFee).filter((f) => f !== null).length > 0;
  }

  hasSecurityAmount(
    conditions: Partial<ApplicationDecisionConditionDto>[] | Partial<NoticeOfIntentDecisionConditionDto>[],
  ): boolean {
    return conditions.map((c) => c.securityAmount).filter((f) => f !== null).length > 0;
  }
}
