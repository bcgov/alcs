import { Component, Input } from '@angular/core';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-naru',
  templateUrl: './naru.component.html',
  styleUrls: ['./naru.component.scss']
})
export class NaruComponent {
  @Input() component!: DecisionComponentDto;
}
