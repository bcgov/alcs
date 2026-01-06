import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApplicationDecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
    selector: 'app-incl-excl',
    templateUrl: './incl-excl.component.html',
    styleUrls: ['./incl-excl.component.scss'],
    standalone: false
})
export class InclExclComponent {
  @Input() component!: ApplicationDecisionComponentDto;
}
