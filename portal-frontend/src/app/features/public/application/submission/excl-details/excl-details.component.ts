import { Component, Input } from '@angular/core';
import { PublicApplicationSubmissionDto } from '../../../../../services/public/public-application.dto';
import { PublicDocumentDto } from '../../../../../services/public/public.dto';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { downloadFile } from '../../../../../shared/utils/file';
import { DocumentService } from '../../../../../services/document/document.service';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
  selector: 'app-excl-details',
  templateUrl: './excl-details.component.html',
  styleUrls: ['./excl-details.component.scss'],
})
export class ExclDetailsComponent {
  @Input() applicationSubmission!: PublicApplicationSubmissionDto;

  @Input() set applicationDocuments(documents: PublicDocumentDto[]) {
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    this.reportOfPublicHearing = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING
    );
  }

  proposalMap: PublicDocumentDto[] = [];
  reportOfPublicHearing: PublicDocumentDto[] = [];

  constructor(
    private documentService: DocumentService,
    private toastService: ToastService,
  ) {}

  async downloadFile(uuid: string) {
    try {
      const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, false);

      downloadFile(url, fileName);
    } catch (e) {
      this.toastService.showErrorToast('Failed to download file');
    }
  }
}
