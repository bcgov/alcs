import { Component, Input } from '@angular/core';
import { NoticeOfIntentPortalDecisionDto } from '../../../../../services/notice-of-intent-decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionService } from '../../../../../services/notice-of-intent-decision/notice-of-intent-decision.service';

@Component({
  selector: 'app-public-decisions',
  templateUrl: './decisions.component.html',
  styleUrls: ['./decisions.component.scss'],
})
export class PublicDecisionsComponent {
  @Input() decisions: NoticeOfIntentPortalDecisionDto[] = [];

  constructor(private decisionService: NoticeOfIntentDecisionService) {}

  async openFile(uuid: string) {
    const res = await this.decisionService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }
}
