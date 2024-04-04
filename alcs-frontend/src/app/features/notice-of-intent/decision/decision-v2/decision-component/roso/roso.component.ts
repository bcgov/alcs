import { Component, Input } from '@angular/core';
import { NoticeOfIntentDecisionComponentDto } from '../../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';

@Component({
  selector: 'app-noi-roso',
  templateUrl: './roso.component.html',
  styleUrls: ['./roso.component.scss'],
})
export class RosoComponent {
  @Input() component!: NoticeOfIntentDecisionComponentDto;
}
