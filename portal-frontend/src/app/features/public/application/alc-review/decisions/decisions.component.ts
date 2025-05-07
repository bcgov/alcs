import { Component, Input } from '@angular/core';
import { ApplicationPortalDecisionDto } from '../../../../../services/application-decision/application-decision.dto';
import { DocumentService } from '../../../../../services/document/document.service';

@Component({
  selector: 'app-public-decisions',
  templateUrl: './decisions.component.html',
  styleUrls: ['./decisions.component.scss'],
})
export class PublicDecisionsComponent {
  @Input() applicationDecisions: ApplicationPortalDecisionDto[] = [];

  constructor(private documentService: DocumentService) {}

  async downloadFile(uuid: string) {
    const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, false);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = fileName;
    if (window.webkitURL == null) {
      downloadLink.onclick = (event: MouseEvent) => document.body.removeChild(<Node>event.target);
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
    }
    downloadLink.click();
  }
}
