import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { downloadFile } from '../../../../shared/utils/file';
import { MOBILE_BREAKPOINT } from '../../../../shared/utils/breakpoints';
import { DocumentService } from '../../../../services/document/document.service';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-naru-details[applicationSubmission]',
  templateUrl: './naru-details.component.html',
  styleUrls: ['./naru-details.component.scss'],
})
export class NaruDetailsComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  _applicationSubmission: ApplicationSubmissionDetailedDto | undefined;

  @Input() set applicationSubmission(applicationSubmission: ApplicationSubmissionDetailedDto | undefined) {
    if (applicationSubmission) {
      this._applicationSubmission = applicationSubmission;
    }
  }

  @Input() set applicationDocuments(documents: ApplicationDocumentDto[]) {
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
  }

  proposalMap: ApplicationDocumentDto[] = [];
  buildingPlans: ApplicationDocumentDto[] = [];

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private toastService: ToastService,
  ) {}

  async onEditSection(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `/alcs/application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`,
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

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
