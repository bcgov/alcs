import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApplicationDecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-app-pfrs',
  templateUrl: './pfrs.component.html',
  styleUrls: ['./pfrs.component.scss'],
})
export class PfrsComponent {
  @Input() component!: ApplicationDecisionComponentDto;
}
