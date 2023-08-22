import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-roso',
  templateUrl: './roso.component.html',
  styleUrls: ['./roso.component.scss'],
})
export class RosoComponent {
  @Input() component!: DecisionComponentDto;
}
