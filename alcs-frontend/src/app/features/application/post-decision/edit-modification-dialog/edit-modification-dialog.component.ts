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
    isTimeExtension: this.isTimeExtensionControl,
    modifiesDecisions: new FormControl<string[]>([], [Validators.required]),
    description: new FormControl<string | undefined>(undefined),
    reviewOutcomeCode: this.reviewOutcomeCodeControl,
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
      modifiesDecisions: data.existingModification.modifiesDecisions.map((dec) => dec.uuid),
      description: data.existingModification.description,
    });
  }

  ngOnInit(): void {
    this.loadDecisions(this.data.fileNumber);
  }

  async onSubmit() {
    this.isLoading = true;

    const { submittedDate, isTimeExtension, reviewOutcomeCode, modifiesDecisions, description } =
      this.form.getRawValue();
    const updateDto: ApplicationModificationUpdateDto = {
      submittedDate: formatDateForApi(submittedDate!),
      reviewOutcomeCode: reviewOutcomeCode || undefined,
      isTimeExtension: isTimeExtension === 'true',
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
    const decisions = await this.decisionService.fetchByApplication(fileNumber);
    if (decisions.length > 0) {
      this.decisions = decisions.map((decision) => ({
        uuid: decision.uuid,
        resolution: `#${decision.resolutionNumber}/${decision.resolutionYear}`,
      }));
    }
  }
}
