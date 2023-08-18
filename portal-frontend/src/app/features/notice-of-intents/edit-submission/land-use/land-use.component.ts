import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { EditNoiSteps } from '../edit-submission.component';
import { StepComponent } from '../step.partial';

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
export class LandUseComponent extends StepComponent implements OnInit, OnDestroy {
  currentStep = EditNoiSteps.LandUse;

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

  constructor(private router: Router, private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService) {
    super();
  }

  ngOnInit(): void {
    this.$noiSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      if (noiSubmission) {
        this.fileId = noiSubmission.fileNumber;
        this.submissionUuid = noiSubmission.uuid;
        this.populateFormValues(noiSubmission);
      }
    });

    if (this.showErrors) {
      this.landUseForm.markAllAsTouched();
    }
  }

  populateFormValues(application: NoticeOfIntentSubmissionDetailedDto) {
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
    if (this.landUseForm.dirty) {
      const formValues = this.landUseForm.getRawValue();
      const updatedSubmission = await this.noticeOfIntentSubmissionService.updatePending(this.submissionUuid, {
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
      if (updatedSubmission) {
        this.$noiSubmission.next(updatedSubmission);
      }
    }
  }

  async onSave() {
    await this.saveProgress();
  }
}
