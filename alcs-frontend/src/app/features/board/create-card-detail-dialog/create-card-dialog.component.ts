import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as dayjs from 'dayjs';
import { ApplicationRegionDto, ApplicationTypeDto } from '../../../services/application/application-code.dto';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ToastService } from '../../../services/toast/toast.service';
import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { formatDateForApi } from '../../../shared/utils/api-date-formatter';

@Component({
  selector: 'app-create-card-dialog',
  templateUrl: './create-card-dialog.component.html',
  styleUrls: ['./create-card-dialog.component.scss'],
})
export class CreateCardDialogComponent implements OnInit {
  applicationTypes: ApplicationTypeDto[] = [];
  regions: ApplicationRegionDto[] = [];

  createForm = new FormGroup({
    fileNumber: new FormControl('', [Validators.required]),
    applicant: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    receivedDate: new FormControl<Date | undefined>(undefined, [Validators.required]),
    region: new FormControl(''),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDetailedDto,
    private dialogRef: MatDialogRef<CreateCardDialogComponent>,
    private applicationService: ApplicationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.applicationService.$applicationTypes.subscribe((types) => {
      this.applicationTypes = types;
    });

    this.applicationService.$applicationRegions.subscribe((regions) => {
      this.regions = regions;
    });
  }

  onSelectDtoDropdown(field: string, value: BaseCodeDto) {
    this.createForm.patchValue({
      [field]: value.code,
    });
  }

  async onSubmit() {
    const formValues = this.createForm.getRawValue();
    await this.applicationService.createApplication({
      type: formValues.type!,
      applicant: formValues.applicant!,
      fileNumber: formValues.fileNumber!.toString(),
      region: formValues.region || undefined,
      dateReceived: formatDateForApi(formValues.receivedDate!),
    });
    this.dialogRef.close(true);
    this.toastService.showSuccessToast('Application Created');
  }
}
