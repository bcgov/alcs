import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationDocumentDto } from '../../../../services/notification-document/notification-document.dto';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification-submission/notification-submission.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { downloadFile } from '../../../../shared/utils/file';
import { DocumentService } from '../../../../services/document/document.service';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
    selector: 'app-proposal-details[notificationSubmission]',
    templateUrl: './proposal-details.component.html',
    styleUrls: ['./proposal-details.component.scss'],
    standalone: false
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

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private toastService: ToastService,
  ) {}

  async onEditSection(step: number) {
    await this.router.navigateByUrl(`notification/${this._notificationSubmission?.fileNumber}/edit/${step}?errors=t`);
  }

  async downloadFile(uuid: string) {
    try {
      const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, true);

      downloadFile(url, fileName);
    } catch (e) {
      this.toastService.showErrorToast('Failed to download file');
    }
  }
}
