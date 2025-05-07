import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NoticeOfIntentPortalDecisionDto } from '../../../../../services/notice-of-intent-decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionService } from '../../../../../services/notice-of-intent-decision/notice-of-intent-decision.service';
import { DocumentService } from '../../../../../services/document/document.service';

@Component({
  selector: 'app-decisions[fileNumber]',
  templateUrl: './decisions.component.html',
  styleUrls: ['./decisions.component.scss'],
})
export class DecisionsComponent implements OnInit, OnChanges {
  @Input() fileNumber = '';
  decisions: NoticeOfIntentPortalDecisionDto[] = [];

  constructor(
    private decisionService: NoticeOfIntentDecisionService,
    private documentService: DocumentService,
  ) {}

  ngOnInit(): void {
    this.loadDecisions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadDecisions();
  }

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

  private async loadDecisions() {
    if (this.fileNumber) {
      const decisions = await this.decisionService.getByFileId(this.fileNumber);
      if (decisions) {
        this.decisions = decisions;
      }
    }
  }
}
