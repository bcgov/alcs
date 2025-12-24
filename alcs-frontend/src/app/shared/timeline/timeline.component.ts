import { Component, Input } from '@angular/core';
import { TimelineEventDto } from '../../services/notice-of-intent/notice-of-intent-timeline/notice-of-intent-timeline.dto';

@Component({
    selector: 'app-timeline[events]',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss'],
    standalone: false
})
export class TimelineComponent {
  @Input() events: TimelineEventDto[] = [];

  constructor() {}
}
