import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Observable, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../../../services/application/application-local-government/application-local-government.service';
import {
  CreateApplicationReconsiderationDto,
  ReconsiderationTypeDto,
} from '../../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../../../../services/application/application.dto';
import { ApplicationService } from '../../../../../services/application/application.service';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { CardService } from '../../../../../services/card/card.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { parseStringToBoolean } from '../../../../../shared/utils/boolean-helper';

@Component({
  selector: 'app-create',
  templateUrl: './create-reconsideration-dialog.html',
  styleUrls: ['./create-reconsideration-dialog.component.scss'],
})
export class CreateReconsiderationDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  applicationTypes: ApplicationTypeDto[] = [];
  regions: ApplicationRegionDto[] = [];
  reconTypes: ReconsiderationTypeDto[] = [];
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
  reconTypeControl = new FormControl<string | null>(null, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>(null, [Validators.required]);
  reconsidersDecisions = new FormControl<string[]>([], [Validators.required]);
  descriptionControl = new FormControl<string | null>('', [Validators.required]);
  isNewProposalControl = new FormControl<string | undefined>(undefined, [Validators.required]);
  isIncorrectFalseInfoControl = new FormControl<string | undefined>(undefined, [Validators.required]);
  isNewEvidenceControl = new FormControl<string | undefined>(undefined, [Validators.required]);

  createForm: FormGroup = new FormGroup({
    applicationType: this.applicationTypeControl,
    fileNumber: this.fileNumberControl,
    applicant: this.applicantControl,
    region: this.regionControl,
    localGovernment: this.localGovernmentControl,
    submittedDate: this.submittedDateControl,
    reconType: this.reconTypeControl,
    reconsidersDecisions: this.reconsidersDecisions,
    description: this.descriptionControl,
    isNewProposal: this.isNewProposalControl,
    isIncorrectFalseInfo: this.isIncorrectFalseInfoControl,
    isNewEvidence: this.isNewEvidenceControl,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateReconsiderationDialogComponent>,
    private applicationService: ApplicationService,
    private cardService: CardService,
    private reconsiderationService: ApplicationReconsiderationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private toastService: ToastService,
    private decisionService: ApplicationDecisionV2Service,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.currentBoardCode = this.data.currentBoardCode;
    this.cardService.fetchCodes();
    this.applicationService.$applicationTypes.pipe(takeUntil(this.$destroy)).subscribe((types) => {
      this.applicationTypes = types;
    });

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions;
    });

    this.cardService.$cardReconTypes.pipe(takeUntil(this.$destroy)).subscribe((reconTypes) => {
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
      }),
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

    await this.loadDecisions(application.fileNumber);

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
      const recon: CreateApplicationReconsiderationDto = {
        // application details
        applicationTypeCode: formValues.applicationType!,
        applicationFileNumber: formValues.fileNumber!.fileNumber?.trim() ?? formValues.fileNumber!.trim(),
        applicant: formValues.applicant!,
        regionCode: formValues.region!,
        localGovernmentUuid: formValues.localGovernment!,
        // recon details
        submittedDate: formValues.submittedDate!,
        reconTypeCode: formValues.reconType!,
        // card details
        boardCode: this.currentBoardCode,
        reconsideredDecisionUuids: formValues.reconsidersDecisions!,
        description: formValues.description,
        isNewProposal: parseStringToBoolean(formValues.isNewProposal),
        isIncorrectFalseInfo: parseStringToBoolean(formValues.isIncorrectFalseInfo),
        isNewEvidence: parseStringToBoolean(formValues.isNewEvidence),
      };

      if (!recon.boardCode) {
        this.toastService.showErrorToast('Board is required, please reload the page and try again');
        return;
      }

      const res = await this.reconsiderationService.create(recon);
      if (res) {
        await this.router.navigate(this.activatedRoute.snapshot.url, {
          queryParams: res.card.uuid && res.card.type ? { card: res.card.uuid, type: res.card.type } : {},
          relativeTo: this.activatedRoute,
        });
      }
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
    this.reconsidersDecisions.reset();
    this.descriptionControl.reset();
    this.isIncorrectFalseInfoControl.reset();
    this.isNewEvidenceControl.reset();
    this.isNewProposalControl.reset();

    this.fileNumberControl.enable();
    this.applicantControl.enable();
    this.regionControl.enable();
    this.applicationTypeControl.enable();
    this.localGovernmentControl.enable();
    this.reconsidersDecisions.disable();

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
      this.decisions = decisions
        .filter((e) => !e.isDraft)
        .map((decision) => ({
          uuid: decision.uuid,
          resolution: `#${decision.resolutionNumber}/${decision.resolutionYear}`,
        }));
      this.reconsidersDecisions.enable();
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
