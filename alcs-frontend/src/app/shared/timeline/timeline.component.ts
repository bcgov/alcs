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
export class TimelineComponent implements OnInit {
  @Input() events: TimelineEvent[] = [];
  dateFormat = environment.dateFormat;

  constructor() {}

  ngOnInit(): void {}
}
