import { Component, Input } from '@angular/core';
import { ApplicationSubmissionDto } from '../../../../../services/application/application.dto';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';
import { ApplicationDocumentDto } from '../../../../../services/application/application-document/application-document.dto';
import { DOCUMENT_TYPE } from '../../../../../shared/document/document.dto';

@Component({
  selector: 'app-incl-details',
  templateUrl: './incl-details.component.html',
  styleUrls: ['./incl-details.component.scss'],
})
export class InclDetailsComponent {
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
