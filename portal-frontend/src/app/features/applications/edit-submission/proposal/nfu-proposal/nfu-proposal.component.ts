import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationSubmissionUpdateDto } from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { SoilTableData } from '../../../../../shared/soil-table/soil-table.component';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';

@Component({
  selector: 'app-nfu-proposal',
  templateUrl: './nfu-proposal.component.html',
  styleUrls: ['./nfu-proposal.component.scss'],
})
export class NfuProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  fillTableData: SoilTableData = {};

  hectares = new FormControl<string | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  outsideLands = new FormControl<string | null>(null, [Validators.required]);
  agricultureSupport = new FormControl<string | null>(null, [Validators.required]);
  willImportFill = new FormControl<string | null>(null, [Validators.required]);
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
    projectDurationAmount: this.projectDurationAmount,
    projectDurationUnit: this.projectDurationUnit,
    fillTypeDescription: this.fillTypeDescription,
    fillOriginDescription: this.fillOriginDescription,
  });
  private submissionUuid = '';
  proposalMap: ApplicationDocumentDto[] = [];

  constructor(
    private router: Router,
    private applicationSubmissionService: ApplicationSubmissionService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog
  ) {
    super(applicationDocumentService, dialog);
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
          projectDurationAmount: applicationSubmission.nfuProjectDurationAmount?.toString(),
          projectDurationUnit: applicationSubmission.nfuProjectDurationUnit,
          fillTypeDescription: applicationSubmission.nfuFillTypeDescription,
          fillOriginDescription: applicationSubmission.nfuFillOriginDescription,
        });

        this.fillTableData = {
          volume: applicationSubmission.nfuFillVolume ?? undefined,
          area: applicationSubmission.nfuTotalFillArea ?? undefined,
          maximumDepth: applicationSubmission.nfuMaxFillDepth ?? undefined,
          averageDepth: applicationSubmission.nfuAverageFillDepth ?? undefined,
        };

        if (applicationSubmission.nfuWillImportFill !== null) {
          this.willImportFill.setValue(applicationSubmission.nfuWillImportFill ? 'true' : 'false');
          this.onChangeFill(applicationSubmission.nfuWillImportFill ? 'true' : 'false');
        }

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    });
  }

  async onSave() {
    await this.save();
  }

  protected async save() {
    if (this.fileId && this.form.dirty) {
      const nfuHectares = this.hectares.getRawValue();
      const purpose = this.purpose.getRawValue();
      const nfuOutsideLands = this.outsideLands.getRawValue();
      const nfuAgricultureSupport = this.agricultureSupport.getRawValue();
      const nfuWillImportFill = this.willImportFill.getRawValue();
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
        nfuTotalFillArea: this.fillTableData.area ?? null,
        nfuMaxFillDepth: this.fillTableData.maximumDepth ?? null,
        nfuAverageFillDepth: this.fillTableData.averageDepth ?? null,
        nfuFillVolume: this.fillTableData.volume ?? null,
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
      this.projectDurationAmount.enable();
      this.projectDurationUnit.enable();
      this.fillTypeDescription.enable();
      this.fillOriginDescription.enable();
    } else {
      this.projectDurationAmount.disable();
      this.projectDurationUnit.disable();
      this.fillTypeDescription.disable();
      this.fillOriginDescription.disable();

      this.projectDurationAmount.setValue(null);
      this.projectDurationUnit.setValue(null);
      this.fillTypeDescription.setValue(null);
      this.fillOriginDescription.setValue(null);
    }
  }

  markDirty() {
    this.form.markAsDirty();
  }
}
