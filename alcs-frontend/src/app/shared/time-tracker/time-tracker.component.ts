import { Component, Input } from '@angular/core';
import { ApplicationDto } from '../../services/application/application.dto';
import { CommissionerApplicationDto } from '../../services/commissioner/commissioner.dto';
import { NoticeOfIntentDto } from '../../services/notice-of-intent/notice-of-intent.dto';

@Component({
  selector: 'app-time-tracker[application]',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss'],
})
export class TimeTrackerComponent {
  paused = false;
  activeDays = 0;
  pausedDays = 0;

  @Input() set application(application: ApplicationDto | CommissionerApplicationDto | NoticeOfIntentDto | undefined) {
    if (application) {
      this.paused = application.paused;
      this.activeDays = application.activeDays;
      this.pausedDays = application.pausedDays;
    }
  }

  constructor() {}
}
