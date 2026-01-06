import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { EditApplicationSteps } from '../edit-submission.component';
import { StepComponent } from '../step.partial';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-other-parcels',
    templateUrl: './other-parcels.component.html',
    styleUrls: ['./other-parcels.component.scss'],
    standalone: false
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

  constructor(
    private applicationService: ApplicationSubmissionService,
    private confirmationDialogService: ConfirmationDialogService
  ) {
    super();
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
      this.confirmationDialogService
        .openDialog({
          title:
            'Do any of the land owners added previously own or lease other parcels that might inform this application process?',
          body: 'Changing the answer to this question will remove content already saved to this page. Do you want to continue?',
        })
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
