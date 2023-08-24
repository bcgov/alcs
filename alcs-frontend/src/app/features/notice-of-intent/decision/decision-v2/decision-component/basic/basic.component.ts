import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NoticeOfIntentDecisionComponentDto } from '../../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss'],
})
export class BasicComponent {
  @Input() component!: NoticeOfIntentDecisionComponentDto;
  @Input() fillRow = false;
  @Output() saveAlrArea = new EventEmitter<string | null>();

  constructor() {}

  async onSaveAlrArea(alrArea: string | null) {
    this.saveAlrArea.emit(alrArea);
  }
}
