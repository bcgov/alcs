import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogAction } from '../../constants';
import {
  DecisionConditionFinancialInstrumentDto,
  CreateUpdateDecisionConditionFinancialInstrumentDto,
} from '../../../services/common/decision-condition-financial-instrument/decision-condition-financial-instrument.dto';
import { FormControl, FormGroup, ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import {
  HeldBy,
  InstrumentStatus,
  InstrumentType,
} from '../../../services/common/decision-condition-financial-instrument/decision-condition-financial-instrument.dto';
import { DecisionConditionFinancialInstrumentService } from '../../../services/common/decision-condition-financial-instrument/decision-condition-financial-instrument.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-decision-condition-financial-instrument-dialog',
  templateUrl: './decision-condition-financial-instrument-dialog.component.html',
  styleUrl: './decision-condition-financial-instrument-dialog.component.scss',
})
export class DecisionConditionFinancialInstrumentDialogComponent implements OnInit {
  @Input() service?: DecisionConditionFinancialInstrumentService;
  isEdit: boolean = false;
  form: FormGroup;

  securityHolderPayee = new FormControl<string | null>('', Validators.required);
  type = new FormControl<InstrumentType | null>(null, [Validators.required, this.enumValidator(InstrumentType)]);
  issueDate = new FormControl<Date | null>(null, Validators.required);
  expiryDate = new FormControl<Date | null>(null);
  amount = new FormControl<number | null>(null, Validators.required);
  bank = new FormControl<string | null>('', Validators.required);
  instrumentNumber = new FormControl<string | null>(null);
  heldBy = new FormControl<HeldBy | null>(null, [Validators.required, this.enumValidator(HeldBy)]);
  receivedDate = new FormControl<Date | null>(null, Validators.required);
  notes = new FormControl<string | null>(null);
  status = new FormControl<InstrumentStatus>(InstrumentStatus.RECEIVED, [
    Validators.required,
    this.enumValidator(InstrumentStatus),
  ]);
  statusDate = new FormControl<Date | null>(null);
  explanation = new FormControl<string | null>(null);

  instrumentTypes = InstrumentType;
  heldByOptions = HeldBy;
  instrumentStatuses = InstrumentStatus;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      action: DialogAction;
      conditionUuid: string;
      instrument?: DecisionConditionFinancialInstrumentDto;
      service: DecisionConditionFinancialInstrumentService;
    },
    private dialogRef: MatDialogRef<DecisionConditionFinancialInstrumentDialogComponent>,
    private toastService: ToastService,
  ) {
    this.form = new FormGroup({
      securityHolderPayee: this.securityHolderPayee,
      type: this.type,
      issueDate: this.issueDate,
      expiryDate: this.expiryDate,
      amount: this.amount,
      bank: this.bank,
      instrumentNumber: this.instrumentNumber,
      heldBy: this.heldBy,
      receivedDate: this.receivedDate,
      notes: this.notes,
      status: this.status,
      statusDate: this.statusDate,
      explanation: this.explanation,
    });
  }

  ngOnInit(): void {
    this.service = this.data.service;
    this.isEdit = this.data.action === DialogAction.EDIT;

    this.form.get('status')?.valueChanges.subscribe((status) => {
      if (status === InstrumentStatus.RECEIVED) {
        this.form.get('statusDate')?.setValidators([]);
        this.form.get('explanation')?.setValidators([]);
      } else {
        this.form.get('statusDate')?.setValidators([Validators.required]);
        this.form.get('explanation')?.setValidators([Validators.required]);
      }

      this.form.get('statusDate')?.updateValueAndValidity();
      this.form.get('explanation')?.updateValueAndValidity();
    });

    if (this.isEdit && this.data.instrument) {
      const instrument = this.data.instrument;
      this.form.patchValue({
        ...instrument,
        issueDate: instrument.issueDate ? new Date(instrument.issueDate) : null,
        expiryDate: instrument.expiryDate ? new Date(instrument.expiryDate) : null,
        receivedDate: instrument.receivedDate ? new Date(instrument.receivedDate) : null,
        statusDate: instrument.statusDate ? new Date(instrument.statusDate) : null,
      });
    }
  }

  enumValidator(enumType: any): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!Object.values(enumType).includes(control.value)) {
        return { enum: { value: control.value } };
      }
      return null;
    };
  }

  mapToDto() {
    const formData = this.form.getRawValue();
    const dto: CreateUpdateDecisionConditionFinancialInstrumentDto = {
      securityHolderPayee: formData.securityHolderPayee,
      type: formData.type,
      issueDate: new Date(formData.issueDate).getTime(),
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).getTime() : null,
      amount: formData.amount,
      bank: formData.bank,
      instrumentNumber: formData.instrumentNumber,
      heldBy: formData.heldBy,
      receivedDate: new Date(formData.receivedDate).getTime(),
      notes: formData.notes,
      status: formData.status,
      statusDate: formData.statusDate ? new Date(formData.statusDate).getTime() : null,
      explanation: formData.explanation,
    };
    return dto;
  }

  async onSubmit() {
    try {
      const dto = this.mapToDto();
      if (this.isEdit && this.data.instrument?.uuid) {
        await this.service!.update(this.data.conditionUuid, this.data.instrument.uuid, dto);
        this.toastService.showSuccessToast('Financial Instrument updated successfully');
      } else {
        await this.service!.create(this.data.conditionUuid, dto);
        this.toastService.showSuccessToast('Financial Instrument created successfully');
      }
      this.dialogRef.close({ action: this.isEdit ? DialogAction.EDIT : DialogAction.ADD, successful: true });
    } catch (error: any) {
      console.error(error);
      this.toastService.showErrorToast(error.message || 'An error occurred');
    }
  }
}
