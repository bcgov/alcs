import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { DocumentService } from '../../../../services/document/document.service';
import { downloadFile } from '../../../../shared/utils/file';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-excl-details',
  templateUrl: './excl-details.component.html',
  styleUrls: ['./excl-details.component.scss'],
})
export class ExclDetailsComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  _applicationSubmission: ApplicationSubmissionDetailedDto | undefined;

  @Input() set applicationSubmission(applicationSubmission: ApplicationSubmissionDetailedDto | undefined) {
    if (applicationSubmission) {
      this._applicationSubmission = applicationSubmission;
    }
  }

  @Input() set applicationDocuments(documents: ApplicationDocumentDto[]) {
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    this.noticeOfPublicHearing = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_ADVERTISING
    );
    this.proofOfSignage = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_SIGNAGE);
    this.reportOfPublicHearing = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING
    );
  }

  proposalMap: ApplicationDocumentDto[] = [];
  noticeOfPublicHearing: ApplicationDocumentDto[] = [];
  proofOfSignage: ApplicationDocumentDto[] = [];
  reportOfPublicHearing: ApplicationDocumentDto[] = [];

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
