import { Component, OnDestroy, OnInit } from '@angular/core';
import { FilesStepComponent } from '../../files-step.partial';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ApplicationDocumentDto,
  DOCUMENT_TYPE,
} from '../../../../services/application-document/application-document.dto';
import { EditApplicationSteps } from '../../edit-submission.component';
import { takeUntil } from 'rxjs';
import { ApplicationSubmissionUpdateDto } from '../../../../services/application-submission/application-submission.dto';

@Component({
  selector: 'app-incl-proposal',
  templateUrl: './incl-proposal.component.html',
  styleUrls: ['./incl-proposal.component.scss'],
})
export class InclProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  DOCUMENT = DOCUMENT_TYPE;

  currentStep = EditApplicationSteps.Proposal;

  hectares = new FormControl<string | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  agSupport = new FormControl<string | null>(null, [Validators.required]);
  improvements = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    hectares: this.hectares,
    purpose: this.purpose,
    agSupport: this.agSupport,
    improvements: this.improvements,
  });
  private submissionUuid = '';
  proposalMap: ApplicationDocumentDto[] = [];

  constructor(
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
          hectares: applicationSubmission.inclExclHectares?.toString(),
          purpose: applicationSubmission.purpose,
          agSupport: applicationSubmission.inclAgricultureSupport,
          improvements: applicationSubmission.inclImprovements,
        });

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
    if (this.fileId) {
      const inclExclHectares = this.hectares.value;
      const purpose = this.purpose.value;
      const inclAgricultureSupport = this.agSupport.value;
      const inclImprovements = this.improvements.value;

      const updateDto: ApplicationSubmissionUpdateDto = {
        inclExclHectares: inclExclHectares ? parseFloat(inclExclHectares) : null,
        purpose,
        inclAgricultureSupport,
        inclImprovements,
      };

      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }
}
