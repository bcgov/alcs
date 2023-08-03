import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';
import { ApplicationSubmissionDto } from '../../../../../services/application/application.dto';
import { DOCUMENT_TYPE } from '../../../../../shared/document/document.dto';

@Component({
  selector: 'app-naru-details[applicationSubmission]',
  templateUrl: './naru-details.component.html',
  styleUrls: ['./naru-details.component.scss'],
})
export class NaruDetailsComponent {
  _applicationSubmission: ApplicationSubmissionDto | undefined;
  @Input() set applicationSubmission(application: ApplicationSubmissionDto | undefined) {
    if (application) {
      this._applicationSubmission = application;
    }
  }

  @Input() set files(documents: ApplicationDocumentDto[] | undefined) {
    if (documents) {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    }
  }

  proposalMap: ApplicationDocumentDto[] = [];

  constructor(private router: Router, private applicationDocumentService: ApplicationDocumentService) {}

  async openFile(file: ApplicationDocumentDto) {
    await this.applicationDocumentService.download(file.uuid, file.fileName);
  }
}
