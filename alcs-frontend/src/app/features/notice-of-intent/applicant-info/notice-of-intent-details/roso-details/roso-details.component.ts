import { Component, Input } from '@angular/core';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent/noi-document/noi-document.dto';
import { NoiDocumentService } from '../../../../../services/notice-of-intent/noi-document/noi-document.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../../services/notice-of-intent/notice-of-intent.dto';
import { DOCUMENT_TYPE } from '../../../../../shared/document/document.dto';

@Component({
  selector: 'app-roso-details[noiSubmission]',
  templateUrl: './roso-details.component.html',
  styleUrls: ['./roso-details.component.scss'],
})
export class RosoDetailsComponent {
  _noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined;

  @Input() set noiSubmission(noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined) {
    if (noiSubmission) {
      this._noiSubmission = noiSubmission;
    }
  }

  @Input() set files(documents: NoticeOfIntentDocumentDto[] | undefined) {
    if (documents) {
      this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
      this.reclamationPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.RECLAMATION_PLAN);
      this.noticeOfWorks = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.NOTICE_OF_WORK);
    }
  }

  crossSections: NoticeOfIntentDocumentDto[] = [];
  proposalMap: NoticeOfIntentDocumentDto[] = [];
  reclamationPlans: NoticeOfIntentDocumentDto[] = [];
  noticeOfWorks: NoticeOfIntentDocumentDto[] = [];

  constructor(private noticeOfIntentDocumentService: NoiDocumentService) {}

  async openFile(file: NoticeOfIntentDocumentDto) {
    await this.noticeOfIntentDocumentService.download(file.uuid, file.fileName);
  }
}
