import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ApplicationSubmissionDetailedDto } from '../../services/application-submission/application-submission.dto';

@Component({
  selector: 'app-step',
  template: '<p></p>',
  styleUrls: [],
})
export class StepComponent implements OnDestroy {
  protected $destroy = new Subject<void>();

  @Input() $applicationSubmission!: BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>;

  @Input() showErrors = false;
  @Input() draftMode = false;

  @Output() navigateToStep = new EventEmitter<number>();
  @Output() exit = new EventEmitter<void>();

  async onSaveExit() {
    this.exit.emit();
  }

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }

  async ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
