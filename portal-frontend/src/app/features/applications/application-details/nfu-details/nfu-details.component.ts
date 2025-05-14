import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { DocumentService } from '../../../../services/document/document.service';
import { downloadFile } from '../../../../shared/utils/file';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-nfu-details[applicationSubmission]',
  templateUrl: './nfu-details.component.html',
  styleUrls: ['./nfu-details.component.scss'],
})
export class NfuDetailsComponent {
  @Input() applicationSubmission: ApplicationSubmissionDetailedDto | undefined;
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;
  proposalMap: ApplicationDocumentDto[] = [];

  @Input() set applicationDocuments(documents: ApplicationDocumentDto[]) {
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
  }

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private toastService: ToastService,
  ) {}

  async onEditSection(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `/alcs/application/${this.applicationSubmission?.fileNumber}/edit/${step}?errors=t`,
      );
    } else {
      await this.router.navigateByUrl(`application/${this.applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
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
