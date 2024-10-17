import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormProposedStructure,
} from '../../../../../features/notice-of-intents/edit-submission/additional-information/additional-information.component';

@Component({
  selector: 'app-structure-mobile-card',
  templateUrl: './structure-mobile-card.component.html',
  styleUrl: './structure-mobile-card.component.scss',
})
export class StructureMobileCardComponent {
  @Input() structure!: FormProposedStructure;
  @Input() isLast: boolean = false;
  @Input() index: number = 0;
  @Input() isReviewStep: boolean = false;
  @Output() editClicked = new EventEmitter<FormProposedStructure>();
  @Output() removeClicked = new EventEmitter<FormProposedStructure>();

  onEdit() {
    this.editClicked.emit(this.structure);
  }

  onRemove() {
    this.removeClicked.emit(this.structure);
  }
}
