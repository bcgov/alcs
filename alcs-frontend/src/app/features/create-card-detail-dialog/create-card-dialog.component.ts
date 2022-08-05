import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDecisionMakerDto } from '../../services/application/application-decision-maker.dto';
import { ApplicationTypeDto } from '../../services/application/application-type.dto';
import { ApplicationDetailedDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-create-card-dialog',
  templateUrl: './create-card-dialog.component.html',
  styleUrls: ['./create-card-dialog.component.scss'],
})
export class CreateCardDialogComponent implements OnInit {
  applicationTypes: ApplicationTypeDto[] = [];
  decisionMakers: ApplicationDecisionMakerDto[] = [];

  createForm = new FormGroup({
    fileNumber: new FormControl('', [Validators.required]),
    applicant: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    decisionMaker: new FormControl(''),
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
    });
  }

  onSelectApplicationType(type: ApplicationTypeDto) {
    this.createForm.patchValue({
      type: type.code,
    });
  }

  onSelectDecisionMaker(decisionMaker: ApplicationDecisionMakerDto) {
    this.createForm.patchValue({
      decisionMaker: decisionMaker.code,
    });
  }

  async onSubmit() {
    const formValues = this.createForm.getRawValue();
    await this.applicationService.createApplication({
      type: formValues.type!,
      applicant: formValues.applicant!,
      fileNumber: formValues.fileNumber!.toString(),
      decisionMaker: formValues.decisionMaker ? formValues.decisionMaker : undefined,
    });
    this.dialogRef.close();
    this.toastService.showSuccessToast('Application Created');
  }
}
