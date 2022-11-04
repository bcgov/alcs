import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationAmendmentDto,
  ApplicationAmendmentUpdateDto,
} from '../../../../services/application/application-amendment/application-amendment.dto';
import { ApplicationAmendmentService } from '../../../../services/application/application-amendment/application-amendment.service';
import { ApplicationDecisionService } from '../../../../services/application/application-decision/application-decision.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';

@Component({
  selector: 'app-edit-reconsideration-dialog',
  templateUrl: './edit-amendment-dialog.component.html',
  styleUrls: ['./edit-amendment-dialog.component.scss'],
})
export class EditAmendmentDialogComponent implements OnInit {
  decisions: { uuid: string; resolution: string }[] = [];

  isLoading = false;

  isReviewApprovedControl = new FormControl<string | null>(null);
  isTimeExtensionControl = new FormControl<string>('true', [Validators.required]);

  form = new FormGroup({
    submittedDate: new FormControl<Date | undefined>(undefined, [Validators.required]),
    isReviewApproved: this.isReviewApprovedControl,
    isTimeExtension: this.isTimeExtensionControl,
    reviewDate: new FormControl<Date | null | undefined>(null),
    amendedDecisions: new FormControl<string[]>([], [Validators.required]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileNumber: string;
      existingAmendment: ApplicationAmendmentDto;
    },
    private dialogRef: MatDialogRef<EditAmendmentDialogComponent>,
    private amendmentService: ApplicationAmendmentService,
    private decisionService: ApplicationDecisionService,
    private toastService: ToastService
  ) {
    this.form.patchValue({
      submittedDate: new Date(data.existingAmendment.submittedDate),
      isReviewApproved: JSON.stringify(data.existingAmendment.isReviewApproved),
      isTimeExtension: data.existingAmendment.isTimeExtension ? 'true' : 'false',
      reviewDate: data.existingAmendment.reviewDate ? new Date(data.existingAmendment.reviewDate) : null,
      amendedDecisions: data.existingAmendment.amendedDecisions.map((dec) => dec.uuid),
    });
  }

  ngOnInit(): void {
    this.loadDecisions(this.data.fileNumber);
  }

  async onSubmit() {
    this.isLoading = true;

    const { submittedDate, isTimeExtension, isReviewApproved, reviewDate, amendedDecisions } = this.form.getRawValue();
    const updateDto: ApplicationAmendmentUpdateDto = {
      submittedDate: formatDateForApi(submittedDate!),
      isReviewApproved: isReviewApproved != undefined ? JSON.parse(isReviewApproved) : null,
      isTimeExtension: isTimeExtension === 'true',
      reviewDate: reviewDate ? formatDateForApi(reviewDate) : reviewDate,
      amendedDecisionUuids: amendedDecisions!,
    };

    try {
      await this.amendmentService.update(this.data.existingAmendment.uuid, updateDto);
      this.toastService.showSuccessToast('Amendment updated');
    } finally {
      this.isLoading = false;
    }
    this.dialogRef.close(true);
  }

  async loadDecisions(fileNumber: string) {
    const decisions = await this.decisionService.fetchByApplication(fileNumber);
    if (decisions.length > 0) {
      this.decisions = decisions.map((decision) => ({
        uuid: decision.uuid,
        resolution: `#${decision.resolutionNumber}/${decision.resolutionYear}`,
      }));
    }
  }
}
