import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoticeOfIntentDecisionService } from '../../../../services/notice-of-intent/decision/notice-of-intent-decision.service';
import {
  NoticeOfIntentModificationDto,
  NoticeOfIntentModificationUpdateDto,
} from '../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';

@Component({
  selector: 'app-edit-noi-modification-dialog',
  templateUrl: './edit-modification-dialog.component.html',
  styleUrls: ['./edit-modification-dialog.component.scss'],
})
export class EditModificationDialogComponent implements OnInit {
  decisions: { uuid: string; resolution: string }[] = [];

  isLoading = false;

  reviewOutcomeCodeControl = new FormControl<string | undefined>(undefined);

  form = new FormGroup({
    submittedDate: new FormControl<Date | undefined>(undefined, [Validators.required]),
    reviewOutcomeCode: this.reviewOutcomeCodeControl,
    modifiesDecisions: new FormControl<string[]>([], [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileNumber: string;
      existingModification: NoticeOfIntentModificationDto;
    },
    private dialogRef: MatDialogRef<EditModificationDialogComponent>,
    private modificationService: NoticeOfIntentModificationService,
    private decisionService: NoticeOfIntentDecisionService,
    private toastService: ToastService
  ) {
    this.form.patchValue({
      submittedDate: new Date(data.existingModification.submittedDate),
      reviewOutcomeCode: data.existingModification.reviewOutcome.code,
      modifiesDecisions: data.existingModification.modifiesDecisions.map((dec) => dec.uuid),
      description: data.existingModification.description,
    });
  }

  ngOnInit(): void {
    this.loadDecisions(this.data.fileNumber);
  }

  async onSubmit() {
    this.isLoading = true;

    const { submittedDate, reviewOutcomeCode, modifiesDecisions, description } = this.form.getRawValue();
    const updateDto: NoticeOfIntentModificationUpdateDto = {
      submittedDate: formatDateForApi(submittedDate!),
      reviewOutcomeCode: reviewOutcomeCode || undefined,
      modifiesDecisionUuids: modifiesDecisions!,
      description: description!,
    };

    try {
      await this.modificationService.update(this.data.existingModification.uuid, updateDto);
      this.toastService.showSuccessToast('Modification updated');
    } finally {
      this.isLoading = false;
    }
    this.dialogRef.close(true);
  }

  async loadDecisions(fileNumber: string) {
    const decisions = await this.decisionService.fetchByFileNumber(fileNumber);
    if (decisions.length > 0) {
      this.decisions = decisions.map((decision) => ({
        uuid: decision.uuid,
        resolution: `#${decision.resolutionNumber}/${decision.resolutionYear}`,
      }));
    }
  }
}
