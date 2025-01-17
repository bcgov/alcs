import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationSubmissionUpdateDto } from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { SoilTableData } from '../../../../../shared/soil-table/soil-table.component';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { ConfirmationDialogService } from '../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-nfu-proposal',
  templateUrl: './nfu-proposal.component.html',
  styleUrls: ['./nfu-proposal.component.scss'],
})
export class NfuProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  fillTableData: SoilTableData = {};
  fillTableDisabled = true;
  showProposalMapHasVirusError = false;
  showProposalMapVirusScanFailedError = false;

  hectares = new FormControl<string | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  outsideLands = new FormControl<string | null>(null, [Validators.required]);
  agricultureSupport = new FormControl<string | null>(null, [Validators.required]);
  willImportFill = new FormControl<boolean | null>(null, [Validators.required]);
  fillTypeDescription = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required],
  );

  form = new FormGroup({
    hectares: this.hectares,
    purpose: this.purpose,
    outsideLands: this.outsideLands,
    agricultureSupport: this.agricultureSupport,
    willImportFill: this.willImportFill,
    fillTypeDescription: this.fillTypeDescription,
  });
  private submissionUuid = '';
  proposalMap: ApplicationDocumentDto[] = [];

  constructor(
    private router: Router,
    private applicationSubmissionService: ApplicationSubmissionService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService,
    toastService: ToastService,
  ) {
    super(applicationDocumentService, dialog, toastService);
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
          fillTypeDescription: applicationSubmission.nfuFillTypeDescription,
        });

        this.fillTableData = {
          area: applicationSubmission.nfuTotalFillArea ?? undefined,
          maximumDepth: applicationSubmission.nfuMaxFillDepth ?? undefined,
          averageDepth: applicationSubmission.nfuAverageFillDepth ?? undefined,
        };

        if (applicationSubmission.nfuWillImportFill !== null) {
          this.willImportFill.setValue(applicationSubmission.nfuWillImportFill);
          this.onChangeFill(applicationSubmission.nfuWillImportFill);
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

  async attachProposalMap(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.PROPOSAL_MAP);
      this.showProposalMapHasVirusError = false;
      this.showProposalMapVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showProposalMapHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showProposalMapVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
  }

  protected async save() {
    if (this.fileId && this.form.dirty) {
      const nfuHectares = this.hectares.getRawValue();
      const purpose = this.purpose.getRawValue();
      const nfuOutsideLands = this.outsideLands.getRawValue();
      const nfuAgricultureSupport = this.agricultureSupport.getRawValue();
      const nfuWillImportFill = this.willImportFill.getRawValue();
      const nfuFillTypeDescription = this.fillTypeDescription.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        nfuHectares: nfuHectares ? parseFloat(nfuHectares) : null,
        purpose,
        nfuOutsideLands,
        nfuAgricultureSupport,
        nfuWillImportFill: nfuWillImportFill,
        nfuTotalFillArea: this.fillTableData.area ?? null,
        nfuMaxFillDepth: this.fillTableData.maximumDepth ?? null,
        nfuAverageFillDepth: this.fillTableData.averageDepth ?? null,
        nfuFillTypeDescription,
      };

      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  onChangeFill(willImportFill: boolean) {
    const hasValues =
      this.fillTypeDescription.value ||
      this.fillTableData.area ||
      this.fillTableData.averageDepth ||
      this.fillTableData.maximumDepth;

    if (!willImportFill && hasValues) {
      this.confirmationDialogService
        .openDialog({
          title: 'Do you need to import any fill to construct or conduct the proposed Non-farm use?',
          body: 'Changing the answer to this question will remove content already saved to this page. Do you want to continue?',
        })
        .subscribe((confirmed) => {
          this.updateFillFields(!confirmed);
          this.willImportFill.setValue(!confirmed);
        });
    } else {
      this.updateFillFields(willImportFill);
    }
  }

  updateFillFields(willImportFill: boolean) {
    this.fillTableDisabled = !willImportFill;

    if (willImportFill) {
      this.fillTypeDescription.enable();
    } else {
      this.fillTypeDescription.disable();

      this.fillTypeDescription.setValue(null);
    }
  }

  markDirty() {
    this.form.markAsDirty();
  }
}
