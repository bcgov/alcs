import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationRegionDto } from '../../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../../../services/application/application.service';
import { CardService } from '../../../../../services/card/card.service';
import { CreateNoticeOfIntentDto } from '../../../../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentService } from '../../../../../services/notice-of-intent/notice-of-intent.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { formatDateForApi } from '../../../../../shared/utils/api-date-formatter';

@Component({
  selector: 'app-create-notice-of-intent-dialog',
  templateUrl: './create-notice-of-intent-dialog.component.html',
  styleUrls: ['./create-notice-of-intent-dialog.component.scss'],
})
export class CreateNoticeOfIntentDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  regions: ApplicationRegionDto[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  isLoading: boolean = false;

  fileNumberControl = new FormControl<string | any>('', [Validators.required]);
  regionControl = new FormControl<string | null>(null, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>(null, [Validators.required]);
  applicantControl = new FormControl<string | any>('', [Validators.required]);
  dateSubmitted = new FormControl<Date | null>(null, [Validators.required]);

  createForm = new FormGroup({
    fileNumber: this.fileNumberControl,
    region: this.regionControl,
    localGovernment: this.localGovernmentControl,
    applicant: this.applicantControl,
    dateSubmitted: this.dateSubmitted,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateNoticeOfIntentDialogComponent>,
    private noticeOfIntentService: NoticeOfIntentService,
    private cardService: CardService,
    private applicationService: ApplicationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cardService.fetchCodes();

    this.localGovernmentService.list().then((res) => {
      this.localGovernments = res;
    });

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions;
    });
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const noticeOfIntent: CreateNoticeOfIntentDto = {
        fileNumber: formValues.fileNumber!.trim(),
        regionCode: formValues.region!,
        localGovernmentUuid: formValues.localGovernment!,
        applicant: formValues.applicant!.trim(),
        boardCode: this.data.currentBoardCode,
        dateSubmittedToAlc: formatDateForApi(formValues.dateSubmitted!),
      };

      await this.noticeOfIntentService.create(noticeOfIntent);

      this.dialogRef.close(true);
      this.toastService.showSuccessToast('Notice of Intent created');
    } finally {
      this.isLoading = false;
    }
  }

  onSelectGovernment(value: ApplicationLocalGovernmentDto) {
    this.createForm.patchValue({
      region: value.preferredRegionCode,
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
