import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApplicationPortalDecisionDto } from '../../../../../services/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../../../services/application-decision/application-decision.service';
import { openFileWindow } from '../../../../../shared/utils/file';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';

@Component({
  selector: 'app-decisions[fileNumber]',
  templateUrl: './decisions.component.html',
  styleUrls: ['./decisions.component.scss'],
})
export class DecisionsComponent implements OnInit, OnChanges {
  @Input() fileNumber = '';
  decisions: ApplicationPortalDecisionDto[] = [];

  constructor(private decisionService: ApplicationDecisionService) {}

  ngOnInit(): void {
    this.loadDecisions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadDecisions();
  }

  async openFile(file: ApplicationDocumentDto) {
    const res = await this.decisionService.openFile(file.uuid);
    if (res) {
      openFileWindow(res.url, file.fileName);
    }
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
