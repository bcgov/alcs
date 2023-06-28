import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Observable, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../../../services/application/application-local-government/application-local-government.service';
import { ApplicationModificationCreateDto } from '../../../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../../../services/application/application-modification/application-modification.service';
import { ApplicationDto } from '../../../../../services/application/application.dto';
import { ApplicationService } from '../../../../../services/application/application.service';
import { ApplicationDecisionService } from '../../../../../services/application/decision/application-decision-v1/application-decision.service';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
  selector: 'app-create',
  templateUrl: './create-app-modification-dialog.html',
  styleUrls: ['./create-app-modification-dialog.component.scss'],
})
export class CreateAppModificationDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  applicationTypes: ApplicationTypeDto[] = [];
  regions: ApplicationRegionDto[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  isLoading = false;
  isDecisionDateEmpty = false;
  currentBoardCode: string = '';

  decisions: { uuid: string; resolution: string }[] = [];
  filteredApplications: Observable<ApplicationDto[]> | undefined;

  fileNumberControl = new FormControl<string | any>('', [Validators.required]);
  applicantControl = new FormControl('', [Validators.required]);
  applicationTypeControl = new FormControl<string | null>(null, [Validators.required]);
  regionControl = new FormControl<string | null>(null, [Validators.required]);
  submittedDateControl = new FormControl<Date | undefined>(undefined, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>(null, [Validators.required]);
  isTimeExtensionControl = new FormControl<string>('true', [Validators.required]);
  modifiesDecisions = new FormControl<string[]>([], [Validators.required]);

  createForm = new FormGroup({
    applicationType: this.applicationTypeControl,
    fileNumber: this.fileNumberControl,
    applicant: this.applicantControl,
    region: this.regionControl,
    localGovernment: this.localGovernmentControl,
    submittedDate: this.submittedDateControl,
    isTimeExtension: this.isTimeExtensionControl,
    modifiesDecisions: this.modifiesDecisions,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateAppModificationDialogComponent>,
    private applicationService: ApplicationService,
    private modificationService: ApplicationModificationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private decisionService: ApplicationDecisionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentBoardCode = this.data.currentBoardCode;
    this.applicationService.$applicationTypes.pipe(takeUntil(this.$destroy)).subscribe((types) => {
      this.applicationTypes = types;
    });

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
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

    this.loadDecisions(application.fileNumber);

    this.createForm.patchValue({
      applicant: application.applicant,
      region: application.region?.code,
      applicationType: application.type.code,
      localGovernment: this.localGovernments.find((g) => g.uuid === application.localGovernment?.uuid)?.uuid ?? null,
    });

    if (!application.decisionDate) {
      this.isDecisionDateEmpty = true;
    }
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const modificationCreateDto: ApplicationModificationCreateDto = {
        // application details
        applicationTypeCode: formValues.applicationType!,
        applicationFileNumber: formValues.fileNumber!.fileNumber?.trim() ?? formValues.fileNumber!.trim(),
        applicant: formValues.applicant!,
        regionCode: formValues.region!,
        localGovernmentUuid: formValues.localGovernment!,
        // modification details
        submittedDate: formValues.submittedDate!.valueOf(),
        boardCode: this.currentBoardCode,
        isTimeExtension: formValues.isTimeExtension === 'true',
        modifiesDecisionUuids: formValues.modifiesDecisions!,
      };

      if (!modificationCreateDto.boardCode) {
        this.toastService.showErrorToast('Board is required, please reload the page and try again');
        return;
      }

      await this.modificationService.create(modificationCreateDto);
      this.dialogRef.close(true);
      this.toastService.showSuccessToast('Modification card created');
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
    this.modifiesDecisions.reset();

    this.fileNumberControl.enable();
    this.applicantControl.enable();
    this.regionControl.enable();
    this.applicationTypeControl.enable();
    this.localGovernmentControl.enable();
    this.modifiesDecisions.disable();

    // clear warnings
    this.isDecisionDateEmpty = false;
  }

  onSelectGovernment(value: ApplicationLocalGovernmentDto) {
    this.createForm.patchValue({
      region: value.preferredRegionCode,
    });
  }

  async loadDecisions(fileNumber: string) {
    const decisions = await this.decisionService.fetchByApplication(fileNumber);
    if (decisions.length > 0) {
      this.decisions = decisions.map((decision) => ({
        uuid: decision.uuid,
        resolution: `#${decision.resolutionNumber}/${decision.resolutionYear}`,
      }));
      this.modifiesDecisions.enable();
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
