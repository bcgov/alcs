import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationDecisionMakerDto,
  ApplicationRegionDto,
  ApplicationTypeDto,
} from '../../../services/application/application-code.dto';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { ToastService } from '../../../services/toast/toast.service';
import { BaseCodeDto } from '../../../shared/dto/base.dto';

@Component({
  selector: 'app-create-card-dialog',
  templateUrl: './create-card-dialog.component.html',
  styleUrls: ['./create-card-dialog.component.scss'],
})
export class CreateCardDialogComponent implements OnInit {
  applicationTypes: ApplicationTypeDto[] = [];
  decisionMakers: ApplicationDecisionMakerDto[] = [];
  regions: ApplicationRegionDto[] = [];
  decisionMaker?: ApplicationDecisionMakerDto;

  createForm = new FormGroup({
    fileNumber: new FormControl('', [Validators.required]),
    applicant: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    decisionMaker: new FormControl('', [Validators.required]),
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

    this.applicationService.$applicationDecisionMakers.subscribe((decisionMakers) => {
      this.decisionMakers = decisionMakers;

      if (this.data.decisionMaker) {
        this.decisionMaker = this.decisionMakers.find((dm) => dm.code === this.data.decisionMaker);
      }
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
      decisionMaker: formValues.decisionMaker || undefined,
      region: formValues.region || undefined,
    });
    this.dialogRef.close();
    this.toastService.showSuccessToast('Application Created');
  }
}
