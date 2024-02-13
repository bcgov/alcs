import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { EditApplicationSteps } from '../edit-submission.component';
import { StepComponent } from '../step.partial';
import { OtherParcelsConfirmationDialogComponent } from './other-parcels-confirmation-dialog/other-parcels-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-other-parcels',
  templateUrl: './other-parcels.component.html',
  styleUrls: ['./other-parcels.component.scss'],
})
export class OtherParcelsComponent extends StepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.OtherParcel;
  submissionUuid = '';

  hasOtherParcelsInCommunity = new FormControl<boolean | null>(null, [Validators.required]);
  otherParcelsDescription = new FormControl<string | null>(
    {
      value: null,
      disabled: true,
    },
    []
  );

  otherParcelsForm = new FormGroup({
    hasOtherParcelsInCommunity: this.hasOtherParcelsInCommunity,
    otherParcelsDescription: this.otherParcelsDescription,
  });

  application?: ApplicationSubmissionDetailedDto;

  dialog;

  constructor(private applicationService: ApplicationSubmissionService, dialog: MatDialog) {
    super();
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.application = application;
        this.submissionUuid = application.uuid;

        this.otherParcelsForm.patchValue({
          hasOtherParcelsInCommunity: application.hasOtherParcelsInCommunity,
          otherParcelsDescription: application.otherParcelsDescription ?? null,
        });

        if (application.hasOtherParcelsInCommunity) {
          this.otherParcelsDescription.enable();
          this.otherParcelsDescription.setValidators([Validators.required]);
        }

        if (this.showErrors) {
          this.otherParcelsForm.markAllAsTouched();
        }
      }
    });
  }

  async saveProgress() {
    if (this.otherParcelsForm.dirty) {
      const formValues = this.otherParcelsForm.getRawValue();
      const updatedSubmission = await this.applicationService.updatePending(this.submissionUuid, {
        hasOtherParcelsInCommunity: formValues.hasOtherParcelsInCommunity,
        otherParcelsDescription: formValues.otherParcelsDescription,
      });
      if (updatedSubmission) {
        this.$applicationSubmission.next(updatedSubmission);
      }
    }
  }

  async onSave() {
    await this.saveProgress();
  }

  onChangeOtherParcels(hasOtherParcels: boolean) {
    if (!hasOtherParcels && this.otherParcelsDescription.value) {
      this.dialog
        .open(OtherParcelsConfirmationDialogComponent, {
          panelClass: 'no-padding',
          disableClose: true,
        })
        .beforeClosed()
        .subscribe((confirmed) => {
          this.updateParcelDescription(!confirmed);
          this.hasOtherParcelsInCommunity.setValue(!confirmed);
        });
    } else {
      this.updateParcelDescription(hasOtherParcels);
    }
  }

  updateParcelDescription(hasOtherParcels: boolean) {
    if (hasOtherParcels) {
      this.otherParcelsDescription.enable();
      this.otherParcelsDescription.setValidators([Validators.required]);
    } else {
      this.otherParcelsDescription.setValue(null);
      this.otherParcelsDescription.disable();
      this.otherParcelsDescription.setValidators([]);
    }
    this.otherParcelsForm.updateValueAndValidity();
  }
}
