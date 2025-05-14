import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { downloadFile } from '../../../../shared/utils/file';
import { DocumentService } from '../../../../services/document/document.service';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-tur-details[applicationSubmission]',
  templateUrl: './tur-details.component.html',
  styleUrls: ['./tur-details.component.scss'],
})
export class TurDetailsComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  _applicationSubmission: ApplicationSubmissionDetailedDto | undefined;
  @Input() set applicationSubmission(application: ApplicationSubmissionDetailedDto | undefined) {
    if (application) {
      this._applicationSubmission = application;
    }
  }

  @Input() set applicationDocuments(documents: ApplicationDocumentDto[]) {
    this.servingNotice = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.SERVING_NOTICE);
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
  }

  servingNotice: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private toastService: ToastService,
  ) {}

  async onEditSection(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `/alcs/application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`
      );
    } else {
      await this.router.navigateByUrl(`application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
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
