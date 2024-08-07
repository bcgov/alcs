import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NoticeOfIntentDecisionComponentDto } from '../../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';

@Component({
  selector: 'app-noi-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss'],
})
export class BasicComponent {
  @Input() component!: NoticeOfIntentDecisionComponentDto;
  @Input() fillRow = false;
  @Input() nonZeroEmptyValidation = false;
  @Output() saveAlrArea = new EventEmitter<string | null>();

  constructor() {}

  async onSaveAlrArea(alrArea: string | null) {
    this.saveAlrArea.emit(alrArea);
  }
}
