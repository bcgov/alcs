import { Component, Input, OnInit } from '@angular/core';
import { ApplicationDecisionComponentService } from '../../../../../../services/application/decision/application-decision-v2/application-decision-component/application-decision-component.service';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-subd[component]',
  templateUrl: './subd.component.html',
  styleUrls: ['./subd.component.scss'],
})
export class SubdComponent {
  constructor(private componentService: ApplicationDecisionComponentService) {}

  @Input() component!: DecisionComponentDto;

  async onSaveAlrArea(i: number, alrArea: string | null) {
    const lots = this.component.subdApprovedLots;
    if (lots && this.component.uuid) {
      lots[i].alrArea = alrArea ? parseFloat(alrArea) : null;
      await this.componentService.update(this.component.uuid, {
        uuid: this.component.uuid,
        subdApprovedLots: lots,
        applicationDecisionComponentTypeCode: this.component.applicationDecisionComponentTypeCode,
      });
    }
  }
}
