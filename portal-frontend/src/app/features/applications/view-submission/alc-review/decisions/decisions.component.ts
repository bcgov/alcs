import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApplicationPortalDecisionDto } from '../../../../../services/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../../../services/application-decision/application-decision.service';
import { DocumentService } from '../../../../../services/document/document.service';
import { downloadFile } from '../../../../../shared/utils/file';

@Component({
  selector: 'app-decisions[fileNumber]',
  templateUrl: './decisions.component.html',
  styleUrls: ['./decisions.component.scss'],
})
export class DecisionsComponent implements OnInit, OnChanges {
  @Input() fileNumber = '';
  decisions: ApplicationPortalDecisionDto[] = [];

  constructor(
    private decisionService: ApplicationDecisionService,
    private documentService: DocumentService,
  ) {}

  ngOnInit(): void {
    this.loadDecisions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadDecisions();
  }

  async downloadFile(uuid: string) {
    const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, true);

    downloadFile(url, fileName);
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
