import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-turp',
  templateUrl: './turp.component.html',
  styleUrls: ['./turp.component.scss'],
})
export class TurpComponent {
  @Input() component!: DecisionComponentDto;
}
