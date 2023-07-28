import { Component, Input } from '@angular/core';
import { ApplicationSubmissionDto } from '../../../../../services/application/application.dto';
import {
  ApplicationDocumentService,
  DOCUMENT_TYPE,
} from '../../../../../services/application/application-document/application-document.service';
import { ApplicationDocumentDto } from '../../../../../services/application/application-document/application-document.dto';

@Component({
  selector: 'app-excl-details',
  templateUrl: './excl-details.component.html',
  styleUrls: ['./excl-details.component.scss'],
})
export class ExclDetailsComponent {
  _applicationSubmission: ApplicationSubmissionDto | undefined;
  @Input() set applicationSubmission(application: ApplicationSubmissionDto | undefined) {
    if (application) {
      this._applicationSubmission = application;
    }
  }

  @Input() set files(documents: ApplicationDocumentDto[] | undefined) {
    if (documents) {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
      this.noticeOfPublicHearing = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_ADVERTISING
      );
      this.proofOfSignage = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_SIGNAGE);
      this.reportOfPublicHearing = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING
      );
    }
  }

  proposalMap: ApplicationDocumentDto[] = [];
  noticeOfPublicHearing: ApplicationDocumentDto[] = [];
  proofOfSignage: ApplicationDocumentDto[] = [];
  reportOfPublicHearing: ApplicationDocumentDto[] = [];

  constructor(private applicationDocumentService: ApplicationDocumentService) {}

  async openFile(file: ApplicationDocumentDto) {
    await this.applicationDocumentService.download(file.uuid, file.fileName);
  }
}
