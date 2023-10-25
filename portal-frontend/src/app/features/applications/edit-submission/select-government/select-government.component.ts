import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, Observable, startWith, takeUntil } from 'rxjs';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { LocalGovernmentDto } from '../../../../services/code/code.dto';
import { CodeService } from '../../../../services/code/code.service';
import { EditApplicationSteps } from '../edit-submission.component';
import { StepComponent } from '../step.partial';

@Component({
  selector: 'app-select-government',
  templateUrl: './select-government.component.html',
  styleUrls: ['./select-government.component.scss'],
})
export class SelectGovernmentComponent extends StepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Government;

  private fileId = '';
  private submissionUuid = '';

  localGovernment = new FormControl<string | any>('', [Validators.required]);
  showWarning = false;
  selectedOwnGovernment = false;
  selectGovernmentUuid = '';
  localGovernments: LocalGovernmentDto[] = [];
  filteredLocalGovernments!: Observable<LocalGovernmentDto[]>;
  isDirty = false;

  form = new FormGroup({
    localGovernment: this.localGovernment,
  });
  typeCode = '';

  constructor(private codeService: CodeService, private applicationSubmissionService: ApplicationSubmissionService) {
    super();
  }

  ngOnInit(): void {
    this.loadGovernments();

    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.selectGovernmentUuid = applicationSubmission.localGovernmentUuid;
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;
        this.typeCode = applicationSubmission.typeCode;
        this.populateLocalGovernment(applicationSubmission.localGovernmentUuid);
      }
    });

    if (this.draftMode) {
      this.localGovernment.disable();
    }

    this.filteredLocalGovernments = this.localGovernment.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value || ''))
    );

    if (this.showErrors) {
      this.form.markAllAsTouched();
    }
  }

  onChange($event: MatAutocompleteSelectedEvent) {
    this.isDirty = true;
    const localGovernmentName = $event.option.value;
    if (localGovernmentName) {
      const localGovernment = this.localGovernments.find((lg) => lg.name == localGovernmentName);
      if (localGovernment) {
        this.showWarning = !localGovernment.hasGuid;

        this.localGovernment.setValue(localGovernment.name);
        if (localGovernment.hasGuid) {
          this.localGovernment.setErrors(null);
        } else {
          this.localGovernment.setErrors({ invalid: localGovernment.hasGuid });
        }

        this.selectedOwnGovernment = localGovernment.matchesUserGuid;
      }
    }
  }

  onBlur() {
    //Blur will fire before onChange above, so use setTimeout to delay it
    setTimeout(() => {
      const localGovernmentName = this.localGovernment.getRawValue();
      if (localGovernmentName) {
        const localGovernment = this.localGovernments.find((lg) => lg.name == localGovernmentName);
        if (localGovernment) {
          this.selectedOwnGovernment = localGovernment.matchesUserGuid;
        } else {
          this.localGovernment.setValue(null);
          console.log('Clearing Local Government field');
        }
      }
    }, 500);
  }

  async onSave() {
    await this.save();
  }

  private async save() {
    if (this.isDirty) {
      const localGovernmentName = this.localGovernment.getRawValue();
      if (localGovernmentName) {
        const localGovernment = this.localGovernments.find((lg) => lg.name == localGovernmentName);

        if (localGovernment) {
          const res = await this.applicationSubmissionService.updatePending(this.submissionUuid, {
            localGovernmentUuid: localGovernment.uuid,
          });
          this.$applicationSubmission.next(res);
        }
      }
      this.isDirty = false;
    }
  }

  private filter(value: string): LocalGovernmentDto[] {
    if (this.localGovernments) {
      const filterValue = value.toLowerCase();
      return this.localGovernments.filter((localGovernment) =>
        localGovernment.name.toLowerCase().includes(filterValue)
      );
    }
    return [];
  }

  private async loadGovernments() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (this.selectGovernmentUuid) {
      this.populateLocalGovernment(this.selectGovernmentUuid);
    }
  }

  private populateLocalGovernment(governmentUuid: string) {
    const lg = this.localGovernments.find((lg) => lg.uuid === governmentUuid);
    if (lg) {
      this.localGovernment.patchValue(lg.name);
      this.showWarning = !lg.hasGuid;
      if (!lg.hasGuid) {
        this.localGovernment.setErrors({ invalid: true });
      }
      this.selectedOwnGovernment = lg.matchesUserGuid;
    }
  }
}
