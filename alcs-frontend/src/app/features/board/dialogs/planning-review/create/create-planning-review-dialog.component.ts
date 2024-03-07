import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Moment } from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationRegionDto } from '../../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../../../services/application/application.service';
import { CardService } from '../../../../../services/card/card.service';
import {
  CreatePlanningReviewDto,
  PlanningReviewTypeDto,
} from '../../../../../services/planning-review/planning-review.dto';
import { PlanningReviewService } from '../../../../../services/planning-review/planning-review.service';

@Component({
  selector: 'app-create',
  templateUrl: './create-planning-review-dialog.component.html',
  styleUrls: ['./create-planning-review-dialog.component.scss'],
})
export class CreatePlanningReviewDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  regions: ApplicationRegionDto[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  types: PlanningReviewTypeDto[] = [];
  isLoading = false;

  regionControl = new FormControl<string | null>(null, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>(null, [Validators.required]);
  typeControl = new FormControl<string | null>(null, [Validators.required]);
  documentNameControl = new FormControl<string | null>(null, [Validators.required]);
  descriptionControl = new FormControl<string | null>(null, [Validators.required]);
  submissionDateControl = new FormControl<Moment | null>(null, [Validators.required]);
  dueDateControl = new FormControl<Moment | null>(null);

  createForm = new FormGroup({
    region: this.regionControl,
    localGovernment: this.localGovernmentControl,
    type: this.typeControl,
    documentName: this.documentNameControl,
    description: this.descriptionControl,
    submissionDate: this.submissionDateControl,
    dueDate: this.dueDateControl,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      currentBoardCode: string;
    },
    private dialogRef: MatDialogRef<CreatePlanningReviewDialogComponent>,
    private planningReviewService: PlanningReviewService,
    private cardService: CardService,
    private applicationService: ApplicationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.cardService.fetchCodes();

    this.localGovernmentService.list().then((res) => {
      this.localGovernments = res;
    });

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions;
    });

    this.loadTypes();
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const planningReview: CreatePlanningReviewDto = {
        regionCode: formValues.region!,
        localGovernmentUuid: formValues.localGovernment!,
        typeCode: formValues.type!,
        submissionDate: formValues.submissionDate!.valueOf(),
        description: formValues.description!,
        documentName: formValues.documentName!,
        dueDate: formValues.dueDate?.valueOf(),
      };

      const res = await this.planningReviewService.create(planningReview);
      this.dialogRef.close(true);
      if (res) {
        await this.router.navigate(this.activatedRoute.snapshot.url, {
          queryParams: res.card.uuid && res.card.type ? { card: res.card.uuid, type: res.card.type } : {},
          relativeTo: this.activatedRoute,
        });
      }
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

  private async loadTypes() {
    const types = await this.planningReviewService.fetchTypes();
    if (types) {
      this.types = types;
    }
  }
}
