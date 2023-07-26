import { Component, Input } from '@angular/core';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-subd[component]',
  templateUrl: './subd.component.html',
  styleUrls: ['./subd.component.scss'],
})
export class SubdComponent {
  @Input() component!: DecisionComponentDto;
}
