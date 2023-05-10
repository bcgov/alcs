import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ApplicationModificationDto,
  ApplicationModificationUpdateDto,
} from '../../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../../services/application/application-modification/application-modification.service';
import { ApplicationDecisionService } from '../../../../services/application/decision/application-decision-v1/application-decision.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';

@Component({
  selector: 'app-edit-reconsideration-dialog',
  templateUrl: './edit-modification-dialog.component.html',
  styleUrls: ['./edit-modification-dialog.component.scss'],
})
export class EditModificationDialogComponent implements OnInit {
  decisions: { uuid: string; resolution: string }[] = [];

  isLoading = false;

  reviewOutcomeCodeControl = new FormControl<string | undefined>(undefined);
  isTimeExtensionControl = new FormControl<string>('true', [Validators.required]);

  form = new FormGroup({
    submittedDate: new FormControl<Date | undefined>(undefined, [Validators.required]),
    reviewOutcomeCode: this.reviewOutcomeCodeControl,
    isTimeExtension: this.isTimeExtensionControl,
    reviewDate: new FormControl<Date | null | undefined>(null),
    modifiesDecisions: new FormControl<string[]>([], [Validators.required]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileNumber: string;
      existingModification: ApplicationModificationDto;
    },
    private dialogRef: MatDialogRef<EditModificationDialogComponent>,
    private modificationService: ApplicationModificationService,
    private decisionService: ApplicationDecisionService,
    private toastService: ToastService
  ) {
    this.form.patchValue({
      submittedDate: new Date(data.existingModification.submittedDate),
      reviewOutcomeCode: data.existingModification.reviewOutcome.code,
      isTimeExtension: data.existingModification.isTimeExtension ? 'true' : 'false',
      reviewDate: data.existingModification.reviewDate ? new Date(data.existingModification.reviewDate) : null,
      modifiesDecisions: data.existingModification.modifiesDecisions.map((dec) => dec.uuid),
    });
  }

  ngOnInit(): void {
    this.loadDecisions(this.data.fileNumber);
  }

  async onSubmit() {
    this.isLoading = true;

    const { submittedDate, isTimeExtension, reviewOutcomeCode, reviewDate, modifiesDecisions } =
      this.form.getRawValue();
    const updateDto: ApplicationModificationUpdateDto = {
      submittedDate: formatDateForApi(submittedDate!),
      reviewOutcomeCode: reviewOutcomeCode || undefined,
      isTimeExtension: isTimeExtension === 'true',
      reviewDate: reviewDate ? formatDateForApi(reviewDate) : reviewDate,
      modifiesDecisionUuids: modifiesDecisions!,
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
    const decisions = await this.decisionService.fetchByApplication(fileNumber);
    if (decisions.length > 0) {
      this.decisions = decisions.map((decision) => ({
        uuid: decision.uuid,
        resolution: `#${decision.resolutionNumber}/${decision.resolutionYear}`,
      }));
    }
  }
}
