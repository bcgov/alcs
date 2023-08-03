import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';
import { ApplicationSubmissionDto } from '../../../../../services/application/application.dto';
import { DOCUMENT_TYPE } from '../../../../../shared/document/document.dto';

@Component({
  selector: 'app-subd-details[applicationSubmission]',
  templateUrl: './subd-details.component.html',
  styleUrls: ['./subd-details.component.scss'],
})
export class SubdDetailsComponent {
  _applicationSubmission: ApplicationSubmissionDto | undefined;

  @Input() set applicationSubmission(applicationSubmission: ApplicationSubmissionDto | undefined) {
    if (applicationSubmission) {
      this._applicationSubmission = applicationSubmission;
    }
  }

  @Input() set files(files: ApplicationDocumentDto[] | undefined) {
    if (files) {
      this.homesiteDocuments = files.filter((document) => document.type?.code === DOCUMENT_TYPE.HOMESITE_SEVERANCE);
      this.proposalMap = files.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    }
  }

  homesiteDocuments: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];

  constructor(private router: Router, private applicationDocumentService: ApplicationDocumentService) {}

  async openFile(file: ApplicationDocumentDto) {
    await this.applicationDocumentService.download(file.uuid, file.fileName);
  }
}
