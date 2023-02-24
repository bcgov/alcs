import { Component, EventEmitter, Output } from '@angular/core';
import { EditApplicationSteps } from '../edit-application.component';

@Component({
  selector: 'app-base-step',
  templateUrl: './base-step.component.html',
  styleUrls: ['./base-step.component.scss'],
})
export class BaseStepComponent {
  @Output() navigateToStep = new EventEmitter<number>();

  currentStep = EditApplicationSteps.AppParcel;

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }
}
