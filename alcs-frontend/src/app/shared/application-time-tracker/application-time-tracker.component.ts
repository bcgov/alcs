import { Component, Input } from '@angular/core';
import { ApplicationDto } from '../../services/application/application.dto';
import { CommissionerApplicationDto } from '../../services/commissioner/commissioner.dto';

@Component({
  selector: 'app-application-time-tracker[application]',
  templateUrl: './application-time-tracker.component.html',
  styleUrls: ['./application-time-tracker.component.scss'],
})
export class ApplicationTimeTrackerComponent {
  paused = false;
  activeDays = 0;
  pausedDays = 0;

  @Input() set application(application: ApplicationDto | CommissionerApplicationDto | undefined) {
    if (application) {
      this.paused = application.paused;
      this.activeDays = application.activeDays;
      this.pausedDays = application.pausedDays;
    }
  }

  constructor() {}
}
