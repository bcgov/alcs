import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Observable, startWith, switchMap } from 'rxjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import {
  CreateApplicationReconsiderationDto,
  ReconsiderationTypeDto,
} from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDetailedDto, ApplicationDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { CardService } from '../../../services/card/card.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-recon-create-card-dialog',
  templateUrl: './recon-create-card-dialog.component.html',
  styleUrls: ['./recon-create-card-dialog.component.scss'],
})
export class ReconCreateCardDialogComponent implements OnInit {
  applicationTypes: ApplicationTypeDto[] = [];
  regions: ApplicationRegionDto[] = [];
  reconTypes: ReconsiderationTypeDto[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  isLoading = false;
  isDecisionDateEmpty = false;
  hasPendingRecon = false;
  currentBoardCode: string = '';

  filteredApplications: Observable<ApplicationDto[]> | undefined;

  fileNumberControl = new FormControl('', [Validators.required]);
  applicantControl = new FormControl('', [Validators.required]);
  applicationTypeControl = new FormControl<string | null>(null, [Validators.required]);
  regionControl = new FormControl<string | null>(null, [Validators.required]);
  submittedDateControl = new FormControl<Date | undefined>(undefined, [Validators.required]);
  reconTypeControl = new FormControl<string | null>(null, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>(null, [Validators.required]);

  createForm = new FormGroup({
    applicationType: this.applicationTypeControl,
    fileNumber: this.fileNumberControl,
    applicant: this.applicantControl,
    region: this.regionControl,
    localGovernment: this.localGovernmentControl,
    submittedDate: this.submittedDateControl,
    reconType: this.reconTypeControl,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ReconCreateCardDialogComponent>,
    private applicationService: ApplicationService,
    private cardService: CardService,
    private reconsiderationService: ApplicationReconsiderationService,
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

    this.cardService.$cardReconTypes.subscribe((reconTypes) => {
      this.reconTypes = reconTypes;
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

  autocompleteDisplay(application: ApplicationDetailedDto): string {
    return (application && application.fileNumber) ?? '';
  }

  async onApplicationSelected($event: MatOptionSelectionChange) {
    if (!$event?.source?.value) {
      return;
    }

    const application = $event.source.value as ApplicationDetailedDto;

    this.fileNumberControl.disable();
    this.applicantControl.disable();
    this.regionControl.disable();
    this.applicationTypeControl.disable();
    this.localGovernmentControl.disable();

    this.createForm.patchValue({
      applicant: application.applicant,
      region: this.regions.find((r) => r.code === application.region)?.code ?? null,
      applicationType: this.applicationTypes.find((r) => r.code === application.type)?.code ?? null,
      localGovernment: this.localGovernments.find((g) => g.uuid === application.localGovernment.uuid)?.uuid ?? null,
    });

    if (!application.decisionDate) {
      this.isDecisionDateEmpty = true;
    }

    // TODO implement hasPendingRecon once reconsideration entity created
    // this.hasPendingRecon = true;
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const recon: CreateApplicationReconsiderationDto = {
        // application details
        applicationTypeCode: formValues.applicationType!,
        applicationFileNumber: formValues.fileNumber!.trim(),
        applicant: formValues.applicant!,
        region: formValues.region!,
        localGovernmentUuid: formValues.localGovernment!,
        // recon details
        submittedDate: formValues.submittedDate!,
        reconTypeCode: formValues.reconType!,
        // card details
        boardCode: this.currentBoardCode,
      };

      console.log('recon onSubmit', recon);

      if (!recon.boardCode) {
        this.toastService.showErrorToast('Board is required. Please reload the page and try again.');
        return;
      }

      await this.reconsiderationService.create(recon);

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
    this.reconTypeControl.reset();

    this.fileNumberControl.enable();
    this.applicantControl.enable();
    this.regionControl.enable();
    this.applicationTypeControl.enable();

    // clear warnings
    this.isDecisionDateEmpty = false;
    this.hasPendingRecon = false;
  }

  onSelectGovernment(value: ApplicationLocalGovernmentDto) {
    this.createForm.patchValue({
      region: value.preferredRegionCode,
    });
  }
}
