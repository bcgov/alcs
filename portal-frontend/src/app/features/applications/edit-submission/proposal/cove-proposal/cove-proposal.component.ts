import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationSubmissionUpdateDto } from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { CovenantTransfereeDto } from '../../../../../services/covenant-transferee/covenant-transferee.dto';
import { CovenantTransfereeService } from '../../../../../services/covenant-transferee/covenant-transferee.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { formatBooleanToString } from '../../../../../shared/utils/boolean-helper';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { CovenantTransfereeDialogComponent } from './transferee-dialog/transferee-dialog.component';
import { ConfirmationDialogService } from '../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { MOBILE_BREAKPOINT } from '../../../../../shared/utils/breakpoints';
import { VISIBLE_COUNT_INCREMENT } from '../../../../../shared/constants';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cove-proposal',
  templateUrl: './cove-proposal.component.html',
  styleUrls: ['./cove-proposal.component.scss'],
})
export class CoveProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  transferees: CovenantTransfereeDto[] = [];
  isDirty = false;
  displayedColumns: string[] = ['type', 'fullName', 'organizationName', 'phone', 'email', 'actions'];

  private submissionUuid = '';

  hectares = new FormControl<string | null>(null, [Validators.required]);
  farmImpact = new FormControl<string | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  hasDraftCopy = new FormControl<string | null>(null, [Validators.required]);
  canUploadDraft = false;

  form = new FormGroup({
    hectares: this.hectares,
    purpose: this.purpose,
    farmImpact: this.farmImpact,
    hasDraftCopy: this.hasDraftCopy,
  });

  proposalMap: ApplicationDocumentDto[] = [];
  showProposalMapHasVirusError = false;
  showProposalMapVirusScanFailedError = false;
  draftCovenant: ApplicationDocumentDto[] = [];
  showDraftCovenantHasVirusError = false;
  showDraftCovenantVirusScanFailedError = false;
  isMobile = false;
  visibleCount = VISIBLE_COUNT_INCREMENT;

  constructor(
    private covenantTransfereeService: CovenantTransfereeService,
    private confDialogService: ConfirmationDialogService,
    private applicationSubmissionService: ApplicationSubmissionService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog,
    toastService: ToastService,
  ) {
    super(applicationDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      if (submission) {
        this.submissionUuid = submission.uuid;
        this.fileId = submission.fileNumber;
        this.loadTransferees(submission.uuid);

        this.form.patchValue({
          farmImpact: submission.coveFarmImpact,
          hasDraftCopy: formatBooleanToString(submission.coveHasDraft),
          purpose: submission.purpose,
          hectares: submission.coveAreaImpacted?.toString(),
        });

        this.canUploadDraft = !!submission.coveHasDraft;

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
      this.draftCovenant = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.SRW_TERMS);
    });

    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }

  async onSave() {
    await this.save();
  }

  protected async save() {
    if (this.fileId && this.form.dirty) {
      const purpose = this.purpose.value;
      const hectares = this.hectares.value;
      const impact = this.farmImpact.value;
      const hasDraftCopy = this.hasDraftCopy.value;

      const updateDto: ApplicationSubmissionUpdateDto = {
        purpose,
        coveAreaImpacted: hectares ? parseFloat(hectares) : null,
        coveFarmImpact: impact,
        coveHasDraft: parseStringToBoolean(hasDraftCopy),
      };

      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  private async loadTransferees(submissionUuid: string) {
    const transferees = await this.covenantTransfereeService.fetchBySubmissionId(submissionUuid);
    if (transferees) {
      this.transferees = transferees;
    }
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

  async attachDraftCovenant(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.SRW_TERMS);
      this.showDraftCovenantHasVirusError = false;
      this.showDraftCovenantVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showDraftCovenantHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showDraftCovenantVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
  }

  onAdd() {
    this.dialog
      .open(CovenantTransfereeDialogComponent, {
        data: {
          submissionUuid: this.submissionUuid,
        },
      })
      .beforeClosed()
      .subscribe((didCreate) => {
        if (didCreate) {
          this.loadTransferees(this.submissionUuid);
        }
      });
  }

  onEdit(uuid: string) {
    const selectedTransferee = this.transferees.find((transferee) => transferee.uuid === uuid);
    this.dialog
      .open(CovenantTransfereeDialogComponent, {
        data: {
          submissionUuid: this.submissionUuid,
          existingTransferee: selectedTransferee,
        },
      })
      .beforeClosed()
      .subscribe((didSave) => {
        if (didSave) {
          this.loadTransferees(this.submissionUuid);
        }
      });
  }

  async onDelete(uuid: string) {
    const selectedTransferee = this.transferees.find((transferee) => transferee.uuid === uuid);
    this.confDialogService
      .openDialog({
        title: 'Remove Transferee',
        body: `This action will remove ${selectedTransferee?.firstName} ${selectedTransferee?.lastName} and its usage from the entire Application. Are you sure you want to remove this transferee? `,
      })
      .subscribe(async (confirmed) => {
        await this.covenantTransfereeService.delete(uuid);
        await this.loadTransferees(this.submissionUuid);
      });
  }

  onChangeHasDraftCopy(value: string) {
    const isTrue = parseStringToBoolean(value);
    this.canUploadDraft = !!isTrue;
  }

  async increaseVisibleCount() {
    if (this.transferees.length - this.visibleCount >= VISIBLE_COUNT_INCREMENT) {
      this.visibleCount += VISIBLE_COUNT_INCREMENT;
    } else {
      this.visibleCount += this.transferees.length - this.visibleCount;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
