import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-incl-excl',
  templateUrl: './incl-excl.component.html',
  styleUrls: ['./incl-excl.component.scss'],
})
export class InclExclComponent {
  @Input() component!: DecisionComponentDto;
}
