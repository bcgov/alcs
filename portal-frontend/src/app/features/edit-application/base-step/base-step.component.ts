import { Component, EventEmitter, Output } from '@angular/core';
import { EditApplicationSteps } from '../edit-application.component';

@Component({
  template: '<span>base step</span>',
})
export class BaseStepComponent {
  @Output() navigateToStep = new EventEmitter<number>();

  currentStep = EditApplicationSteps.AppParcel;

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }
}
