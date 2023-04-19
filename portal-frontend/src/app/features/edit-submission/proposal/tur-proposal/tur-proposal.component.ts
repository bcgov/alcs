import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  DOCUMENT_TYPE,
} from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import {
  ApplicationSubmissionDetailedDto,
  ApplicationSubmissionUpdateDto,
} from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { EditApplicationSteps } from '../../edit-submission.component';
import { StepComponent } from '../../step.partial';

@Component({
  selector: 'app-tur-proposal',
  templateUrl: './tur-proposal.component.html',
  styleUrls: ['./tur-proposal.component.scss'],
})
export class TurProposalComponent extends StepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;

  DOCUMENT = DOCUMENT_TYPE;

  servingNotice: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];

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
  private fileId = '';
  private submissionUuid = '';

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
    private applicationDocumentService: ApplicationDocumentService
  ) {
    super();
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;

        this.form.patchValue({
          purpose: applicationSubmission.turPurpose,
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

  async onSave() {
    await this.save();
  }

  async attachFile(file: FileHandle, documentType: DOCUMENT_TYPE) {
    if (this.fileId) {
      await this.save();
      const mappedFiles = file.file;
      await this.applicationDocumentService.attachExternalFile(this.fileId, mappedFiles, documentType);
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async deleteFile($event: ApplicationDocumentDto) {
    await this.applicationDocumentService.deleteExternalFile($event.uuid);
    if (this.fileId) {
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  private async save() {
    if (this.fileId) {
      const turPurpose = this.purpose.getRawValue();
      const turOutsideLands = this.outsideLands.getRawValue();
      const turAgriculturalActivities = this.agriculturalActivities.getRawValue();
      const turReduceNegativeImpacts = this.reduceNegativeImpacts.getRawValue();
      const turTotalCorridorArea = this.totalCorridorArea.getRawValue();
      const turAllOwnersNotified = this.allOwnersNotified.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        turPurpose,
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
