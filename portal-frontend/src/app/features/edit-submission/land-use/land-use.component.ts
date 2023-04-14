import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { EditApplicationSteps } from '../edit-submission.component';

export enum MainLandUseTypeOptions {
  AgriculturalFarm = 'Agricultural / Farm',
  CivicInstitutional = 'Civic / Institutional',
  CommercialRetail = 'Commercial / Retail',
  Industrial = 'Industrial',
  Other = 'Other',
  Recreational = 'Recreational',
  Residential = 'Residential',
  TransportationUtilities = 'Transportation / Utilities',
  Unused = 'Unused',
}

@Component({
  selector: 'app-land-use',
  templateUrl: './land-use.component.html',
  styleUrls: ['./land-use.component.scss'],
})
export class LandUseComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  currentStep = EditApplicationSteps.LandUse;
  @Input() $applicationSubmission!: BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>;
  @Input() showErrors = false;
  @Output() navigateToStep = new EventEmitter<number>();

  fileId = '';
  submissionUuid = '';

  MainLandUseTypeOptions = MainLandUseTypeOptions;

  parcelsAgricultureDescription = new FormControl<string>('', [Validators.required]);
  parcelsAgricultureImprovementDescription = new FormControl<string>('', [Validators.required]);
  parcelsNonAgricultureUseDescription = new FormControl<string>('', [Validators.required]);
  northLandUseType = new FormControl<string>('', [Validators.required]);
  northLandUseTypeDescription = new FormControl<string>('', [Validators.required]);
  eastLandUseType = new FormControl<string>('', [Validators.required]);
  eastLandUseTypeDescription = new FormControl<string>('', [Validators.required]);
  southLandUseType = new FormControl<string>('', [Validators.required]);
  southLandUseTypeDescription = new FormControl<string>('', [Validators.required]);
  westLandUseType = new FormControl<string>('', [Validators.required]);
  westLandUseTypeDescription = new FormControl<string>('', [Validators.required]);
  landUseForm = new FormGroup({
    parcelsAgricultureDescription: this.parcelsAgricultureDescription,
    parcelsAgricultureImprovementDescription: this.parcelsAgricultureImprovementDescription,
    parcelsNonAgricultureUseDescription: this.parcelsNonAgricultureUseDescription,
    northLandUseType: this.northLandUseType,
    northLandUseTypeDescription: this.northLandUseTypeDescription,
    eastLandUseType: this.eastLandUseType,
    eastLandUseTypeDescription: this.eastLandUseTypeDescription,
    southLandUseType: this.southLandUseType,
    southLandUseTypeDescription: this.southLandUseTypeDescription,
    westLandUseType: this.westLandUseType,
    westLandUseTypeDescription: this.westLandUseTypeDescription,
  });

  constructor(private router: Router, private applicationService: ApplicationSubmissionService) {}

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;
        this.populateFormValues(applicationSubmission);
      }
    });

    if (this.showErrors) {
      this.landUseForm.markAllAsTouched();
    }
  }

  async ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }

  populateFormValues(application: ApplicationSubmissionDetailedDto) {
    this.landUseForm.patchValue({
      parcelsAgricultureDescription: application.parcelsAgricultureDescription,
      parcelsAgricultureImprovementDescription: application.parcelsAgricultureImprovementDescription,
      parcelsNonAgricultureUseDescription: application.parcelsNonAgricultureUseDescription,
      northLandUseType: application.northLandUseType,
      northLandUseTypeDescription: application.northLandUseTypeDescription,
      eastLandUseType: application.eastLandUseType,
      eastLandUseTypeDescription: application.eastLandUseTypeDescription,
      southLandUseType: application.southLandUseType,
      southLandUseTypeDescription: application.southLandUseTypeDescription,
      westLandUseType: application.westLandUseType,
      westLandUseTypeDescription: application.westLandUseTypeDescription,
    });
  }

  async saveProgress() {
    const formValues = this.landUseForm.getRawValue();
    await this.applicationService.updatePending(this.submissionUuid, {
      parcelsAgricultureDescription: formValues.parcelsAgricultureDescription,
      parcelsAgricultureImprovementDescription: formValues.parcelsAgricultureImprovementDescription,
      parcelsNonAgricultureUseDescription: formValues.parcelsNonAgricultureUseDescription,
      northLandUseType: formValues.northLandUseType,
      northLandUseTypeDescription: formValues.northLandUseTypeDescription,
      eastLandUseType: formValues.eastLandUseType,
      eastLandUseTypeDescription: formValues.eastLandUseTypeDescription,
      southLandUseType: formValues.southLandUseType,
      southLandUseTypeDescription: formValues.southLandUseTypeDescription,
      westLandUseType: formValues.westLandUseType,
      westLandUseTypeDescription: formValues.westLandUseTypeDescription,
    });
  }

  async onSave() {
    await this.saveProgress();
  }

  async onSaveExit() {
    if (this.fileId) {
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }
}
