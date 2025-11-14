import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import moment from 'moment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from '../../../../../services/compliance-and-enforcement/chronology/chronology.dto';

@Component({
  selector: 'app-compliance-and-enforcement-chronology-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
})
export class ComplianceAndEnforcementChronologyEntryComponent implements OnInit, OnDestroy {
  private _entry: ComplianceAndEnforcementChronologyEntryDto | null = null;
  @Input()
  set entry(entry: ComplianceAndEnforcementChronologyEntryDto | null) {
    if (!entry) {
      return;
    }

    this._entry = entry;

    this.isPatching = true;
    this.fillForm(entry);
    this.isPatching = false;
  }
  get entry(): ComplianceAndEnforcementChronologyEntryDto | null {
    return this._entry;
  }
  @Input() editDisabled = false;

  @Output() edit: EventEmitter<string> = new EventEmitter<string>();
  @Output() complete: EventEmitter<{
    uuid: string;
    updateDto: UpdateComplianceAndEnforcementChronologyEntryDto;
  }> = new EventEmitter<{
    uuid: string;
    updateDto: UpdateComplianceAndEnforcementChronologyEntryDto;
  }>();
  @Output() delete: EventEmitter<string> = new EventEmitter<string>();
  @Output() addCorrespondence: EventEmitter<string> = new EventEmitter<string>();

  $changes: BehaviorSubject<[string | undefined, UpdateComplianceAndEnforcementChronologyEntryDto]> =
    new BehaviorSubject<[string | undefined, UpdateComplianceAndEnforcementChronologyEntryDto]>([undefined, {}]);

  isPatching = false;
  isSubscribed = false;

  date: FormControl<moment.Moment | null> = new FormControl<moment.Moment | null>(null, [Validators.required]);
  description: FormControl<string | null> = new FormControl<string | null>(null, [Validators.required]);
  form: FormGroup = new FormGroup({
    date: this.date,
    description: this.description,
  });

  $destroy = new Subject<void>();

  ngOnInit(): void {
    if (this.isSubscribed) {
      return;
    }

    this.form.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((form) => {
      if (this.isPatching || !this.entry) {
        return;
      }

      this.$changes.next([
        this.entry?.uuid,
        {
          date: form.date ? form.date.toDate().getTime() : undefined,
          description: form.description ?? undefined,
        },
      ]);
    });

    this.isSubscribed = true;
  }

  fillForm(entry: ComplianceAndEnforcementChronologyEntryDto): void {
    this.date.setValue(entry.date !== undefined && entry.date !== null ? moment(entry.date) : null);
    this.description.setValue(entry.description);
  }

  dtoFromForm(): UpdateComplianceAndEnforcementChronologyEntryDto {
    if (!this.entry) {
      throw new Error('No entry set');
    }

    const dto: UpdateComplianceAndEnforcementChronologyEntryDto = {};

    if (this.date.value) {
      dto.date = this.date.value.toDate().getTime();
    }

    if (this.description.value) {
      dto.description = this.description.value;
    }

    return dto;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
