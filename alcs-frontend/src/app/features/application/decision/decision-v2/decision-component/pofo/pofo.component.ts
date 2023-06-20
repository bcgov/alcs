import { Component, Input } from '@angular/core';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-pofo',
  templateUrl: './pofo.component.html',
  styleUrls: ['./pofo.component.scss']
})
export class PofoComponent {
  @Input() component!: DecisionComponentDto;
}
