import { Component, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
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
    intakeNotes: new FormControl<string>({ value: '', disabled: true }, [Validators.required]),
  });

  @Input() set parentForm(parentForm: FormGroup) {
    parentForm.addControl('overview', this.form);
  }

  $changes: BehaviorSubject<UpdateComplianceAndEnforcementDto> = new BehaviorSubject<UpdateComplianceAndEnforcementDto>(
    {},
  );

  subscribed = false;

  @Input()
  set file(file: ComplianceAndEnforcementDto | undefined) {
    if (!file) {
      return;
    }

    this.form.patchValue({
      dateSubmitted: file.dateSubmitted ? moment(file.dateSubmitted) : null,
      initialSubmissionType: file.initialSubmissionType,
      allegedContraventionNarrative: file.allegedContraventionNarrative,
      allegedActivity: file.allegedActivity,
      intakeNotes: file.intakeNotes,
    });
    this.form.enable();

    // Prevent resubscription
    if (this.subscribed) {
      return;
    }

    this.form.valueChanges.pipe(takeUntil(this.$destroy), distinctUntilChanged()).subscribe((form) => {
      this.$changes.next({
        dateSubmitted: form.dateSubmitted?.toDate().getTime() ?? null,
        initialSubmissionType: form.initialSubmissionType as InitialSubmissionType,
        allegedContraventionNarrative: form.allegedContraventionNarrative ?? '',
        allegedActivity: form.allegedActivity as AllegedActivity[],
        intakeNotes: form.intakeNotes ?? '',
      });
    });

    this.subscribed = true;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
