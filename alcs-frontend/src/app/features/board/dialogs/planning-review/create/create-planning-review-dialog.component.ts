import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationRegionDto } from '../../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../../../services/application/application.service';
import { CardService } from '../../../../../services/card/card.service';
import { CreatePlanningReviewDto } from '../../../../../services/planning-review/planning-review.dto';
import { PlanningReviewService } from '../../../../../services/planning-review/planning-review.service';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
  selector: 'app-create',
  templateUrl: './create-planning-review-dialog.component.html',
  styleUrls: ['./create-planning-review-dialog.component.scss'],
})
export class CreatePlanningReviewDialogComponent implements OnInit {
  regions: ApplicationRegionDto[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  isLoading = false;

  fileNumberControl = new FormControl<string | any>('', [Validators.required]);
  regionControl = new FormControl<string | null>(null, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>(null, [Validators.required]);
  typeControl = new FormControl<string | null>(null, [Validators.required]);

  createForm = new FormGroup({
    fileNumber: this.fileNumberControl,
    region: this.regionControl,
    localGovernment: this.localGovernmentControl,
    type: this.typeControl,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreatePlanningReviewDialogComponent>,
    private planningReviewService: PlanningReviewService,
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

    this.applicationService.$applicationRegions.subscribe((regions) => {
      this.regions = regions;
    });
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const planningReview: CreatePlanningReviewDto = {
        fileNumber: formValues.fileNumber!.trim(),
        regionCode: formValues.region!,
        localGovernmentUuid: formValues.localGovernment!,
        type: formValues.type!,
      };

      await this.planningReviewService.create(planningReview);

      this.dialogRef.close(true);
      this.toastService.showSuccessToast('Planning meeting card created');
    } finally {
      this.isLoading = false;
    }
  }

  onSelectGovernment(value: ApplicationLocalGovernmentDto) {
    this.createForm.patchValue({
      region: value.preferredRegionCode,
    });
  }
}
