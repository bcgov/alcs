import { Component } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validator,
  Validators,
} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

type ProposedLot = {
  type: 'Lot' | 'Road Dedication' | null;
  size: string | null;
  alrArea: string | null;
  uuid: string | null;
};

@Component({
  selector: 'app-lots-table',
  templateUrl: './lots-table-form.component.html',
  styleUrls: ['./lots-table-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: LotsTableFormComponent,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: LotsTableFormComponent,
    },
  ],
})
export class LotsTableFormComponent implements ControlValueAccessor, Validator {
  displayedColumns = ['index', 'type', 'size', 'alrArea'];
  lotsSource = new MatTableDataSource<ProposedLot>([]);
  lotCount: number | null = null;

  touched = false;
  disabled = false;

  count = new FormControl<string | null>(null, [Validators.required]);
  form = new FormGroup({
    count: this.count,
  } as any);

  private onTouched: Function | undefined;
  private onChange: Function | undefined;

  markTouched() {
    this.touched = true;
    this.form.markAllAsTouched();
  }

  onChangeLotCount(event: Event) {
    this.markAsTouched();
    const targetString = (event.target as HTMLInputElement).value;
    const targetCount = parseInt(targetString);

    let lots = this.mapFormToLots();
    lots = lots.slice(0, targetCount);
    while (lots.length < targetCount) {
      lots.push({
        size: null,
        alrArea: null,
        type: null,
        uuid: null,
      });
    }

    this.lotCount = targetCount;
    this.resetForm(lots);

    this.lotsSource = new MatTableDataSource(lots);
    this.fireChanged();
  }

  resetForm(lots: ProposedLot[]) {
    for (const controlName of Object.keys(this.form.controls)) {
      if (controlName.includes('lot')) {
        this.form.removeControl(controlName);
      }
    }

    lots.forEach((lot, index) => {
      this.form.addControl(`${index}-lotType`, new FormControl(lot.type, [Validators.required]));
      this.form.addControl(`${index}-lotSize`, new FormControl(lot.size, [Validators.required]));
      this.form.addControl(`${index}-lotAlrArea`, new FormControl(lot.alrArea, [Validators.required]));
      this.form.addControl(`${index}-lotUuid`, new FormControl(lot.uuid));
    });
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: Function) {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  writeValue(proposedLots: ProposedLot[] | null) {
    this.resetForm(proposedLots ?? []);
    this.lotCount = proposedLots?.length ?? null;
    let lots = this.mapFormToLots();
    this.lotsSource = new MatTableDataSource(lots);
    if (this.lotCount !== null) {
      this.count.setValue(this.lotCount.toString());
    }
  }

  validate(control: AbstractControl) {
    if (this.form.valid) {
      return null;
    }

    let errors: any = {};
    for (const controlName of Object.keys(this.form.controls)) {
      const controlErrors = this.form.controls[controlName].errors;

      if (controlErrors) {
        errors[controlName] = controlErrors;
      }
    }

    return errors;
  }

  private markAsTouched() {
    if (!this.touched) {
      if (this.onTouched) {
        this.onTouched();
      }
      this.touched = true;
    }
  }

  private mapFormToLots() {
    const proposedLots: ProposedLot[] = [];
    if (this.lotCount !== null) {
      for (let index = 0; index < this.lotCount; index++) {
        const lotType = this.form.controls[`${index}-lotType`].value;
        const lotSize = this.form.controls[`${index}-lotSize`].value;
        const lotAlrArea = this.form.controls[`${index}-lotAlrArea`].value;
        const lotUuid = this.form.controls[`${index}-lotUuid`].value;
        proposedLots.push({
          size: lotSize,
          type: lotType,
          alrArea: lotAlrArea,
          uuid: lotUuid,
        });
      }
    }
    return proposedLots;
  }

  fireChanged() {
    if (this.onChange) {
      const mappedLots = this.mapFormToLots();
      this.onChange(mappedLots);
    }
  }
}
