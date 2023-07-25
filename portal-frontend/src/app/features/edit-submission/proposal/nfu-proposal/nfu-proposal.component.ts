import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationSubmissionUpdateDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { parseStringToBoolean } from '../../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { StepComponent } from '../../step.partial';

@Component({
  selector: 'app-nfu-proposal',
  templateUrl: './nfu-proposal.component.html',
  styleUrls: ['./nfu-proposal.component.scss'],
})
export class NfuProposalComponent extends StepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  hectares = new FormControl<string | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  outsideLands = new FormControl<string | null>(null, [Validators.required]);
  agricultureSupport = new FormControl<string | null>(null, [Validators.required]);
  willImportFill = new FormControl<string | null>(null, [Validators.required]);
  totalFillPlacement = new FormControl<string | null>(null, [Validators.required]);
  maxFillDepth = new FormControl<string | null>(null, [Validators.required]);
  fillVolume = new FormControl<string | null>(null, [Validators.required]);
  projectDurationAmount = new FormControl<string | null>(null, [Validators.required]);
  projectDurationUnit = new FormControl<string | null>(null, [Validators.required]);
  fillTypeDescription = new FormControl<string | null>(null, [Validators.required]);
  fillOriginDescription = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    hectares: this.hectares,
    purpose: this.purpose,
    outsideLands: this.outsideLands,
    agricultureSupport: this.agricultureSupport,
    willImportFill: this.willImportFill,
    totalFillPlacement: this.totalFillPlacement,
    maxFillDepth: this.maxFillDepth,
    fillVolume: this.fillVolume,
    projectDurationAmount: this.projectDurationAmount,
    projectDurationUnit: this.projectDurationUnit,
    fillTypeDescription: this.fillTypeDescription,
    fillOriginDescription: this.fillOriginDescription,
  });
  private fileId = '';
  private submissionUuid = '';

  constructor(private router: Router, private applicationSubmissionService: ApplicationSubmissionService) {
    super();
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;

        this.form.patchValue({
          hectares: applicationSubmission.nfuHectares?.toString(),
          purpose: applicationSubmission.purpose,
          outsideLands: applicationSubmission.nfuOutsideLands,
          agricultureSupport: applicationSubmission.nfuAgricultureSupport,
          totalFillPlacement: applicationSubmission.nfuTotalFillPlacement?.toString(),
          maxFillDepth: applicationSubmission.nfuMaxFillDepth?.toString(),
          fillVolume: applicationSubmission.nfuFillVolume?.toString(),
          projectDurationAmount: applicationSubmission.nfuProjectDurationAmount?.toString(),
          projectDurationUnit: applicationSubmission.nfuProjectDurationUnit,
          fillTypeDescription: applicationSubmission.nfuFillTypeDescription,
          fillOriginDescription: applicationSubmission.nfuFillOriginDescription,
        });

        if (applicationSubmission.nfuWillImportFill !== null) {
          this.willImportFill.setValue(applicationSubmission.nfuWillImportFill ? 'true' : 'false');
          this.onChangeFill(applicationSubmission.nfuWillImportFill ? 'true' : 'false');
        }

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });
  }

  async onSave() {
    await this.save();
  }

  private async save() {
    if (this.fileId && this.form.dirty) {
      const nfuHectares = this.hectares.getRawValue();
      const purpose = this.purpose.getRawValue();
      const nfuOutsideLands = this.outsideLands.getRawValue();
      const nfuAgricultureSupport = this.agricultureSupport.getRawValue();
      const nfuWillImportFill = this.willImportFill.getRawValue();
      const nfuTotalFillPlacement = this.totalFillPlacement.getRawValue();
      const nfuMaxFillDepth = this.maxFillDepth.getRawValue();
      const nfuFillVolume = this.fillVolume.getRawValue();
      const nfuProjectDurationAmount = this.projectDurationAmount.getRawValue();
      const nfuProjectDurationUnit = this.projectDurationUnit.getRawValue();
      const nfuFillTypeDescription = this.fillTypeDescription.getRawValue();
      const nfuFillOriginDescription = this.fillOriginDescription.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        nfuHectares: nfuHectares ? parseFloat(nfuHectares) : null,
        purpose,
        nfuOutsideLands,
        nfuAgricultureSupport,
        nfuWillImportFill: parseStringToBoolean(nfuWillImportFill),
        nfuTotalFillPlacement: nfuTotalFillPlacement ? parseFloat(nfuTotalFillPlacement) : null,
        nfuMaxFillDepth: nfuMaxFillDepth ? parseFloat(nfuMaxFillDepth) : null,
        nfuFillVolume: nfuFillVolume ? parseFloat(nfuFillVolume) : null,
        nfuProjectDurationAmount: nfuProjectDurationAmount ? parseFloat(nfuProjectDurationAmount) : null,
        nfuProjectDurationUnit,
        nfuFillTypeDescription,
        nfuFillOriginDescription,
      };

      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  onChangeFill(value: string) {
    if (value === 'true') {
      this.totalFillPlacement.enable();
      this.maxFillDepth.enable();
      this.fillVolume.enable();
      this.projectDurationAmount.enable();
      this.projectDurationUnit.enable();
      this.fillTypeDescription.enable();
      this.fillOriginDescription.enable();
    } else {
      this.totalFillPlacement.disable();
      this.maxFillDepth.disable();
      this.fillVolume.disable();
      this.projectDurationAmount.disable();
      this.projectDurationUnit.disable();
      this.fillTypeDescription.disable();
      this.fillOriginDescription.disable();

      this.totalFillPlacement.setValue(null);
      this.maxFillDepth.setValue(null);
      this.fillVolume.setValue(null);
      this.projectDurationAmount.setValue(null);
      this.projectDurationUnit.setValue(null);
      this.fillTypeDescription.setValue(null);
      this.fillOriginDescription.setValue(null);
    }
  }
}
