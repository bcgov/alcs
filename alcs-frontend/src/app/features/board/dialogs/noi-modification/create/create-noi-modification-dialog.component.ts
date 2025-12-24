import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ApplicationTypeDto } from '../../../../../services/application/application-code.dto';
import { NoticeOfIntentDecisionV2Service } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentModificationCreateDto } from '../../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentService } from '../../../../../services/notice-of-intent/notice-of-intent.service';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
    selector: 'app-create-noi-modi-dialog',
    templateUrl: './create-noi-modification-dialog.html',
    styleUrls: ['./create-noi-modification-dialog.component.scss'],
    standalone: false
})
export class CreateNoiModificationDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  applicationTypes: ApplicationTypeDto[] = [];
  isLoading = false;
  isDecisionDateEmpty = false;

  decisions: { uuid: string; resolution: string }[] = [];

  fileNumberControl = new FormControl<string | any>({ value: '', disabled: true }, [Validators.required]);
  applicantControl = new FormControl({ value: '', disabled: true }, [Validators.required]);
  descriptionControl = new FormControl('', [Validators.required]);
  regionControl = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  submittedDateControl = new FormControl<Date | undefined>(undefined, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
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
    private modificationService: NoticeOfIntentModificationService,
    private decisionService: NoticeOfIntentDecisionV2Service,
    private toastService: ToastService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.createForm.patchValue({
      fileNumber: this.data.fileNumber,
      applicant: this.data.applicant,
      region: this.data.region?.label,
      localGovernment: this.data.localGovernment?.name,
    });

    this.noticeOfIntentService.fetchByFileNumber(this.data.fileNumber).then((noi) => {
      if (!noi?.decisionDate) {
        this.isDecisionDateEmpty = true;
      }
    });

    this.loadDecisions(this.data.fileNumber);
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
        boardCode: 'noi',
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

  onReset(event: MouseEvent) {
    event.preventDefault();

    this.submittedDateControl.reset();
    this.modifiesDecisions.reset();
    this.descriptionControl.reset();
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
