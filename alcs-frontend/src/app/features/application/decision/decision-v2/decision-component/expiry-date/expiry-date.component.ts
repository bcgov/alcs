import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApplicationDecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-expiry-date',
  templateUrl: './expiry-date.component.html',
  styleUrls: ['./expiry-date.component.scss'],
})
export class ExpiryDateComponent {
  @Input() component!: ApplicationDecisionComponentDto;
}
