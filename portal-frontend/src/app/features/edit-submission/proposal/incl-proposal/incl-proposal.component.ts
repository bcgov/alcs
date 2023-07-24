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

  ngOnInit(): void {}

  async onSave() {
    await this.save();
  }

  protected async save() {}
}
