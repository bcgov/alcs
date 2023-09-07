import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NotificationDocumentDto } from '../../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../../services/notification-document/notification-document.service';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification-submission/notification-submission.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';

@Component({
  selector: 'app-proposal-details[notificationSubmission]',
  templateUrl: './proposal-details.component.html',
  styleUrls: ['./proposal-details.component.scss'],
})
export class ProposalDetailsComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;

  _notificationSubmission: NotificationSubmissionDetailedDto | undefined;

  @Input() set notificationSubmission(notificationSubmission: NotificationSubmissionDetailedDto | undefined) {
    if (notificationSubmission) {
      this._notificationSubmission = notificationSubmission;
    }
  }

  @Input() set notificationDocuments(documents: NotificationDocumentDto[]) {
    this.surveyPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.SURVEY_PLAN);
    this.srwTerms = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.SRW_TERMS);
  }

  surveyPlans: NotificationDocumentDto[] = [];
  srwTerms: NotificationDocumentDto[] = [];

  constructor(private router: Router, private notificationDocumentService: NotificationDocumentService) {}

  async onEditSection(step: number) {
    await this.router.navigateByUrl(`notification/${this._notificationSubmission?.fileNumber}/edit/${step}?errors=t`);
  }

  async openFile(uuid: string) {
    const res = await this.notificationDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }
}
