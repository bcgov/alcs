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
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-tur-proposal',
  templateUrl: './tur-proposal.component.html',
  styleUrls: ['./tur-proposal.component.scss'],
})
export class TurProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  DOCUMENT = DOCUMENT_TYPE;

  servingNotice: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];

  showServingNoticeHasVirusError = false;
  showServingNoticeVirusScanFailedError = false;
  showProposalMapHasVirusError = false;
  showProposalMapVirusScanFailedError = false;

  purpose = new FormControl<string | null>(null, [Validators.required]);
  outsideLands = new FormControl<string | null>(null, [Validators.required]);
  agriculturalActivities = new FormControl<string | null>(null, [Validators.required]);
  reduceNegativeImpacts = new FormControl<string | null>(null, [Validators.required]);
  totalCorridorArea = new FormControl<string | null>(null, [Validators.required]);
  allOwnersNotified = new FormControl<boolean>(false, [Validators.required]);

  form = new FormGroup({
    purpose: this.purpose,
    outsideLands: this.outsideLands,
    agriculturalActivities: this.agriculturalActivities,
    reduceNegativeImpacts: this.reduceNegativeImpacts,
    totalCorridorArea: this.totalCorridorArea,
    allOwnersNotified: this.allOwnersNotified,
  });
  private submissionUuid = '';

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
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

        this.form.patchValue({
          purpose: applicationSubmission.purpose,
          outsideLands: applicationSubmission.turOutsideLands,
          agriculturalActivities: applicationSubmission.turAgriculturalActivities,
          reduceNegativeImpacts: applicationSubmission.turReduceNegativeImpacts,
          totalCorridorArea: applicationSubmission.turTotalCorridorArea?.toString(),
          allOwnersNotified: applicationSubmission.turAllOwnersNotified,
        });

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.servingNotice = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.SERVING_NOTICE);
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    });
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

  async attachServinceNotice(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.SERVING_NOTICE);
      this.showServingNoticeHasVirusError = false;
      this.showServingNoticeVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showServingNoticeHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showServingNoticeVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
  }

  async onSave() {
    await this.save();
  }

  protected async save() {
    if (this.fileId && this.form.dirty) {
      const purpose = this.purpose.getRawValue();
      const turOutsideLands = this.outsideLands.getRawValue();
      const turAgriculturalActivities = this.agriculturalActivities.getRawValue();
      const turReduceNegativeImpacts = this.reduceNegativeImpacts.getRawValue();
      const turTotalCorridorArea = this.totalCorridorArea.getRawValue();
      const turAllOwnersNotified = this.allOwnersNotified.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        purpose,
        turOutsideLands,
        turAgriculturalActivities,
        turReduceNegativeImpacts,
        turTotalCorridorArea: turTotalCorridorArea ? parseFloat(turTotalCorridorArea) : null,
        turAllOwnersNotified,
      };

      const updatedApp = await this.applicationService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }
}
