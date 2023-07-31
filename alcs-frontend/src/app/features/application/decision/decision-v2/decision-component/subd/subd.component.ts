import { Component, Input, OnInit } from '@angular/core';
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
export class SubdComponent implements OnInit {
  constructor(private componentLotService: ApplicationDecisionComponentLotService) {}

  @Input() component!: DecisionComponentDto;

  ngOnInit(): void {
    console.log('here')
    this.component.subdApprovedLots = this.component.subdApprovedLots?.sort((a, b) => a.number - b.number) ?? undefined;
    this.component.lots = this.component.lots?.sort((a, b) => a.number - b.number) ?? undefined;
  }

  async onSaveAlrArea(lot: ProposedDecisionLotDto, alrArea: string | null) {
    if (lot.uuid) {
      lot.alrArea = alrArea ? parseFloat(alrArea) : null;
      await this.componentLotService.update(lot.uuid, lot);
    }
  }
}
