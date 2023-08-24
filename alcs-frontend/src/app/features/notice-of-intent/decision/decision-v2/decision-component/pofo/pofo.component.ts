import { Component, Input } from '@angular/core';
import { NoticeOfIntentDecisionComponentDto } from '../../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';

@Component({
  selector: 'app-pofo',
  templateUrl: './pofo.component.html',
  styleUrls: ['./pofo.component.scss'],
})
export class PofoComponent {
  @Input() component!: NoticeOfIntentDecisionComponentDto;
}
