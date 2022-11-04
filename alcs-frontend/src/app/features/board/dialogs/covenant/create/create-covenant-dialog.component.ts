import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationRegionDto } from '../../../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../../../services/application/application.service';
import { CardService } from '../../../../../services/card/card.service';
import { CreateCovenantDto } from '../../../../../services/covenant/covenant.dto';
import { CovenantService } from '../../../../../services/covenant/covenant.service';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
  selector: 'app-create-covenant-dialog',
  templateUrl: './create-covenant-dialog.component.html',
  styleUrls: ['./create-covenant-dialog.component.scss'],
})
export class CreateCovenantDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  regions: ApplicationRegionDto[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  isLoading: boolean = false;
  currentBoardCode: string = '';

  fileNumberControl = new FormControl<string | any>('', [Validators.required]);
  regionControl = new FormControl<string | null>(null, [Validators.required]);
  localGovernmentControl = new FormControl<string | null>(null, [Validators.required]);
  applicantControl = new FormControl<string | any>('', [Validators.required]);

  createForm = new FormGroup({
    fileNumber: this.fileNumberControl,
    region: this.regionControl,
    localGovernment: this.localGovernmentControl,
    applicant: this.applicantControl,
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateCovenantDialogComponent>,
    private covenantService: CovenantService,
    private cardService: CardService,
    private applicationService: ApplicationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentBoardCode = this.data.currentBoardCode;
    this.cardService.fetchCodes();

    this.localGovernmentService.list().then((res) => {
      this.localGovernments = res;
    });

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions;
    });
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      const planningReview: CreateCovenantDto = {
        fileNumber: formValues.fileNumber!.trim(),
        regionCode: formValues.region!,
        localGovernmentUuid: formValues.localGovernment!,
        applicant: formValues.applicant!.trim(),
        boardCode: this.currentBoardCode,
      };

      await this.covenantService.create(planningReview);

      this.dialogRef.close(true);
      this.toastService.showSuccessToast('Covenant card created');
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
}
