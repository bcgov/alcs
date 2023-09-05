import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  NotificationSubmissionDetailedDto,
  NotificationSubmissionDto,
} from '../../../services/notification-submission/notification-submission.dto';

@Component({
  selector: 'app-step',
  template: '<p></p>',
  styleUrls: [],
})
export class StepComponent implements OnDestroy {
  protected $destroy = new Subject<void>();

  @Input() $notificationSubmission!: BehaviorSubject<NotificationSubmissionDetailedDto | undefined>;

  @Input() showErrors = false;

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
