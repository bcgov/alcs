import { Component, Input } from '@angular/core';
import { NoticeOfIntentPortalDecisionDto } from '../../../../../services/notice-of-intent-decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionService } from '../../../../../services/notice-of-intent-decision/notice-of-intent-decision.service';
import { openFileInline } from '../../../../../shared/utils/file';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { DocumentService } from '../../../../../services/document/document.service';

@Component({
  selector: 'app-public-decisions',
  templateUrl: './decisions.component.html',
  styleUrls: ['./decisions.component.scss'],
})
export class PublicDecisionsComponent {
  @Input() decisions: NoticeOfIntentPortalDecisionDto[] = [];

  constructor(private documentService: DocumentService) {}

  async downloadFile(uuid: string) {
    console.log('howdy');
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
