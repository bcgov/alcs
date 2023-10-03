import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';

@Component({
  selector: 'app-roso-details[noiSubmission]',
  templateUrl: './roso-details.component.html',
  styleUrls: ['./roso-details.component.scss'],
})
export class RosoDetailsComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  _noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined;

  @Input() set noiSubmission(noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined) {
    if (noiSubmission) {
      this._noiSubmission = noiSubmission;
    }
  }

  @Input() set noiDocuments(documents: NoticeOfIntentDocumentDto[]) {
    this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    this.reclamationPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.RECLAMATION_PLAN);
    this.noticeOfWorks = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.NOTICE_OF_WORK);
  }

  crossSections: NoticeOfIntentDocumentDto[] = [];
  proposalMap: NoticeOfIntentDocumentDto[] = [];
  reclamationPlans: NoticeOfIntentDocumentDto[] = [];
  noticeOfWorks: NoticeOfIntentDocumentDto[] = [];

  constructor(private router: Router, private noticeOfIntentDocumentService: NoticeOfIntentDocumentService) {}

  async onEditSection(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `/alcs/notice-of-intent/${this._noiSubmission?.fileNumber}/edit/${step}?errors=t`
      );
    } else {
      await this.router.navigateByUrl(`notice-of-intent/${this._noiSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
  }

  async openFile(uuid: string) {
    const res = await this.noticeOfIntentDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }
}
