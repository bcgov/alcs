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
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';

@Component({
  selector: 'app-excl-proposal',
  templateUrl: './excl-proposal.component.html',
  styleUrls: ['./excl-proposal.component.scss'],
})
export class ExclProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  DOCUMENT = DOCUMENT_TYPE;

  currentStep = EditApplicationSteps.Proposal;
  prescribedBody: string | null = null;

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
        (document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_ADVERTISING
      );
      this.proofOfSignage = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_SIGNAGE);
      this.reportOfPublicHearing = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING
      );
    });
  }

  async onSave() {
    await this.save();
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
