import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import moment from 'moment';
import { ApplicationDto } from '../../services/application/application.dto';
import { CommissionerApplicationDto } from '../../services/commissioner/commissioner.dto';
import { NoticeOfIntentDto } from '../../services/notice-of-intent/notice-of-intent.dto';

export interface TimeTrackable {
  paused: boolean;
  activeDays: number | null;
  pausedDays: number | null;
  maxActiveDays?: number;
}

@Component({
  selector: 'app-time-tracker[data]',
  templateUrl: './time-tracker.component.html',
  styleUrls: ['./time-tracker.component.scss'],
})
export class TimeTrackerComponent implements OnChanges {
  paused = false;
  activeDays: number | null = null;
  pausedDays: number | null = null;
  dueDate: Date | null = null;
  isOverdue = false;

  @Input() data: TimeTrackable | undefined;
  @Input() maxActiveDays: number | undefined;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.data) {
      this.paused = this.data.paused;
      this.activeDays = this.data.activeDays;
      this.pausedDays = this.data.pausedDays;
    }

    if (this.maxActiveDays) {
      this.dueDate = moment()
        .subtract(this.activeDays, 'days')
        .add(this.maxActiveDays - 1, 'days')
        .toDate();

      if (this.dueDate && this.dueDate.getTime() < Date.now()) {
        this.isOverdue = true;
      }
    }
  }
}
