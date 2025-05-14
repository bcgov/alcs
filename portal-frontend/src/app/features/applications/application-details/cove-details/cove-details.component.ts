import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { CovenantTransfereeDto } from '../../../../services/covenant-transferee/covenant-transferee.dto';
import { CovenantTransfereeService } from '../../../../services/covenant-transferee/covenant-transferee.service';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { MOBILE_BREAKPOINT } from '../../../../shared/utils/breakpoints';
import { DocumentService } from '../../../../services/document/document.service';
import { downloadFile } from '../../../../shared/utils/file';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-cove-details',
  templateUrl: './cove-details.component.html',
  styleUrls: ['./cove-details.component.scss'],
})
export class CoveDetailsComponent {
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  _applicationSubmission: ApplicationSubmissionDetailedDto | undefined;

  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  @Input() set applicationSubmission(applicationSubmission: ApplicationSubmissionDetailedDto | undefined) {
    if (applicationSubmission) {
      this._applicationSubmission = applicationSubmission;
      this.loadTransferees(applicationSubmission.uuid);
    }
  }

  @Input() set applicationDocuments(documents: ApplicationDocumentDto[]) {
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    this.srwTerms = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.SRW_TERMS);
  }

  proposalMap: ApplicationDocumentDto[] = [];
  srwTerms: ApplicationDocumentDto[] = [];
  transferees: CovenantTransfereeDto[] = [];

  constructor(
    private router: Router,
    private covenantTransfereeService: CovenantTransfereeService,
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

  private async loadTransferees(uuid: string) {
    const transferees = await this.covenantTransfereeService.fetchBySubmissionId(uuid);
    if (transferees) {
      this.transferees = transferees;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
