import { Component, Input } from '@angular/core';
// import {CdkStepperModule} from '@angular/cdk/stepper';
import { CdkStepper } from '@angular/cdk/stepper';

@Component({
  selector: 'app-custom-stepper',
  templateUrl: './custom-stepper.component.html',
  styleUrls: ['./custom-stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: CustomStepperComponent }],
})
export class CustomStepperComponent extends CdkStepper {
  @Input()
  activeClass = 'active';

  navigateToStep(index: number): void {
    this.selectedIndex = index;
  }
}
