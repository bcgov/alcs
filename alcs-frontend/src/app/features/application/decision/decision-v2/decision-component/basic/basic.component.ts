import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss'],
})
export class BasicComponent {
  @Input() component!: DecisionComponentDto;
  @Input() fillRow = false;
  @Output() saveAlrArea = new EventEmitter<string | null>();

  constructor() {}

  async onSaveAlrArea(alrArea: string | null) {
    this.saveAlrArea.emit(alrArea);
  }
}
