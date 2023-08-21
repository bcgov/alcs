import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

@Component({
  selector: 'app-nfup',
  templateUrl: './nfup.component.html',
  styleUrls: ['./nfup.component.scss'],
})
export class NfupComponent {
  @Input() component!: DecisionComponentDto;
  @Output() saveAlrArea = new EventEmitter<string | null>();

  onSaveAlrArea($event: string | null) {
    this.saveAlrArea.emit($event);
  }
}
