import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Observable, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../../../services/application/application.service';
import { NoticeOfIntentDecisionV2Service } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentModificationCreateDto } from '../../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDto } from '../../../../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentService } from '../../../../../services/notice-of-intent/notice-of-intent.service';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
  selector: 'app-create-noi-modi-dialog',
  templateUrl: './create-noi-modification-dialog.html',
  styleUrls: ['./create-noi-modification-dialog.component.scss'],
})
export class CreateNoiModificationDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  applicationTypes: ApplicationTypeDto[] = [];
  regions: ApplicationRegionDto[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  isLoading = false;
  isDecisionDateEmpty = false;
  currentBoardCode: string = '';

  decisions: { uuid: string; resolution: string }[] = [];
  filteredNOIs: Observable<NoticeOfIntentDto[]> | undefined;

  fileNumberControl = new FormControl<string | any>('', [Validators.required]);
  applicantControl = new FormControl('', [Validators.required]);
  descriptionControl = new FormControl('', [Validators.required]);
  regionControl = new FormControl<string | null>(null, [Validators.required]);
  submittedDateControl = new FormControl<Date | undefined>(undefined, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>(null, [Validators.required]);
  modifiesDecisions = new FormControl<string[]>([], [Validators.required]);

  createForm = new FormGroup({
    fileNumber: this.fileNumberControl,
    applicant: this.applicantControl,
    description: this.descriptionControl,
    region: this.regionControl,
    localGovernment: this.localGovernmentControl,
    submittedDate: this.submittedDateControl,
    modifiesDecisions: this.modifiesDecisions,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateNoiModificationDialogComponent>,
    private noticeOfIntentService: NoticeOfIntentService,
    private applicationService: ApplicationService,
    private modificationService: NoticeOfIntentModificationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private decisionService: NoticeOfIntentDecisionV2Service,
    private toastService: ToastService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.currentBoardCode = this.data.currentBoardCode;

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions;
    });

    this.localGovernmentService.list().then((res) => {
      this.localGovernments = res;
    });

    this.initFileNumberAutocomplete();
  }

  initFileNumberAutocomplete() {
    this.filteredNOIs = this.fileNumberControl.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((val) => {
        if (val && val.length > 1) {
          return this.noticeOfIntentService.searchByFileNumber(val);
        }
        return [];
      }),
    );
  }

  autocompleteDisplay(application: NoticeOfIntentDto): string {
    return application?.fileNumber ?? '';
  }

  async onNOISelected($event: MatOptionSelectionChange) {
    if (!$event?.source?.value) {
      return;
    }

    const noticeOfIntent = $event.source.value as NoticeOfIntentDto;
    this.fileNumberControl.disable();
    this.applicantControl.disable();
    this.regionControl.disable();
    this.localGovernmentControl.disable();

    this.loadDecisions(noticeOfIntent.fileNumber);

    this.createForm.patchValue({
      applicant: noticeOfIntent.applicant,
      region: noticeOfIntent.region.code,
      localGovernment: this.localGovernments.find((g) => g.uuid === noticeOfIntent.localGovernment.uuid)?.uuid ?? null,
    });

    if (!noticeOfIntent.decisionDate) {
      this.isDecisionDateEmpty = true;
    }
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const modificationCreateDto: NoticeOfIntentModificationCreateDto = {
        fileNumber: formValues.fileNumber!.fileNumber?.trim() ?? formValues.fileNumber!.trim(),
        applicant: formValues.applicant!,
        regionCode: formValues.region!,
        localGovernmentUuid: formValues.localGovernment!,
        submittedDate: formValues.submittedDate!.valueOf(),
        boardCode: this.currentBoardCode,
        modifiesDecisionUuids: formValues.modifiesDecisions!,
        description: formValues.description!,
      };

      if (!modificationCreateDto.boardCode) {
        this.toastService.showErrorToast('Board is required, please reload the page and try again');
        return;
      }

      const res = await this.modificationService.create(modificationCreateDto);
      this.dialogRef.close(true);
      if (res) {
        await this.router.navigate(this.activatedRoute.snapshot.url, {
          queryParams: res.card.uuid && res.card.type ? { card: res.card.uuid, type: res.card.type } : {},
          relativeTo: this.activatedRoute,
        });
      }

      this.toastService.showSuccessToast('Modification card created');
    } finally {
      this.isLoading = false;
    }
  }

  onReset() {
    this.fileNumberControl.reset();
    this.applicantControl.reset();
    this.regionControl.reset();
    this.submittedDateControl.reset();
    this.modifiesDecisions.reset();
    this.descriptionControl.reset();

    this.fileNumberControl.enable();
    this.applicantControl.enable();
    this.regionControl.enable();
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
    const decisions = await this.decisionService.fetchByFileNumber(fileNumber);
    if (decisions.length > 0) {
      this.decisions = decisions
        .filter((dec) => !dec.isDraft)
        .map((decision) => ({
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
