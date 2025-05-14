import { Component, Input } from '@angular/core';
import { ApplicationPortalDecisionDto } from '../../../../../services/application-decision/application-decision.dto';
import { DocumentService } from '../../../../../services/document/document.service';
import { downloadFile } from '../../../../../shared/utils/file';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
  selector: 'app-public-decisions',
  templateUrl: './decisions.component.html',
  styleUrls: ['./decisions.component.scss'],
})
export class PublicDecisionsComponent {
  @Input() applicationDecisions: ApplicationPortalDecisionDto[] = [];

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
