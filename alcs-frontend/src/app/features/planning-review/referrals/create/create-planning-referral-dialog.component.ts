import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Moment } from 'moment';
import { Subject } from 'rxjs';
import { PlanningReferralService } from '../../../../services/planning-review/planning-referral.service';
import {
  CreatePlanningReferralDto,
  PlanningReferralDto,
} from '../../../../services/planning-review/planning-review.dto';

@Component({
    selector: 'app-create',
    templateUrl: './create-planning-referral-dialog.component.html',
    styleUrls: ['./create-planning-referral-dialog.component.scss'],
    standalone: false
})
export class CreatePlanningReferralDialogComponent {
  isLoading = false;
  minimumDate = new Date(0);

  descriptionControl = new FormControl<string | null>(null, [Validators.required]);
  submissionDateControl = new FormControl<Moment | null>(null, [Validators.required]);
  dueDateControl = new FormControl<Moment | null>(null);

  createForm = new FormGroup({
    description: this.descriptionControl,
    submissionDate: this.submissionDateControl,
    dueDate: this.dueDateControl,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      planningReviewUuid: string;
      minReceivedDate: number;
    },
    private dialogRef: MatDialogRef<CreatePlanningReferralDialogComponent>,
    private planningReferralService: PlanningReferralService,
  ) {
    this.minimumDate = new Date(this.data.minReceivedDate);
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const planningReview: CreatePlanningReferralDto = {
        planningReviewUuid: this.data.planningReviewUuid,
        submissionDate: formValues.submissionDate!.valueOf(),
        referralDescription: formValues.description!,
        dueDate: formValues.dueDate?.valueOf(),
      };

      await this.planningReferralService.create(planningReview);
      this.dialogRef.close(true);
    } finally {
      this.isLoading = false;
    }
  }
}
