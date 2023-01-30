import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';

export enum MainLandUseTypeOptions {
  AgriculturalFarm = 'Agricultural/Farm',
  CivicInstitutional = 'Civic/Institutional',
  CommercialRetail = 'Commercial/Retail',
  Industrial = 'Industrial',
  Other = 'Other',
  Recreational = 'Recreational',
  Residential = 'Residential',
  TransportationUtilities = 'Transportation/Utilities',
  Unused = 'Unused',
}

@Component({
  selector: 'app-land-use',
  templateUrl: './land-use.component.html',
  styleUrls: ['./land-use.component.scss'],
})
export class LandUseComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationDto | undefined>;
  fileId: string = '';

  MainLandUseTypeOptions = MainLandUseTypeOptions;

  $destroy = new Subject<void>();

  parcelsAgricultureDescription = new FormControl<string>('');
  parcelsAgricultureImprovementDescription = new FormControl<string>('');
  parcelsNonAgricultureUseDescription = new FormControl<string>('');
  northLandUseType = new FormControl<string>('');
  northLandUseTypeDescription = new FormControl<string>('');
  eastLandUseType = new FormControl<string>('');
  eastLandUseTypeDescription = new FormControl<string>('');
  southLandUseType = new FormControl<string>('');
  southLandUseTypeDescription = new FormControl<string>('');
  westLandUseType = new FormControl<string>('');
  westLandUseTypeDescription = new FormControl<string>('');
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

  constructor(private router: Router, private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.populateFormValues(application);
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  populateFormValues(application: ApplicationDto) {
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
    this.applicationService.updatePending(this.fileId, {
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
      await this.saveProgress();
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }
}
