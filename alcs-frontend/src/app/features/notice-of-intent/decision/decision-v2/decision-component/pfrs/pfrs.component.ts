import { Component, Input } from '@angular/core';
import { NoticeOfIntentDecisionComponentDto } from '../../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';

@Component({
  selector: 'app-noi-pfrs',
  templateUrl: './pfrs.component.html',
  styleUrls: ['./pfrs.component.scss'],
})
export class PfrsComponent {
  @Input() component!: NoticeOfIntentDecisionComponentDto;
}
