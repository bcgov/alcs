import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';
import { ApplicationSubmissionService } from '../../../../../services/application/application-submission/application-submission.service';
import { ApplicationSubmissionDto, CovenantTransfereeDto } from '../../../../../services/application/application.dto';
import { DOCUMENT_TYPE } from '../../../../../shared/document/document.dto';

@Component({
  selector: 'app-cove-details',
  templateUrl: './cove-details.component.html',
  styleUrls: ['./cove-details.component.scss'],
})
export class CoveDetailsComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  _applicationSubmission: ApplicationSubmissionDto | undefined;

  @Input() set applicationSubmission(applicationSubmission: ApplicationSubmissionDto | undefined) {
    if (applicationSubmission) {
      this._applicationSubmission = applicationSubmission;
      this.loadTransferees(applicationSubmission.fileNumber);
    }
  }

  @Input() set files(documents: ApplicationDocumentDto[] | undefined) {
    if (documents) {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
      this.srwTerms = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.SRW_TERMS);
    }
  }

  proposalMap: ApplicationDocumentDto[] = [];
  srwTerms: ApplicationDocumentDto[] = [];
  transferees: CovenantTransfereeDto[] = [];

  constructor(
    private router: Router,
    private applicationDocumentService: ApplicationDocumentService,
    private appSubmissionService: ApplicationSubmissionService
  ) {}

  async openFile(file: ApplicationDocumentDto) {
    await this.applicationDocumentService.download(file.uuid, file.fileName);
  }

  private async loadTransferees(fileNumber: string) {
    const transferees = await this.appSubmissionService.fetchTransferees(fileNumber);
    if (transferees) {
      this.transferees = transferees;
    }
  }
}
