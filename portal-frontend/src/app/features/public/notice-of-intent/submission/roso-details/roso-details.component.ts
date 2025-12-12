import { Component, Input } from '@angular/core';
import { PublicNoticeOfIntentSubmissionDto } from '../../../../../services/public/public-notice-of-intent.dto';
import { PublicDocumentDto } from '../../../../../services/public/public.dto';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { downloadFile } from '../../../../../shared/utils/file';
import { DocumentService } from '../../../../../services/document/document.service';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
    selector: 'app-roso-details[noiSubmission]',
    templateUrl: './roso-details.component.html',
    styleUrls: ['./roso-details.component.scss'],
    standalone: false
})
export class RosoDetailsComponent {
  @Input() noiSubmission!: PublicNoticeOfIntentSubmissionDto;

  @Input() set noiDocuments(documents: PublicDocumentDto[]) {
    this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
  }

  crossSections: PublicDocumentDto[] = [];
  proposalMap: PublicDocumentDto[] = [];

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
