import { Component, Input } from '@angular/core';
import { NoticeOfIntentDecisionComponentDto } from '../../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';

@Component({
  selector: 'app-pfrs',
  templateUrl: './pfrs.component.html',
  styleUrls: ['./pfrs.component.scss'],
})
export class PfrsComponent {
  @Input() component!: NoticeOfIntentDecisionComponentDto;
}
