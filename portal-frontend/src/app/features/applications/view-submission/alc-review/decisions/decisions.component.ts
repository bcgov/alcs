import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApplicationPortalDecisionDto } from '../../../../../services/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../../../services/application-decision/application-decision.service';

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

  async openFile(uuid: string) {
    const res = await this.decisionService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
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
