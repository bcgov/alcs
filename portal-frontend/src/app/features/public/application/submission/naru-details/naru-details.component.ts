import { Component, HostListener, Input } from '@angular/core';
import { PublicApplicationSubmissionDto } from '../../../../../services/public/public-application.dto';
import { PublicDocumentDto } from '../../../../../services/public/public.dto';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { downloadFile } from '../../../../../shared/utils/file';
import { MOBILE_BREAKPOINT } from '../../../../../shared/utils/breakpoints';
import { DocumentService } from '../../../../../services/document/document.service';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
    selector: 'app-naru-details[applicationSubmission]',
    templateUrl: './naru-details.component.html',
    styleUrls: ['./naru-details.component.scss'],
    standalone: false
})
export class NaruDetailsComponent {
  proposalMap: PublicDocumentDto[] = [];
  buildingPlans: PublicDocumentDto[] = [];

  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  @Input() applicationSubmission!: PublicApplicationSubmissionDto;
  @Input() set applicationDocuments(documents: PublicDocumentDto[]) {
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
  }

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

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
