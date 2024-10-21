import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormProposedStructure,
  NOI_STRUCTURE_TYPE_LABEL_MAP,
  STRUCTURE_TYPES,
} from '../../../features/notice-of-intents/edit-submission/additional-information/additional-information.component';
import { ProposedStructure } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';

@Component({
  selector: 'app-structure-mobile-card',
  templateUrl: './structure-mobile-card.component.html',
  styleUrl: './structure-mobile-card.component.scss',
})
export class StructureMobileCardComponent {
  @Input() structure!: FormProposedStructure | ProposedStructure;
  @Input() isLast: boolean = false;
  @Input() index: number = 0;
  @Input() isReviewStep: boolean = false;
  @Input() showErrors: boolean = false;
  @Output() editClicked = new EventEmitter<FormProposedStructure | ProposedStructure>();
  @Output() removeClicked = new EventEmitter<FormProposedStructure | ProposedStructure>();

  isError: boolean = false;

  ngOnInit(): void {
    if (this.structure.area === null || this.structure.area === 0 || this.structure.type === null) {
      this.isError = true;
      this.showErrors = true;
    }
  }

  onEdit() {
    this.editClicked.emit(this.structure);
  }

  onRemove() {
    this.removeClicked.emit(this.structure);
  }

  mapStructureTypeValueToLabel(value: STRUCTURE_TYPES | null): string | null {
    if (value === null) {
      return null;
    }

    return NOI_STRUCTURE_TYPE_LABEL_MAP[value];
  }
}
