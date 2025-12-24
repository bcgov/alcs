import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApplicationDecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
    selector: 'app-app-basic',
    templateUrl: './basic.component.html',
    styleUrls: ['./basic.component.scss'],
    standalone: false
})
export class BasicComponent {
  @Input() component!: ApplicationDecisionComponentDto;
  @Input() fillRow = false;
  @Input() nonZeroEmptyValidation = false;
  @Output() saveAlrArea = new EventEmitter<string | null>();

  constructor() {}

  async onSaveAlrArea(alrArea: string | null) {
    this.saveAlrArea.emit(alrArea);
  }
}
