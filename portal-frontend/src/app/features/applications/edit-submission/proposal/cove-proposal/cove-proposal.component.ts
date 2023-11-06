import { Component, OnDestroy, OnInit } from '@angular/core';
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
  showProposalMapVirus = false;
  draftCovenant: ApplicationDocumentDto[] = [];
  showDraftCovenantVirus = false;

  constructor(
    private covenantTransfereeService: CovenantTransfereeService,
    private applicationSubmissionService: ApplicationSubmissionService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog,
    toastService: ToastService
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
    const res = await this.attachFile(file, DOCUMENT_TYPE.PROPOSAL_MAP);
    this.showProposalMapVirus = !res;
  }

  async attachDraftCovenant(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.SRW_TERMS);
    this.showProposalMapVirus = !res;
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
    await this.covenantTransfereeService.delete(uuid);
    await this.loadTransferees(this.submissionUuid);
  }

  onChangeHasDraftCopy(value: string) {
    const isTrue = parseStringToBoolean(value);
    this.canUploadDraft = !!isTrue;
  }
}
