import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationSubmissionUpdateDto } from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { PdfGenerationService } from '../../../../../services/pdf-generation/pdf-generation.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-excl-proposal',
  templateUrl: './excl-proposal.component.html',
  styleUrls: ['./excl-proposal.component.scss'],
})
export class ExclProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  DOCUMENT = DOCUMENT_TYPE;

  currentStep = EditApplicationSteps.Proposal;
  prescribedBody: string | null = null;

  showProposalMapHasVirusError = false;
  showProposalMapVirusScanFailedError = false;
  showProposalMapUnknownError = false;
  showProofOfAdvertisingHasVirusError = false;
  showProofOfAdvertisingVirusScanFailedError = false;
  showProofOfAdvertisingUnknownError = false;
  showProofOfSignageHasVirusError = false;
  showProofOfSignageVirusScanFailedError = false;
  showProofOfSignageUnknownError = false;
  showReportOfPublicHearingHasVirusError = false;
  showReportOfPublicHearingVirusScanFailedError = false;
  showReportOfPublicHearingUnknownError = false;

  hectares = new FormControl<string | null>(null, [Validators.required]);
  shareProperty = new FormControl<string | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  whyExclude = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    hectares: this.hectares,
    purpose: this.purpose,
    shareProperty: this.shareProperty,
    whyExclude: this.whyExclude,
  });
  private submissionUuid = '';
  proposalMap: ApplicationDocumentDto[] = [];
  noticeOfPublicHearing: ApplicationDocumentDto[] = [];
  proofOfSignage: ApplicationDocumentDto[] = [];
  reportOfPublicHearing: ApplicationDocumentDto[] = [];

  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private pdfGenerationService: PdfGenerationService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog,
    toastService: ToastService,
  ) {
    super(applicationDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;
        this.prescribedBody = applicationSubmission.prescribedBody;

        this.form.patchValue({
          hectares: applicationSubmission.inclExclHectares?.toString(),
          purpose: applicationSubmission.purpose,
          whyExclude: applicationSubmission.exclWhyLand,
        });

        if (applicationSubmission.exclShareGovernmentBorders !== null) {
          this.shareProperty.setValue(applicationSubmission.exclShareGovernmentBorders ? 'true' : 'false');
        }

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
      this.noticeOfPublicHearing = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_ADVERTISING,
      );
      this.proofOfSignage = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_SIGNAGE);
      this.reportOfPublicHearing = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING,
      );
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
      this.showProposalMapUnknownError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showProposalMapHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showProposalMapVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
      this.showProposalMapUnknownError =
        !this.showProposalMapHasVirusError && !this.showProposalMapVirusScanFailedError;
    }
  }

  async attachProofOfAdvertising(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.PROOF_OF_ADVERTISING);
      this.showProofOfAdvertisingHasVirusError = false;
      this.showProofOfAdvertisingVirusScanFailedError = false;
      this.showProofOfAdvertisingUnknownError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showProofOfAdvertisingHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showProofOfAdvertisingVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
      this.showProofOfAdvertisingUnknownError =
        !this.showProofOfAdvertisingHasVirusError && !this.showProofOfAdvertisingVirusScanFailedError;
    }
  }

  async attachProofOfSignage(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.PROOF_OF_SIGNAGE);
      this.showProofOfSignageHasVirusError = false;
      this.showProofOfSignageVirusScanFailedError = false;
      this.showProofOfSignageUnknownError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showProofOfSignageHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showProofOfSignageVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
      this.showProofOfSignageUnknownError =
        !this.showProofOfSignageHasVirusError && !this.showProofOfSignageVirusScanFailedError;
    }
  }

  async attachReportOfPublicHearing(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING);
      this.showReportOfPublicHearingHasVirusError = false;
      this.showReportOfPublicHearingVirusScanFailedError = false;
      this.showReportOfPublicHearingUnknownError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showReportOfPublicHearingHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showReportOfPublicHearingVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
      this.showReportOfPublicHearingUnknownError =
        !this.showReportOfPublicHearingHasVirusError && !this.showReportOfPublicHearingVirusScanFailedError;
    }
  }

  async onDownloadPdf() {
    await this.pdfGenerationService.generateAppSubmission(this.fileId);
  }

  protected async save() {
    if (this.fileId && this.form.dirty) {
      const inclExclHectares = this.hectares.value;
      const purpose = this.purpose.value;
      const exclWhyLand = this.whyExclude.value;
      const shareProperty = this.shareProperty.value;

      const updateDto: ApplicationSubmissionUpdateDto = {
        inclExclHectares: inclExclHectares ? parseFloat(inclExclHectares) : null,
        purpose,
        exclWhyLand,
        exclShareGovernmentBorders: parseStringToBoolean(shareProperty),
      };

      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }
}
