import { Component, Input } from '@angular/core';
import { NoticeOfIntentDecisionComponentDto } from '../../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';

@Component({
  selector: 'app-roso',
  templateUrl: './roso.component.html',
  styleUrls: ['./roso.component.scss'],
})
export class RosoComponent {
  @Input() component!: NoticeOfIntentDecisionComponentDto;
}
