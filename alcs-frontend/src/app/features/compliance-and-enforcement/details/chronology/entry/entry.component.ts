import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import moment from 'moment';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from '../../../../../services/compliance-and-enforcement/chronology/chronology.dto';
import { UserDto } from '../../../../../services/user/user.dto';

@Component({
    selector: 'app-compliance-and-enforcement-chronology-entry',
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.scss'],
    standalone: false
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
  @Input() authors?: UserDto[];
  @Input() datesInUse?: number[];
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

  showErrors = false;

  date: FormControl<moment.Moment | null> = new FormControl<moment.Moment | null>(null, [
    Validators.required,
    this.dateInUseValidator.bind(this),
  ]);
  authorDropdown = new FormControl<string | null>(null, [Validators.required]);
  description: FormControl<string | null> = new FormControl<string | null>(null, [Validators.required]);
  form: FormGroup = new FormGroup({
    date: this.date,
    authorUuid: this.authorDropdown,
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
          date: form.date ? form.date.toDate().getTime() : null,
          authorUuid: form.authorUuid,
          description: form.description ?? '',
        },
      ]);
    });

    this.isSubscribed = true;
  }

  fillForm(entry: ComplianceAndEnforcementChronologyEntryDto): void {
    this.form.patchValue(
      {
        date: entry.date !== undefined && entry.date !== null ? moment(entry.date) : null,
        authorUuid: entry.author.uuid,
        description: entry.description,
      },
      { emitEvent: false },
    );
  }

  dtoFromForm(): UpdateComplianceAndEnforcementChronologyEntryDto {
    if (!this.entry) {
      throw new Error('No entry set');
    }

    const dto: UpdateComplianceAndEnforcementChronologyEntryDto = {};

    if (this.date.value) {
      dto.date = this.date.value.toDate().getTime();
    }

    if (this.authorDropdown.value) {
      dto.authorUuid = this.authorDropdown.value;
    }

    if (this.description.value) {
      dto.description = this.description.value;
    }

    return dto;
  }

  dateInUseValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.datesInUse) {
      return null;
    }

    return !control.value || !this.datesInUse?.includes(control.value.toDate().getTime()) ? null : { dateInUse: true };
  }

  onCompleteButtonClick(): void {
    if (this.form.invalid) {
      this.date.markAsTouched();
      this.description.markAsTouched();
      this.showErrors = true;
      return;
    }
    this.showErrors = false;

    this.complete.emit({
      uuid: this.entry?.uuid!,
      updateDto: this.dtoFromForm(),
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
