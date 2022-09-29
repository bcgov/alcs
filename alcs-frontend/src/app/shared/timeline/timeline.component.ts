import { Component, Input } from '@angular/core';

export interface TimelineEvent {
  startDate: Date;
  fulfilledDate?: Date;
  isFulfilled: boolean;
  name: string;
  link?: string;
}

@Component({
  selector: 'app-timeline[events]',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent {
  @Input() events: TimelineEvent[] = [];

  constructor() {}
}
