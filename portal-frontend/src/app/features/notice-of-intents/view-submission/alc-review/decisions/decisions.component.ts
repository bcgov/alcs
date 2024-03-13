import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NoticeOfIntentPortalDecisionDto } from '../../../../../services/notice-of-intent-decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionService } from '../../../../../services/notice-of-intent-decision/notice-of-intent-decision.service';
import { openFileWindow } from '../../../../../shared/utils/file';

@Component({
  selector: 'app-decisions[fileNumber]',
  templateUrl: './decisions.component.html',
  styleUrls: ['./decisions.component.scss'],
})
export class DecisionsComponent implements OnInit, OnChanges {
  @Input() fileNumber = '';
  decisions: NoticeOfIntentPortalDecisionDto[] = [];

  constructor(private decisionService: NoticeOfIntentDecisionService) {}

  ngOnInit(): void {
    this.loadDecisions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadDecisions();
  }

  async openFile(uuid: string) {
    const res = await this.decisionService.openFile(uuid);
    if (res) {
      openFileWindow(res);
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
