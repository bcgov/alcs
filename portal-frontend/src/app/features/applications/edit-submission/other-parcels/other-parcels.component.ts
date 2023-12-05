import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, takeUntil } from 'rxjs';
import {
  ApplicationOwnerDetailedDto,
  ApplicationOwnerDto,
} from '../../../../services/application-owner/application-owner.dto';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { formatBooleanToString } from '../../../../shared/utils/boolean-helper';
import { parseStringToBoolean } from '../../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../edit-submission.component';
import { StepComponent } from '../step.partial';

@Component({
  selector: 'app-other-parcels',
  templateUrl: './other-parcels.component.html',
  styleUrls: ['./other-parcels.component.scss'],
})
export class OtherParcelsComponent extends StepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.OtherParcel;
  submissionUuid = '';

  hasOtherParcelsInCommunity = new FormControl<string | null>(null, [Validators.required]);
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

  constructor(private applicationService: ApplicationSubmissionService) {
    super();
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.application = application;
        this.submissionUuid = application.uuid;

        this.otherParcelsForm.patchValue({
          hasOtherParcelsInCommunity: formatBooleanToString(application.hasOtherParcelsInCommunity),
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
        hasOtherParcelsInCommunity: parseStringToBoolean(formValues.hasOtherParcelsInCommunity),
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

  onChangeOtherParcels($event: MatButtonToggleChange) {
    if ($event.value === 'true') {
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
