import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApplicationDecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
    selector: 'app-naru',
    templateUrl: './naru.component.html',
    styleUrls: ['./naru.component.scss'],
    standalone: false
})
export class NaruComponent {
  @Input() component!: ApplicationDecisionComponentDto;
}
