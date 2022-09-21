import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

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
