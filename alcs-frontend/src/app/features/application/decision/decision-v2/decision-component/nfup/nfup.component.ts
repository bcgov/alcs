import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApplicationDecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-nfup',
  templateUrl: './nfup.component.html',
  styleUrls: ['./nfup.component.scss'],
})
export class NfupComponent {
  @Input() component!: ApplicationDecisionComponentDto;
}
