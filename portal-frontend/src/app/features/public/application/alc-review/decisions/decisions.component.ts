import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApplicationPortalDecisionDto } from '../../../../../services/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../../../services/application-decision/application-decision.service';

@Component({
  selector: 'app-public-decisions',
  templateUrl: './decisions.component.html',
  styleUrls: ['./decisions.component.scss'],
})
export class PublicDecisionsComponent {
  @Input() applicationDecisions: ApplicationPortalDecisionDto[] = [];

  constructor(private decisionService: ApplicationDecisionService) {}

  async openFile(uuid: string) {
    const res = await this.decisionService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }
}
