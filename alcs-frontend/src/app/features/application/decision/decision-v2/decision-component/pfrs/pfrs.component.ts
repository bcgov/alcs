import { Component, Input } from '@angular/core';
import { PfrsDecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-app-pfrs',
  templateUrl: './pfrs.component.html',
  styleUrls: ['./pfrs.component.scss'],
})
export class PfrsComponent {
  @Input() component!: PfrsDecisionComponentDto;
}
