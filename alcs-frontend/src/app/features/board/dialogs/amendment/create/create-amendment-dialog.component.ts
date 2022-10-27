import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Observable, startWith, switchMap } from 'rxjs';
import { ApplicationAmendmentCreateDto } from '../../../../../services/application/application-amendment/application-amendment.dto';
import { ApplicationAmendmentService } from '../../../../../services/application/application-amendment/application-amendment.service';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../../../services/application/application-local-government/application-local-government.service';
import { ApplicationDto } from '../../../../../services/application/application.dto';
import { ApplicationService } from '../../../../../services/application/application.service';
import { CardService } from '../../../../../services/card/card.service';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
  selector: 'app-create',
  templateUrl: './create-amendment-dialog.html',
  styleUrls: ['./create-amendment-dialog.component.scss'],
})
export class CreateAmendmentDialogComponent implements OnInit {
  applicationTypes: ApplicationTypeDto[] = [];
  regions: ApplicationRegionDto[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  isLoading = false;
  isDecisionDateEmpty = false;
  currentBoardCode: string = '';

  filteredApplications: Observable<ApplicationDto[]> | undefined;

  fileNumberControl = new FormControl<string | any>('', [Validators.required]);
  applicantControl = new FormControl('', [Validators.required]);
  applicationTypeControl = new FormControl<string | null>(null, [Validators.required]);
  regionControl = new FormControl<string | null>(null, [Validators.required]);
  submittedDateControl = new FormControl<Date | undefined>(undefined, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>(null, [Validators.required]);
  isTimeExtensionControl = new FormControl<string>('true', [Validators.required]);

  createForm = new FormGroup({
    applicationType: this.applicationTypeControl,
    fileNumber: this.fileNumberControl,
    applicant: this.applicantControl,
    region: this.regionControl,
    localGovernment: this.localGovernmentControl,
    submittedDate: this.submittedDateControl,
    isTimeExtension: this.isTimeExtensionControl,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateAmendmentDialogComponent>,
    private applicationService: ApplicationService,
    private cardService: CardService,
    private amendmentService: ApplicationAmendmentService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentBoardCode = this.data.currentBoardCode;
    this.cardService.fetchCodes();
    this.applicationService.$applicationTypes.subscribe((types) => {
      this.applicationTypes = types;
    });

    this.applicationService.$applicationRegions.subscribe((regions) => {
      this.regions = regions;
    });

    this.localGovernmentService.list().then((res) => {
      this.localGovernments = res;
    });

    this.initApplicationFileNumberAutocomplete();
  }

  initApplicationFileNumberAutocomplete() {
    this.filteredApplications = this.fileNumberControl.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((val) => {
        if (val && val.length > 1) {
          return this.applicationService.searchApplicationsByNumber(val);
        }
        return [];
      })
    );
  }

  autocompleteDisplay(application: ApplicationDto): string {
    return application?.fileNumber ?? '';
  }

  async onApplicationSelected($event: MatOptionSelectionChange) {
    if (!$event?.source?.value) {
      return;
    }

    const application = $event.source.value as ApplicationDto;

    this.fileNumberControl.disable();
    this.applicantControl.disable();
    this.regionControl.disable();
    this.applicationTypeControl.disable();
    this.localGovernmentControl.disable();

    this.createForm.patchValue({
      applicant: application.applicant,
      region: application.region.code,
      applicationType: application.type.code,
      localGovernment: this.localGovernments.find((g) => g.uuid === application.localGovernment.uuid)?.uuid ?? null,
    });

    if (!application.decisionDate) {
      this.isDecisionDateEmpty = true;
    }
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const amendment: ApplicationAmendmentCreateDto = {
        // application details
        applicationTypeCode: formValues.applicationType!,
        applicationFileNumber: formValues.fileNumber!.fileNumber?.trim() ?? formValues.fileNumber!.trim(),
        applicant: formValues.applicant!,
        regionCode: formValues.region!,
        localGovernmentUuid: formValues.localGovernment!,
        // amendment details
        submittedDate: formValues.submittedDate!.getTime(),
        boardCode: this.currentBoardCode,
        isTimeExtension: formValues.isTimeExtension === 'true',
      };

      if (!amendment.boardCode) {
        this.toastService.showErrorToast('Board is required, please reload the page and try again');
        return;
      }

      await this.amendmentService.create(amendment);
      this.dialogRef.close(true);
      this.toastService.showSuccessToast('Reconsideration card created');
    } finally {
      this.isLoading = false;
    }
  }

  onReset() {
    this.fileNumberControl.reset();
    this.applicantControl.reset();
    this.regionControl.reset();
    this.applicationTypeControl.reset();
    this.submittedDateControl.reset();

    this.fileNumberControl.enable();
    this.applicantControl.enable();
    this.regionControl.enable();
    this.applicationTypeControl.enable();
    this.localGovernmentControl.enable();

    // clear warnings
    this.isDecisionDateEmpty = false;
  }

  onSelectGovernment(value: ApplicationLocalGovernmentDto) {
    this.createForm.patchValue({
      region: value.preferredRegionCode,
    });
  }
}
