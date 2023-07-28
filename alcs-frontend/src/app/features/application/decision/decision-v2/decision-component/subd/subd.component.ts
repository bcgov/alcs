import { Component, Input } from '@angular/core';
import { ApplicationDecisionComponentLotService } from '../../../../../../services/application/decision/application-decision-v2/application-decision-component-lot/application-decision-component-lot.service';
import {
  DecisionComponentDto,
  ProposedDecisionLotDto,
} from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-subd[component]',
  templateUrl: './subd.component.html',
  styleUrls: ['./subd.component.scss'],
})
export class SubdComponent {
  constructor(private componentLotService: ApplicationDecisionComponentLotService) {}

  @Input() component!: DecisionComponentDto;

  async onSaveAlrArea(lot: ProposedDecisionLotDto, alrArea: string | null) {
    if (lot.uuid) {
      lot.alrArea = alrArea ? parseFloat(alrArea) : null;
      await this.componentLotService.update(lot.uuid, lot);
    }
  }
}
