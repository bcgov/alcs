import { Component, Input } from '@angular/core';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-nfup',
  templateUrl: './nfup.component.html',
  styleUrls: ['./nfup.component.scss'],
})
export class NfupComponent {
  @Input() component!: DecisionComponentDto;
}
