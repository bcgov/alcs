import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent/noi-document/noi-document.dto';
import { NoiDocumentService } from '../../../../../services/notice-of-intent/noi-document/noi-document.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../../services/notice-of-intent/notice-of-intent.dto';
import { DOCUMENT_TYPE } from '../../../../../shared/document/document.dto';

@Component({
  selector: 'app-pfrs-details',
  templateUrl: './pfrs-details.component.html',
  styleUrls: ['./pfrs-details.component.scss'],
})
export class PfrsDetailsComponent {
  _noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined;
  
  @Input() set noiSubmission(application: NoticeOfIntentSubmissionDetailedDto | undefined) {
    if (application) {
      this._noiSubmission = application;
    }
  }

  @Input() set files(documents: NoticeOfIntentDocumentDto[] | undefined) {
    if (documents) {
      this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
      this.reclamationPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.RECLAMATION_PLAN);
      this.noticeOfWork = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.NOTICE_OF_WORK);
    }
  }

  crossSections: NoticeOfIntentDocumentDto[] = [];
  proposalMap: NoticeOfIntentDocumentDto[] = [];
  reclamationPlans: NoticeOfIntentDocumentDto[] = [];
  noticeOfWork: NoticeOfIntentDocumentDto[] = [];

  constructor(private router: Router, private applicationDocumentService: NoiDocumentService) {}

  async openFile(file: NoticeOfIntentDocumentDto) {
    await this.applicationDocumentService.download(file.uuid, file.fileName);
  }
}
