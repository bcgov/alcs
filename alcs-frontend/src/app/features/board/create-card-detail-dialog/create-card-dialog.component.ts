import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../services/application/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ToastService } from '../../../services/toast/toast.service';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';

@Component({
  selector: 'app-create-card-dialog',
  templateUrl: './create-card-dialog.component.html',
  styleUrls: ['./create-card-dialog.component.scss'],
})
export class CreateCardDialogComponent implements OnInit {
  applicationTypes: ApplicationTypeDto[] = [];
  regions: ApplicationRegionDto[] = [];
  localGovernments: ApplicationLocalGovernmentDto[] = [];
  isLoading = false;

  createForm = new FormGroup({
    fileNumber: new FormControl('', [Validators.required]),
    applicant: new FormControl('', [Validators.required]),
    type: new FormControl(null, [Validators.required]),
    localGovernment: new FormControl<string | null>(null, [Validators.required]),
    region: new FormControl<string | null>(null, [Validators.required]),
    receivedDate: new FormControl<Date | undefined>(undefined, [Validators.required]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDetailedDto,
    private dialogRef: MatDialogRef<CreateCardDialogComponent>,
    private applicationService: ApplicationService,
    private localGovernmentService: ApplicationLocalGovernmentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.applicationService.$applicationTypes.subscribe((types) => {
      this.applicationTypes = types;
    });

    this.applicationService.$applicationRegions.subscribe((regions) => {
      this.regions = regions;
    });

    this.localGovernmentService.list().then((res) => {
      this.localGovernments = res;
    });
  }

  onSelectGovernment(value: ApplicationLocalGovernmentDto) {
    this.createForm.patchValue({
      region: value.preferredRegionCode,
    });
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      const formValues = this.createForm.getRawValue();
      await this.applicationService.createApplication({
        type: formValues.type!,
        applicant: formValues.applicant!,
        fileNumber: formValues.fileNumber!.trim(),
        region: formValues.region || undefined,
        dateReceived: formatDateForApi(formValues.receivedDate!),
        localGovernmentUuid: formValues.localGovernment!,
      });
      this.dialogRef.close(true);
      this.toastService.showSuccessToast('Application Created');
    } finally {
      this.isLoading = false;
    }
  }
}
