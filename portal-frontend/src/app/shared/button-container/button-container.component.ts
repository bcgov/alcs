import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button-container',
  templateUrl: './button-container.component.html',
  styleUrls: ['./button-container.component.scss'],
})
export class ButtonContainerComponent {
  @Input() draftMode!: boolean;
  @Input() currentStep!: number;
  @Input() reviewStep!: boolean;

  @Output() saveExit: EventEmitter<void> = new EventEmitter<void>();
  @Output() navigateStep: EventEmitter<number> = new EventEmitter<number>();
  @Output() onSubmitToAlcs: EventEmitter<void> = new EventEmitter<void>();

  onSaveExit() {
    this.saveExit.emit();
  }

  onNavigateToStep(step: number) {
    this.navigateStep.emit(step);
  }

  onSubmit() {
    this.onSubmitToAlcs.emit();
  }
}
