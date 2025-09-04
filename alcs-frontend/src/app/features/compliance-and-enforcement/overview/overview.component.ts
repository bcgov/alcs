import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  AllegedActivity,
  ComplianceAndEnforcementDto,
  InitialSubmissionType,
  UpdateComplianceAndEnforcementDto,
} from '../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import moment, { Moment } from 'moment';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-compliance-and-enforcement-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnDestroy {
  $destroy = new Subject<void>();

  isPatching = false;
  isSubscribed = false;

  initialSubmissionTypes = Object.entries(InitialSubmissionType).map(([key, value]) => ({ key, value }));
  allegedActivities = Object.entries(AllegedActivity).map(([key, value]) => ({ key, value }));

  form = new FormGroup({
    dateSubmitted: new FormControl<Moment | null>({ value: null, disabled: true }, [Validators.required]),
    initialSubmissionType: new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]),
    allegedContraventionNarrative: new FormControl<string>({ value: '', disabled: true }, [
      Validators.required,
      Validators.minLength(1),
    ]),
    allegedActivity: new FormControl<AllegedActivity[]>({ value: [], disabled: true }, [
      Validators.required,
      Validators.minLength(1),
    ]),
    intakeNotes: new FormControl<string>({ value: '', disabled: true }),
  });

  @Output() formReady = new EventEmitter<{ name: string; formGroup: FormGroup }>();

  $changes: BehaviorSubject<UpdateComplianceAndEnforcementDto> = new BehaviorSubject<UpdateComplianceAndEnforcementDto>(
    {},
  );

  @Input()
  set file(file: ComplianceAndEnforcementDto | undefined) {
    if (file) {
      this.isPatching = true;
      this.form.disable();
      this.form.patchValue({
        dateSubmitted: file.dateSubmitted ? moment(file.dateSubmitted) : null,
        initialSubmissionType: file.initialSubmissionType,
        allegedContraventionNarrative: file.allegedContraventionNarrative,
        allegedActivity: file.allegedActivity,
        intakeNotes: file.intakeNotes,
      });
      this.form.enable();
      this.isPatching = false;
    }

    // Prevent resubscription
    if (!this.isSubscribed) {
      this.form.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((form) => {
        if (this.isPatching) {
          return;
        }

        this.$changes.next({
          dateSubmitted: form.dateSubmitted?.toDate().getTime() ?? null,
          initialSubmissionType: form.initialSubmissionType as InitialSubmissionType,
          allegedContraventionNarrative: form.allegedContraventionNarrative ?? '',
          allegedActivity: form.allegedActivity as AllegedActivity[],
          intakeNotes: form.intakeNotes ?? '',
        });
      });

      this.formReady.emit({ name: 'overview', formGroup: this.form });

      this.isSubscribed = true;
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
